import { useState, useEffect } from "react";
import { adminPostJob, adminGetJobs, adminDeleteJob } from "../../api/client";
import Navbar from "../../components/Navbar";

const SKILL_OPTIONS = [
  "Java","Python","JavaScript","TypeScript","React","Angular","Vue","Node.js",
  "Spring Boot","Django","Flask","MySQL","PostgreSQL","MongoDB","Redis",
  "AWS","Docker","Kubernetes","Git","REST API","GraphQL","Machine Learning",
  "Deep Learning","TensorFlow","PyTorch","Data Science","Tableau","Power BI",
  "C","C++","C#","PHP","Ruby","Go","Kotlin","Swift","Android","iOS","Flutter",
  "HTML","CSS","Bootstrap","Tailwind","jQuery","Next.js","Hibernate","Maven",
  "Jenkins","Linux","Agile","Scrum","DevOps","Microservices","SQL","Excel"
];

export default function AdminJobs() {
  const [jobs, setJobs]         = useState([]);
  const [loading, setLoading]   = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm]         = useState({ jobName: "", jobDetails: "", companyName: "", salary: "", skills: [], skillInput: "" });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess]   = useState("");
  const [error, setError]       = useState("");

  useEffect(() => { fetchJobs(); }, []);

  const fetchJobs = () => {
    setLoading(true);
    adminGetJobs().then(setJobs).finally(() => setLoading(false));
  };

  const addSkill = (sk) => {
    const s = sk.trim();
    if (s && !form.skills.includes(s))
      setForm(prev => ({ ...prev, skills: [...prev.skills, s], skillInput: "" }));
  };
  const removeSkill = (sk) => setForm(prev => ({ ...prev, skills: prev.skills.filter(s => s !== sk) }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.jobName || !form.companyName || form.skills.length === 0) {
      setError("Job name, company and at least one skill are required"); return;
    }
    try {
      setSubmitting(true); setError(""); setSuccess("");
      await adminPostJob({ jobName: form.jobName, jobDetails: form.jobDetails, companyName: form.companyName, salary: form.salary, skills: form.skills });
      setSuccess("Job posted! All users have been notified via email and in-app alert.");
      setForm({ jobName: "", jobDetails: "", companyName: "", salary: "", skills: [], skillInput: "" });
      setShowForm(false);
      fetchJobs();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to post job");
    } finally { setSubmitting(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this job?")) return;
    try {
      await adminDeleteJob(id);
      setJobs(prev => prev.filter(j => j.id !== id));
      setSuccess("Job deleted successfully.");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to delete job. It may have associated submissions.");
    }
  };

  return (
    <div style={{ background: "#0f0f1a", minHeight: "100vh" }}>
      <Navbar />
      <div style={s.page}>
        <div style={s.header}>
          <div>
            <h1 style={s.title}>Manage Jobs</h1>
            <p style={s.sub}>{jobs.length} job{jobs.length !== 1 ? "s" : ""} posted</p>
          </div>
          <button style={s.btnPrimary} onClick={() => setShowForm(p => !p)}>
            {showForm ? "Cancel" : "+ Post New Job"}
          </button>
        </div>

        {success && <div style={s.success}>{success}</div>}
        {error   && <div style={s.err}>{error}</div>}

        {showForm && (
          <div style={s.formCard}>
            <h2 style={s.formTitle}>Post New Job</h2>
            <p style={s.formSub}>📧 All registered users will receive an email + in-app alert automatically</p>
            <form onSubmit={handleSubmit}>
              <div style={s.row}>
                <div style={s.group}>
                  <label style={s.label}>Job Title *</label>
                  <input style={s.input} placeholder="e.g. Java Backend Developer"
                    value={form.jobName} onChange={e => setForm({...form, jobName: e.target.value})} />
                </div>
                <div style={s.group}>
                  <label style={s.label}>Company Name *</label>
                  <input style={s.input} placeholder="e.g. TechCorp India"
                    value={form.companyName} onChange={e => setForm({...form, companyName: e.target.value})} />
                </div>
              </div>
              <div style={s.group}>
                <label style={s.label}>Job Description</label>
                <textarea style={s.textarea} rows={4} placeholder="Describe the role, responsibilities…"
                  value={form.jobDetails} onChange={e => setForm({...form, jobDetails: e.target.value})} />
              </div>
              <div style={s.row}>
                <div style={s.group}>
                  <label style={s.label}>Salary Range</label>
                  <input style={s.input} placeholder="e.g. 6-10 LPA"
                    value={form.salary} onChange={e => setForm({...form, salary: e.target.value})} />
                </div>
                <div style={s.group}>
                  <label style={s.label}>Add Skills *</label>
                  <div style={{ display: "flex", gap: 8 }}>
                    <input style={{ ...s.input, flex: 1 }} placeholder="Type skill + Enter"
                      value={form.skillInput}
                      onChange={e => setForm({...form, skillInput: e.target.value})}
                      onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addSkill(form.skillInput); }}} />
                    <button type="button" style={s.addBtn} onClick={() => addSkill(form.skillInput)}>Add</button>
                  </div>
                </div>
              </div>
              <div style={s.group}>
                <label style={s.label}>Quick Add Skills</label>
                <div style={s.quickSkills}>
                  {SKILL_OPTIONS.filter(sk => !form.skills.includes(sk)).slice(0,20).map(sk => (
                    <span key={sk} style={s.quickSkill} onClick={() => addSkill(sk)}>{sk} +</span>
                  ))}
                </div>
              </div>
              {form.skills.length > 0 && (
                <div style={s.group}>
                  <label style={s.label}>Selected Skills ({form.skills.length})</label>
                  <div style={s.selectedSkills}>
                    {form.skills.map(sk => (
                      <span key={sk} style={s.selectedSkill}>
                        {sk}
                        <button type="button" style={s.removeSkill} onClick={() => removeSkill(sk)}>×</button>
                      </span>
                    ))}
                  </div>
                </div>
              )}
              <button style={s.submitBtn} disabled={submitting}>
                {submitting ? "Posting & Sending Alerts…" : "Post Job & Notify All Users"}
              </button>
            </form>
          </div>
        )}

        {loading ? <p style={{ color: "#64748b", padding: 20 }}>Loading…</p> : (
          <div style={s.list}>
            {jobs.map(job => (
              <div key={job.id} style={s.jobCard}>
                <div style={s.jobLeft}>
                  <div style={s.jobBadge}>{job.companyName?.[0]}</div>
                </div>
                <div style={s.jobMain}>
                  <div style={s.jobTop}>
                    <div>
                      <h3 style={s.jobName}>{job.jobName}</h3>
                      <p style={s.jobMeta}>{job.companyName} · {job.postDate} {job.salary && `· ${job.salary}`}</p>
                    </div>
                    <button style={s.deleteBtn} onClick={() => handleDelete(job.id)}>Delete</button>
                  </div>
                  <div style={s.skillsWrap}>
                    {(job.skills || []).map(sk => (
                      <span key={sk} style={s.skillTag}>{sk}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const s = {
  page: { maxWidth: 1000, margin: "auto", padding: "28px 20px 60px" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 20 },
  title: { fontSize: 22, fontWeight: 700, color: "#f1f5f9", marginBottom: 4 },
  sub: { fontSize: 14, color: "#64748b" },
  btnPrimary: { background: "linear-gradient(135deg,#4f46e5,#818cf8)", color: "#fff", border: "none", padding: "10px 22px", borderRadius: 10, fontWeight: 600, fontSize: 14, cursor: "pointer" },
  success: { background: "#052e16", border: "1px solid #166534", borderRadius: 10, padding: 14, fontSize: 14, color: "#4ade80", marginBottom: 16 },
  err: { background: "#2d1515", border: "1px solid #7f1d1d", borderRadius: 10, padding: 12, fontSize: 13, color: "#f87171", marginBottom: 16 },
  formCard: { background: "#13131f", borderRadius: 16, border: "1px solid #2d2d4e", padding: "24px 28px", marginBottom: 24 },
  formTitle: { fontSize: 18, fontWeight: 700, color: "#f1f5f9", marginBottom: 4 },
  formSub: { fontSize: 13, color: "#818cf8", background: "#1e1b4b", padding: "8px 12px", borderRadius: 8, marginBottom: 20 },
  row: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 },
  group: { marginBottom: 16 },
  label: { display: "block", fontSize: 13, fontWeight: 600, color: "#94a3b8", marginBottom: 7 },
  input: { width: "100%", padding: "10px 13px", fontSize: 14, borderRadius: 10, border: "1.5px solid #2d2d4e", outline: "none", color: "#f1f5f9", background: "#1a1a2e" },
  textarea: { width: "100%", padding: "10px 13px", fontSize: 14, borderRadius: 10, border: "1.5px solid #2d2d4e", outline: "none", resize: "vertical", color: "#f1f5f9", background: "#1a1a2e" },
  addBtn: { padding: "10px 14px", background: "#4f46e5", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600, fontSize: 13 },
  quickSkills: { display: "flex", flexWrap: "wrap", gap: 6 },
  quickSkill: { background: "#1a1a2e", color: "#94a3b8", padding: "4px 10px", borderRadius: 999, fontSize: 12, cursor: "pointer", border: "1px solid #2d2d4e" },
  selectedSkills: { display: "flex", flexWrap: "wrap", gap: 6 },
  selectedSkill: { background: "#1e1b4b", color: "#818cf8", padding: "4px 10px", borderRadius: 999, fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", gap: 6 },
  removeSkill: { background: "none", border: "none", color: "#a78bfa", cursor: "pointer", fontSize: 16, lineHeight: 1, padding: 0 },
  submitBtn: { width: "100%", padding: 13, borderRadius: 12, border: "none", fontSize: 15, fontWeight: 600, color: "#fff", background: "linear-gradient(135deg,#4f46e5,#818cf8)", cursor: "pointer", marginTop: 8 },
  list: { display: "flex", flexDirection: "column", gap: 12 },
  jobCard: { background: "#13131f", borderRadius: 14, border: "1px solid #2d2d4e", padding: "16px 20px", display: "flex", gap: 16, alignItems: "flex-start" },
  jobLeft: { flexShrink: 0 },
  jobBadge: { width: 44, height: 44, borderRadius: 10, background: "#1e1b4b", color: "#818cf8", fontSize: 18, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" },
  jobMain: { flex: 1 },
  jobTop: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 },
  jobName: { fontSize: 15, fontWeight: 700, color: "#f1f5f9", marginBottom: 2 },
  jobMeta: { fontSize: 12, color: "#64748b" },
  deleteBtn: { background: "#2d1515", color: "#f87171", border: "1px solid #7f1d1d", padding: "5px 12px", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer" },
  skillsWrap: { display: "flex", flexWrap: "wrap", gap: 5 },
  skillTag: { background: "#1e1b4b", color: "#818cf8", padding: "3px 9px", borderRadius: 999, fontSize: 11, fontWeight: 600 },
};
