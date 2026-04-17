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

  const userLinks = [
    { to: "/", label: "Dashboard" },
    { to: "/jobs", label: "Jobs" },
    { to: "/analyze", label: "ATS Checker" },
    { to: "/my-results", label: "My Results" },
    { to: "/feedback", label: "Feedback" },
    { to: "/profile", label: "My Profile" },
  ];

  const adminLinks = [
    { to: "/admin", label: "Dashboard" },
    { to: "/admin/jobs", label: "Manage Jobs" },
    { to: "/admin/resumes", label: "Resumes" },
    { to: "/admin/feedback", label: "Feedback" },
  ];

  const navLinks = isAdmin ? adminLinks : userLinks;

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
        <div style={s.links} className="navbar-links">
          {navLinks.map(({ to, label }) => (
            <Link key={to} to={to}
              style={{ ...s.link, ...(active(to) && to !== "/" ? s.activeLink : to === "/" && location.pathname === "/" ? s.activeLink : {}) }}>
              {label}
            </Link>
          ))}
        </div>

        {/* User + Hamburger */}
        <div style={s.right} className="navbar-right">
          <span style={s.username}>👤 {user?.username}</span>
          <button style={s.logoutBtn} className="navbar-logout" onClick={() => { logout(); navigate("/login"); }}>
            Logout
          </button>
          {/* Mobile hamburger */}
          <button style={{ ...s.hamburger, display: "none" }} className="navbar-hamburger" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
            <span style={{ ...s.hamburgerLine, ...(menuOpen ? s.hamburgerLineOpen1 : {}) }} />
            <span style={{ ...s.hamburgerLine, ...(menuOpen ? s.hamburgerLineOpen2 : {}) }} />
            <span style={{ ...s.hamburgerLine, ...(menuOpen ? s.hamburgerLineOpen3 : {}) }} />
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div style={s.mobileMenu}>
          {navLinks.map(({ to, label }) => (
            <Link key={to} to={to} style={{ ...s.mobileLink, ...(active(to) ? s.activeMobileLink : {}) }}
              onClick={() => setMenuOpen(false)}>
              {label}
            </Link>
          ))}
          <div style={s.mobileDivider} />
          <Link to="/profile" style={{ ...s.mobileLink, ...(active("/profile") ? s.activeMobileLink : {}) }}
            onClick={() => setMenuOpen(false)}>
            🔒 My Profile
          </Link>
        </div>
      )}
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
  hamburger: { display: "none", flexDirection: "column", gap: 5, background: "none", border: "none", cursor: "pointer", padding: 4 },
  hamburgerLine: { display: "block", width: 22, height: 2, background: "#94a3b8", borderRadius: 2, transition: "all .2s" },
  hamburgerLineOpen1: { transform: "translateY(7px) rotate(45deg)" },
  hamburgerLineOpen2: { opacity: 0 },
  hamburgerLineOpen3: { transform: "translateY(-7px) rotate(-45deg)" },
  mobileMenu: { display: "flex", flexDirection: "column", background: "#0f0f1a", borderTop: "1px solid #2d2d4e", padding: "8px 0" },
  mobileLink: { color: "#94a3b8", fontSize: 14, fontWeight: 500, padding: "10px 20px", textDecoration: "none", transition: "all .15s" },
  activeMobileLink: { color: "#818cf8", background: "#1e1b4b", fontWeight: 600 },
  mobileDivider: { height: 1, background: "#2d2d4e", margin: "4px 0" },
};

// Responsive: show hamburger only on small screens via CSS injection
const style = document.createElement("style");
style.textContent = `
  @media (max-width: 768px) {
    .navbar-links { display: none !important; }
    .navbar-right > span,
    .navbar-right > button.navbar-logout { display: none !important; }
    .navbar-right > button.navbar-hamburger { display: flex !important; }
  }
`;
if (!document.head.querySelector("style[data-navbar]")) {
  style.setAttribute("data-navbar", "true");
  document.head.appendChild(style);
}
