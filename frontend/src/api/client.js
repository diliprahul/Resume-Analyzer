import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8081",
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("ra_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 || err.response?.status === 403) {
      localStorage.removeItem("ra_token");
      localStorage.removeItem("ra_user");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

// Auth
export const registerUser = (data) => api.post("/api/auth/register", data).then(r => r.data);
export const loginUser    = (data) => api.post("/api/auth/login", data).then(r => r.data);

// Jobs
export const getJobs    = ()    => api.get("/api/jobs").then(r => r.data);
export const getJobById = (id)  => api.get(`/api/jobs/${id}`).then(r => r.data);

// Resume
export const analyzeResume = (jobId, file) => {
  const form = new FormData();
  form.append("jobId", jobId);
  form.append("resume", file);
  return api.post("/api/resumes/analyze", form, {
    headers: { "Content-Type": "multipart/form-data" },
  }).then(r => r.data);
};
export const getMyResumes = () => api.get("/api/resumes/my").then(r => r.data);

export const freeAnalyzeResume = (file, jobDescription) => {
  const form = new FormData();
  form.append("resume", file);
  form.append("jobDescription", jobDescription || "");
  return api.post("/api/resumes/free-analyze", form, {
    headers: { "Content-Type": "multipart/form-data" },
  }).then(r => r.data);
};

// Chat
export const sendChatMessage = (message, context = "") =>
  api.post("/api/chat", { message, context }).then(r => r.data);

// Notifications
export const getNotifications = ()  => api.get("/api/notifications").then(r => r.data);
export const markAllRead      = ()  => api.post("/api/notifications/mark-read").then(r => r.data);

// Feedback
export const submitFeedback = (data) => api.post("/api/feedback", data).then(r => r.data);

// Admin
export const adminPostJob         = (data) => api.post("/api/admin/jobs", data).then(r => r.data);
export const adminGetJobs         = ()     => api.get("/api/admin/jobs").then(r => r.data);
export const adminDeleteJob       = (id)   => api.delete(`/api/admin/jobs/${id}`).then(r => r.data);
export const adminGetResumes      = ()     => api.get("/api/admin/resumes").then(r => r.data);
export const adminGetResumesByJob = (jobId)=> api.get(`/api/admin/resumes/job/${jobId}`).then(r => r.data);
export const adminGetFeedback     = ()     => api.get("/api/admin/feedback").then(r => r.data);
export const adminGetStats        = ()     => api.get("/api/admin/stats").then(r => r.data);
