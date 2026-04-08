import { useState, useEffect } from "react";
import { adminGetFeedback } from "../../api/client";
import Navbar from "../../components/Navbar";

export default function AdminFeedback() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading]     = useState(true);

  useEffect(() => { adminGetFeedback().then(setFeedbacks).finally(() => setLoading(false)); }, []);

  const ratingCounts = [1,2,3,4,5].map(n => ({ n, count: feedbacks.filter(f => f.rating === n).length }));
  const avgRating = feedbacks.length
    ? (feedbacks.reduce((a, f) => a + f.rating, 0) / feedbacks.length).toFixed(1) : 0;

  const ratingColor = (n) => n >= 4 ? "#34d399" : n >= 3 ? "#fbbf24" : "#f87171";
  const ratingLabel = (n) => ["","Poor","Fair","Good","Very Good","Excellent"][n];

  return (
    <div style={{ background: "#0f0f1a", minHeight: "100vh" }}>
      <Navbar />
      <div style={s.page}>
        <div style={s.header}>
          <h1 style={s.title}>User Feedback</h1>
          <p style={s.sub}>{feedbacks.length} feedback{feedbacks.length !== 1 ? "s" : ""} · Average rating: {avgRating} ★</p>
        </div>
        <div style={s.summaryCard}>
          <div style={s.avgBox}>
            <div style={s.avgNum}>{avgRating}</div>
            <div style={s.avgStars}>{"★".repeat(Math.round(Number(avgRating)))}{"☆".repeat(5 - Math.round(Number(avgRating)))}</div>
            <div style={s.avgLabel}>Average Rating</div>
          </div>
          <div style={s.bars}>
            {[5,4,3,2,1].map(n => {
              const item = ratingCounts.find(r => r.n === n);
              const pct  = feedbacks.length ? Math.round((item.count / feedbacks.length) * 100) : 0;
              return (
                <div key={n} style={s.barRow}>
                  <span style={{ ...s.barLabel, color: ratingColor(n) }}>{n} ★</span>
                  <div style={s.barTrack}>
                    <div style={{ ...s.barFill, width: `${pct}%`, background: ratingColor(n) }} />
                  </div>
                  <span style={s.barCount}>{item.count}</span>
                </div>
              );
            })}
          </div>
        </div>
        {loading ? <p style={{ color: "#64748b", padding: 20 }}>Loading…</p> : feedbacks.length === 0 ? (
          <div style={s.emptyCard}>No feedback submitted yet</div>
        ) : (
          <div style={s.list}>
            {feedbacks.map(f => (
              <div key={f.id} style={s.card}>
                <div style={s.cardTop}>
                  <div style={s.userInfo}>
                    <div style={s.avatar}>{f.username?.[0]?.toUpperCase()}</div>
                    <div>
                      <div style={s.username}>{f.username}</div>
                      <div style={s.date}>{f.feedbackDate}</div>
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ ...s.ratingBadge, color: ratingColor(f.rating) }}>
                      {"★".repeat(f.rating)}{"☆".repeat(5 - f.rating)}
                    </div>
                    <div style={{ fontSize: 11, color: ratingColor(f.rating), fontWeight: 600 }}>{ratingLabel(f.rating)}</div>
                  </div>
                </div>
                <p style={s.feedbackText}>{f.feedbackText}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const s = {
  page: { maxWidth: 900, margin: "auto", padding: "28px 20px 60px" },
  header: { marginBottom: 20 },
  title: { fontSize: 22, fontWeight: 700, color: "#f1f5f9", marginBottom: 4 },
  sub: { fontSize: 14, color: "#64748b" },
  summaryCard: { background: "#13131f", borderRadius: 16, border: "1px solid #2d2d4e", padding: "24px 28px", marginBottom: 24, display: "flex", gap: 40, alignItems: "center", flexWrap: "wrap" },
  avgBox: { textAlign: "center", minWidth: 100 },
  avgNum: { fontSize: 48, fontWeight: 800, color: "#f1f5f9", lineHeight: 1 },
  avgStars: { fontSize: 22, color: "#fbbf24", margin: "6px 0 4px" },
  avgLabel: { fontSize: 12, color: "#64748b" },
  bars: { flex: 1, display: "flex", flexDirection: "column", gap: 8 },
  barRow: { display: "flex", alignItems: "center", gap: 10 },
  barLabel: { fontSize: 13, width: 28, fontWeight: 600 },
  barTrack: { flex: 1, background: "#1a1a2e", borderRadius: 999, height: 10, overflow: "hidden" },
  barFill: { height: "100%", borderRadius: 999, transition: "width 0.4s ease" },
  barCount: { fontSize: 13, color: "#64748b", width: 24, textAlign: "right" },
  emptyCard: { background: "#13131f", borderRadius: 16, border: "1px solid #2d2d4e", padding: "40px 24px", textAlign: "center", color: "#64748b" },
  list: { display: "flex", flexDirection: "column", gap: 14 },
  card: { background: "#13131f", borderRadius: 14, border: "1px solid #2d2d4e", padding: "18px 22px" },
  cardTop: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 },
  userInfo: { display: "flex", alignItems: "center", gap: 12 },
  avatar: { width: 36, height: 36, borderRadius: "50%", background: "#1e1b4b", color: "#818cf8", fontSize: 16, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" },
  username: { fontSize: 14, fontWeight: 600, color: "#e2e8f0" },
  date: { fontSize: 12, color: "#475569" },
  ratingBadge: { fontSize: 18, letterSpacing: 2 },
  feedbackText: { fontSize: 14, color: "#94a3b8", lineHeight: 1.6 },
};
