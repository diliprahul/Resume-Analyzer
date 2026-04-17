import { useState, useEffect } from "react";
import { getMyProfile, updateProfile, changePassword } from "../api/client";
import Navbar from "../components/Navbar";

export default function Profile() {
  const [profile, setProfile]   = useState(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");

  // Edit profile state
  const [editing, setEditing]   = useState(false);
  const [form, setForm]         = useState({ contactNo: "", address: "" });
  const [saving, setSaving]     = useState(false);
  const [saveMsg, setSaveMsg]   = useState("");

  // Change password state
  const [showPw, setShowPw]     = useState(false);
  const [pwForm, setPwForm]     = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [pwError, setPwError]   = useState("");
  const [pwSuccess, setPwSuccess] = useState("");
  const [pwSaving, setPwSaving] = useState(false);

  useEffect(() => {
    getMyProfile()
      .then(data => {
        setProfile(data);
        setForm({ contactNo: data.contactNo || "", address: data.address || "" });
      })
      .catch(() => setError("Failed to load profile."))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true); setSaveMsg(""); setError("");
    try {
      const updated = await updateProfile({ contactNo: form.contactNo, address: form.address });
      setProfile(prev => ({ ...prev, contactNo: updated.contactNo, address: updated.address }));
      setEditing(false);
      setSaveMsg("Profile updated successfully.");
    } catch (err) {
      setError(err.response?.data?.error || "Update failed.");
    } finally { setSaving(false); }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPwError(""); setPwSuccess("");
    if (pwForm.newPassword !== pwForm.confirmPassword) { setPwError("New passwords do not match"); return; }
    if (pwForm.newPassword.length < 8) { setPwError("Password must be at least 8 characters"); return; }
    if (!/(?=.*[A-Za-z])(?=.*\d)/.test(pwForm.newPassword)) { setPwError("Password must contain at least one letter and one number"); return; }
    setPwSaving(true);
    try {
      await changePassword({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword, confirmPassword: pwForm.confirmPassword });
      setPwSuccess("Password changed successfully!");
      setPwForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setShowPw(false);
    } catch (err) {
      setPwError(err.response?.data?.error || "Failed to change password.");
    } finally { setPwSaving(false); }
  };

  const f = (key) => ({
    style: s.input,
    value: form[key],
    onChange: e => setForm({ ...form, [key]: e.target.value })
  });

  const pw = (key) => ({
    style: s.input,
    type: "password",
    value: pwForm[key],
    onChange: e => setPwForm({ ...pwForm, [key]: e.target.value })
  });

  if (loading) return (
    <div style={{ background: "#0f0f1a", minHeight: "100vh" }}><Navbar /><div style={{ ...s.page, textAlign: "center" }}><p style={{ color: "#64748b" }}>Loading profile…</p></div></div>
  );

  return (
    <div style={{ background: "#0f0f1a", minHeight: "100vh" }}>
      <Navbar />
      <div style={s.page}>
        <div style={s.header}>
          <div>
            <h1 style={s.title}>👤 My Profile</h1>
            <p style={s.sub}>Manage your account information</p>
          </div>
        </div>

        {error && <div style={s.err}>{error}</div>}
        {saveMsg && <div style={s.success}>{saveMsg}</div>}
        {pwSuccess && <div style={s.success}>{pwSuccess}</div>}

        {/* Profile Card */}
        <div style={s.card}>
          <div style={s.avatarRow}>
            <div style={s.avatar}>{profile?.username?.[0]?.toUpperCase() || "?"}</div>
            <div>
              <div style={s.username}>{profile?.username}</div>
              <div style={s.roleBadge}>{profile?.role}</div>
            </div>
          </div>

          <div style={s.divider} />

          {!editing ? (
            <>
              <div style={s.infoGrid}>
                <div style={s.infoItem}><span style={s.infoLabel}>Email</span><span style={s.infoValue}>{profile?.email}</span></div>
                <div style={s.infoItem}><span style={s.infoLabel}>Phone</span><span style={s.infoValue}>{profile?.contactNo || "—"}</span></div>
                <div style={s.infoItem}><span style={s.infoLabel}>Address</span><span style={s.infoValue}>{profile?.address || "—"}</span></div>
                <div style={s.infoItem}><span style={s.infoLabel}>Member Since</span><span style={s.infoValue}>{profile?.createdAt || "—"}</span></div>
              </div>
              <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
                <button style={s.editBtn} onClick={() => setEditing(true)}>✏️ Edit Profile</button>
                <button style={s.pwBtn} onClick={() => setShowPw(!showPw)}>{showPw ? "Cancel" : "🔒 Change Password"}</button>
              </div>
            </>
          ) : (
            <form onSubmit={handleSave}>
              <div style={s.infoGrid}>
                <div style={s.infoItem}><span style={s.infoLabel}>Email</span><span style={{ ...s.infoValue, color: "#64748b" }}>{profile?.email} (cannot change)</span></div>
                <div style={s.infoItem}>
                  <span style={s.infoLabel}>Phone</span>
                  <input placeholder="9876543210" {...f("contactNo")} />
                </div>
                <div style={s.infoItem}>
                  <span style={s.infoLabel}>Address</span>
                  <input placeholder="City, State" {...f("address")} />
                </div>
                <div style={s.infoItem}><span style={s.infoLabel}>Member Since</span><span style={s.infoValue}>{profile?.createdAt || "—"}</span></div>
              </div>
              <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
                <button style={s.saveBtn} type="submit" disabled={saving}>{saving ? "Saving…" : "💾 Save Changes"}</button>
                <button style={s.cancelBtn} type="button" onClick={() => setEditing(false)}>Cancel</button>
              </div>
            </form>
          )}
        </div>

        {/* Change Password Card */}
        {showPw && (
          <div style={s.card}>
            <h2 style={s.cardTitle}>🔒 Change Password</h2>
            <form onSubmit={handlePasswordChange}>
              <div style={s.pwField}>
                <label style={s.label}>Current Password</label>
                <input style={s.input} type="password" placeholder="Enter current password"
                  value={pwForm.currentPassword}
                  onChange={e => setPwForm({ ...pwForm, currentPassword: e.target.value })} />
              </div>
              <div style={s.pwField}>
                <label style={s.label}>New Password</label>
                <input style={s.input} type="password" placeholder="Min 8 chars, letters + numbers"
                  value={pwForm.newPassword}
                  onChange={e => setPwForm({ ...pwForm, newPassword: e.target.value })} />
              </div>
              <div style={s.pwField}>
                <label style={s.label}>Confirm New Password</label>
                <input style={s.input} type="password" placeholder="Repeat new password"
                  value={pwForm.confirmPassword}
                  onChange={e => setPwForm({ ...pwForm, confirmPassword: e.target.value })} />
              </div>
              {pwError && <div style={s.err}>{pwError}</div>}
              <button style={s.saveBtn} type="submit" disabled={pwSaving}>
                {pwSaving ? "Updating…" : "✅ Update Password"}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

const s = {
  page: { maxWidth: 680, margin: "auto", padding: "28px 20px 60px" },
  header: { marginBottom: 24 },
  title: { fontSize: 24, fontWeight: 800, color: "#f1f5f9", margin: 0 },
  sub: { fontSize: 14, color: "#64748b", margin: "4px 0 0" },
  err: { background: "#2d1515", border: "1px solid #7f1d1d", borderRadius: 10, padding: 12, fontSize: 13, color: "#f87171", marginBottom: 16 },
  success: { background: "#052e16", border: "1px solid #166534", borderRadius: 10, padding: 14, fontSize: 14, color: "#4ade80", marginBottom: 16 },
  card: { background: "#13131f", border: "1px solid #2d2d4e", borderRadius: 16, padding: "24px", marginBottom: 20 },
  avatarRow: { display: "flex", alignItems: "center", gap: 16, marginBottom: 16 },
  avatar: { width: 56, height: 56, borderRadius: "50%", background: "linear-gradient(135deg,#4f46e5,#818cf8)", color: "#fff", fontSize: 22, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  username: { fontSize: 18, fontWeight: 700, color: "#f1f5f9" },
  roleBadge: { display: "inline-block", background: "#1e1b4b", color: "#818cf8", fontSize: 11, fontWeight: 700, padding: "2px 10px", borderRadius: 20, marginTop: 4 },
  divider: { height: 1, background: "#2d2d4e", marginBottom: 16 },
  infoGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px 24px", marginBottom: 16 },
  infoItem: { display: "flex", flexDirection: "column", gap: 4 },
  infoLabel: { fontSize: 12, fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: 0.5 },
  infoValue: { fontSize: 14, color: "#f1f5f9", fontWeight: 500 },
  input: { width: "100%", padding: "10px 13px", fontSize: 14, borderRadius: 10, border: "1.5px solid #2d2d4e", outline: "none", color: "#f1f5f9", background: "#1a1a2e", boxSizing: "border-box" },
  editBtn: { background: "#1e1b4b", color: "#818cf8", border: "1px solid #4f46e5", padding: "9px 18px", borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: "pointer" },
  pwBtn: { background: "#2d1515", color: "#f87171", border: "1px solid #7f1d1d", padding: "9px 18px", borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: "pointer" },
  saveBtn: { background: "linear-gradient(135deg,#4f46e5,#818cf8)", color: "#fff", border: "none", padding: "10px 22px", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: "pointer" },
  cancelBtn: { background: "none", color: "#64748b", border: "1px solid #2d2d4e", padding: "10px 22px", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: "pointer" },
  cardTitle: { fontSize: 16, fontWeight: 700, color: "#f1f5f9", marginBottom: 16 },
  pwField: { marginBottom: 14 },
  label: { display: "block", fontSize: 13, fontWeight: 600, color: "#94a3b8", marginBottom: 6 },
};
