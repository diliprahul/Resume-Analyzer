import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getMyResumes } from "../api/client";
import Navbar from "../components/Navbar";

const scoreColor = (v) => v >= 70 ? "#34d399" : v >= 50 ? "#fbbf24" : "#f87171";

export default function MyResults() {
  const navigate = useNavigate();
  const [resumes, setResumes]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [selected, setSelected] = useState(null);
  const [error, setError]       = useState("");

  useEffect(() => {
    getMyResumes()
      .then(data => setResumes(Array.isArray(data) ? data : []))
      .catch(() => setError("Failed to load results."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ background: "#0f0f1a", minHeight: "100vh" }}>
      <Navbar />
      <div style={s.page}>
        <div style={s.header}>
          <div>
            <h1 style={s.title}>📊 My ATS Results</h1>
            <p style={s.sub}>{resumes.length} submission{resumes.length !== 1 ? "s" : ""}</p>
          </div>
          <button style={s.analyzeBtn} onClick={() => navigate("/analyze")}>🎯 Free ATS Check</button>
        </div>

        {error && <div style={s.err}>{error}</div>}

        {loading ? <div style={s.center}><p style={{ color: "#64748b" }}>Loading results…</p></div>
          : resumes.length === 0
          ? (
            <div style={s.emptyCard}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
              <p style={{ color: "#64748b", fontSize: 15 }}>No submissions yet.</p>
              <button style={s.analyzeBtn} onClick={() => navigate("/jobs")}>Browse Jobs</button>
            </div>
          )
          : (
            <div style={{ display: "grid", gridTemplateColumns: selected ? "300px 1fr" : "1fr", gap: 20, alignItems: "start" }}>
              {/* List */}
              <div>
                {resumes.map(r => (
                  <div key={r.id} style={{ ...s.card, ...(selected?.id === r.id ? s.selectedCard : {}) }}
                    onClick={() => setSelected(selected?.id === r.id ? null : r)}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={s.jobName}>{r.jobName}</div>
                        <div style={s.jobComp}>{r.companyName}</div>
                        <div style={{ fontSize: 11, color: "#475569", marginTop: 4 }}>{r.uploadDate} · {r.resumeName}</div>
                      </div>
                      <div style={{ textAlign: "right", flexShrink: 0, marginLeft: 12 }}>
                        <div style={{ fontSize: 24, fontWeight: 800, color: scoreColor(r.totalScore) }}>{r.totalScore}%</div>
                        <div style={{ fontSize: 11, color: scoreColor(r.totalScore), fontWeight: 600 }}>{r.scoreLabel}</div>
                      </div>
                    </div>
                    {/* Mini progress bars */}
                    <div style={{ display: "flex", gap: 4, marginTop: 10 }}>
                      {[["S", r.skillScore, 50], ["E", r.experienceScore, 20], ["Ed", r.educationScore, 15], ["K", r.keywordScore, 15]].map(([label, val, max]) => (
                        <div key={label} style={{ flex: 1 }}>
                          <div style={{ fontSize: 10, color: "#475569", marginBottom: 2 }}>{label}</div>
                          <div style={{ background: "#1e1e30", borderRadius: 2, height: 4 }}>
                            <div style={{ width: `${Math.min(100, ((val || 0) / max) * 100)}%`, background: scoreColor(((val || 0) / max) * 100), height: "100%", borderRadius: 2 }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Detail Panel */}
              {selected && (
                <div style={s.detailPanel}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                    <h2 style={{ color: "#f1f5f9", fontSize: 16, fontWeight: 700, margin: 0 }}>
                      {selected.jobName} <span style={{ color: "#64748b", fontWeight: 400, fontSize: 14 }}>@ {selected.companyName}</span>
                    </h2>
                    <button style={s.closeBtn} onClick={() => setSelected(null)}>✕</button>
                  </div>

                  {/* Score Breakdown */}
                  <div style={s.scoreRow}>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: 44, fontWeight: 900, color: scoreColor(selected.totalScore) }}>{selected.totalScore}%</div>
                      <div style={{ fontSize: 13, color: scoreColor(selected.totalScore), fontWeight: 700 }}>{selected.scoreLabel}</div>
                    </div>
                    <div style={{ flex: 1 }}>
                      {[["Skills (50pts)", selected.skillScore, 50], ["Experience (20pts)", selected.experienceScore, 20], ["Education (15pts)", selected.educationScore, 15], ["Keywords (15pts)", selected.keywordScore, 15]].map(([label, val, max]) => (
                        <div key={label} style={{ marginBottom: 8 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#94a3b8", marginBottom: 3 }}>
                            <span>{label}</span>
                            <span style={{ color: scoreColor(((val || 0) / max) * 100) }}>{val || 0}/{max}</span>
                          </div>
                          <div style={{ background: "#1e1e30", borderRadius: 4, height: 6 }}>
                            <div style={{ width: `${Math.min(100, ((val || 0) / max) * 100)}%`, background: scoreColor(((val || 0) / max) * 100), height: "100%", borderRadius: 4 }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Skills */}
                  <div style={s.section}>
                    <div style={s.sectionTitle}>✅ Matched Skills</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {(selected.matchedSkills || []).length === 0
                        ? <span style={{ color: "#64748b", fontSize: 13 }}>None matched</span>
                        : selected.matchedSkills.map(sk => <span key={sk} style={s.matchChip}>{sk}</span>)
                      }
                    </div>
                  </div>

                  <div style={s.section}>
                    <div style={s.sectionTitle}>❌ Missing Skills</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {(selected.missingSkills || []).length === 0
                        ? <span style={{ color: "#64748b", fontSize: 13 }}>All found!</span>
                        : selected.missingSkills.map(sk => <span key={sk} style={s.missChip}>{sk}</span>)
                      }
                    </div>
                  </div>

                  {/* Suggestions */}
                  {(selected.suggestions || []).length > 0 && (
                    <div style={s.section}>
                      <div style={s.sectionTitle}>💡 Suggestions</div>
                      {selected.suggestions.map((sg, i) => (
                        <div key={i} style={{ fontSize: 13, color: "#94a3b8", padding: "6px 0", borderBottom: "1px solid #1e1e30", lineHeight: 1.5 }}>{sg}</div>
                      ))}
                    </div>
                  )}

                  <button style={{ ...s.analyzeBtn, marginTop: 16, width: "100%" }} onClick={() => navigate("/analyze")}>
                    Run Full ATS Deep Check →
                  </button>
                </div>
              )}
            </div>
          )
        }
      </div>
    </div>
  );
}

const s = {
  page: { maxWidth: 1100, margin: "auto", padding: "28px 20px 60px" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, flexWrap: "wrap", gap: 12 },
  title: { fontSize: 24, fontWeight: 800, color: "#f1f5f9", margin: 0 },
  sub: { fontSize: 14, color: "#64748b", margin: "4px 0 0" },
  analyzeBtn: { background: "linear-gradient(135deg,#4f46e5,#7c3aed)", color: "#fff", border: "none", padding: "10px 20px", borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: "pointer" },
  err: { background: "#2d1515", border: "1px solid #f87171", color: "#fca5a5", padding: "12px 16px", borderRadius: 10, marginBottom: 16, fontSize: 14 },
  center: { textAlign: "center", padding: "60px 20px" },
  emptyCard: { background: "#13131f", border: "1px solid #2d2d4e", borderRadius: 16, padding: "40px", textAlign: "center" },
  card: { background: "#13131f", border: "1px solid #2d2d4e", borderRadius: 14, padding: "16px 18px", marginBottom: 12, cursor: "pointer", transition: "border-color .2s" },
  selectedCard: { borderColor: "#4f46e5", background: "#1a1a2e" },
  jobName: { fontSize: 14, fontWeight: 700, color: "#f1f5f9", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  jobComp: { fontSize: 12, color: "#64748b", marginTop: 2 },
  detailPanel: { background: "#13131f", border: "1px solid #2d2d4e", borderRadius: 16, padding: "22px", position: "sticky", top: 80 },
  closeBtn: { background: "none", border: "none", color: "#64748b", fontSize: 18, cursor: "pointer" },
  scoreRow: { display: "flex", gap: 20, flexWrap: "wrap", alignItems: "center", paddingBottom: 16, borderBottom: "1px solid #2d2d4e", marginBottom: 16 },
  section: { paddingBottom: 16, borderBottom: "1px solid #2d2d4e", marginBottom: 16 },
  sectionTitle: { fontSize: 13, fontWeight: 700, color: "#94a3b8", marginBottom: 8 },
  matchChip: { background: "#052e16", color: "#34d399", padding: "4px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600 },
  missChip: { background: "#2d1515", color: "#f87171", padding: "4px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600 },
};
