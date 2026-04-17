import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Login       from "./pages/Login";
import Register    from "./pages/Register";
import Dashboard   from "./pages/Dashboard";
import Jobs        from "./pages/Jobs";
import UploadResume from "./pages/UploadResume";
import MyResults   from "./pages/MyResults";
import Feedback    from "./pages/Feedback";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminJobs   from "./pages/admin/AdminJobs";
import AdminResumes from "./pages/admin/AdminResumes";
import AdminFeedback from "./pages/admin/AdminFeedback";
import FreeAnalyzer from "./pages/FreeAnalyzer";
import Profile     from "./pages/Profile";

const Protected = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
};

const AdminOnly = ({ children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== "ADMIN") return <Navigate to="/" replace />;
  return children;
};

const GuestOnly = ({ children }) => {
  const { user } = useAuth();
  return !user ? children : <Navigate to="/" replace />;
};

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login"    element={<GuestOnly><Login /></GuestOnly>} />
        <Route path="/register" element={<GuestOnly><Register /></GuestOnly>} />
        <Route path="/"         element={<Protected><Dashboard /></Protected>} />
        <Route path="/jobs"     element={<Jobs />} />
        <Route path="/jobs/:id/apply" element={<Protected><UploadResume /></Protected>} />
        <Route path="/my-results"     element={<Protected><MyResults /></Protected>} />
        <Route path="/feedback"       element={<Protected><Feedback /></Protected>} />
        <Route path="/analyze"        element={<Protected><FreeAnalyzer /></Protected>} />
        <Route path="/profile"        element={<Protected><Profile /></Protected>} />
        <Route path="/admin"          element={<AdminOnly><AdminDashboard /></AdminOnly>} />
        <Route path="/admin/jobs"     element={<AdminOnly><AdminJobs /></AdminOnly>} />
        <Route path="/admin/resumes"  element={<AdminOnly><AdminResumes /></AdminOnly>} />
        <Route path="/admin/feedback" element={<AdminOnly><AdminFeedback /></AdminOnly>} />
        <Route path="*"               element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
