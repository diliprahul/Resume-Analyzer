import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const isAdmin = user?.role === "ADMIN";
  const active = (path) => location.pathname === path || location.pathname.startsWith(path + "/");

  const navLinks = isAdmin
    ? [
        { to: "/admin", label: "Dashboard" },
        { to: "/admin/jobs", label: "Manage Jobs" },
        { to: "/admin/resumes", label: "Resumes" },
        { to: "/admin/feedback", label: "Feedback" },
      ]
    : [
        { to: "/", label: "Dashboard" },
        { to: "/jobs", label: "Jobs" },
        { to: "/analyze", label: "ATS Checker" },
        { to: "/my-results", label: "My Results" },
        { to: "/feedback", label: "Feedback" },
      ];

  return (
    <nav style={s.nav}>
      <div style={s.inner}>
        {/* Logo */}
        <Link to={isAdmin ? "/admin" : "/"} style={s.logo}>
          <span style={s.logoIcon}>◈</span>
          <span>Resume<span style={{ color: "#818cf8" }}>ATS</span></span>
          {isAdmin && <span style={s.adminBadge}>Admin</span>}
        </Link>

        {/* Desktop links */}
        <div style={s.links}>
          {navLinks.map(({ to, label }) => (
            <Link key={to} to={to}
              style={{ ...s.link, ...(active(to) && to !== "/" ? s.activeLink : to === "/" && location.pathname === "/" ? s.activeLink : {}) }}>
              {label}
            </Link>
          ))}
        </div>

        {/* User */}
        <div style={s.right}>
          <span style={s.username}>👤 {user?.username}</span>
          <button style={s.logoutBtn} onClick={() => { logout(); navigate("/login"); }}>
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}

const s = {
  nav: { background: "#13131f", borderBottom: "1px solid #2d2d4e", position: "sticky", top: 0, zIndex: 100 },
  inner: { maxWidth: 1200, margin: "auto", padding: "0 20px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between" },
  logo: { display: "flex", alignItems: "center", gap: 8, color: "#f1f5f9", fontWeight: 800, fontSize: 18, textDecoration: "none" },
  logoIcon: { color: "#818cf8", fontSize: 20 },
  adminBadge: { background: "#7c3aed", color: "#fff", fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 6, letterSpacing: 0.5 },
  links: { display: "flex", gap: 4, alignItems: "center" },
  link: { color: "#94a3b8", fontSize: 14, fontWeight: 500, padding: "6px 12px", borderRadius: 8, textDecoration: "none", transition: "all .15s" },
  activeLink: { color: "#818cf8", background: "#1e1b4b", fontWeight: 600 },
  right: { display: "flex", alignItems: "center", gap: 12 },
  username: { color: "#64748b", fontSize: 13 },
  logoutBtn: { background: "none", border: "1px solid #2d2d4e", color: "#94a3b8", padding: "6px 14px", borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: "pointer" },
};
