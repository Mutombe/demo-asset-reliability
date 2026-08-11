import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import Icon from '../components/Icon';
import WorkMap from '../components/WorkMap';
import {
  API_BASE, getToken, setToken, adminLogin, adminGoogle, listClients, getClient, createClient,
  regenPin, deleteClient, createProject, updateProject, deleteProject, addWorklog, addMilestone,
  toggleMilestone, addPhoto, getMap, STATUS_HEX, STATUSES,
  uploadPhoto, deletePhoto, notifyClient, adminReport, waLink, photoSrc,
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

/* ═══════════════ LOGIN ═══════════════ */
function AdminLogin({ onIn }) {
  const [pass, setPass] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault(); setBusy(true);
    try { const r = await adminLogin(pass); setToken(r.token); onIn(r.admin); toast.success('Signed in'); }
    catch (err) { toast.error(err.message || 'Wrong passcode'); }
    finally { setBusy(false); }
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
        if (el) window.google.accounts.id.renderButton(el, { theme: 'outline', size: 'large', width: 320, text: 'continue_with' });
      } catch { /* origins not authorised — passcode still works */ }
    };
    if (document.getElementById(id)) { init(); return; }
    const s = document.createElement('script');
    s.src = 'https://accounts.google.com/gsi/client'; s.async = true; s.defer = true; s.id = id; s.onload = init;
    document.body.appendChild(s);
  }, [onIn]);

  return (
    <section className="min-h-[100svh] grid place-items-center bg-steel-950 px-6 py-24">
      <div className="w-full max-w-sm">
        <img src="/img/logo-light.png" alt="ARS" className="h-10 mb-8" />
        <p className="kicker mb-3">Admin console</p>
        <h1 className="display-3 text-steel-50">Sign in to manage projects</h1>
        <p className="text-steel-400 mt-2 text-sm">Clients, projects, work history and portal access.</p>
        <div id="gbtn" className="mt-7 flex justify-center [color-scheme:light]" />
        <div className="flex items-center gap-3 my-5"><span className="h-px flex-1 bg-steel-800" /><span className="mono-label text-steel-500">or passcode</span><span className="h-px flex-1 bg-steel-800" /></div>
        <form onSubmit={submit} className="space-y-3">
          <Field label="Admin passcode"><input value={pass} onChange={(e) => setPass(e.target.value)} type="password" className="input" placeholder="••••••••" /></Field>
          <button type="submit" disabled={busy} className="btn btn-red w-full !py-3.5 disabled:opacity-60">{busy ? 'Signing in…' : 'Sign in'}</button>
        </form>
        <p className="font-mono text-[0.66rem] text-steel-600 text-center mt-5">Google sign-in requires this domain to be an authorised origin in the Google OAuth client.</p>
        <p className="text-center text-sm text-steel-400 mt-3"><Link to="/portal" className="text-red-400 link-underline">Client portal →</Link></p>
      </div>
    </section>
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
  const sendEmail = async () => {
    if (!client.email) { toast.error('Add an email address for this client first'); return; }
    setEmailing(true);
    try { const r = await notifyClient(client.id, portalLink(client.slug)); toast.success(`Portal link emailed to ${r.to}`); }
    catch (e) { toast.error(e.message); } finally { setEmailing(false); }
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

/* ═══════════════ CONSOLE ═══════════════ */
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
          {[['dashboard', 'Overview', 'overview'], ['user', 'Clients', 'clients']].map(([ic, lbl, id]) => (
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
            <div><p className="mono-label text-red-400">Asset Reliability Services</p><h1 className="font-display text-2xl text-steel-50 mt-0.5">{sel ? sel.name : tab === 'overview' ? 'Overview' : 'Clients'}</h1></div>
            <div className="flex items-center gap-2 lg:hidden">
              <button onClick={() => { setTab('overview'); setSel(null); }} className={`px-3 py-2 rounded-md text-[0.78rem] font-display border ${tab === 'overview' && !sel ? 'bg-red-500 text-white border-red-500' : 'bg-steel-850 text-steel-300 border-steel-700'}`}>Overview</button>
              <button onClick={() => { setTab('clients'); setSel(null); }} className={`px-3 py-2 rounded-md text-[0.78rem] font-display border ${tab === 'clients' && !sel ? 'bg-red-500 text-white border-red-500' : 'bg-steel-850 text-steel-300 border-steel-700'}`}>Clients</button>
              <button onClick={onOut} className="btn btn-ghost !py-2 !px-3 text-[0.78rem]">Exit</button>
            </div>
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
