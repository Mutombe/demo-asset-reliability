/* ARS portal/admin API client. Base URL is baked at build time; override with
   VITE_API_BASE. The admin JWT lives in localStorage. */
export const API_BASE = (import.meta.env.VITE_API_BASE || 'https://demo-asset-reliability-api.onrender.com').replace(/\/$/, '');

const TKEY = 'ars_admin_token';
export const getToken = () => localStorage.getItem(TKEY);
export const setToken = (t) => (t ? localStorage.setItem(TKEY, t) : localStorage.removeItem(TKEY));

async function req(path, { method = 'GET', body, auth = false } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (auth) {
    const t = getToken();
    if (t) headers.Authorization = `Bearer ${t}`;
  }
  let res;
  try {
    res = await fetch(API_BASE + path, { method, headers, body: body ? JSON.stringify(body) : undefined });
  } catch {
    throw new Error('Cannot reach the server. It may be waking up — try again in a moment.');
  }
  if (res.status === 204) return null;
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.detail || `Request failed (${res.status})`);
  return data;
}

/* ── client portal ── */
export const portalAccess = (code, pin) => req('/api/portal/access', { method: 'POST', body: { code, pin } });

/* ── admin auth ── */
export const adminLogin = (passcode) => req('/api/admin/login', { method: 'POST', body: { passcode } });
export const adminGoogle = (credential) => req('/api/auth/google', { method: 'POST', body: { credential } });

/* ── admin data ── */
export const listClients = () => req('/api/admin/clients', { auth: true });
export const getClient = (id) => req(`/api/admin/clients/${id}`, { auth: true });
export const createClient = (body) => req('/api/admin/clients', { method: 'POST', body, auth: true });
export const regenPin = (id) => req(`/api/admin/clients/${id}/regenerate-pin`, { method: 'POST', auth: true });
export const deleteClient = (id) => req(`/api/admin/clients/${id}`, { method: 'DELETE', auth: true });

export const createProject = (cid, body) => req(`/api/admin/clients/${cid}/projects`, { method: 'POST', body, auth: true });
export const updateProject = (pid, body) => req(`/api/admin/projects/${pid}`, { method: 'PATCH', body, auth: true });
export const deleteProject = (pid) => req(`/api/admin/projects/${pid}`, { method: 'DELETE', auth: true });

export const addWorklog = (pid, body) => req(`/api/admin/projects/${pid}/worklogs`, { method: 'POST', body, auth: true });
export const addMilestone = (pid, body) => req(`/api/admin/projects/${pid}/milestones`, { method: 'POST', body, auth: true });
export const toggleMilestone = (mid, done) => req(`/api/admin/milestones/${mid}`, { method: 'PATCH', body: { done }, auth: true });
export const addPhoto = (pid, body) => req(`/api/admin/projects/${pid}/photos`, { method: 'POST', body, auth: true });
export const getMap = () => req('/api/admin/map', { auth: true });

/* status → brand colour, shared by map + badges */
export const STATUS_HEX = { Planning: '#6b7280', Active: '#e2211c', 'On hold': '#e8930c', Completed: '#1fae6b' };
export const STATUSES = ['Planning', 'Active', 'On hold', 'Completed'];
