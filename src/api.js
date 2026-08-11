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

/* ── admin auth (real accounts) ── */
export const adminLogin = (email, password) => req('/api/admin/login', { method: 'POST', body: { email, password } });
export const adminRegister = (name, email, password) => req('/api/admin/register', { method: 'POST', body: { name, email, password } });
export const adminGoogle = (credential) => req('/api/auth/google', { method: 'POST', body: { credential } });

/* ── inventory ── */
export const listProducts = () => req('/api/admin/products', { auth: true });
export const createProductApi = (body) => req('/api/admin/products', { method: 'POST', body, auth: true });
export const updateProductApi = (id, body) => req(`/api/admin/products/${id}`, { method: 'PATCH', body, auth: true });
export const adjustStock = (id, delta) => req(`/api/admin/products/${id}/stock`, { method: 'POST', body: { delta }, auth: true });
export const deleteProductApi = (id) => req(`/api/admin/products/${id}`, { method: 'DELETE', auth: true });

/* ── site content (CMS) ── */
export const listContent = () => req('/api/admin/content', { auth: true });
export const createContentApi = (body) => req('/api/admin/content', { method: 'POST', body, auth: true });
export const updateContentApi = (id, body) => req(`/api/admin/content/${id}`, { method: 'PATCH', body, auth: true });
export const deleteContentApi = (id) => req(`/api/admin/content/${id}`, { method: 'DELETE', auth: true });

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

export const deletePhoto = (id) => req(`/api/admin/photos/${id}`, { method: 'DELETE', auth: true });
export const notifyClient = (cid, link) => req(`/api/admin/clients/${cid}/notify`, { method: 'POST', body: { link }, auth: true });

/* resolve a photo URL: uploaded photos are stored relative to the API host */
export const photoSrc = (url) => (!url ? '' : url.startsWith('http') ? url : API_BASE + url);

/* multipart photo upload */
export async function uploadPhoto(pid, file, caption = '') {
  const fd = new FormData(); fd.append('file', file); fd.append('caption', caption);
  const t = getToken();
  const res = await fetch(`${API_BASE}/api/admin/projects/${pid}/upload`, { method: 'POST', headers: t ? { Authorization: `Bearer ${t}` } : {}, body: fd });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.detail || 'Upload failed');
  return data;
}

/* PDF report download (returns nothing, triggers a browser download) */
async function downloadPdf(path, { method = 'GET', body, auth } = {}, filename = 'ARS-report.pdf') {
  const headers = {};
  if (auth) { const t = getToken(); if (t) headers.Authorization = `Bearer ${t}`; }
  if (body) headers['Content-Type'] = 'application/json';
  const res = await fetch(API_BASE + path, { method, headers, body: body ? JSON.stringify(body) : undefined });
  if (!res.ok) { const d = await res.json().catch(() => ({})); throw new Error(d.detail || 'Could not generate report'); }
  const blob = await res.blob();
  const u = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = u; a.download = filename; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(u), 4000);
}
export const adminReport = (pid, name = 'report') => downloadPdf(`/api/admin/projects/${pid}/report`, { auth: true }, `ARS-${name}.pdf`);
export const clientReport = (code, pin, projectId, name = 'report') => downloadPdf('/api/portal/report', { method: 'POST', body: { code, pin, project_id: projectId } }, `ARS-${name}.pdf`);

/* WhatsApp deep-link with the portal link + PIN prefilled */
export const waLink = (contact, link, pin) => {
  const num = (contact || '').replace(/\D/g, '');
  const msg = encodeURIComponent(`Hello, here is your Asset Reliability Services project portal:\n${link}\nYour access PIN: ${pin}`);
  return num ? `https://wa.me/${num}?text=${msg}` : `https://wa.me/?text=${msg}`;
};

/* status → brand colour, shared by map + badges */
export const STATUS_HEX = { Planning: '#6b7280', Active: '#e2211c', 'On hold': '#e8930c', Completed: '#1fae6b' };
export const STATUSES = ['Planning', 'Active', 'On hold', 'Completed'];
