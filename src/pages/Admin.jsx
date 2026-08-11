import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import Icon from '../components/Icon';
import WorkMap from '../components/WorkMap';
import Modal from '../components/Modal';
import { AuthBackdrop } from './Portal';
import {
  API_BASE, getToken, setToken, adminLogin, adminRegister, adminGoogle, listClients, getClient, createClient,
  regenPin, deleteClient, createProject, updateProject, deleteProject, addWorklog, addMilestone,
  toggleMilestone, addPhoto, getMap, STATUS_HEX, STATUSES,
  uploadPhoto, deletePhoto, notifyClient, adminReport, waLink, photoSrc,
  listProducts, createProductApi, updateProductApi, adjustStock, deleteProductApi,
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
  const [rep, setRep] = useState(false);
  const report = async () => { setRep(true); try { await adminReport(p.id, (p.title || 'project').replace(/\s+/g, '-').toLowerCase()); toast.success('Report downloaded'); } catch (e) { toast.error(e.message); } finally { setRep(false); } };
  const remove = async () => { await deleteProject(p.id); toast('Project deleted'); reload(); onBack(); };

  return (
    <div>
      <button onClick={onBack} className="inline-flex items-center gap-2 text-sm text-steel-400 hover:text-red-400 mb-5"><Icon name="arrowLeft" className="w-4 h-4" /> Back to client</button>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <h2 className="font-display text-xl text-steel-50">{p.title || 'Untitled project'}</h2>
        <div className="flex gap-2">
          <button onClick={report} disabled={rep} className="btn btn-ghost !py-2 !px-3 text-[0.78rem] disabled:opacity-60"><Icon name="download" className="w-4 h-4" /> {rep ? '…' : 'PDF'}</button>
          <button onClick={remove} className="btn btn-ghost !py-2 !px-3 text-[0.78rem] hover:!text-red-500">Delete</button>
          <button onClick={save} disabled={saving} className="btn btn-red !py-2.5">{saving ? 'Saving…' : 'Save changes'}</button>
        </div>
      </div>

      {/* editable fields */}
      <div className="panel p-5 sm:p-6 grid sm:grid-cols-2 gap-4 mb-5">
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

      <div className="grid lg:grid-cols-2 gap-5">
        {/* milestones */}
        <div className="panel p-5">
          <h3 className="font-display text-steel-50 mb-3">Milestones</h3>
          <ul className="space-y-2 mb-3">
            {(p.milestones || []).map((m) => (
              <li key={m.id} className="flex items-center gap-3"><button onClick={() => doToggle(m)} className={`grid place-items-center w-5 h-5 rounded-full shrink-0 ${m.done ? 'bg-[color:var(--color-ok)] text-white' : 'bg-steel-800 text-steel-500 hover:text-red-400'}`}><Icon name="check" className="w-3 h-3" /></button><span className={`text-sm flex-1 ${m.done ? 'text-steel-300 line-through' : 'text-steel-200'}`}>{m.title}</span><span className="mono-label text-steel-500">{m.due}</span></li>
            ))}
          </ul>
          <div className="flex gap-2"><input className="input !py-2 flex-1" placeholder="Milestone" value={ml.title} onChange={(e) => setMl({ ...ml, title: e.target.value })} /><input type="date" className="input !py-2 w-36" value={ml.due} onChange={(e) => setMl({ ...ml, due: e.target.value })} /><button onClick={doMilestone} className="btn btn-red !py-2 !px-3"><Icon name="plus" className="w-4 h-4" /></button></div>
        </div>
        {/* worklogs */}
        <div className="panel p-5">
          <h3 className="font-display text-steel-50 mb-3">Work history</h3>
          <ol className="space-y-3 mb-3 max-h-56 overflow-y-auto">
            {(p.worklogs || []).map((w) => (<li key={w.id} className="border-l-2 border-red-500 pl-3"><p className="mono-label text-red-400">{w.date} · {w.status}</p><p className="text-sm text-steel-100">{w.title}</p>{w.note && <p className="text-sm text-steel-400">{w.note}</p>}</li>))}
          </ol>
          <div className="space-y-2">
            <div className="flex gap-2"><input type="date" className="input !py-2 w-36" value={wl.date} onChange={(e) => setWl({ ...wl, date: e.target.value })} /><input className="input !py-2 flex-1" placeholder="Update title" value={wl.title} onChange={(e) => setWl({ ...wl, title: e.target.value })} /></div>
            <div className="flex gap-2"><input className="input !py-2 flex-1" placeholder="Note" value={wl.note} onChange={(e) => setWl({ ...wl, note: e.target.value })} /><button onClick={doWorklog} className="btn btn-red !py-2 !px-3"><Icon name="plus" className="w-4 h-4" /></button></div>
          </div>
        </div>
        {/* photos */}
        <div className="panel p-5 lg:col-span-2">
          <h3 className="font-display text-steel-50 mb-3">Site photos</h3>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-3">
            {(p.photos || []).map((x) => (
              <figure key={x.id} className="cover-frame aspect-square relative group">
                <img src={photoSrc(x.url)} alt={x.caption} className="absolute inset-0 w-full h-full object-cover duotone" />
                <button onClick={() => doDelPhoto(x.id)} className="absolute top-1 right-1 grid place-items-center w-6 h-6 rounded bg-steel-950/70 text-white opacity-0 group-hover:opacity-100 hover:bg-red-500 transition"><Icon name="x" className="w-3.5 h-3.5" /></button>
              </figure>
            ))}
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
      </div>
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
      <button onClick={onBack} className="inline-flex items-center gap-2 text-sm text-steel-400 hover:text-red-400 mb-5"><Icon name="arrowLeft" className="w-4 h-4" /> All clients</button>
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
      <div className="flex items-center justify-between mb-3"><h3 className="font-display text-lg text-steel-50">Projects ({(client.projects || []).length})</h3><button onClick={() => setAdding((v) => !v)} className="btn btn-red !py-2.5"><Icon name={adding ? 'x' : 'plus'} className="w-4 h-4" /> {adding ? 'Cancel' : 'New project'}</button></div>

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
        {(client.projects || []).map((p) => (
          <button key={p.id} onClick={() => setProj(p)} className="panel lift p-5 text-left group">
            <div className="flex items-center justify-between mb-2"><StatusPill s={p.status} /><span className="mono-label text-steel-500">{p.type}</span></div>
            <h4 className="font-display text-steel-50 group-hover:text-red-400 transition-colors">{p.title}</h4>
            <div className="flex items-center justify-between mt-3 mb-1.5"><span className="mono-label text-steel-500">{p.progress}%</span><span className="font-mono text-sm text-steel-100">{money(p.budget)}</span></div>
            <div className="h-1.5 rounded-full bg-steel-800 overflow-hidden"><div className="h-full rounded-full" style={{ width: `${p.progress}%`, background: STATUS_HEX[p.status] }} /></div>
            <p className="mono-label text-steel-500 mt-3">{(p.worklogs || []).length} updates · {(p.photos || []).length} photos · {(p.milestones || []).length} milestones</p>
          </button>
        ))}
        {!(client.projects || []).length && !adding && <p className="mono-label text-steel-500 py-8">No projects yet. Add the first one.</p>}
      </div>
    </div>
  );
}

/* ═══════════════ INVENTORY ═══════════════ */
const EMPTY_PRODUCT = { name: '', sku: '', category: '', price: 0, stock: 0, reorder: 5, image: '' };
function Inventory() {
  const [items, setItems] = useState([]);
  const [q, setQ] = useState('');
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState(EMPTY_PRODUCT);
  const [loaded, setLoaded] = useState(false);

  const load = useCallback(async () => { try { setItems(await listProducts()); } catch (e) { toast.error(e.message); } finally { setLoaded(true); } }, []);
  useEffect(() => { load(); }, [load]);

  const filtered = items.filter((p) => `${p.name} ${p.sku} ${p.category}`.toLowerCase().includes(q.toLowerCase()));
  const low = items.filter((p) => p.stock <= p.reorder).length;
  const value = items.reduce((a, p) => a + p.price * p.stock, 0);
  const bump = async (id, delta) => { try { const u = await adjustStock(id, delta); setItems((x) => x.map((p) => (p.id === id ? u : p))); } catch (e) { toast.error(e.message); } };
  const patch = async (id, body) => { try { const u = await updateProductApi(id, body); setItems((x) => x.map((p) => (p.id === id ? u : p))); } catch (e) { toast.error(e.message); } };
  const del = async (id) => { await deleteProductApi(id); setItems((x) => x.filter((p) => p.id !== id)); toast('Product removed'); };
  const create = async () => {
    if (!form.name) { toast.error('Product needs a name'); return; }
    const p = await createProductApi({ ...form, price: Number(form.price) || 0, stock: Number(form.stock) || 0, reorder: Number(form.reorder) || 0 });
    setItems([p, ...items]); setForm(EMPTY_PRODUCT); setAdding(false); toast.success('Product added');
  };

  return (
    <>
      <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-5">
        {[['SKUs', items.length, 'box'], ['Low stock', low, 'bell'], ['Stock value', money(value), 'analytics']].map(([l, v, ic]) => (
          <div key={l} className="panel-800 ticked p-4 sm:p-5"><span className="grid place-items-center w-9 h-9 rounded bg-steel-800 text-red-500 mb-3"><Icon name={ic} className="w-5 h-5" /></span><p className="font-display text-xl sm:text-2xl text-steel-50 tabnum">{v}</p><p className="mono-label text-steel-500 mt-1">{l}</p></div>
        ))}
      </div>
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <label className="relative flex-1"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-steel-400"><Icon name="search" className="w-4 h-4" /></span><input value={q} onChange={(e) => setQ(e.target.value)} className="input !pl-9 w-full" placeholder="Search product, SKU or category…" /></label>
        <button onClick={() => setAdding((v) => !v)} className="btn btn-red !py-2.5 shrink-0"><Icon name={adding ? 'x' : 'plus'} className="w-4 h-4" /> {adding ? 'Cancel' : 'New product'}</button>
      </div>
      {adding && (
        <div className="panel p-5 mb-4 grid sm:grid-cols-3 gap-3">
          <Field label="Name"><input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
          <Field label="SKU"><input className="input" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} /></Field>
          <Field label="Category"><input className="input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} /></Field>
          <Field label="Price (US$)"><input type="number" className="input" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} /></Field>
          <Field label="Stock"><input type="number" className="input" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} /></Field>
          <Field label="Reorder at"><input type="number" className="input" value={form.reorder} onChange={(e) => setForm({ ...form, reorder: e.target.value })} /></Field>
          <div className="sm:col-span-2"><Field label="Image URL"><input className="input" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} placeholder="/img/photos/…" /></Field></div>
          <div className="flex items-end"><button onClick={create} className="btn btn-red w-full">Add product</button></div>
        </div>
      )}
      <div className="panel overflow-hidden">
        <div className="hidden md:grid grid-cols-[2.2fr_1.2fr_1fr_1.4fr_auto] gap-4 px-5 py-3 border-b border-steel-800 mono-label text-steel-500"><span>Product</span><span>Category</span><span>Price</span><span>Stock</span><span></span></div>
        {filtered.map((p) => {
          const lowp = p.stock <= p.reorder;
          return (
            <div key={p.id} className="grid grid-cols-[1fr_auto] md:grid-cols-[2.2fr_1.2fr_1fr_1.4fr_auto] gap-3 md:gap-4 px-4 sm:px-5 py-3 border-b border-steel-800 last:border-0 items-center hover:bg-steel-850">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded overflow-hidden bg-steel-800 shrink-0">{p.image ? <img src={photoSrc(p.image)} alt="" className="w-full h-full object-cover duotone" /> : null}</div>
                <div className="min-w-0"><p className="text-sm text-steel-100 leading-tight truncate">{p.name}</p><p className="font-mono text-[0.68rem] text-steel-500">{p.sku || '—'} {lowp && <span className="text-[color:var(--color-warn)]">· LOW</span>}</p></div>
              </div>
              <span className="text-sm text-steel-400 hidden md:block truncate">{p.category}</span>
              <div className="hidden md:block"><span className="font-mono text-sm text-steel-500">US$</span> <input defaultValue={p.price} onBlur={(e) => Number(e.target.value) !== p.price && patch(p.id, { price: Number(e.target.value) })} className="w-20 bg-transparent border-b border-steel-700 focus:border-red-500 outline-none font-mono text-sm text-steel-100 py-0.5" /></div>
              <div className="flex items-center gap-2 justify-self-end md:justify-self-auto">
                <button onClick={() => bump(p.id, -1)} className="grid place-items-center w-7 h-7 rounded bg-steel-800 text-steel-300 hover:text-red-400"><Icon name="minus" className="w-4 h-4" /></button>
                <span className="font-mono text-sm tabnum w-10 text-center" style={{ color: lowp ? 'var(--color-warn)' : 'var(--color-steel-100)' }}>{p.stock}</span>
                <button onClick={() => bump(p.id, 1)} className="grid place-items-center w-7 h-7 rounded bg-steel-800 text-steel-300 hover:text-red-400"><Icon name="plus" className="w-4 h-4" /></button>
              </div>
              <button onClick={() => del(p.id)} className="text-steel-500 hover:text-red-400 justify-self-end hidden md:block"><Icon name="x" className="w-4 h-4" /></button>
            </div>
          );
        })}
        {loaded && filtered.length === 0 && <p className="mono-label text-steel-500 py-12 text-center">No products{q ? ` match “${q}”` : ' yet'}.</p>}
      </div>
      <p className="mono-label text-steel-500 mt-3">Edit price inline · use − / + to adjust stock · products marked LOW are at or below their reorder point.</p>
    </>
  );
}

/* ═══════════════ SITE MANAGEMENT (CMS) ═══════════════ */
const CONTENT_TYPES = ['Article', 'Case study', 'Video', 'Standard'];
const EMPTY_CONTENT = { type: 'Article', title: '', excerpt: '', body: '', status: 'Draft', image: '', youtube: '' };
function SiteManagement() {
  const [items, setItems] = useState([]);
  const [q, setQ] = useState('');
  const [edit, setEdit] = useState(null); // content object or {} for new
  const [loaded, setLoaded] = useState(false);

  const load = useCallback(async () => { try { setItems(await listContent()); } catch (e) { toast.error(e.message); } finally { setLoaded(true); } }, []);
  useEffect(() => { load(); }, [load]);

  const filtered = items.filter((c) => `${c.title} ${c.type}`.toLowerCase().includes(q.toLowerCase()));
  const pub = items.filter((c) => c.status === 'Published').length;
  const publishToggle = async (c) => { const u = await updateContentApi(c.id, { status: c.status === 'Published' ? 'Draft' : 'Published' }); setItems((x) => x.map((i) => (i.id === c.id ? u : i))); toast(u.status === 'Published' ? 'Published' : 'Unpublished'); };
  const del = async (id) => { await deleteContentApi(id); setItems((x) => x.filter((c) => c.id !== id)); toast('Content removed'); };
  const saveEdit = async (data) => {
    if (!data.title) { toast.error('Title required'); return; }
    if (data.id) { const u = await updateContentApi(data.id, data); setItems((x) => x.map((c) => (c.id === data.id ? u : c))); toast.success('Saved'); }
    else { const c = await createContentApi(data); setItems([c, ...items]); toast.success('Created'); }
    setEdit(null);
  };
  const statusColor = (s) => (s === 'Published' ? 'var(--color-ok)' : 'var(--color-steel-400)');

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
      <div className="grid sm:grid-cols-2 gap-4">
        {filtered.map((c) => (
          <div key={c.id} className="panel overflow-hidden flex">
            <div className="w-24 shrink-0 bg-steel-800 relative">{c.image ? <img src={photoSrc(c.image)} alt="" className="absolute inset-0 w-full h-full object-cover duotone" /> : null}{c.type === 'Video' && <span className="absolute inset-0 grid place-items-center text-white"><Icon name="play" className="w-6 h-6" /></span>}</div>
            <div className="flex-1 min-w-0 p-4">
              <div className="flex items-center gap-2 mb-1"><span className="mono-label text-red-400">{c.type}</span><span className="mono-label" style={{ color: statusColor(c.status) }}>· {c.status}</span></div>
              <p className="text-sm text-steel-100 font-medium leading-tight line-clamp-2">{c.title}</p>
              <div className="flex items-center gap-2 mt-3">
                <button onClick={() => publishToggle(c)} className="btn btn-ghost !py-1.5 !px-2.5 text-[0.72rem]">{c.status === 'Published' ? 'Unpublish' : 'Publish'}</button>
                <button onClick={() => setEdit(c)} className="btn btn-ghost !py-1.5 !px-2.5 text-[0.72rem]">Edit</button>
                <button onClick={() => del(c.id)} className="text-steel-500 hover:text-red-400 ml-auto"><Icon name="x" className="w-4 h-4" /></button>
              </div>
            </div>
          </div>
        ))}
        {loaded && filtered.length === 0 && <p className="mono-label text-steel-500 py-12 text-center sm:col-span-2">No content{q ? ` matches “${q}”` : ''}.</p>}
      </div>
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
const NAV_ITEMS = [['dashboard', 'Overview', 'overview'], ['user', 'Clients', 'clients'], ['box', 'Inventory', 'inventory'], ['file', 'Site', 'site']];
const TAB_TITLE = { overview: 'Overview', clients: 'Clients', inventory: 'Inventory', site: 'Site content' };
function Console({ admin, onOut }) {
  const [tab, setTab] = useState('overview');
  const [clients, setClients] = useState([]);
  const [pins, setPins] = useState([]);
  const [sel, setSel] = useState(null); // full client detail
  const [nc, setNc] = useState({ name: '', contact: '', email: '' });
  const [creating, setCreating] = useState(false);

  const loadAll = useCallback(async () => {
    try { const [cs, mp] = await Promise.all([listClients(), getMap()]); setClients(cs); setPins(mp); }
    catch (err) { if (/401|token/i.test(err.message)) onOut(); else toast.error(err.message); }
  }, [onOut]);
  useEffect(() => { loadAll(); }, [loadAll]);

  const openClient = async (id) => { try { setSel(await getClient(id)); } catch (err) { toast.error(err.message); } };
  const reloadClient = async () => { if (!sel) return null; const c = await getClient(sel.id); setSel(c); return c; };

  const createC = async () => {
    if (!nc.name) { toast.error('Client needs a name'); return; }
    try { const c = await createClient(nc); setNc({ name: '', contact: '', email: '' }); setCreating(false); await loadAll(); toast.success(`${c.name} created · PIN ${c.pin}`); openClient(c.id); }
    catch (err) { toast.error(err.message); }
  };
  const delC = async (id, name) => { await deleteClient(id); await loadAll(); toast(`${name} removed`); };

  const totalProjects = clients.reduce((a, c) => a + c.projectCount, 0);
  const activePins = pins.filter((p) => p.status === 'Active').length;
  const totalValue = pins.reduce((a, p) => a + (p.budget || 0), 0);

  return (
    <section className="pt-[62px] md:pt-[72px] bg-steel-950 min-h-screen">
      <div className="flex">
        <aside className="hidden lg:flex flex-col w-60 shrink-0 bg-steel-900 border-r border-steel-800 min-h-[calc(100vh-72px)] sticky top-[72px] p-4">
          <p className="mono-label text-steel-500 px-3 mb-3">Project console</p>
          {NAV_ITEMS.map(([ic, lbl, id]) => (
            <button key={id} onClick={() => { setTab(id); setSel(null); }} className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-display transition-colors mb-1 ${tab === id && !sel ? 'bg-red-500/12 text-red-400' : 'text-steel-300 hover:bg-steel-850 hover:text-steel-100'}`}><Icon name={ic} className="w-5 h-5" /> {lbl}</button>
          ))}
          <div className="mt-auto panel p-4">
            <p className="mono-label text-steel-500">Signed in</p>
            <p className="text-sm text-steel-100 mt-1 truncate">{admin?.name || 'Admin'}</p>
            <button onClick={onOut} className="btn btn-ghost w-full mt-3 !py-2 text-[0.78rem]">Sign out</button>
          </div>
        </aside>

        <div className="flex-1 min-w-0 p-5 md:p-8">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div><p className="mono-label text-red-400">Asset Reliability Services</p><h1 className="font-display text-2xl text-steel-50 mt-0.5">{sel ? sel.name : TAB_TITLE[tab]}</h1></div>
          </div>
          {/* mobile nav */}
          <div className="lg:hidden flex gap-2 overflow-x-auto no-scrollbar mb-6 -mx-1 px-1">
            {NAV_ITEMS.map(([ic, lbl, id]) => (
              <button key={id} onClick={() => { setTab(id); setSel(null); }} className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-2 rounded-md text-[0.78rem] font-display border ${tab === id && !sel ? 'bg-red-500 text-white border-red-500' : 'bg-steel-850 text-steel-300 border-steel-700'}`}><Icon name={ic} className="w-4 h-4" />{lbl}</button>
            ))}
            <button onClick={onOut} className="shrink-0 btn btn-ghost !py-2 !px-3 text-[0.78rem]">Exit</button>
          </div>

          {sel ? (
            <ClientDetail client={sel} onBack={() => setSel(null)} reloadClient={reloadClient} reloadAll={loadAll} />
          ) : tab === 'overview' ? (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-5">
                {[['Clients', clients.length, 'user'], ['Projects', totalProjects, 'dashboard'], ['Active on map', activePins, 'pin'], ['Portfolio value', money(totalValue), 'analytics']].map(([l, v, ic]) => (
                  <div key={l} className="panel-800 ticked p-4 sm:p-5"><span className="grid place-items-center w-10 h-10 rounded bg-steel-800 text-red-500 mb-3"><Icon name={ic} className="w-5 h-5" /></span><p className="font-display text-2xl text-steel-50 tabnum">{v}</p><p className="mono-label text-steel-500 mt-1">{l}</p></div>
                ))}
              </div>
              <div className="panel p-2 mb-5"><WorkMap pins={pins} height={440} /></div>
              <div className="flex flex-wrap gap-3 items-center">
                {STATUSES.map((s) => <span key={s} className="inline-flex items-center gap-1.5 mono-label text-steel-400"><span className="w-2.5 h-2.5 rounded-full" style={{ background: STATUS_HEX[s] }} /> {s}</span>)}
                <span className="mono-label text-steel-600 ml-auto">Ring = % complete · click a pin for detail</span>
              </div>
            </>
          ) : tab === 'inventory' ? (
            <Inventory />
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
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {clients.map((c) => (
                  <div key={c.id} className="panel p-5">
                    <div className="flex items-start justify-between"><div><h3 className="font-display text-lg text-steel-50">{c.name}</h3><p className="text-sm text-steel-400 mt-0.5">{c.contact || '—'}</p></div><span className="mono-label text-steel-500">{c.projectCount} proj</span></div>
                    <div className="flex items-center justify-between mt-4 panel-800 p-2.5"><div><p className="mono-label text-steel-500">PIN</p><p className="font-mono text-lg text-steel-50 tracking-[0.3em]">{c.pin}</p></div><span className="font-mono text-[0.66rem] text-steel-500 truncate max-w-[8rem]">/portal?c={c.slug}</span></div>
                    <div className="flex gap-2 mt-3">
                      <button onClick={() => openClient(c.id)} className="btn btn-red !py-2 flex-1 text-[0.78rem]">Manage</button>
                      <button onClick={() => copy(portalLink(c.slug), 'Link copied')} className="btn btn-ghost !py-2 !px-3 text-[0.78rem]"><Icon name="chain" className="w-4 h-4" /></button>
                      <button onClick={() => delC(c.id, c.name)} className="btn btn-ghost !py-2 !px-3 text-[0.78rem] hover:!text-red-500"><Icon name="x" className="w-4 h-4" /></button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
          <p className="font-mono text-[0.68rem] text-steel-600 mt-8 text-center">Live console · connected to {API_BASE.replace('https://', '')}</p>
        </div>
      </div>
    </section>
  );
}

export default function Admin() {
  const [admin, setAdmin] = useState(getToken() ? { name: 'ARS Admin' } : null);
  const signOut = () => { setToken(null); setAdmin(null); toast('Signed out'); };
  return admin ? <Console admin={admin} onOut={signOut} /> : <AdminLogin onIn={setAdmin} />;
}
