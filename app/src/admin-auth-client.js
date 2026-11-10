// Frontend prototype access only. This is not a production authorization boundary.
const SESSION_KEY = "hakkita-admin-preview:v1";
let currentSession = null;
try {
  const saved = JSON.parse(sessionStorage.getItem(SESSION_KEY) || "null");
  if (saved?.mode === "frontend" && typeof saved.name === "string") currentSession = { ...saved, role: "admin" };
} catch { /* Keep access available when browser storage is unavailable. */ }
let snapshot = { status: currentSession ? "authenticated" : "anonymous", session: currentSession, configured: true, error: "" };
const listeners = new Set();
const notify = () => listeners.forEach((listener) => listener());
export const subscribeAdminAuth = (listener) => { listeners.add(listener); return () => listeners.delete(listener); };
export const getAdminAuthSnapshot = () => snapshot;
export const getAdminSession = () => snapshot.session;
function openWorkspace(email = "", provider = "frontend") {
  currentSession = { id: "frontend-admin", name: "Admin HAKKITA", email, role: "admin", mode: "frontend", provider };
  try { sessionStorage.setItem(SESSION_KEY, JSON.stringify(currentSession)); } catch { /* Memory access remains available. */ }
  snapshot = { status: "authenticated", session: currentSession, configured: true, error: "" };
  notify();
  return currentSession;
}
export async function refreshAdminSession({ enter = false } = {}) {
  return currentSession || (enter ? openWorkspace() : null);
}
export async function startAdminGoogleLogin() {
  return openWorkspace("", "google_frontend");
}
export async function signInAdminWithPassword(email = "") {
  return openWorkspace(email.trim());
}
export async function endAdminSession() {
  currentSession = null;
  try { sessionStorage.removeItem(SESSION_KEY); } catch { /* Clear memory even if storage is unavailable. */ }
  snapshot = { ...snapshot, status: "anonymous", session: null, error: "" }; notify();
}
