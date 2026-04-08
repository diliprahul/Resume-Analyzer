import { useState } from "react";
import { submitFeedback } from "../api/client";
import Navbar from "../components/Navbar";

export default function Feedback() {
  const [form, setForm]       = useState({ feedbackText: "", rating: 0 });
  const [success, setSuccess] = useState(false);
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.feedbackText.trim()) { setError("Please write your feedback"); return; }
    if (form.rating === 0) { setError("Please select a rating"); return; }
    try {
      setLoading(true); setError("");
      await submitFeedback(form);
      setSuccess(true);
      setForm({ feedbackText: "", rating: 0 });
    } catch (err) {
      setError(err.response?.data?.error || "Failed to submit feedback");
    } finally { setLoading(false); }
  };

  return (
    <div style={{ background: "#0f0f1a", minHeight: "100vh" }}>
      <Navbar />
      <div style={s.page}>
        <div style={s.card}>
          <h1 style={s.title}>Share Your Feedback</h1>
          <p style={s.sub}>Help us improve ResumeAnalyzer</p>

          {success && (
            <div style={s.success}>
              ✅ Thank you for your feedback! We appreciate it.
            </div>
          )}

          {error && <div style={s.err}>{error}</div>}

          <form onSubmit={handleSubmit}>
            <div style={s.group}>
              <label style={s.label}>Your Rating</label>
              <div style={s.stars}>
                {[1,2,3,4,5].map(n => (
                  <span key={n}
                    style={{ ...s.star, color: n <= form.rating ? "#f59e0b" : "#d1d5db" }}
                    onClick={() => setForm({...form, rating: n})}>★</span>
                ))}
                <span style={{ fontSize: 13, color: "#64748b", marginLeft: 8 }}>
                  {form.rating > 0 ? ["","Poor","Fair","Good","Very Good","Excellent"][form.rating] : "Click to rate"}
                </span>
              </div>
            </div>

            <div style={s.group}>
              <label style={s.label}>Your Feedback</label>
              <textarea style={s.textarea} rows={5}
                placeholder="Tell us about your experience, what you liked, what can be improved…"
                value={form.feedbackText}
                onChange={e => setForm({...form, feedbackText: e.target.value})} />
            </div>

            <button style={s.btn} disabled={loading}>
              {loading ? "Submitting…" : "Submit Feedback"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

const s = {
  page: { maxWidth: 600, margin: "auto", padding: "28px 20px 60px" },
  card: { background: "#13131f", borderRadius: 20, border: "1px solid #2d2d4e", padding: "32px 36px" },
  title: { fontSize: 22, fontWeight: 700, color: "#f1f5f9", marginBottom: 6 },
  sub: { fontSize: 14, color: "#64748b", marginBottom: 28 },
  success: { background: "#052e16", border: "1px solid #166534", borderRadius: 10, padding: 14, fontSize: 14, color: "#34d399", marginBottom: 20 },
  err: { background: "#2d1515", border: "1px solid #7f1d1d", borderRadius: 10, padding: 12, fontSize: 13, color: "#f87171", marginBottom: 16 },
  group: { marginBottom: 22 },
  label: { display: "block", fontSize: 13, fontWeight: 600, color: "#94a3b8", marginBottom: 10 },
  stars: { display: "flex", alignItems: "center", gap: 4 },
  star: { fontSize: 36, cursor: "pointer", transition: "color 0.15s" },
  textarea: { width: "100%", padding: "12px 14px", fontSize: 14, borderRadius: 12, border: "1.5px solid #2d2d4e", outline: "none", resize: "vertical", color: "#f1f5f9", lineHeight: 1.5 },
  btn: { width: "100%", padding: 13, borderRadius: 12, border: "none", fontSize: 15, fontWeight: 600, color: "#fff", background: "linear-gradient(135deg,#4f46e5,#818cf8)", cursor: "pointer" },
};
