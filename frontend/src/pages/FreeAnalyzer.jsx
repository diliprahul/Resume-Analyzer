import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { freeAnalyzeResume, sendChatMessage } from "../api/client";
import Navbar from "../components/Navbar";

const scoreColor = (v) => v >= 70 ? "#34d399" : v >= 50 ? "#fbbf24" : "#f87171";
const severityColor = { HIGH: "#f87171", MEDIUM: "#fbbf24", LOW: "#94a3b8", PASS: "#34d399" };
const severityBg    = { HIGH: "#2d1515", MEDIUM: "#2d1f00", LOW: "#1a1a2e", PASS: "#052e16" };
const severityBorder= { HIGH: "#f87171", MEDIUM: "#fbbf24", LOW: "#2d2d4e", PASS: "#34d399" };

export default function FreeAnalyzer() {
  const navigate = useNavigate();
  const [file, setFile]       = useState(null);
  const [jd, setJd]           = useState("");
  const [result, setResult]   = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [activeTab, setActiveTab] = useState("overview");

  // Chat state
  const [chatOpen, setChatOpen]   = useState(false);
  const [messages, setMessages]   = useState([
    { role: "bot", text: "👋 Hi! I'm your ATS Assistant. Analyze a resume first, then ask me anything to improve it!" }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const chatEnd = useRef(null);

  useEffect(() => { chatEnd.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) { setError("Please select a resume file"); return; }
    try {
      setLoading(true); setError(""); setResult(null);
      const data = await freeAnalyzeResume(file, jd);
      setResult(data);
      setActiveTab("overview");
      // Auto-open chat with context
      setMessages([{
        role: "bot",
        text: `✅ Analysis complete! Your ATS score is **${data.totalScore}%** (${data.scoreLabel}).\n\nI found **${(data.atsIssues || []).filter(i => i.severity === "HIGH").length} HIGH** priority issues and **${(data.atsIssues || []).filter(i => i.severity === "MEDIUM").length} MEDIUM** issues.\n\nAsk me anything to improve your resume! For example: "How do I fix my measurable impact?" or "What buzzwords should I remove?"`
      }]);
    } catch (err) {
      setError(err.response?.data?.error || "Analysis failed. Please try again.");
    } finally { setLoading(false); }
  };

  const buildChatContext = () => {
    if (!result) return "";
    const issues = (result.atsIssues || []).filter(i => i.severity !== "PASS");
    return `ATS Score: ${result.totalScore}% (${result.scoreLabel})\n` +
           `Issues: ${issues.map(i => `[${i.category}/${i.severity}] ${i.message}`).join("\n")}\n` +
           `Missing skills: ${(result.missingSkills || []).join(", ")}\n` +
           `Buzzwords found: ${(result.buzzwordsFound || []).join(", ")}\n` +
           `Filler words: ${(result.fillerWordsFound || []).join(", ")}\n` +
           `Metrics found: ${(result.metricsFound || []).join(", ")}`;
  };

  const sendChat = async () => {
    if (!chatInput.trim() || chatLoading) return;
    const msg = chatInput.trim();
    setChatInput("");
    setMessages(prev => [...prev, { role: "user", text: msg }]);
    setChatLoading(true);
    try {
      const ctx = buildChatContext();
      const data = await sendChatMessage(msg, ctx);
      setMessages(prev => [...prev, { role: "bot", text: data.reply }]);
    } catch {
      setMessages(prev => [...prev, { role: "bot", text: "Sorry, I couldn't process that. Please try again." }]);
    } finally { setChatLoading(false); }
  };

  const cats = [...new Set((result?.atsIssues || []).map(i => i.category))];

  const ScoreBar = ({ label, value, max }) => (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
        <span style={{ fontSize: 13, color: "#94a3b8" }}>{label}</span>
        <span style={{ fontSize: 13, fontWeight: 700, color: scoreColor((value / max) * 100) }}>{value}/{max}</span>
      </div>
      <div style={{ background: "#1e1e30", borderRadius: 4, height: 8 }}>
        <div style={{ width: `${Math.min(100, (value / max) * 100)}%`, background: scoreColor((value / max) * 100), height: "100%", borderRadius: 4, transition: "width 1s ease" }} />
      </div>
    </div>
  );

  return (
    <div style={{ background: "#0f0f1a", minHeight: "100vh" }}>
      <Navbar />
      <style>{`
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
        .msg{animation:fadeIn .2s ease}
        .chat-input:focus{outline:none;border-color:#4f46e5!important}
        pre{white-space:pre-wrap;font-family:inherit;margin:0}
      `}</style>

      <div style={s.page}>
        {/* Upload Form */}
        {!result && (
          <div style={s.formCard}>
            <button style={s.back} onClick={() => navigate("/")}>← Dashboard</button>
            <div style={s.heroBox}>
              <span style={{ fontSize: 40 }}>🎯</span>
              <div>
                <h1 style={s.title}>Deep ATS Resume Analyzer</h1>
                <p style={s.sub}>Checks buzzwords, filler words, measurable impact, format, line length, action verbs, contact info, missing sections & more.</p>
              </div>
            </div>

            {error && <div style={s.err}>{error}</div>}

            <form onSubmit={handleSubmit}>
              <div style={s.group}>
                <label style={s.label}>📋 Job Description <span style={{ color: "#475569", fontWeight: 400 }}>(optional — paste from any job portal)</span></label>
                <textarea style={s.textarea} rows={6}
                  placeholder={"Paste the job description here for a targeted match score…\n\nLeave blank for a general ATS quality check."}
                  value={jd} onChange={e => setJd(e.target.value)} />
              </div>

              <div style={s.group}>
                <label style={s.label}>📄 Your Resume</label>
                <label style={{ ...s.dropzone, borderColor: file ? "#4f46e5" : "#2d2d4e", background: file ? "#1e1b4b" : "#1a1a2e", cursor: "pointer" }}>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 36 }}>{file ? "✅" : "📤"}</div>
                    {file
                      ? <><p style={{ color: "#818cf8", fontWeight: 700, margin: "6px 0 0" }}>{file.name}</p><p style={{ color: "#64748b", fontSize: 12, margin: "4px 0 0" }}>{(file.size / 1024).toFixed(1)} KB · click to replace</p></>
                      : <><p style={{ color: "#94a3b8", fontWeight: 600, margin: "8px 0 0" }}>Drag & drop or click to upload</p><p style={{ color: "#475569", fontSize: 13, margin: "4px 0 0" }}>PDF, DOCX, DOC, TXT · Max 10MB</p></>
                    }
                  </div>
                  <input type="file" accept=".pdf,.docx,.doc,.txt" style={{ display: "none" }}
                    onChange={e => { if (e.target.files[0]) setFile(e.target.files[0]); }} />
                </label>
              </div>

              <button style={{ ...s.analyzeBtn, opacity: (loading || !file) ? 0.6 : 1, cursor: (loading || !file) ? "not-allowed" : "pointer" }}
                disabled={loading || !file}>
                {loading
                  ? <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}><span style={s.spinner} />Analyzing resume…</span>
                  : "🚀 Analyze My Resume"
                }
              </button>
            </form>
          </div>
        )}

        {/* Results */}
        {result && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
              <button style={s.back} onClick={() => setResult(null)}>← Analyze Another</button>
              <div style={{ display: "flex", gap: 10 }}>
                <button style={{ ...s.tabBtn, background: chatOpen ? "#4f46e5" : "#1e1b4b", color: chatOpen ? "#fff" : "#818cf8" }}
                  onClick={() => setChatOpen(!chatOpen)}>
                  💬 {chatOpen ? "Hide" : "Open"} AI Assistant
                </button>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: chatOpen ? "1fr 360px" : "1fr", gap: 20, alignItems: "start" }}>
              {/* Left: Results */}
              <div>
                {/* Score Header */}
                <div style={s.scoreHeader}>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 56, fontWeight: 900, color: scoreColor(result.totalScore) }}>{result.totalScore}%</div>
                    <div style={{ fontSize: 14, color: scoreColor(result.totalScore), fontWeight: 700, marginTop: 4 }}>{result.scoreLabel}</div>
                    <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>ATS Score</div>
                  </div>
                  <div style={{ flex: 1, maxWidth: 400 }}>
                    <ScoreBar label="Skills Match (50pts)" value={result.skillScore} max={50} />
                    <ScoreBar label="Experience (20pts)" value={result.experienceScore} max={20} />
                    <ScoreBar label="Education (15pts)" value={result.educationScore} max={15} />
                    <ScoreBar label="Keyword Density (15pts)" value={result.keywordScore} max={15} />
                  </div>
                  <div style={s.candidateBox}>
                    <div style={s.candidateItem}><span>👤 Name</span><strong>{result.candidateName || "—"}</strong></div>
                    <div style={s.candidateItem}><span>📚 Education</span><strong>{result.education || "—"}</strong></div>
                    <div style={s.candidateItem}><span>💼 Experience</span><strong>{result.experienceYears || 0} yr(s)</strong></div>
                    <div style={s.candidateItem}>
                      <span>📞 Contact</span>
                      <strong>
                        {result.hasEmail ? "✅" : "❌"} Email&nbsp;
                        {result.hasPhone ? "✅" : "❌"} Phone&nbsp;
                        {result.hasLinkedIn ? "✅" : "❌"} LinkedIn
                      </strong>
                    </div>
                  </div>
                </div>

                {/* Issue Summary Badges */}
                <div style={s.issueSummary}>
                  {["HIGH","MEDIUM","LOW","PASS"].map(sev => {
                    const cnt = (result.atsIssues || []).filter(i => i.severity === sev).length;
                    return cnt > 0 ? (
                      <div key={sev} style={{ ...s.issueBadge, background: severityBg[sev], border: `1px solid ${severityBorder[sev]}`, color: severityColor[sev] }}>
                        <span style={{ fontWeight: 800 }}>{cnt}</span> {sev}
                      </div>
                    ) : null;
                  })}
                </div>

                {/* Tabs */}
                <div style={s.tabs}>
                  {[["overview","📊 Overview"], ["issues","⚠️ ATS Issues"], ["skills","🛠️ Skills"], ["writing","✍️ Writing Quality"]].map(([key, label]) => (
                    <button key={key} style={{ ...s.tab, ...(activeTab === key ? s.activeTab : {}) }} onClick={() => setActiveTab(key)}>
                      {label}
                    </button>
                  ))}
                </div>

                {/* Tab: Overview */}
                {activeTab === "overview" && (
                  <div style={s.tabContent}>
                    <div style={s.twoGrid}>
                      {/* Quick Wins */}
                      <div style={s.panel}>
                        <h3 style={s.panelTitle}>🚨 Fix These First (HIGH Priority)</h3>
                        {(result.atsIssues || []).filter(i => i.severity === "HIGH").length === 0
                          ? <p style={s.pass}>✅ No HIGH priority issues!</p>
                          : (result.atsIssues || []).filter(i => i.severity === "HIGH").map((issue, i) => (
                            <div key={i} style={s.issueRow}>
                              <span style={{ fontSize: 11, fontWeight: 700, color: "#f87171", background: "#2d1515", padding: "2px 7px", borderRadius: 4 }}>{issue.category}</span>
                              <p style={{ margin: "4px 0 0", fontSize: 13, color: "#fca5a5", lineHeight: 1.5 }}>{issue.message}</p>
                            </div>
                          ))}
                      </div>
                      {/* Contact Info */}
                      <div style={s.panel}>
                        <h3 style={s.panelTitle}>📞 Contact & Profile</h3>
                        {[
                          ["Email",    result.hasEmail,    "Add your professional email address"],
                          ["Phone",    result.hasPhone,    "Add your 10-digit phone number"],
                          ["LinkedIn", result.hasLinkedIn, "Add linkedin.com/in/yourname"],
                          ["GitHub",   result.hasGitHub,   "Add github.com/yourusername"],
                        ].map(([label, ok, fix]) => (
                          <div key={label} style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 10 }}>
                            <span style={{ fontSize: 18, lineHeight: 1.2 }}>{ok ? "✅" : "❌"}</span>
                            <div>
                              <div style={{ fontSize: 13, fontWeight: 600, color: ok ? "#34d399" : "#f87171" }}>{label}</div>
                              {!ok && <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>{fix}</div>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Missing Sections */}
                    {(result.missingSections || []).length > 0 && (
                      <div style={s.panel}>
                        <h3 style={s.panelTitle}>📂 Missing Resume Sections</h3>
                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                          {result.missingSections.map(sec => (
                            <span key={sec} style={{ background: "#2d1515", color: "#f87171", fontSize: 13, fontWeight: 600, padding: "6px 14px", borderRadius: 8 }}>
                              ❌ {sec}
                            </span>
                          ))}
                        </div>
                        <p style={{ fontSize: 12, color: "#64748b", marginTop: 8 }}>Add these section headings so ATS can parse your resume correctly.</p>
                      </div>
                    )}

                    {/* Format Issues */}
                    {(result.formatIssues || []).length > 0 && (
                      <div style={s.panel}>
                        <h3 style={s.panelTitle}>📐 Format Issues</h3>
                        {result.formatIssues.map((fi, i) => (
                          <div key={i} style={{ fontSize: 13, color: "#fbbf24", padding: "6px 0", borderBottom: "1px solid #1e1e30" }}>⚠️ {fi}</div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Tab: ATS Issues */}
                {activeTab === "issues" && (
                  <div style={s.tabContent}>
                    {cats.map(cat => (
                      <div key={cat} style={s.panel}>
                        <h3 style={s.panelTitle}>{cat}</h3>
                        {(result.atsIssues || []).filter(i => i.category === cat).map((issue, i) => (
                          <div key={i} style={{ ...s.issueCard, borderColor: severityBorder[issue.severity], background: severityBg[issue.severity] }}>
                            <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 4 }}>
                              <span style={{ fontSize: 11, fontWeight: 800, color: severityColor[issue.severity], background: "rgba(0,0,0,0.3)", padding: "2px 8px", borderRadius: 4 }}>{issue.severity}</span>
                            </div>
                            <p style={{ margin: 0, fontSize: 13, color: issue.severity === "PASS" ? "#6ee7b7" : "#e2e8f0", lineHeight: 1.6 }}>{issue.message}</p>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                )}

                {/* Tab: Skills */}
                {activeTab === "skills" && (
                  <div style={s.tabContent}>
                    <div style={s.twoGrid}>
                      <div style={s.panel}>
                        <h3 style={s.panelTitle}>✅ Matched Skills ({(result.matchedSkills || []).length})</h3>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                          {(result.matchedSkills || []).length === 0
                            ? <p style={{ color: "#64748b", fontSize: 13 }}>No skills matched from the JD.</p>
                            : (result.matchedSkills || []).map(sk => (
                              <span key={sk} style={{ background: "#052e16", color: "#34d399", padding: "5px 12px", borderRadius: 20, fontSize: 12, fontWeight: 600 }}>{sk}</span>
                            ))}
                        </div>
                      </div>
                      <div style={s.panel}>
                        <h3 style={s.panelTitle}>❌ Missing Skills ({(result.missingSkills || []).length})</h3>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                          {(result.missingSkills || []).length === 0
                            ? <p style={{ color: "#64748b", fontSize: 13 }}>All required skills found!</p>
                            : (result.missingSkills || []).map(sk => (
                              <span key={sk} style={{ background: "#2d1515", color: "#f87171", padding: "5px 12px", borderRadius: 20, fontSize: 12, fontWeight: 600 }}>{sk}</span>
                            ))}
                        </div>
                      </div>
                    </div>
                    <div style={s.panel}>
                      <h3 style={s.panelTitle}>🔍 All Skills Detected in Your Resume ({(result.extractedSkills || []).length})</h3>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                        {(result.extractedSkills || []).map(sk => (
                          <span key={sk} style={{ background: "#1e1b4b", color: "#a5b4fc", padding: "4px 10px", borderRadius: 20, fontSize: 12, fontWeight: 500 }}>{sk}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab: Writing Quality */}
                {activeTab === "writing" && (
                  <div style={s.tabContent}>
                    <div style={s.twoGrid}>
                      {/* Measurable Impact */}
                      <div style={s.panel}>
                        <h3 style={s.panelTitle}>📈 Measurable Impact</h3>
                        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                          <span style={{ fontSize: 28 }}>{result.hasMeasurableImpact ? "✅" : "❌"}</span>
                          <div>
                            <div style={{ fontSize: 14, fontWeight: 700, color: result.hasMeasurableImpact ? "#34d399" : "#f87171" }}>
                              {result.hasMeasurableImpact ? "Good!" : "Needs improvement"}
                            </div>
                            <div style={{ fontSize: 12, color: "#64748b" }}>Found {(result.metricsFound || []).length} metric(s)</div>
                          </div>
                        </div>
                        {(result.metricsFound || []).length > 0 && (
                          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                            {result.metricsFound.map((m, i) => (
                              <span key={i} style={{ background: "#052e16", color: "#34d399", padding: "4px 10px", borderRadius: 8, fontSize: 12, fontWeight: 600 }}>{m}</span>
                            ))}
                          </div>
                        )}
                        {!result.hasMeasurableImpact && (
                          <p style={{ fontSize: 12, color: "#94a3b8", marginTop: 8 }}>
                            Add metrics like: "Improved response time by 40%", "Served 10,000+ users", "Reduced bugs by 60%"
                          </p>
                        )}
                      </div>

                      {/* Action Verbs */}
                      <div style={s.panel}>
                        <h3 style={s.panelTitle}>💪 Action Verbs</h3>
                        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                          <span style={{ fontSize: 28 }}>{result.hasStrongActionVerbs ? "✅" : "⚠️"}</span>
                          <div>
                            <div style={{ fontSize: 14, fontWeight: 700, color: result.hasStrongActionVerbs ? "#34d399" : "#fbbf24" }}>
                              {result.hasStrongActionVerbs ? "Strong verbs found!" : "Add more action verbs"}
                            </div>
                            <div style={{ fontSize: 12, color: "#64748b" }}>Found {(result.actionVerbsFound || []).length} action verb(s)</div>
                          </div>
                        </div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                          {(result.actionVerbsFound || []).slice(0, 10).map(v => (
                            <span key={v} style={{ background: "#1e1b4b", color: "#a5b4fc", padding: "4px 10px", borderRadius: 8, fontSize: 12, fontWeight: 600, textTransform: "capitalize" }}>{v}</span>
                          ))}
                        </div>
                      </div>

                      {/* Buzzwords */}
                      <div style={s.panel}>
                        <h3 style={s.panelTitle}>🚫 Buzzwords Detected</h3>
                        {(result.buzzwordsFound || []).length === 0
                          ? <p style={s.pass}>✅ No buzzwords found! Great job.</p>
                          : <>
                            <p style={{ fontSize: 13, color: "#94a3b8", marginBottom: 10 }}>Remove or replace these vague terms with specific achievements:</p>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                              {result.buzzwordsFound.map(bw => (
                                <span key={bw} style={{ background: "#2d1515", color: "#f87171", padding: "4px 10px", borderRadius: 8, fontSize: 12, fontWeight: 600 }}>{bw}</span>
                              ))}
                            </div>
                          </>
                        }
                      </div>

                      {/* Filler Words */}
                      <div style={s.panel}>
                        <h3 style={s.panelTitle}>🗑️ Filler Phrases</h3>
                        {(result.fillerWordsFound || []).length === 0
                          ? <p style={s.pass}>✅ No filler phrases found!</p>
                          : <>
                            <p style={{ fontSize: 13, color: "#94a3b8", marginBottom: 10 }}>Replace these weak phrases with strong action verbs:</p>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                              {result.fillerWordsFound.map(fw => (
                                <span key={fw} style={{ background: "#2d1f00", color: "#fbbf24", padding: "4px 10px", borderRadius: 8, fontSize: 12, fontWeight: 600 }}>{fw}</span>
                              ))}
                            </div>
                          </>
                        }
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Right: Chatbot */}
              {chatOpen && (
                <div style={s.chatPanel}>
                  <div style={s.chatHeader}>
                    <div>
                      <div style={{ fontWeight: 700, color: "#f1f5f9", fontSize: 15 }}>💬 ATS Assistant</div>
                      <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>Ask anything about your resume</div>
                    </div>
                    <button style={s.closeBtn} onClick={() => setChatOpen(false)}>✕</button>
                  </div>
                  <div style={s.chatMessages}>
                    {messages.map((msg, i) => (
                      <div key={i} className="msg" style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start", marginBottom: 12 }}>
                        <div style={msg.role === "user" ? s.userBubble : s.botBubble}>
                          <pre style={{ fontSize: 13, lineHeight: 1.6 }}>{msg.text}</pre>
                        </div>
                      </div>
                    ))}
                    {chatLoading && (
                      <div style={{ display: "flex", gap: 6, padding: "8px 0" }}>
                        {[0,1,2].map(i => (
                          <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: "#818cf8", animation: `pulse 1s ${i * 0.2}s infinite` }} />
                        ))}
                      </div>
                    )}
                    <div ref={chatEnd} />
                  </div>
                  <div style={s.chatInputRow}>
                    <input
                      className="chat-input"
                      style={s.chatInput}
                      value={chatInput}
                      onChange={e => setChatInput(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendChat()}
                      placeholder="Ask me how to improve…"
                    />
                    <button style={{ ...s.sendBtn, opacity: (!chatInput.trim() || chatLoading) ? 0.5 : 1 }}
                      onClick={sendChat} disabled={!chatInput.trim() || chatLoading}>
                      ➤
                    </button>
                  </div>
                  <div style={s.chatSuggestions}>
                    {["How to fix my score?", "Remove buzzwords", "Add measurable impact", "ATS format tips"].map(q => (
                      <button key={q} style={s.suggBtn} onClick={() => { setChatInput(q); }}>
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      <style>{`@keyframes pulse{0%,100%{opacity:.3;transform:scale(1)}50%{opacity:1;transform:scale(1.2)}}`}</style>
    </div>
  );
}

const s = {
  page: { maxWidth: 1200, margin: "auto", padding: "28px 20px 60px" },
  formCard: { maxWidth: 700, margin: "0 auto", background: "#13131f", borderRadius: 20, border: "1px solid #2d2d4e", padding: "32px" },
  back: { background: "none", border: "none", color: "#818cf8", fontSize: 14, fontWeight: 600, cursor: "pointer", padding: "0 0 16px", display: "block" },
  heroBox: { display: "flex", gap: 16, alignItems: "flex-start", marginBottom: 24 },
  title: { fontSize: 22, fontWeight: 800, color: "#f1f5f9", margin: 0 },
  sub: { fontSize: 13, color: "#64748b", marginTop: 4, lineHeight: 1.6 },
  err: { background: "#2d1515", border: "1px solid #f87171", color: "#fca5a5", padding: "12px 16px", borderRadius: 10, marginBottom: 16, fontSize: 14 },
  group: { marginBottom: 20 },
  label: { display: "block", fontSize: 13, fontWeight: 600, color: "#94a3b8", marginBottom: 8 },
  textarea: { width: "100%", background: "#1a1a2e", border: "1px solid #2d2d4e", borderRadius: 10, color: "#f1f5f9", padding: "12px 14px", fontSize: 13, lineHeight: 1.6, resize: "vertical", boxSizing: "border-box", outline: "none" },
  dropzone: { display: "flex", justifyContent: "center", alignItems: "center", border: "2px dashed", borderRadius: 12, padding: "28px 20px", transition: "all .2s" },
  analyzeBtn: { width: "100%", background: "linear-gradient(135deg,#4f46e5,#7c3aed)", color: "#fff", border: "none", padding: "14px", borderRadius: 12, fontSize: 15, fontWeight: 700, marginTop: 8 },
  spinner: { width: 18, height: 18, border: "2px solid rgba(255,255,255,.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin .8s linear infinite" },

  // Results
  scoreHeader: { background: "#13131f", borderRadius: 16, border: "1px solid #2d2d4e", padding: "24px", display: "flex", flexWrap: "wrap", gap: 28, alignItems: "center", marginBottom: 16 },
  candidateBox: { background: "#0f0f1a", borderRadius: 12, border: "1px solid #2d2d4e", padding: "14px 16px", minWidth: 200 },
  candidateItem: { display: "flex", flexDirection: "column", marginBottom: 8, fontSize: 12 },
  issueSummary: { display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" },
  issueBadge: { padding: "6px 16px", borderRadius: 20, fontSize: 13, fontWeight: 700 },
  tabs: { display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" },
  tab: { background: "#13131f", border: "1px solid #2d2d4e", color: "#64748b", padding: "8px 16px", borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: "pointer" },
  activeTab: { background: "#1e1b4b", borderColor: "#4f46e5", color: "#818cf8", fontWeight: 700 },
  tabContent: {},
  twoGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 16, marginBottom: 16 },
  panel: { background: "#13131f", borderRadius: 14, border: "1px solid #2d2d4e", padding: "16px 18px", marginBottom: 16 },
  panelTitle: { fontSize: 14, fontWeight: 700, color: "#f1f5f9", margin: "0 0 12px" },
  issueRow: { paddingBottom: 10, marginBottom: 10, borderBottom: "1px solid #1e1e30" },
  issueCard: { border: "1px solid", borderRadius: 10, padding: "10px 14px", marginBottom: 10 },
  pass: { color: "#34d399", fontSize: 13, margin: 0 },
  tabBtn: { padding: "8px 16px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", border: "1px solid #2d2d4e" },

  // Chat
  chatPanel: { background: "#13131f", border: "1px solid #2d2d4e", borderRadius: 16, display: "flex", flexDirection: "column", height: "calc(100vh - 120px)", position: "sticky", top: 80 },
  chatHeader: { padding: "16px 18px", borderBottom: "1px solid #2d2d4e", display: "flex", justifyContent: "space-between", alignItems: "center" },
  closeBtn: { background: "none", border: "none", color: "#64748b", fontSize: 16, cursor: "pointer", padding: 4 },
  chatMessages: { flex: 1, overflowY: "auto", padding: "16px", display: "flex", flexDirection: "column" },
  userBubble: { background: "linear-gradient(135deg,#4f46e5,#7c3aed)", color: "#fff", padding: "10px 14px", borderRadius: "14px 14px 4px 14px", maxWidth: "85%" },
  botBubble: { background: "#1e1e30", color: "#e2e8f0", padding: "10px 14px", borderRadius: "14px 14px 14px 4px", maxWidth: "90%" },
  chatInputRow: { padding: "12px 16px", borderTop: "1px solid #2d2d4e", display: "flex", gap: 8 },
  chatInput: { flex: 1, background: "#0f0f1a", border: "1px solid #2d2d4e", borderRadius: 8, color: "#f1f5f9", padding: "8px 12px", fontSize: 13 },
  sendBtn: { background: "linear-gradient(135deg,#4f46e5,#7c3aed)", color: "#fff", border: "none", borderRadius: 8, width: 36, height: 36, fontSize: 16, cursor: "pointer" },
  chatSuggestions: { padding: "8px 12px 12px", display: "flex", flexWrap: "wrap", gap: 6, borderTop: "1px solid #1e1e30" },
  suggBtn: { background: "#1e1b4b", color: "#818cf8", border: "none", borderRadius: 20, fontSize: 11, fontWeight: 600, padding: "4px 10px", cursor: "pointer" },
};
