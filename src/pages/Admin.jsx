import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from '../components/Icon';
import WorkMap from '../components/WorkMap';
import Modal from '../components/Modal';
import { Skeleton, SkeletonStats, SkeletonTable, SkeletonCards, SkeletonMap, SkeletonList } from '../components/Skeleton';
import { AuthBackdrop } from './Portal';

/* in-memory cache so switching tabs shows the last data instantly (refetched in
   the background) instead of flashing a skeleton every visit. */
const cache = { clients: null, pins: null, products: null, content: null, detail: {} };

/* list entrance: a soft staggered cascade */
const listV = { show: { transition: { staggerChildren: 0.035 } } };
const itemV = { hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0, transition: { duration: 0.28 } } };
import {
  API_BASE, getToken, setToken, adminLogin, adminRegister, adminGoogle, listClients, getClient, createClient,
  regenPin, deleteClient, createProject, updateProject, deleteProject, addWorklog, addMilestone,
  toggleMilestone, addPhoto, getMap, STATUS_HEX, STATUSES,
  uploadPhoto, deletePhoto, notifyClient, adminReport, waLink, photoSrc,
  listProducts, createProductApi, updateProductApi, adjustStock, deleteProductApi,
  stockMovement, productMovements,
  listSuppliers, createSupplier, updateSupplier, deleteSupplier,
  listPOs, createPO, receivePO, updatePO, deletePO, allMovements,
  addTask, updateTask, deleteTask, addDoc, deleteDoc, addValuation, updateValuation, deleteValuation,
  listContent, createContentApi, updateContentApi, deleteContentApi,
} from '../api';

const GOOGLE_CLIENT_ID = '961906050297-3taptq0frt5digsbi7tj0058v6g0sf19.apps.googleusercontent.com';
const money = (n) => 'US$' + Number(n || 0).toLocaleString();
const portalLink = (slug) => `${window.location.origin}/portal?c=${slug}`;
const copy = (t, msg) => { navigator.clipboard?.writeText(t); toast.success(msg || 'Copied'); };

function Field({ label, children }) {
  return <label className="block"><span className="field-label">{label}</span>{children}</label>;
}
function StatusPill({ s }) {
  const c = STATUS_HEX[s] || '#e2211c';
  return <span className="inline-flex items-center gap-1.5 font-mono text-[0.66rem] uppercase px-2 py-0.5 rounded" style={{ color: c, background: `${c}18` }}><span className="w-1.5 h-1.5 rounded-full" style={{ background: c }} /> {s}</span>;
}

/* ═══════════════ ADMIN AUTH — MODAL (sign in / register + Google) ═══════════════ */
function AdminLogin({ onIn }) {
  const nav = useNavigate();
  const [mode, setMode] = useState('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault(); setBusy(true);
    try {
      const r = mode === 'login' ? await adminLogin(email, pass) : await adminRegister(name, email, pass);
      setToken(r.token); toast.success(mode === 'login' ? 'Signed in' : 'Account created'); onIn(r.admin);
    } catch (err) { toast.error(err.message); } finally { setBusy(false); }
  };

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return;
    const id = 'gsi-script';
    const init = () => {
      try {
        window.google?.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: async (resp) => {
            try { const r = await adminGoogle(resp.credential); setToken(r.token); onIn(r.admin); toast.success(`Welcome, ${r.admin.name}`); }
            catch (err) { toast.error(err.message || 'Google sign-in failed'); }
          },
        });
        const el = document.getElementById('gbtn');
        if (el) window.google.accounts.id.renderButton(el, { theme: 'outline', size: 'large', width: 336, text: 'continue_with' });
      } catch { /* origins not authorised — passcode/password still works */ }
    };
    if (document.getElementById(id)) { setTimeout(init, 60); return; }
    const s = document.createElement('script');
    s.src = 'https://accounts.google.com/gsi/client'; s.async = true; s.defer = true; s.id = id; s.onload = init;
    document.body.appendChild(s);
  }, [onIn]);

  return (
    <>
      <AuthBackdrop
        title={<>The reliability <span className="text-red-400">command centre.</span></>}
        sub="Clients, deep project tracking, a live work map, inventory and your website content — all in one console."
        chips={[['dashboard', 'Projects'], ['box', 'Inventory'], ['file', 'Site content']]}
      />
      <Modal open onClose={() => nav('/')} maxW="max-w-md">
        <div className="p-7 sm:p-8">
          <p className="kicker mb-3">Admin console</p>
          <h1 className="display-3 text-steel-50">{mode === 'login' ? 'Welcome back' : 'Create your account'}</h1>
          <p className="text-steel-400 mt-2 text-sm">Manage projects, clients, inventory and site content.</p>

          <div id="gbtn" className="mt-6 flex justify-center [color-scheme:light]" />
          <div className="flex items-center gap-3 my-5"><span className="h-px flex-1 bg-steel-800" /><span className="mono-label text-steel-500">or email</span><span className="h-px flex-1 bg-steel-800" /></div>

          <div className="flex gap-1 p-1 rounded-lg bg-steel-900 mb-4">
            {[['login', 'Sign in'], ['register', 'Register']].map(([m, l]) => (
              <button key={m} onClick={() => setMode(m)} className={`flex-1 py-2 rounded-md font-display text-sm transition-colors ${mode === m ? 'bg-red-500 text-white' : 'text-steel-400 hover:text-steel-100'}`}>{l}</button>
            ))}
          </div>

          <form onSubmit={submit} className="space-y-3">
            {mode === 'register' && <Field label="Full name"><input value={name} onChange={(e) => setName(e.target.value)} className="input" placeholder="Your name" /></Field>}
            <Field label="Email"><input value={email} onChange={(e) => setEmail(e.target.value)} type="email" className="input" placeholder="you@ars.co.zw" autoCapitalize="none" /></Field>
            <Field label="Password"><input value={pass} onChange={(e) => setPass(e.target.value)} type="password" className="input" placeholder="••••••••" /></Field>
            <button type="submit" disabled={busy} className="btn btn-red w-full !py-3.5 disabled:opacity-60">{busy ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'}</button>
          </form>
          <p className="text-center text-sm text-steel-400 mt-4"><Link to="/portal" className="text-red-400 link-underline">Client portal →</Link></p>
        </div>
      </Modal>
    </>
  );
}

/* ═══════════════ PROJECT MANAGE ═══════════════ */
const EMPTY_PROJECT = { title: '', type: 'Condition monitoring', status: 'Planning', progress: 0, budget: 0, spent: 0, location: '', lat: '', lng: '', start_date: '', due_date: '', description: '' };

function ProjectManage({ project, onBack, reload }) {
  const [p, setP] = useState(project);
  const [saving, setSaving] = useState(false);
  const [ml, setMl] = useState({ title: '', due: '' });
  const [wl, setWl] = useState({ date: '', title: '', note: '', status: 'Logged' });
  const [ph, setPh] = useState({ url: '', caption: '' });
  const set = (k, v) => setP((x) => ({ ...x, [k]: v }));

  const save = async () => {
    setSaving(true);
    try {
      const body = { ...p, progress: Number(p.progress) || 0, budget: Number(p.budget) || 0, spent: Number(p.spent) || 0,
        lat: p.lat === '' || p.lat == null ? null : Number(p.lat), lng: p.lng === '' || p.lng == null ? null : Number(p.lng) };
      const up = await updateProject(p.id, body); setP({ ...p, ...up }); toast.success('Project saved'); reload();
    } catch (err) { toast.error(err.message); } finally { setSaving(false); }
  };
  const refresh = async () => { const c = await reload(); const fresh = c?.projects?.find((x) => x.id === p.id); if (fresh) setP(fresh); };
  const doMilestone = async () => { if (!ml.title) return; await addMilestone(p.id, ml); setMl({ title: '', due: '' }); await refresh(); toast.success('Milestone added'); };
  const doToggle = async (m) => { await toggleMilestone(m.id, !m.done); await refresh(); };
  const doWorklog = async () => { if (!wl.title) return; await addWorklog(p.id, wl); setWl({ date: '', title: '', note: '', status: 'Logged' }); await refresh(); toast.success('Update logged'); };
  const doPhoto = async () => { if (!ph.url) return; await addPhoto(p.id, ph); setPh({ url: '', caption: '' }); await refresh(); toast.success('Photo added'); };
  const [upBusy, setUpBusy] = useState(false);
  const doUpload = async (e) => {
    const f = e.target.files?.[0]; if (!f) return;
    setUpBusy(true);
    try { await uploadPhoto(p.id, f, ph.caption); setPh({ url: '', caption: '' }); await refresh(); toast.success('Photo uploaded'); }
    catch (err) { toast.error(err.message); } finally { setUpBusy(false); e.target.value = ''; }
  };
  const doDelPhoto = async (id) => { await deletePhoto(id); await refresh(); toast('Photo removed'); };
  const [pmTab, setPmTab] = useState('overview');
  const [tk, setTk] = useState({ title: '', assignee: '', status: 'To do', priority: 'Normal', due: '' });
  const [dc, setDc] = useState({ name: '', url: '', kind: 'Document' });
  const [vl, setVl] = useState({ ref: '', amount: '', status: 'Draft', note: '' });
  const doTask = async () => { if (!tk.title) return; await addTask(p.id, tk); setTk({ title: '', assignee: '', status: 'To do', priority: 'Normal', due: '' }); await refresh(); toast.success('Task added'); };
  const doTaskStatus = async (t, status) => { await updateTask(t.id, { status }); await refresh(); };
  const doDelTask = async (id) => { await deleteTask(id); await refresh(); };
  const doDoc = async () => { if (!dc.name) return; await addDoc(p.id, dc); setDc({ name: '', url: '', kind: 'Document' }); await refresh(); toast.success('Document added'); };
  const doDelDoc = async (id) => { await deleteDoc(id); await refresh(); toast('Document removed'); };
  const doVal = async () => { if (!vl.ref && !vl.amount) { toast.error('Add a ref or amount'); return; } await addValuation(p.id, { ...vl, amount: Number(vl.amount) || 0 }); setVl({ ref: '', amount: '', status: 'Draft', note: '' }); await refresh(); toast.success('Valuation added'); };
  const doValStatus = async (v, status) => { await updateValuation(v.id, { status }); await refresh(); };
  const doDelVal = async (id) => { await deleteValuation(id); await refresh(); };
  const [rep, setRep] = useState(false);
  const report = async () => { setRep(true); try { await adminReport(p.id, (p.title || 'project').replace(/\s+/g, '-').toLowerCase()); toast.success('Report downloaded'); } catch (e) { toast.error(e.message); } finally { setRep(false); } };
  const remove = async () => { await deleteProject(p.id); toast('Project deleted'); reload(); onBack(); };

  const PM_TABS = [['overview', 'Overview'], ['tasks', 'Tasks'], ['milestones', 'Milestones'], ['diary', 'Site diary'], ['documents', 'Documents'], ['valuations', 'Valuations'], ['photos', 'Photos']];
  const TASK_COLS = ['To do', 'In progress', 'Blocked', 'Done'];
  const TASK_HEX = { 'To do': '#6b7280', 'In progress': '#e8930c', 'Blocked': '#e2211c', 'Done': '#1fae6b' };
  const VAL_HEX = { Draft: '#6b7280', Submitted: '#e8930c', Certified: '#234f9e', Paid: '#1fae6b' };
  const tasks = p.tasks || [], docs = p.documents || [], vals = p.valuations || [];
  const certified = vals.filter((v) => v.status === 'Certified' || v.status === 'Paid').reduce((a, v) => a + v.amount, 0);
  const counts = { tasks: tasks.length, documents: docs.length, valuations: vals.length, milestones: (p.milestones || []).length, photos: (p.photos || []).length, diary: (p.worklogs || []).length };

  return (
    <div>
      <nav className="flex items-center gap-1.5 text-sm mb-4"><button onClick={onBack} className="inline-flex items-center gap-1.5 text-steel-400 hover:text-red-400"><Icon name="arrowLeft" className="w-4 h-4" /> Projects</button><Icon name="chevronRight" className="w-3.5 h-3.5 text-steel-600" /><span className="text-steel-100 truncate max-w-[40vw]">{p.title || 'Untitled'}</span></nav>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3"><StatusPill s={p.status} /><h2 className="font-display text-xl text-steel-50">{p.title || 'Untitled project'}</h2></div>
        <div className="flex gap-2">
          <button onClick={report} disabled={rep} className="btn btn-ghost !py-2 !px-3 text-[0.78rem] disabled:opacity-60"><Icon name="download" className="w-4 h-4" /> {rep ? '…' : 'PDF'}</button>
          <button onClick={remove} className="btn btn-ghost !py-2 !px-3 text-[0.78rem] hover:!text-red-500">Delete</button>
          <button onClick={save} disabled={saving} className="btn btn-red !py-2.5">{saving ? 'Saving…' : 'Save changes'}</button>
        </div>
      </div>

      <div className="flex gap-1 mb-5 border-b border-[#e7e9ee] overflow-x-auto no-scrollbar">
        {PM_TABS.map(([id, lbl]) => (
          <button key={id} onClick={() => setPmTab(id)} className={`shrink-0 px-3.5 py-2.5 font-display text-sm border-b-2 -mb-px transition-colors ${pmTab === id ? 'border-red-500 text-steel-50' : 'border-transparent text-steel-400 hover:text-steel-100'}`}>{lbl}{counts[id] ? <span className="ml-1.5 text-steel-500">{counts[id]}</span> : ''}</button>
        ))}
      </div>

      {pmTab === 'overview' && (
        <div className="panel p-5 sm:p-6 grid sm:grid-cols-2 gap-4">
          <Field label="Title"><input className="input" value={p.title} onChange={(e) => set('title', e.target.value)} /></Field>
          <Field label="Type of work"><input className="input" value={p.type} onChange={(e) => set('type', e.target.value)} /></Field>
          <Field label="Status"><select className="input" value={p.status} onChange={(e) => set('status', e.target.value)}>{STATUSES.map((s) => <option key={s}>{s}</option>)}</select></Field>
          <Field label={`Progress — ${p.progress}%`}><input type="range" min="0" max="100" value={p.progress} onChange={(e) => set('progress', e.target.value)} className="w-full accent-red-500" /></Field>
          <Field label="Contract value (US$)"><input type="number" className="input" value={p.budget} onChange={(e) => set('budget', e.target.value)} /></Field>
          <Field label="Spent to date (US$)"><input type="number" className="input" value={p.spent} onChange={(e) => set('spent', e.target.value)} /></Field>
          <Field label="Start date"><input type="date" className="input" value={p.start_date} onChange={(e) => set('start_date', e.target.value)} /></Field>
          <Field label="Due date"><input type="date" className="input" value={p.due_date} onChange={(e) => set('due_date', e.target.value)} /></Field>
          <Field label="Location"><input className="input" value={p.location} onChange={(e) => set('location', e.target.value)} placeholder="e.g. Zvishavane" /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Latitude"><input className="input" value={p.lat ?? ''} onChange={(e) => set('lat', e.target.value)} placeholder="-20.33" /></Field>
            <Field label="Longitude"><input className="input" value={p.lng ?? ''} onChange={(e) => set('lng', e.target.value)} placeholder="30.07" /></Field>
          </div>
          <div className="sm:col-span-2"><Field label="Description"><textarea className="input min-h-[80px]" value={p.description} onChange={(e) => set('description', e.target.value)} /></Field></div>
        </div>
      )}

      {pmTab === 'tasks' && (
        <>
          <div className="panel p-4 mb-4 grid sm:grid-cols-[2fr_1fr_1fr_auto_auto] gap-2 items-end">
            <Field label="Task"><input className="input !py-2" value={tk.title} onChange={(e) => setTk({ ...tk, title: e.target.value })} placeholder="What needs doing" /></Field>
            <Field label="Assignee"><input className="input !py-2" value={tk.assignee} onChange={(e) => setTk({ ...tk, assignee: e.target.value })} /></Field>
            <Field label="Due"><input type="date" className="input !py-2" value={tk.due} onChange={(e) => setTk({ ...tk, due: e.target.value })} /></Field>
            <Field label="Priority"><select className="input !py-2" value={tk.priority} onChange={(e) => setTk({ ...tk, priority: e.target.value })}>{['Low', 'Normal', 'High'].map((x) => <option key={x}>{x}</option>)}</select></Field>
            <button onClick={doTask} className="btn btn-red !py-2.5"><Icon name="plus" className="w-4 h-4" /> Add</button>
          </div>
          <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-3">
            {TASK_COLS.map((col) => (
              <div key={col} className="panel-800 p-3 min-h-[8rem]">
                <div className="flex items-center gap-2 mb-2.5 px-1"><span className="w-2 h-2 rounded-full" style={{ background: TASK_HEX[col] }} /><span className="mono-label text-steel-400">{col}</span><span className="mono-label text-steel-500 ml-auto">{tasks.filter((t) => t.status === col).length}</span></div>
                <div className="space-y-2">
                  <AnimatePresence initial={false}>
                    {tasks.filter((t) => t.status === col).map((t) => (
                      <motion.div key={t.id} layout initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96 }} className="panel p-3">
                        <div className="flex items-start justify-between gap-2"><p className="text-sm text-steel-100 leading-snug">{t.title}</p><button onClick={() => doDelTask(t.id)} className="text-steel-500 hover:text-red-400 shrink-0"><Icon name="x" className="w-3.5 h-3.5" /></button></div>
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                          {t.priority === 'High' && <span className="mono-label" style={{ color: 'var(--color-crit)' }}>High</span>}
                          {t.assignee && <span className="mono-label text-steel-500">{t.assignee}</span>}
                          {t.due && <span className="mono-label text-steel-500">· {t.due}</span>}
                        </div>
                        <select value={t.status} onChange={(e) => doTaskStatus(t, e.target.value)} className="input !py-1 !px-2 text-[0.72rem] mt-2 w-full">{TASK_COLS.map((c) => <option key={c}>{c}</option>)}</select>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {pmTab === 'milestones' && (
        <div className="panel p-5 max-w-2xl">
          <ul className="space-y-2 mb-4">
            {(p.milestones || []).map((m) => (
              <li key={m.id} className="flex items-center gap-3"><button onClick={() => doToggle(m)} className={`grid place-items-center w-5 h-5 rounded-full shrink-0 ${m.done ? 'bg-[color:var(--color-ok)] text-white' : 'bg-steel-800 text-steel-500 hover:text-red-400'}`}><Icon name="check" className="w-3 h-3" /></button><span className={`text-sm flex-1 ${m.done ? 'text-steel-300 line-through' : 'text-steel-200'}`}>{m.title}</span><span className="mono-label text-steel-500">{m.due}</span></li>
            ))}
            {!(p.milestones || []).length && <p className="mono-label text-steel-500">No milestones yet.</p>}
          </ul>
          <div className="flex gap-2"><input className="input !py-2 flex-1" placeholder="Milestone" value={ml.title} onChange={(e) => setMl({ ...ml, title: e.target.value })} /><input type="date" className="input !py-2 w-36" value={ml.due} onChange={(e) => setMl({ ...ml, due: e.target.value })} /><button onClick={doMilestone} className="btn btn-red !py-2 !px-3"><Icon name="plus" className="w-4 h-4" /></button></div>
        </div>
      )}

      {pmTab === 'diary' && (
        <div className="panel p-5 max-w-2xl">
          <ol className="space-y-3 mb-4 max-h-[26rem] overflow-y-auto">
            {(p.worklogs || []).map((w) => (<li key={w.id} className="border-l-2 border-red-500 pl-3"><p className="mono-label text-red-400">{w.date} · {w.status}</p><p className="text-sm text-steel-100">{w.title}</p>{w.note && <p className="text-sm text-steel-400">{w.note}</p>}</li>))}
            {!(p.worklogs || []).length && <p className="mono-label text-steel-500">No site-diary entries yet.</p>}
          </ol>
          <div className="space-y-2">
            <div className="flex gap-2"><input type="date" className="input !py-2 w-36" value={wl.date} onChange={(e) => setWl({ ...wl, date: e.target.value })} /><input className="input !py-2 flex-1" placeholder="Update title" value={wl.title} onChange={(e) => setWl({ ...wl, title: e.target.value })} /></div>
            <div className="flex gap-2"><input className="input !py-2 flex-1" placeholder="Note" value={wl.note} onChange={(e) => setWl({ ...wl, note: e.target.value })} /><button onClick={doWorklog} className="btn btn-red !py-2 !px-3"><Icon name="plus" className="w-4 h-4" /></button></div>
          </div>
        </div>
      )}

      {pmTab === 'documents' && (
        <div className="panel p-5 max-w-3xl">
          <div className="space-y-2 mb-4">
            {docs.map((d) => (
              <div key={d.id} className="flex items-center gap-3 panel-800 p-3">
                <span className="grid place-items-center w-9 h-9 rounded bg-steel-800 text-red-500 shrink-0"><Icon name="file" className="w-5 h-5" /></span>
                <div className="flex-1 min-w-0"><p className="text-sm text-steel-100 truncate">{d.name}</p><p className="mono-label text-steel-500">{d.kind} · {d.date}</p></div>
                {d.url && <a href={d.url} target="_blank" rel="noreferrer" className="btn btn-ghost !py-1.5 !px-2.5 text-[0.72rem]">Open</a>}
                <button onClick={() => doDelDoc(d.id)} className="text-steel-500 hover:text-red-400"><Icon name="x" className="w-4 h-4" /></button>
              </div>
            ))}
            {!docs.length && <p className="mono-label text-steel-500">No documents yet.</p>}
          </div>
          <div className="grid sm:grid-cols-[2fr_1fr_2fr_auto] gap-2 items-end">
            <Field label="Name"><input className="input !py-2" value={dc.name} onChange={(e) => setDc({ ...dc, name: e.target.value })} /></Field>
            <Field label="Kind"><select className="input !py-2" value={dc.kind} onChange={(e) => setDc({ ...dc, kind: e.target.value })}>{['Document', 'Report', 'Certificate', 'Drawing', 'Photo'].map((k) => <option key={k}>{k}</option>)}</select></Field>
            <Field label="Link (optional)"><input className="input !py-2" value={dc.url} onChange={(e) => setDc({ ...dc, url: e.target.value })} placeholder="https://…" /></Field>
            <button onClick={doDoc} className="btn btn-red !py-2.5"><Icon name="plus" className="w-4 h-4" /></button>
          </div>
        </div>
      )}

      {pmTab === 'valuations' && (
        <div className="panel p-5">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div><p className="mono-label text-steel-500">Certified / paid to date</p><p className="font-display text-2xl text-steel-50 tabnum">{money(certified)}</p></div>
            <p className="text-sm text-steel-400">of {money(p.budget)} contract</p>
          </div>
          <div className="space-y-2 mb-4">
            {vals.map((v) => (
              <div key={v.id} className="flex flex-wrap items-center gap-3 panel-800 p-3">
                <div className="min-w-[7rem]"><p className="font-mono text-sm text-red-400">{v.ref || '—'}</p><p className="mono-label text-steel-500">{v.date}</p></div>
                <p className="font-display text-lg text-steel-50 tabnum">{money(v.amount)}</p>
                <span className="text-sm text-steel-400 flex-1 truncate">{v.note}</span>
                <select value={v.status} onChange={(e) => doValStatus(v, e.target.value)} className="input !py-1 !px-2 text-[0.72rem] w-32" style={{ color: VAL_HEX[v.status] }}>{['Draft', 'Submitted', 'Certified', 'Paid'].map((s) => <option key={s}>{s}</option>)}</select>
                <button onClick={() => doDelVal(v.id)} className="text-steel-500 hover:text-red-400"><Icon name="x" className="w-4 h-4" /></button>
              </div>
            ))}
            {!vals.length && <p className="mono-label text-steel-500">No valuations raised yet.</p>}
          </div>
          <div className="grid sm:grid-cols-[1fr_1fr_2fr_auto] gap-2 items-end">
            <Field label="Ref"><input className="input !py-2" value={vl.ref} onChange={(e) => setVl({ ...vl, ref: e.target.value })} placeholder="VAL-003" /></Field>
            <Field label="Amount (US$)"><input type="number" className="input !py-2" value={vl.amount} onChange={(e) => setVl({ ...vl, amount: e.target.value })} /></Field>
            <Field label="Note"><input className="input !py-2" value={vl.note} onChange={(e) => setVl({ ...vl, note: e.target.value })} /></Field>
            <button onClick={doVal} className="btn btn-red !py-2.5"><Icon name="plus" className="w-4 h-4" /></button>
          </div>
        </div>
      )}

      {pmTab === 'photos' && (
        <div className="panel p-5">
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-2 mb-4">
            {(p.photos || []).map((x) => (
              <figure key={x.id} className="cover-frame aspect-square relative group">
                <img src={photoSrc(x.url)} alt={x.caption} className="absolute inset-0 w-full h-full object-cover duotone" />
                <button onClick={() => doDelPhoto(x.id)} className="absolute top-1 right-1 grid place-items-center w-6 h-6 rounded bg-steel-950/70 text-white opacity-0 group-hover:opacity-100 hover:bg-red-500 transition"><Icon name="x" className="w-3.5 h-3.5" /></button>
              </figure>
            ))}
            {!(p.photos || []).length && <p className="mono-label text-steel-500 col-span-full py-4">No site photos yet.</p>}
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            <input className="input !py-2 w-40" placeholder="Caption (optional)" value={ph.caption} onChange={(e) => setPh({ ...ph, caption: e.target.value })} />
            <label className={`btn btn-red !py-2 !px-3 cursor-pointer ${upBusy ? 'opacity-60 pointer-events-none' : ''}`}>
              <Icon name="plus" className="w-4 h-4" /> {upBusy ? 'Uploading…' : 'Upload photo'}
              <input type="file" accept="image/*" className="hidden" onChange={doUpload} />
            </label>
            <span className="mono-label text-steel-500">or</span>
            <input className="input !py-2 flex-1 min-w-[8rem]" placeholder="Paste image URL" value={ph.url} onChange={(e) => setPh({ ...ph, url: e.target.value })} />
            <button onClick={doPhoto} className="btn btn-ghost !py-2 !px-3">Add URL</button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════ CLIENT DETAIL ═══════════════ */
function ClientDetail({ client, onBack, reloadClient, reloadAll }) {
  const [proj, setProj] = useState(null);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState(EMPTY_PROJECT);
  const [emailing, setEmailing] = useState(false);
  const mailtoCompose = () => {
    const subject = encodeURIComponent('Your Asset Reliability Services project portal');
    const body = encodeURIComponent(`Hello ${client.name},\n\nYou can now follow your projects with us online — live progress, work history, site photos, costs and reports.\n\nPortal link: ${portalLink(client.slug)}\nAccess PIN: ${client.pin}\n\n— Asset Reliability Services (Pvt) Ltd`);
    window.location.href = `mailto:${client.email}?subject=${subject}&body=${body}`;
  };
  const sendEmail = async () => {
    if (!client.email) { toast.error('Add an email address for this client first'); return; }
    setEmailing(true);
    try {
      const r = await notifyClient(client.id, portalLink(client.slug));
      toast.success(`Portal link emailed to ${r.to}`);
    } catch (e) {
      // server mail unavailable (some hosts block outbound SMTP) → open the admin's mail app, prefilled
      mailtoCompose();
      toast('Opening your email app with the link + PIN ready to send');
    } finally { setEmailing(false); }
  };

  const create = async () => {
    if (!form.title) { toast.error('Project needs a title'); return; }
    const body = { ...form, progress: Number(form.progress) || 0, budget: Number(form.budget) || 0, spent: Number(form.spent) || 0,
      lat: form.lat === '' ? null : Number(form.lat), lng: form.lng === '' ? null : Number(form.lng) };
    await createProject(client.id, body); setForm(EMPTY_PROJECT); setAdding(false); await reloadClient(); reloadAll(); toast.success('Project created');
  };

  if (proj) return <ProjectManage project={proj} onBack={() => setProj(null)} reload={async () => { const c = await reloadClient(); return c; }} />;

  return (
    <div>
      <nav className="flex items-center gap-1.5 text-sm mb-5">
        <button onClick={onBack} className="inline-flex items-center gap-1.5 text-steel-400 hover:text-red-400"><Icon name="arrowLeft" className="w-4 h-4" /> Clients</button>
        <Icon name="chevronRight" className="w-3.5 h-3.5 text-steel-600" />
        <span className="text-steel-100 truncate max-w-[50vw]">{client.name}</span>
      </nav>
      {/* client header + portal access */}
      <div className="panel p-5 sm:p-6 mb-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div><h2 className="font-display text-2xl text-steel-50">{client.name}</h2><p className="text-sm text-steel-400 mt-1">{client.contact} {client.email && `· ${client.email}`}</p></div>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => copy(portalLink(client.slug), 'Portal link copied')} className="btn btn-ghost !py-2 !px-3 text-[0.78rem]"><Icon name="chain" className="w-4 h-4" /> Copy</button>
            <a href={waLink(client.contact, portalLink(client.slug), client.pin)} target="_blank" rel="noreferrer" className="btn btn-ghost !py-2 !px-3 text-[0.78rem]"><Icon name="whatsapp" className="w-4 h-4" /> WhatsApp</a>
            <button onClick={sendEmail} disabled={emailing} className="btn btn-ghost !py-2 !px-3 text-[0.78rem] disabled:opacity-60"><Icon name="mail" className="w-4 h-4" /> {emailing ? 'Sending…' : 'Email'}</button>
            <button onClick={async () => { const r = await regenPin(client.id); await reloadClient(); toast.success(`New PIN: ${r.pin}`); }} className="btn btn-ghost !py-2 !px-3 text-[0.78rem]">New PIN</button>
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-3 mt-4">
          <div className="panel-800 p-3 flex items-center justify-between"><div><p className="mono-label text-steel-500">Portal link</p><p className="font-mono text-xs text-steel-200 truncate max-w-[15rem]">{portalLink(client.slug)}</p></div><button onClick={() => copy(portalLink(client.slug))} className="text-steel-400 hover:text-red-400"><Icon name="chain" className="w-4 h-4" /></button></div>
          <div className="panel-800 p-3 flex items-center justify-between"><div><p className="mono-label text-steel-500">4-digit PIN</p><p className="font-mono text-2xl text-steel-50 tracking-[0.35em] tabnum">{client.pin}</p></div><button onClick={() => copy(client.pin, 'PIN copied')} className="text-steel-400 hover:text-red-400"><Icon name="clipboardcheck" className="w-4 h-4" /></button></div>
        </div>
        <p className="mono-label text-steel-500 mt-3">Share the link + PIN with your client. They see only their own projects.</p>
      </div>

      {/* projects */}
      <div className="flex items-center justify-between mb-3"><h3 className="font-display text-lg text-steel-50">Projects{client.projects ? ` (${client.projects.length})` : ''}</h3><button onClick={() => setAdding((v) => !v)} className="btn btn-red !py-2.5"><Icon name={adding ? 'x' : 'plus'} className="w-4 h-4" /> {adding ? 'Cancel' : 'New project'}</button></div>

      {adding && (
        <div className="panel p-5 mb-4 grid sm:grid-cols-2 gap-3">
          <Field label="Title"><input className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></Field>
          <Field label="Type of work"><input className="input" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} /></Field>
          <Field label="Status"><select className="input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>{STATUSES.map((s) => <option key={s}>{s}</option>)}</select></Field>
          <Field label="Contract value (US$)"><input type="number" className="input" value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} /></Field>
          <Field label="Location"><input className="input" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} /></Field>
          <div className="grid grid-cols-2 gap-3"><Field label="Latitude"><input className="input" value={form.lat} onChange={(e) => setForm({ ...form, lat: e.target.value })} placeholder="-20.33" /></Field><Field label="Longitude"><input className="input" value={form.lng} onChange={(e) => setForm({ ...form, lng: e.target.value })} placeholder="30.07" /></Field></div>
          <Field label="Start date"><input type="date" className="input" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} /></Field>
          <Field label="Due date"><input type="date" className="input" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} /></Field>
          <div className="sm:col-span-2"><Field label="Description"><textarea className="input min-h-[70px]" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></Field></div>
          <div className="sm:col-span-2"><button onClick={create} className="btn btn-red">Create project</button></div>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        {client.projects === undefined ? (
          Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="panel p-5"><Skeleton className="h-4 w-24 mb-3" /><Skeleton className="h-5 w-2/3 mb-3.5" /><Skeleton className="h-1.5 w-full mb-3" /><Skeleton className="h-3 w-1/2" /></div>
          ))
        ) : (
          <>
            <AnimatePresence initial={false}>
              {client.projects.map((p) => (
                <motion.button key={p.id} layout variants={itemV} initial="hidden" animate="show" onClick={() => setProj(p)} className="panel lift p-5 text-left group">
                  <div className="flex items-center justify-between mb-2"><StatusPill s={p.status} /><span className="mono-label text-steel-500">{p.type}</span></div>
                  <h4 className="font-display text-steel-50 group-hover:text-red-400 transition-colors">{p.title}</h4>
                  <div className="flex items-center justify-between mt-3 mb-1.5"><span className="mono-label text-steel-500">{p.progress}%</span><span className="font-mono text-sm text-steel-100">{money(p.budget)}</span></div>
                  <div className="h-1.5 rounded-full bg-steel-800 overflow-hidden"><div className="h-full rounded-full" style={{ width: `${p.progress}%`, background: STATUS_HEX[p.status] }} /></div>
                  <p className="mono-label text-steel-500 mt-3">{(p.worklogs || []).length} updates · {(p.photos || []).length} photos · {(p.milestones || []).length} milestones</p>
                </motion.button>
              ))}
            </AnimatePresence>
            {!client.projects.length && !adding && <p className="mono-label text-steel-500 py-8">No projects yet. Add the first one.</p>}
          </>
        )}
      </div>
    </div>
  );
}

/* ═══════════════ INVENTORY ═══════════════ */
const EMPTY_PRODUCT = { name: '', sku: '', category: '', blurb: '', price: 0, cost: 0, stock: 0, reorder: 5, location: 'Main Warehouse', image: '', active: true };
const STOCK_HEX = { 'In stock': 'var(--color-ok)', 'Low': 'var(--color-warn)', 'Out of stock': 'var(--color-crit)' };
const MOVE_KINDS = [['Receive', 'Stock received (+)'], ['Issue', 'Stock issued (−)'], ['Adjust', 'Set count to']];

function Toggle({ on, onClick }) {
  return <button type="button" onClick={onClick} role="switch" aria-checked={on} className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${on ? 'bg-red-500' : 'bg-steel-700'}`}><span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${on ? 'translate-x-5' : ''}`} /></button>;
}
function StockBadge({ s }) {
  const c = STOCK_HEX[s] || 'var(--color-ok)';
  return <span className="inline-flex items-center gap-1.5 font-mono text-[0.66rem] uppercase px-2 py-0.5 rounded" style={{ color: c, background: `${c}18` }}><span className="w-1.5 h-1.5 rounded-full" style={{ background: c }} /> {s}</span>;
}

/* ── product detail: catalogue fields + warehouse movements ── */
function ProductManage({ product, onBack, reload }) {
  const [p, setP] = useState(product);
  const [saving, setSaving] = useState(false);
  const [moves, setMoves] = useState([]);
  const [mLoaded, setMLoaded] = useState(false);
  const [sups, setSups] = useState([]);
  useEffect(() => { listSuppliers().then(setSups).catch(() => {}); }, []);
  const [mv, setMv] = useState({ kind: 'Receive', qty: '', reason: '', ref: '' });
  const set = (k, v) => setP((x) => ({ ...x, [k]: v }));

  useEffect(() => { productMovements(p.id).then(setMoves).catch(() => {}).finally(() => setMLoaded(true)); }, [p.id]);

  const save = async () => {
    setSaving(true);
    try { const u = await updateProductApi(p.id, { ...p, price: Number(p.price) || 0, cost: Number(p.cost) || 0, reorder: Number(p.reorder) || 0 }); setP((x) => ({ ...x, ...u })); toast.success('Product saved'); reload(); }
    catch (e) { toast.error(e.message); } finally { setSaving(false); }
  };
  const doMove = async () => {
    const qty = Number(mv.qty);
    if (!Number.isFinite(qty) || (mv.kind !== 'Adjust' && qty <= 0)) { toast.error('Enter a quantity'); return; }
    try {
      const r = await stockMovement(p.id, { kind: mv.kind, qty, reason: mv.reason, ref: mv.ref });
      setP((x) => ({ ...x, ...r.product })); setMoves((m) => [r.movement, ...m]); setMv({ kind: mv.kind, qty: '', reason: '', ref: '' });
      toast.success(`${mv.kind} recorded`); reload();
    } catch (e) { toast.error(e.message); }
  };
  const remove = async () => { await deleteProductApi(p.id); toast('Product deleted'); reload(); onBack(); };
  const margin = p.price && p.cost ? Math.round((1 - p.cost / p.price) * 100) : null;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <nav className="flex items-center gap-1.5 text-sm">
          <button onClick={onBack} className="inline-flex items-center gap-1.5 text-steel-400 hover:text-red-400"><Icon name="arrowLeft" className="w-4 h-4" /> Inventory</button>
          <Icon name="chevronRight" className="w-3.5 h-3.5 text-steel-600" />
          <span className="text-steel-100 truncate max-w-[40vw]">{p.name || 'New product'}</span>
        </nav>
        <div className="flex gap-2"><button onClick={remove} className="btn btn-ghost !py-2 !px-3 text-[0.78rem] hover:!text-red-500">Delete</button><button onClick={save} disabled={saving} className="btn btn-red !py-2.5">{saving ? 'Saving…' : 'Save changes'}</button></div>
      </div>
      <div className="flex items-center gap-4 mb-5">
        <div className="w-16 h-16 rounded-lg overflow-hidden bg-steel-800 shrink-0">{p.image ? <img src={photoSrc(p.image)} alt="" className="w-full h-full object-cover duotone" /> : null}</div>
        <div className="min-w-0"><h2 className="font-display text-xl text-steel-50 truncate">{p.name || 'New product'}</h2><p className="font-mono text-xs text-steel-500 mt-0.5">{p.sku || '—'} · {p.category || 'Uncategorised'}</p></div>
        <div className="ml-auto text-right"><StockBadge s={p.status} /><p className="font-display text-2xl text-steel-50 tabnum mt-1">{p.stock} <span className="text-sm text-steel-400">in stock</span></p></div>
      </div>

      <div className="grid lg:grid-cols-[1.35fr_1fr] gap-5">
        {/* catalogue / shop fields */}
        <div className="panel p-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-steel-50">Catalogue</h3>
            <label className="flex items-center gap-2.5 text-sm text-steel-300"><span>Show in shop</span><Toggle on={p.active} onClick={() => set('active', !p.active)} /></label>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="Name"><input className="input" value={p.name} onChange={(e) => set('name', e.target.value)} /></Field>
            <Field label="SKU"><input className="input font-mono" value={p.sku} onChange={(e) => set('sku', e.target.value)} /></Field>
            <Field label="Category"><input className="input" value={p.category} onChange={(e) => set('category', e.target.value)} /></Field>
            <Field label="Warehouse / location"><input className="input" value={p.location} onChange={(e) => set('location', e.target.value)} /></Field>
            <Field label="Supplier"><select className="input" value={p.supplier_id || ''} onChange={(e) => set('supplier_id', e.target.value ? Number(e.target.value) : null)}><option value="">— none —</option>{sups.map((sp) => <option key={sp.id} value={sp.id}>{sp.name}</option>)}</select></Field>
            <Field label="Unit"><select className="input" value={p.unit || 'each'} onChange={(e) => set('unit', e.target.value)}>{['each', 'box', 'set', 'm', 'kg', 'litre', 'roll'].map((u) => <option key={u}>{u}</option>)}</select></Field>
            <Field label="Barcode"><input className="input font-mono" value={p.barcode || ''} onChange={(e) => set('barcode', e.target.value)} placeholder="EAN / QR" /></Field>
            <Field label="Sell price (US$)"><input type="number" className="input" value={p.price} onChange={(e) => set('price', e.target.value)} /></Field>
            <Field label="Unit cost (US$)"><input type="number" className="input" value={p.cost} onChange={(e) => set('cost', e.target.value)} /></Field>
            <Field label="Reorder point"><input type="number" className="input" value={p.reorder} onChange={(e) => set('reorder', e.target.value)} /></Field>
            <div className="grid content-end"><p className="field-label">Margin</p><p className="font-display text-lg text-steel-50 tabnum py-1.5">{margin != null ? `${margin}%` : '—'}</p></div>
            <div className="sm:col-span-2"><Field label="Shop description"><textarea className="input min-h-[64px]" value={p.blurb} onChange={(e) => set('blurb', e.target.value)} /></Field></div>
            <div className="sm:col-span-2"><Field label="Image URL"><input className="input" value={p.image} onChange={(e) => set('image', e.target.value)} placeholder="/img/photos/…" /></Field></div>
          </div>
        </div>

        {/* warehouse movements */}
        <div className="panel p-5 sm:p-6">
          <h3 className="font-display text-steel-50 mb-1">Warehouse</h3>
          <p className="text-sm text-steel-400 mb-4">Record stock in, out and counts. Every movement is logged.</p>
          <div className="space-y-2.5">
            <div className="grid grid-cols-2 gap-2">
              <Field label="Movement"><select className="input" value={mv.kind} onChange={(e) => setMv({ ...mv, kind: e.target.value })}>{MOVE_KINDS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select></Field>
              <Field label={mv.kind === 'Adjust' ? 'New count' : 'Quantity'}><input type="number" className="input" value={mv.qty} onChange={(e) => setMv({ ...mv, qty: e.target.value })} /></Field>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Field label="Reason"><input className="input" value={mv.reason} onChange={(e) => setMv({ ...mv, reason: e.target.value })} placeholder="e.g. PO delivery" /></Field>
              <Field label="Reference"><input className="input" value={mv.ref} onChange={(e) => setMv({ ...mv, ref: e.target.value })} placeholder="GRN / job #" /></Field>
            </div>
            <button onClick={doMove} className="btn btn-red w-full !py-2.5">Record movement</button>
          </div>
          <div className="mt-5 pt-4 border-t border-steel-800">
            <p className="mono-label text-steel-500 mb-3">Movement history</p>
            {!mLoaded ? <SkeletonList n={3} /> : (
              <ol className="space-y-2.5 max-h-72 overflow-y-auto">
                <AnimatePresence initial={false}>
                  {moves.map((m) => (
                    <motion.li key={m.id} layout initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3">
                      <span className="grid place-items-center w-7 h-7 rounded shrink-0" style={{ color: m.qty >= 0 ? 'var(--color-ok)' : 'var(--color-crit)', background: 'var(--color-steel-850)' }}><Icon name={m.qty >= 0 ? 'plus' : 'minus'} className="w-4 h-4" /></span>
                      <div className="flex-1 min-w-0"><p className="text-sm text-steel-100">{m.kind} <span className="font-mono tabnum" style={{ color: m.qty >= 0 ? 'var(--color-ok)' : 'var(--color-crit)' }}>{m.qty >= 0 ? '+' : ''}{m.qty}</span> <span className="text-steel-500">→ {m.balance}</span></p><p className="text-xs text-steel-500 truncate">{m.date}{m.reason ? ` · ${m.reason}` : ''}{m.ref ? ` · ${m.ref}` : ''}</p></div>
                    </motion.li>
                  ))}
                </AnimatePresence>
                {!moves.length && <p className="mono-label text-steel-500">No movements yet.</p>}
              </ol>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Catalogue() {
  const [items, setItems] = useState(cache.products || []);
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState('all');
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState(EMPTY_PRODUCT);
  const [loaded, setLoaded] = useState(!!cache.products);
  const [sel, setSel] = useState(null);

  const load = useCallback(async () => {
    try { const d = await listProducts(); cache.products = d; setItems(d); } catch (e) { toast.error(e.message); } finally { setLoaded(true); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const shown = items.filter((p) =>
    `${p.name} ${p.sku} ${p.category}`.toLowerCase().includes(q.toLowerCase()) &&
    (filter === 'all' || p.status === filter)
  );
  const inStock = items.filter((p) => p.status === 'In stock').length;
  const low = items.filter((p) => p.status === 'Low').length;
  const out = items.filter((p) => p.status === 'Out of stock').length;
  const value = items.reduce((a, p) => a + (p.cost || 0) * p.stock, 0);
  const create = async () => {
    if (!form.name) { toast.error('Product needs a name'); return; }
    const body = { ...form, price: Number(form.price) || 0, cost: Number(form.cost) || 0, stock: Number(form.stock) || 0, reorder: Number(form.reorder) || 0 };
    const tmp = { ...body, id: 'tmp-' + Date.now(), _pending: true, active: true, location: body.location || 'Main Warehouse', status: body.stock <= body.reorder ? (body.stock <= 0 ? 'Out of stock' : 'Low') : 'In stock' };
    setItems((x) => [tmp, ...x]); setForm(EMPTY_PRODUCT); setAdding(false);
    try {
      const p = await createProductApi(body);
      setItems((x) => x.map((i) => (i.id === tmp.id ? p : i))); cache.products = null; toast.success('Product added'); load();
    } catch (e) { setItems((x) => x.filter((i) => i.id !== tmp.id)); toast.error(e.message); }
  };

  if (sel) return <ProductManage product={sel} onBack={() => { setSel(null); load(); }} reload={load} />;

  if (!loaded) return (
    <>
      <SkeletonStats n={4} />
      <div className="flex gap-3 mb-4"><Skeleton className="h-11 flex-1" /><Skeleton className="h-11 w-40" /></div>
      <SkeletonTable rows={6} />
    </>
  );

  return (
    <>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-5">
        {[['SKUs', items.length, 'box', 'var(--color-steel-100)'], ['In stock', inStock, 'check', 'var(--color-ok)'], ['Low / out', `${low} / ${out}`, 'bell', 'var(--color-warn)'], ['Stock value (cost)', money(value), 'analytics', 'var(--color-steel-100)']].map(([l, v, ic, col]) => (
          <div key={l} className="panel-800 ticked p-4 sm:p-5"><span className="grid place-items-center w-10 h-10 rounded bg-steel-800 text-red-500 mb-3"><Icon name={ic} className="w-5 h-5" /></span><p className="font-display text-xl sm:text-2xl tabnum" style={{ color: col }}>{v}</p><p className="mono-label text-steel-500 mt-1">{l}</p></div>
        ))}
      </div>
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <label className="relative flex-1"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-steel-400"><Icon name="search" className="w-4 h-4" /></span><input value={q} onChange={(e) => setQ(e.target.value)} className="input !pl-9 w-full" placeholder="Search product, SKU or category…" /></label>
        <div className="flex gap-2">
          {[['all', 'All'], ['In stock', 'In stock'], ['Low', 'Low'], ['Out of stock', 'Out']].map(([v, l]) => (
            <button key={v} onClick={() => setFilter(v)} className={`px-3 py-2 rounded-md font-mono text-[0.72rem] uppercase border transition-colors ${filter === v ? 'bg-red-500 text-white border-red-500' : 'bg-steel-850 text-steel-300 border-steel-700 hover:border-steel-500'}`}>{l}</button>
          ))}
        </div>
        <button onClick={() => setAdding((v) => !v)} className="btn btn-red !py-2.5 shrink-0"><Icon name={adding ? 'x' : 'plus'} className="w-4 h-4" /> {adding ? 'Cancel' : 'New product'}</button>
      </div>
      {adding && (
        <div className="panel p-5 mb-4 grid sm:grid-cols-3 gap-3">
          <Field label="Name"><input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
          <Field label="SKU"><input className="input" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} /></Field>
          <Field label="Category"><input className="input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} /></Field>
          <Field label="Sell price (US$)"><input type="number" className="input" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} /></Field>
          <Field label="Unit cost (US$)"><input type="number" className="input" value={form.cost} onChange={(e) => setForm({ ...form, cost: e.target.value })} /></Field>
          <Field label="Opening stock"><input type="number" className="input" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} /></Field>
          <Field label="Reorder point"><input type="number" className="input" value={form.reorder} onChange={(e) => setForm({ ...form, reorder: e.target.value })} /></Field>
          <div className="sm:col-span-2"><Field label="Image URL"><input className="input" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} placeholder="/img/photos/…" /></Field></div>
          <div className="sm:col-span-3"><button onClick={create} className="btn btn-red">Add product</button></div>
        </div>
      )}
      <div className="panel overflow-hidden">
        <div className="hidden md:grid grid-cols-[2.4fr_1.1fr_0.8fr_0.9fr_1fr_auto] gap-4 px-5 py-3 border-b border-steel-800 mono-label text-steel-500"><span>Product</span><span>Category</span><span>Shop</span><span>Price</span><span>Stock</span><span></span></div>
        <motion.div variants={listV} initial="hidden" animate="show">
          <AnimatePresence initial={false}>
            {shown.map((p) => (
              <motion.button key={p.id} layout variants={itemV} exit={{ opacity: 0, scale: 0.97, transition: { duration: 0.2 } }}
                onClick={() => !p._pending && setSel(p)} disabled={p._pending}
                className={`w-full text-left grid grid-cols-[1fr_auto] md:grid-cols-[2.4fr_1.1fr_0.8fr_0.9fr_1fr_auto] gap-3 md:gap-4 px-4 sm:px-5 py-3 border-b border-steel-800 last:border-0 items-center transition-colors ${p._pending ? 'shimmer-row opacity-70' : 'hover:bg-steel-850'}`}>
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded overflow-hidden bg-steel-800 shrink-0">{p.image ? <img src={photoSrc(p.image)} alt="" className="w-full h-full object-cover duotone" /> : null}</div>
                  <div className="min-w-0"><p className="text-sm text-steel-100 leading-tight truncate">{p.name}</p><p className="font-mono text-[0.68rem] text-steel-500 truncate">{p.sku || '—'} · {p.location}</p><p className="text-xs text-steel-500 mt-0.5 md:hidden"><StockBadge s={p.status} /></p></div>
                </div>
                <span className="text-sm text-steel-400 hidden md:block truncate">{p.category}</span>
                <span className="hidden md:block">{p.active ? <span className="mono-label text-ok">Live</span> : <span className="mono-label text-steel-500">Hidden</span>}</span>
                <span className="font-mono text-sm text-steel-100 hidden md:block">{money(p.price)}</span>
                <div className="hidden md:flex items-center gap-2"><span className="font-mono text-sm tabnum" style={{ color: STOCK_HEX[p.status] }}>{p.stock}</span><StockBadge s={p.status} /></div>
                <div className="flex items-center gap-2 justify-self-end">
                  {p._pending
                    ? <span className="mono-label text-red-400 inline-flex items-center gap-1.5"><span className="w-3 h-3 rounded-full border-2 border-red-400 border-t-transparent animate-spin" /> Creating…</span>
                    : <><span className="md:hidden font-mono text-sm tabnum text-steel-100">{p.stock}</span><Icon name="chevronRight" className="w-4 h-4 text-steel-500" /></>}
                </div>
              </motion.button>
            ))}
          </AnimatePresence>
        </motion.div>
        {loaded && shown.length === 0 && <p className="mono-label text-steel-500 py-12 text-center">No products{q || filter !== 'all' ? ' match your filter' : ' yet'}.</p>}
      </div>
      <p className="mono-label text-steel-500 mt-3">Open a product to edit the shop listing and record warehouse movements. “Live” = visible in the public shop.</p>
    </>
  );
}

/* ── SUPPLIERS ── */
const EMPTY_SUP = { name: '', contact: '', email: '', phone: '', lead_time: 7, terms: '', active: true };
function Suppliers() {
  const [items, setItems] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState(EMPTY_SUP);
  const load = useCallback(async () => { try { setItems(await listSuppliers()); } catch (e) { toast.error(e.message); } finally { setLoaded(true); } }, []);
  useEffect(() => { load(); }, [load]);
  const create = async () => {
    if (!form.name) { toast.error('Supplier needs a name'); return; }
    const tmp = { ...form, id: 'tmp-' + Date.now(), _pending: true, productCount: 0 };
    setItems((x) => [tmp, ...x]); setForm(EMPTY_SUP); setAdding(false);
    try { const s = await createSupplier({ ...form, lead_time: Number(form.lead_time) || 0 }); setItems((x) => x.map((i) => (i.id === tmp.id ? { ...s, productCount: 0 } : i))); toast.success('Supplier added'); }
    catch (e) { setItems((x) => x.filter((i) => i.id !== tmp.id)); toast.error(e.message); }
  };
  const del = async (id) => { const snap = items; setItems((x) => x.filter((i) => i.id !== id)); toast('Supplier removed'); try { await deleteSupplier(id); } catch (e) { setItems(snap); toast.error(e.message); } };
  if (!loaded) return <SkeletonCards n={4} />;
  return (
    <>
      <div className="flex justify-between items-center mb-4"><p className="text-sm text-steel-400">{items.length} supplier{items.length !== 1 ? 's' : ''}</p><button onClick={() => setAdding((v) => !v)} className="btn btn-red !py-2.5"><Icon name={adding ? 'x' : 'plus'} className="w-4 h-4" /> {adding ? 'Cancel' : 'New supplier'}</button></div>
      {adding && (
        <div className="panel p-5 mb-4 grid sm:grid-cols-3 gap-3">
          <Field label="Name"><input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
          <Field label="Contact person"><input className="input" value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} /></Field>
          <Field label="Email"><input className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Field>
          <Field label="Phone"><input className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></Field>
          <Field label="Lead time (days)"><input type="number" className="input" value={form.lead_time} onChange={(e) => setForm({ ...form, lead_time: e.target.value })} /></Field>
          <Field label="Payment terms"><input className="input" value={form.terms} onChange={(e) => setForm({ ...form, terms: e.target.value })} placeholder="Net 30" /></Field>
          <div className="sm:col-span-3"><button onClick={create} className="btn btn-red">Add supplier</button></div>
        </div>
      )}
      <motion.div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4" variants={listV} initial="hidden" animate="show">
        <AnimatePresence initial={false}>
          {items.map((sp) => (
            <motion.div key={sp.id} layout variants={itemV} exit={{ opacity: 0, scale: 0.96 }} className={`panel p-5 ${sp._pending ? 'shimmer-row opacity-70' : ''}`}>
              <div className="flex items-start justify-between"><div className="min-w-0"><h3 className="font-display text-lg text-steel-50 truncate">{sp.name}</h3><p className="text-sm text-steel-400 mt-0.5">{sp.contact || '—'}</p></div><span className="mono-label text-steel-500 shrink-0">{sp.productCount} SKU</span></div>
              <div className="mt-3 space-y-1 text-sm text-steel-400">
                {sp.email && <p className="inline-flex items-center gap-1.5"><Icon name="mail" className="w-3.5 h-3.5" /> {sp.email}</p>}
                {sp.phone && <p className="inline-flex items-center gap-1.5"><Icon name="phone" className="w-3.5 h-3.5" /> {sp.phone}</p>}
              </div>
              <div className="flex items-center justify-between mt-4 panel-800 p-2.5">
                <div><p className="mono-label text-steel-500">Lead time</p><p className="font-mono text-steel-100">{sp.lead_time} days</p></div>
                <div className="text-right"><p className="mono-label text-steel-500">Terms</p><p className="font-mono text-steel-100">{sp.terms || '—'}</p></div>
              </div>
              {!sp._pending && <button onClick={() => del(sp.id)} className="btn btn-ghost w-full !py-2 mt-3 text-[0.78rem] hover:!text-red-500">Remove</button>}
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </>
  );
}

/* ── MOVEMENTS LEDGER (global) ── */
function MovementsLedger() {
  const [rows, setRows] = useState([]);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => { allMovements().then(setRows).catch((e) => toast.error(e.message)).finally(() => setLoaded(true)); }, []);
  if (!loaded) return <SkeletonTable rows={8} />;
  return (
    <div className="panel overflow-hidden">
      <div className="hidden md:grid grid-cols-[1.6fr_1fr_0.8fr_1fr_1.4fr] gap-4 px-5 py-3 border-b border-steel-800 mono-label text-steel-500"><span>Product</span><span>Movement</span><span>Qty</span><span>Balance</span><span>Reason</span></div>
      {rows.map((m) => (
        <div key={m.id} className="grid grid-cols-2 md:grid-cols-[1.6fr_1fr_0.8fr_1fr_1.4fr] gap-3 px-4 sm:px-5 py-3 border-b border-steel-800 last:border-0 items-center">
          <div className="min-w-0"><p className="text-sm text-steel-100 truncate">{m.product}</p><p className="font-mono text-[0.66rem] text-steel-500">{m.sku} · {m.date}</p></div>
          <span className="text-sm text-steel-300 hidden md:block">{m.kind}</span>
          <span className="font-mono text-sm tabnum justify-self-end md:justify-self-auto" style={{ color: m.qty >= 0 ? 'var(--color-ok)' : 'var(--color-crit)' }}>{m.qty >= 0 ? '+' : ''}{m.qty}</span>
          <span className="font-mono text-sm text-steel-200 hidden md:block">{m.balance}</span>
          <span className="text-sm text-steel-400 truncate hidden md:block">{m.reason}{m.ref ? ` · ${m.ref}` : ''}</span>
        </div>
      ))}
      {loaded && !rows.length && <p className="mono-label text-steel-500 py-12 text-center">No stock movements yet.</p>}
    </div>
  );
}

/* ── PURCHASE ORDERS (reorder → receive) ── */
const PO_STATUS_HEX = { Draft: '#6b7280', Sent: '#e8930c', Received: '#1fae6b', Cancelled: '#e2211c' };
function PurchaseOrders() {
  const [pos, setPos] = useState([]);
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState({ supplier_id: '', lines: [] });
  const load = useCallback(async () => {
    try { const [p, pr, su] = await Promise.all([listPOs(), listProducts(), listSuppliers()]); setPos(p); setProducts(pr); setSuppliers(su); }
    catch (e) { toast.error(e.message); } finally { setLoaded(true); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const startReorder = () => {
    const low = products.filter((p) => p.status !== 'In stock');
    setDraft({ supplier_id: low[0]?.supplier_id || suppliers[0]?.id || '', lines: low.map((p) => ({ product_id: p.id, name: p.name, qty: Math.max(p.reorder * 2 - p.stock, p.reorder), cost: p.cost })) });
    setCreating(true);
  };
  const setLine = (i, k, v) => setDraft((d) => ({ ...d, lines: d.lines.map((l, j) => (j === i ? { ...l, [k]: v } : l)) }));
  const rmLine = (i) => setDraft((d) => ({ ...d, lines: d.lines.filter((_, j) => j !== i) }));
  const submitPO = async () => {
    if (!draft.lines.length) { toast.error('Add at least one line'); return; }
    try { await createPO({ supplier_id: draft.supplier_id ? Number(draft.supplier_id) : null, lines: draft.lines.map((l) => ({ product_id: l.product_id, qty: Number(l.qty) || 0, cost: Number(l.cost) || 0 })) }); setCreating(false); setDraft({ supplier_id: '', lines: [] }); await load(); toast.success('Purchase order raised'); }
    catch (e) { toast.error(e.message); }
  };
  const receive = async (id) => { try { await receivePO(id); await load(); toast.success('Received — stock updated'); } catch (e) { toast.error(e.message); } };
  const send = async (id) => { try { await updatePO(id, { status: 'Sent' }); await load(); toast('Marked as sent'); } catch (e) { toast.error(e.message); } };
  const del = async (id) => { const snap = pos; setPos((x) => x.filter((p) => p.id !== id)); try { await deletePO(id); } catch (e) { setPos(snap); toast.error(e.message); } };

  if (!loaded) return <SkeletonTable rows={5} />;
  return (
    <>
      <div className="flex flex-wrap justify-between items-center gap-3 mb-4">
        <p className="text-sm text-steel-400">{pos.length} order{pos.length !== 1 ? 's' : ''}</p>
        <div className="flex gap-2">
          <button onClick={startReorder} className="btn btn-ghost !py-2.5"><Icon name="bell" className="w-4 h-4" /> Reorder low stock</button>
          <button onClick={() => { setDraft({ supplier_id: suppliers[0]?.id || '', lines: [] }); setCreating(true); }} className="btn btn-red !py-2.5"><Icon name="plus" className="w-4 h-4" /> New PO</button>
        </div>
      </div>
      {creating && (
        <div className="panel p-5 mb-4">
          <div className="flex items-center justify-between mb-3"><h3 className="font-display text-steel-50">New purchase order</h3><button onClick={() => setCreating(false)} className="text-steel-500 hover:text-red-400"><Icon name="x" className="w-4 h-4" /></button></div>
          <div className="grid sm:grid-cols-2 gap-3 mb-3">
            <Field label="Supplier"><select className="input" value={draft.supplier_id} onChange={(e) => setDraft({ ...draft, supplier_id: e.target.value })}><option value="">— none —</option>{suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</select></Field>
            <div className="flex items-end"><select className="input" onChange={(e) => { const p = products.find((x) => x.id === Number(e.target.value)); if (p && !draft.lines.some((l) => l.product_id === p.id)) setDraft((d) => ({ ...d, lines: [...d.lines, { product_id: p.id, name: p.name, qty: p.reorder, cost: p.cost }] })); e.target.value = ''; }} defaultValue=""><option value="">+ Add product line…</option>{products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select></div>
          </div>
          <div className="space-y-2 mb-3">
            {draft.lines.map((l, i) => (
              <div key={i} className="flex items-center gap-2 panel-800 p-2.5">
                <span className="text-sm text-steel-100 flex-1 truncate">{l.name}</span>
                <label className="mono-label text-steel-500">Qty</label><input type="number" className="input !py-1.5 w-20" value={l.qty} onChange={(e) => setLine(i, 'qty', e.target.value)} />
                <label className="mono-label text-steel-500">Cost</label><input type="number" className="input !py-1.5 w-24" value={l.cost} onChange={(e) => setLine(i, 'cost', e.target.value)} />
                <button onClick={() => rmLine(i)} className="text-steel-500 hover:text-red-400"><Icon name="x" className="w-4 h-4" /></button>
              </div>
            ))}
            {!draft.lines.length && <p className="mono-label text-steel-500 py-2">Add product lines above, or use “Reorder low stock”.</p>}
          </div>
          <div className="flex items-center justify-between">
            <span className="font-mono text-sm text-steel-100">Total US$ {draft.lines.reduce((a, l) => a + (Number(l.qty) || 0) * (Number(l.cost) || 0), 0).toLocaleString()}</span>
            <button onClick={submitPO} className="btn btn-red">Raise PO</button>
          </div>
        </div>
      )}
      <div className="space-y-3">
        {pos.map((po) => (
          <div key={po.id} className="panel p-4 sm:p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div><div className="flex items-center gap-2"><p className="font-mono text-sm text-red-400">{po.ref}</p><span className="inline-flex items-center gap-1.5 font-mono text-[0.66rem] uppercase px-2 py-0.5 rounded" style={{ color: PO_STATUS_HEX[po.status], background: `${PO_STATUS_HEX[po.status]}18` }}><span className="w-1.5 h-1.5 rounded-full" style={{ background: PO_STATUS_HEX[po.status] }} /> {po.status}</span></div><p className="text-sm text-steel-300 mt-1">{po.supplier || 'No supplier'} · {po.lines.length} line{po.lines.length !== 1 ? 's' : ''} · {po.date}</p></div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-steel-100">US$ {po.total.toLocaleString()}</span>
                {po.status === 'Draft' && <button onClick={() => send(po.id)} className="btn btn-ghost !py-2 !px-3 text-[0.78rem]">Mark sent</button>}
                {po.status !== 'Received' && po.status !== 'Cancelled' && <button onClick={() => receive(po.id)} className="btn btn-red !py-2 !px-3 text-[0.78rem]">Receive</button>}
                <button onClick={() => del(po.id)} className="text-steel-500 hover:text-red-400"><Icon name="x" className="w-4 h-4" /></button>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-steel-800 grid sm:grid-cols-2 gap-x-6 gap-y-1">
              {po.lines.map((l) => (<div key={l.id} className="flex items-center justify-between text-sm"><span className="text-steel-300 truncate">{l.qty} × {l.name}</span><span className="font-mono text-steel-500">US$ {(l.qty * l.cost).toLocaleString()}</span></div>))}
            </div>
          </div>
        ))}
        {!pos.length && <p className="mono-label text-steel-500 py-12 text-center">No purchase orders. Use “Reorder low stock” to raise one.</p>}
      </div>
    </>
  );
}

/* ── INVENTORY MODULE: tabbed (Catalogue / Movements / Suppliers / Purchase orders) ── */
const INV_TABS = [['catalogue', 'Catalogue'], ['movements', 'Movements'], ['suppliers', 'Suppliers'], ['pos', 'Purchase orders']];
function InventoryModule() {
  const [t, setT] = useState('catalogue');
  return (
    <>
      <div className="flex gap-1 mb-5 border-b border-[#e7e9ee] overflow-x-auto no-scrollbar">
        {INV_TABS.map(([id, lbl]) => (
          <button key={id} onClick={() => setT(id)} className={`shrink-0 px-4 py-2.5 font-display text-sm border-b-2 -mb-px transition-colors ${t === id ? 'border-red-500 text-steel-50' : 'border-transparent text-steel-400 hover:text-steel-100'}`}>{lbl}</button>
        ))}
      </div>
      {t === 'catalogue' ? <Catalogue /> : t === 'movements' ? <MovementsLedger /> : t === 'suppliers' ? <Suppliers /> : <PurchaseOrders />}
    </>
  );
}

/* ═══════════════ SITE MANAGEMENT (CMS) ═══════════════ */
const CONTENT_TYPES = ['Article', 'Case study', 'Video', 'Standard'];
const EMPTY_CONTENT = { type: 'Article', title: '', excerpt: '', body: '', status: 'Draft', image: '', youtube: '' };
function SiteManagement() {
  const [items, setItems] = useState(cache.content || []);
  const [q, setQ] = useState('');
  const [edit, setEdit] = useState(null);
  const [loaded, setLoaded] = useState(!!cache.content);

  const load = useCallback(async () => {
    try { const d = await listContent(); cache.content = d; setItems(d); } catch (e) { toast.error(e.message); } finally { setLoaded(true); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const filtered = items.filter((c) => `${c.title} ${c.type}`.toLowerCase().includes(q.toLowerCase()));
  const pub = items.filter((c) => c.status === 'Published').length;
  const statusColor = (s) => (s === 'Published' ? 'var(--color-ok)' : 'var(--color-steel-400)');

  const publishToggle = async (c) => {
    const next = c.status === 'Published' ? 'Draft' : 'Published';
    const snap = items;
    setItems((x) => x.map((i) => (i.id === c.id ? { ...i, status: next } : i)));
    try { await updateContentApi(c.id, { status: next }); cache.content = null; toast(next === 'Published' ? 'Published' : 'Unpublished'); }
    catch (e) { setItems(snap); toast.error(e.message); }
  };
  const del = async (id) => {
    const snap = items;
    setItems((x) => x.filter((c) => c.id !== id)); toast('Content removed');
    try { await deleteContentApi(id); cache.content = null; } catch (e) { setItems(snap); toast.error(e.message); }
  };
  const saveEdit = async (data) => {
    if (!data.title) { toast.error('Title required'); return; }
    setEdit(null);
    if (data.id) {
      const snap = items;
      setItems((x) => x.map((c) => (c.id === data.id ? { ...c, ...data } : c)));
      try { const u = await updateContentApi(data.id, data); setItems((x) => x.map((c) => (c.id === data.id ? u : c))); cache.content = null; toast.success('Saved'); }
      catch (e) { setItems(snap); toast.error(e.message); }
    } else {
      const tmp = { ...data, id: 'tmp-' + Date.now(), _pending: true, date: 'just now' };
      setItems((x) => [tmp, ...x]);
      try { const c = await createContentApi(data); setItems((x) => x.map((i) => (i.id === tmp.id ? c : i))); cache.content = null; toast.success('Created'); }
      catch (e) { setItems((x) => x.filter((i) => i.id !== tmp.id)); toast.error(e.message); }
    }
  };

  if (!loaded) return (
    <>
      <SkeletonStats n={3} />
      <div className="flex gap-3 mb-4"><Skeleton className="h-11 flex-1" /><Skeleton className="h-11 w-36" /></div>
      <SkeletonCards n={4} cols="sm:grid-cols-2" />
    </>
  );

  return (
    <>
      <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-5">
        {[['Items', items.length, 'file'], ['Published', pub, 'check'], ['Drafts', items.length - pub, 'clock']].map(([l, v, ic]) => (
          <div key={l} className="panel-800 ticked p-4 sm:p-5"><span className="grid place-items-center w-9 h-9 rounded bg-steel-800 text-red-500 mb-3"><Icon name={ic} className="w-5 h-5" /></span><p className="font-display text-xl sm:text-2xl text-steel-50 tabnum">{v}</p><p className="mono-label text-steel-500 mt-1">{l}</p></div>
        ))}
      </div>
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <label className="relative flex-1"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-steel-400"><Icon name="search" className="w-4 h-4" /></span><input value={q} onChange={(e) => setQ(e.target.value)} className="input !pl-9 w-full" placeholder="Search content…" /></label>
        <button onClick={() => setEdit({ ...EMPTY_CONTENT })} className="btn btn-red !py-2.5 shrink-0"><Icon name="plus" className="w-4 h-4" /> New content</button>
      </div>
      <motion.div className="grid sm:grid-cols-2 gap-4" variants={listV} initial="hidden" animate="show">
        <AnimatePresence initial={false}>
          {filtered.map((c) => (
            <motion.div key={c.id} layout variants={itemV} exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.2 } }} className={`panel overflow-hidden flex ${c._pending ? 'shimmer-row opacity-70' : ''}`}>
              <div className="w-24 shrink-0 bg-steel-800 relative">{c.image ? <img src={photoSrc(c.image)} alt="" className="absolute inset-0 w-full h-full object-cover duotone" /> : null}{c.type === 'Video' && <span className="absolute inset-0 grid place-items-center text-white"><Icon name="play" className="w-6 h-6" /></span>}</div>
              <div className="flex-1 min-w-0 p-4">
                <div className="flex items-center gap-2 mb-1"><span className="mono-label text-red-400">{c.type}</span><span className="mono-label" style={{ color: statusColor(c.status) }}>· {c.status}</span></div>
                <p className="text-sm text-steel-100 font-medium leading-tight line-clamp-2">{c.title}</p>
                {c._pending
                  ? <p className="mono-label text-red-400 mt-3 inline-flex items-center gap-1.5"><span className="w-3 h-3 rounded-full border-2 border-red-400 border-t-transparent animate-spin" /> Creating…</p>
                  : (
                    <div className="flex items-center gap-2 mt-3">
                      <button onClick={() => publishToggle(c)} className="btn btn-ghost !py-1.5 !px-2.5 text-[0.72rem]">{c.status === 'Published' ? 'Unpublish' : 'Publish'}</button>
                      <button onClick={() => setEdit(c)} className="btn btn-ghost !py-1.5 !px-2.5 text-[0.72rem]">Edit</button>
                      <button onClick={() => del(c.id)} className="text-steel-500 hover:text-red-400 ml-auto"><Icon name="x" className="w-4 h-4" /></button>
                    </div>
                  )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {filtered.length === 0 && <p className="mono-label text-steel-500 py-12 text-center sm:col-span-2">No content{q ? ` matches “${q}”` : ''}.</p>}
      </motion.div>
      <p className="mono-label text-steel-500 mt-3">Published items appear on the public website; drafts stay hidden.</p>
      <ContentEditor data={edit} onClose={() => setEdit(null)} onSave={saveEdit} />
    </>
  );
}

function ContentEditor({ data, onClose, onSave }) {
  const [f, setF] = useState(data || EMPTY_CONTENT);
  useEffect(() => { setF(data || EMPTY_CONTENT); }, [data]);
  if (!data) return null;
  const set = (k, v) => setF((x) => ({ ...x, [k]: v }));
  return (
    <Modal open onClose={onClose} maxW="max-w-lg">
      <div className="p-6 sm:p-7">
        <h3 className="font-display text-xl text-steel-50 mb-4">{f.id ? 'Edit content' : 'New content'}</h3>
        <div className="grid sm:grid-cols-2 gap-3">
          <Field label="Type"><select className="input" value={f.type} onChange={(e) => set('type', e.target.value)}>{CONTENT_TYPES.map((t) => <option key={t}>{t}</option>)}</select></Field>
          <Field label="Status"><select className="input" value={f.status} onChange={(e) => set('status', e.target.value)}><option>Draft</option><option>Published</option></select></Field>
          <div className="sm:col-span-2"><Field label="Title"><input className="input" value={f.title} onChange={(e) => set('title', e.target.value)} /></Field></div>
          <div className="sm:col-span-2"><Field label="Excerpt"><textarea className="input min-h-[60px]" value={f.excerpt} onChange={(e) => set('excerpt', e.target.value)} /></Field></div>
          {f.type === 'Video'
            ? <div className="sm:col-span-2"><Field label="YouTube video ID"><input className="input font-mono" value={f.youtube} onChange={(e) => set('youtube', e.target.value)} placeholder="e.g. JFYd_UuAHa4" /></Field></div>
            : <div className="sm:col-span-2"><Field label="Body"><textarea className="input min-h-[100px]" value={f.body} onChange={(e) => set('body', e.target.value)} /></Field></div>}
          <div className="sm:col-span-2"><Field label="Image URL"><input className="input" value={f.image} onChange={(e) => set('image', e.target.value)} placeholder="/img/photos/…" /></Field></div>
        </div>
        <div className="flex gap-2 mt-5"><button onClick={onClose} className="btn btn-ghost flex-1 !py-2.5">Cancel</button><button onClick={() => onSave(f)} className="btn btn-red flex-1 !py-2.5">{f.id ? 'Save' : 'Create'}</button></div>
      </div>
    </Modal>
  );
}

/* ═══════════════ CONSOLE ═══════════════ */
const NAV_GROUPS = [
  { title: 'Operations', items: [['dashboard', 'Dashboard', 'overview'], ['user', 'Clients', 'clients']] },
  { title: 'Commerce', items: [['box', 'Inventory', 'inventory'], ['file', 'Site content', 'site']] },
];
const TAB_META = {
  overview: ['Dashboard', 'Live projects, portfolio value and the work map'],
  clients: ['Clients', 'Portals, PINs and per-client project delivery'],
  inventory: ['Inventory', 'Shop catalogue and warehouse stock control'],
  site: ['Site content', 'Articles, case studies and videos on the public site'],
};

function Console({ admin, onOut }) {
  const [tab, setTab] = useState('overview');
  const [clients, setClients] = useState(cache.clients || []);
  const [pins, setPins] = useState(cache.pins || []);
  const [loaded, setLoaded] = useState(!!cache.clients);
  const [sel, setSel] = useState(null);
  const [nc, setNc] = useState({ name: '', contact: '', email: '' });
  const [creating, setCreating] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [drawer, setDrawer] = useState(false);

  const loadAll = useCallback(async () => {
    try { const [cs, mp] = await Promise.all([listClients(), getMap()]); cache.clients = cs; cache.pins = mp; setClients(cs); setPins(mp); }
    catch (err) { if (/401|token/i.test(err.message)) onOut(); else toast.error(err.message); }
    finally { setLoaded(true); }
  }, [onOut]);
  useEffect(() => { loadAll(); }, [loadAll]);

  // hover-to-prefetch: quietly warm a client's detail so the click feels instant
  const prefetch = (id) => { if (!cache.detail[id]) getClient(id).then((c) => { cache.detail[id] = c; }).catch(() => {}); };
  const openClient = async (id) => {
    const summary = clients.find((c) => c.id === id);
    setSel(cache.detail[id] || (summary ? { ...summary, projects: undefined } : { id, name: '…', projects: undefined }));
    try { const full = await getClient(id); cache.detail[id] = full; setSel(full); } catch (err) { toast.error(err.message); }
  };
  const reloadClient = async () => { if (!sel) return null; const c = await getClient(sel.id); cache.detail[c.id] = c; setSel(c); return c; };
  const createC = async () => {
    if (!nc.name) { toast.error('Client needs a name'); return; }
    const body = { ...nc }; const tmp = { ...body, id: 'tmp-' + Date.now(), _pending: true, slug: '…', pin: '····', projectCount: 0 };
    setClients((x) => [tmp, ...x]); setNc({ name: '', contact: '', email: '' }); setCreating(false);
    try { const c = await createClient(body); cache.clients = null; setClients((x) => x.map((i) => (i.id === tmp.id ? c : i))); toast.success(`${c.name} created · PIN ${c.pin}`); loadAll(); openClient(c.id); }
    catch (err) { setClients((x) => x.filter((i) => i.id !== tmp.id)); toast.error(err.message); }
  };
  const delC = async (id, name) => {
    const snap = clients;
    setClients((x) => x.filter((c) => c.id !== id)); toast(`${name} removed`);
    try { await deleteClient(id); cache.clients = null; delete cache.detail[id]; loadAll(); } catch (err) { setClients(snap); toast.error(err.message); }
  };

  const totalProjects = clients.reduce((a, c) => a + c.projectCount, 0);
  const activePins = pins.filter((p) => p.status === 'Active').length;
  const totalValue = pins.reduce((a, p) => a + (p.budget || 0), 0);
  const go = (id) => { setTab(id); setSel(null); setDrawer(false); };
  const initials = (admin?.name || 'A').split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();
  const [title, desc] = sel ? [sel.name, 'Client delivery — projects, work history and portal access'] : TAB_META[tab];

  const Sidebar = ({ mobile }) => (
    <div className="flex flex-col h-full w-full" style={{ background: '#14161b' }}>
      <div className="flex items-center h-16 px-4 shrink-0 border-b border-white/[0.06]">
        <img src="/img/logo-light.png" alt="ARS" className={`w-auto ${collapsed && !mobile ? 'h-7 mx-auto' : 'h-8'}`} />
      </div>
      <nav className="flex-1 overflow-y-auto px-2.5 py-3">
        {NAV_GROUPS.map((g) => (
          <div key={g.title} className="mb-4">
            {(!collapsed || mobile) && <p className="px-2.5 pb-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-white/30">{g.title}</p>}
            {g.items.map(([ic, lbl, id]) => {
              const active = tab === id && !sel;
              return (
                <button key={id} onClick={() => go(id)} title={collapsed && !mobile ? lbl : undefined}
                  className={`w-full flex items-center gap-3 rounded-lg px-2.5 py-2.5 text-sm mb-0.5 transition-colors ${active ? 'bg-white/[0.09] text-white font-medium' : 'text-white/60 hover:bg-white/[0.05] hover:text-white'}`}>
                  <Icon name={ic} className="w-5 h-5 shrink-0" />
                  {(!collapsed || mobile) && <span className="truncate flex-1 text-left">{lbl}</span>}
                  {active && (!collapsed || mobile) && <span className="w-1.5 h-1.5 rounded-full bg-red-500" />}
                </button>
              );
            })}
          </div>
        ))}
      </nav>
      <div className="px-3 py-3 border-t border-white/[0.06] shrink-0">
        <div className={`flex items-center gap-2.5 ${collapsed && !mobile ? 'justify-center' : ''} mb-2`}>
          <span className="grid place-items-center w-8 h-8 rounded-full bg-red-500 text-white text-[0.7rem] font-display shrink-0">{initials}</span>
          {(!collapsed || mobile) && <div className="min-w-0 flex-1"><p className="text-sm text-white truncate leading-tight">{admin?.name || 'Admin'}</p><p className="text-[11px] text-white/40 truncate">{admin?.email || 'Administrator'}</p></div>}
        </div>
        {(!collapsed || mobile)
          ? <button onClick={onOut} className="w-full text-sm text-white/70 border border-white/10 rounded-lg py-2 hover:bg-white/[0.06] hover:text-white transition">Sign out</button>
          : <button onClick={onOut} title="Sign out" className="w-full grid place-items-center py-2 rounded-lg text-white/50 hover:bg-white/[0.06] hover:text-white"><Icon name="x" className="w-4 h-4" /></button>}
        {!mobile && (
          <button onClick={() => setCollapsed((v) => !v)} className="w-full flex items-center gap-3 rounded-lg px-2.5 py-2 mt-1 text-sm text-white/40 hover:bg-white/[0.05] hover:text-white">
            <Icon name={collapsed ? 'chevronRight' : 'chevronLeft'} className="w-5 h-5 shrink-0" />{!collapsed && <span>Collapse</span>}
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="erp flex h-screen overflow-hidden" style={{ background: '#f4f5f7' }}>
      <aside className={`hidden lg:block shrink-0 transition-all duration-200 ${collapsed ? 'w-16' : 'w-60'}`}><Sidebar /></aside>
      <AnimatePresence>
        {drawer && (
          <motion.div className="lg:hidden fixed inset-0 z-[60] bg-black/50" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setDrawer(false)}>
            <motion.aside className="absolute left-0 top-0 h-full w-64" initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} transition={{ type: 'spring', damping: 28, stiffness: 280 }} onClick={(e) => e.stopPropagation()}><Sidebar mobile /></motion.aside>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="flex items-center gap-3 h-16 shrink-0 px-4 md:px-6 bg-white border-b border-[#e7e9ee]">
          <button onClick={() => setDrawer(true)} className="lg:hidden grid place-items-center w-9 h-9 rounded-md text-steel-50 hover:bg-[#f4f5f7]"><Icon name="menu" className="w-5 h-5" /></button>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              {sel && <button onClick={() => setSel(null)} className="text-steel-400 hover:text-red-500"><Icon name="arrowLeft" className="w-4 h-4" /></button>}
              <h1 className="font-display text-lg md:text-xl text-steel-50 truncate leading-tight">{title}</h1>
            </div>
            <p className="text-xs text-steel-400 truncate hidden sm:block">{desc}</p>
          </div>
          <div className="ml-auto flex items-center gap-4">
            <span className="hidden md:inline-flex items-center gap-1.5 text-[0.72rem] text-steel-400 font-mono"><span className="w-1.5 h-1.5 rounded-full animate-pulse-dot" style={{ background: 'var(--color-ok)' }} /> {API_BASE.replace('https://', '').replace('http://', '')}</span>
            <span className="grid place-items-center w-9 h-9 rounded-full bg-red-500 text-white text-[0.72rem] font-display shrink-0">{initials}</span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-7">
          {sel ? (
            <ClientDetail client={sel} onBack={() => setSel(null)} reloadClient={reloadClient} reloadAll={loadAll} />
          ) : tab === 'overview' ? (
            !loaded ? <><SkeletonStats n={4} /><SkeletonMap height={460} /></> : (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-5">
                {[['Clients', clients.length, 'user'], ['Projects', totalProjects, 'dashboard'], ['Active on map', activePins, 'pin'], ['Portfolio value', money(totalValue), 'analytics']].map(([l, v, ic]) => (
                  <div key={l} className="panel-800 ticked p-4 sm:p-5"><span className="grid place-items-center w-10 h-10 rounded bg-steel-800 text-red-500 mb-3"><Icon name={ic} className="w-5 h-5" /></span><p className="font-display text-2xl text-steel-50 tabnum">{v}</p><p className="mono-label text-steel-500 mt-1">{l}</p></div>
                ))}
              </div>
              <div className="panel p-2 mb-4"><WorkMap pins={pins} height={460} /></div>
              <div className="flex flex-wrap gap-3 items-center">
                {STATUSES.map((s) => <span key={s} className="inline-flex items-center gap-1.5 mono-label text-steel-400"><span className="w-2.5 h-2.5 rounded-full" style={{ background: STATUS_HEX[s] }} /> {s}</span>)}
                <span className="mono-label text-steel-600 ml-auto">Ring = % complete · click a pin for detail</span>
              </div>
            </>
            )
          ) : tab === 'inventory' ? (
            <InventoryModule />
          ) : tab === 'site' ? (
            <SiteManagement />
          ) : (
            <>
              <div className="flex justify-between items-center mb-4"><p className="text-sm text-steel-400">{clients.length} client{clients.length !== 1 ? 's' : ''}</p><button onClick={() => setCreating((v) => !v)} className="btn btn-red !py-2.5"><Icon name={creating ? 'x' : 'plus'} className="w-4 h-4" /> {creating ? 'Cancel' : 'New client'}</button></div>
              {creating && (
                <div className="panel p-5 mb-4 grid sm:grid-cols-3 gap-3">
                  <Field label="Company name"><input className="input" value={nc.name} onChange={(e) => setNc({ ...nc, name: e.target.value })} /></Field>
                  <Field label="Contact"><input className="input" value={nc.contact} onChange={(e) => setNc({ ...nc, contact: e.target.value })} placeholder="+263 …" /></Field>
                  <Field label="Email"><input className="input" value={nc.email} onChange={(e) => setNc({ ...nc, email: e.target.value })} /></Field>
                  <div className="sm:col-span-3"><button onClick={createC} className="btn btn-red">Create client + generate PIN</button></div>
                </div>
              )}
              {!loaded ? <SkeletonCards n={6} /> : (
                <motion.div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4" variants={listV} initial="hidden" animate="show">
                  <AnimatePresence initial={false}>
                    {clients.map((c) => (
                      <motion.div key={c.id} layout variants={itemV} exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.2 } }}
                        onMouseEnter={() => !c._pending && prefetch(c.id)}
                        className={`panel p-5 ${c._pending ? 'shimmer-row opacity-70' : ''}`}>
                        <div className="flex items-start justify-between"><div><h3 className="font-display text-lg text-steel-50">{c.name}</h3><p className="text-sm text-steel-400 mt-0.5">{c.contact || '—'}</p></div>{c._pending ? <span className="mono-label text-red-400 inline-flex items-center gap-1.5"><span className="w-3 h-3 rounded-full border-2 border-red-400 border-t-transparent animate-spin" /> Creating…</span> : <span className="mono-label text-steel-500">{c.projectCount} proj</span>}</div>
                        <div className="flex items-center justify-between mt-4 panel-800 p-2.5"><div><p className="mono-label text-steel-500">PIN</p><p className="font-mono text-lg text-steel-50 tracking-[0.3em]">{c.pin}</p></div><span className="font-mono text-[0.66rem] text-steel-500 truncate max-w-[8rem]">/portal?c={c.slug}</span></div>
                        <div className="flex gap-2 mt-3">
                          <button onClick={() => openClient(c.id)} disabled={c._pending} className="btn btn-red !py-2 flex-1 text-[0.78rem] disabled:opacity-50">Manage</button>
                          <button onClick={() => copy(portalLink(c.slug), 'Link copied')} className="btn btn-ghost !py-2 !px-3 text-[0.78rem]"><Icon name="chain" className="w-4 h-4" /></button>
                          <button onClick={() => delC(c.id, c.name)} disabled={c._pending} className="btn btn-ghost !py-2 !px-3 text-[0.78rem] hover:!text-red-500"><Icon name="x" className="w-4 h-4" /></button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </motion.div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}

export default function Admin() {
  const [admin, setAdmin] = useState(getToken() ? { name: 'ARS Admin' } : null);
  const signOut = () => { setToken(null); setAdmin(null); toast('Signed out'); };
  // The marketing site uses a large 22px root, which inflates every rem-based
  // size (padding, gaps, modal width). The ERP wants a normal 16px root so
  // components and modals are standard-sized. Scoped to the admin only.
  useEffect(() => {
    const el = document.documentElement, prev = el.style.fontSize;
    el.style.fontSize = '16px';
    return () => { el.style.fontSize = prev; };
  }, []);
  return admin ? <Console admin={admin} onOut={signOut} /> : <AdminLogin onIn={setAdmin} />;
}
