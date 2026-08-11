import React, { useState, useMemo, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from '../components/Icon';
import { Spark, LineChart, BarChart, Ring } from '../components/Charts';
import WorkMap from '../components/WorkMap';
import { useAuth } from '../lib/auth';
import { portalAccess, STATUS_HEX, photoSrc, clientReport } from '../api';
import { brand, portalKpis, portalAssets, portalReports, assetDetail, portalAvailability, portalAlertsSeries, portalMonths, workOrdersSeed } from '../data';

const money = (n) => 'US$' + Number(n || 0).toLocaleString();
const statusColor = { ok: 'var(--color-ok)', warn: 'var(--color-warn)', crit: 'var(--color-crit)' };
const statusLabel = { ok: 'Healthy', warn: 'Watch', crit: 'Critical' };

function StatusBadge({ s }) {
  const c = STATUS_HEX[s] || '#e2211c';
  return <span className="inline-flex items-center gap-1.5 font-mono text-[0.68rem] uppercase px-2 py-1 rounded" style={{ color: c, background: `${c}18` }}><span className="w-1.5 h-1.5 rounded-full" style={{ background: c }} /> {s}</span>;
}
function Progress({ v, color = 'var(--color-red-500)' }) {
  return <div className="h-2 rounded-full bg-steel-800 overflow-hidden"><motion.div className="h-full rounded-full" style={{ background: color }} initial={{ width: 0 }} animate={{ width: `${v}%` }} transition={{ duration: 0.8 }} /></div>;
}

/* ═══════════════ CLIENT PROJECT PORTAL ═══════════════ */
function ProjectDetail({ p, code, pin, onBack }) {
  const spentPct = p.budget ? Math.round((p.spent / p.budget) * 100) : 0;
  const [dl, setDl] = useState(false);
  const download = async () => {
    setDl(true);
    try { await clientReport(code, pin, p.id, p.title.replace(/\s+/g, '-').toLowerCase()); toast.success('Report downloaded'); }
    catch (e) { toast.error(e.message); } finally { setDl(false); }
  };
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center justify-between mb-5">
        <button onClick={onBack} className="inline-flex items-center gap-2 text-sm text-steel-400 hover:text-red-400"><Icon name="arrowLeft" className="w-4 h-4" /> All projects</button>
        <button onClick={download} disabled={dl} className="btn btn-ghost !py-2 !px-3 text-[0.78rem] disabled:opacity-60"><Icon name="download" className="w-4 h-4" /> {dl ? 'Preparing…' : 'Download report'}</button>
      </div>
      <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
        <div>
          <div className="flex items-center gap-3 mb-2"><StatusBadge s={p.status} /><span className="mono-label text-steel-500">{p.type}</span></div>
          <h1 className="font-display text-2xl md:text-3xl text-steel-50">{p.title}</h1>
          {p.location && <p className="text-sm text-steel-400 mt-1 inline-flex items-center gap-1.5"><Icon name="pin" className="w-4 h-4 text-red-500" /> {p.location}</p>}
        </div>
        <div className="text-right">
          <p className="font-display text-2xl text-steel-50 tabnum">{money(p.budget)}</p>
          <p className="mono-label text-steel-500">contract value</p>
        </div>
      </div>

      {/* progress + budget + dates */}
      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        <div className="panel-800 p-4"><div className="flex items-center justify-between mb-2"><span className="mono-label text-steel-500">Progress</span><span className="font-mono text-sm tabnum" style={{ color: STATUS_HEX[p.status] }}>{p.progress}%</span></div><Progress v={p.progress} color={STATUS_HEX[p.status]} /></div>
        <div className="panel-800 p-4"><div className="flex items-center justify-between mb-2"><span className="mono-label text-steel-500">Spent</span><span className="font-mono text-sm tabnum text-steel-100">{money(p.spent)}</span></div><Progress v={spentPct} /></div>
        <div className="panel-800 p-4"><span className="mono-label text-steel-500">Schedule</span><p className="font-mono text-sm text-steel-100 mt-2">{p.start_date || '—'} <span className="text-steel-500">→</span> {p.due_date || '—'}</p></div>
      </div>

      {p.description && <p className="text-steel-300 leading-relaxed mb-8 max-w-3xl">{p.description}</p>}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* milestones */}
        <div>
          <h3 className="kicker has-icon mb-4"><Icon name="check" className="w-4 h-4" /> Milestones</h3>
          <ul className="space-y-2">
            {(p.milestones || []).map((m) => (
              <li key={m.id} className="panel p-3.5 flex items-center gap-3">
                <span className={`grid place-items-center w-6 h-6 rounded-full shrink-0 ${m.done ? 'bg-[color:var(--color-ok)] text-white' : 'bg-steel-800 text-steel-500'}`}><Icon name="check" className="w-3.5 h-3.5" /></span>
                <span className={`text-sm flex-1 ${m.done ? 'text-steel-200' : 'text-steel-400'}`}>{m.title}</span>
                <span className="mono-label text-steel-500">{m.due}</span>
              </li>
            ))}
            {!(p.milestones || []).length && <p className="mono-label text-steel-500">No milestones yet.</p>}
          </ul>
        </div>
        {/* work history */}
        <div>
          <h3 className="kicker has-icon mb-4"><Icon name="clock" className="w-4 h-4" /> Work history</h3>
          <ol className="relative border-l-2 border-steel-800 ml-2 space-y-5">
            {(p.worklogs || []).map((w) => (
              <li key={w.id} className="pl-5 relative">
                <span className="absolute -left-[7px] top-1.5 w-3 h-3 rounded-full bg-red-500 ring-4 ring-steel" />
                <p className="mono-label text-red-400">{w.date}</p>
                <p className="text-sm text-steel-100 font-medium mt-0.5">{w.title}</p>
                {w.note && <p className="text-sm text-steel-400 mt-0.5">{w.note}</p>}
                <span className="mono-label text-steel-500">{w.status}</span>
              </li>
            ))}
            {!(p.worklogs || []).length && <p className="pl-5 mono-label text-steel-500">No updates logged yet.</p>}
          </ol>
        </div>
      </div>

      {/* photos */}
      {(p.photos || []).length > 0 && (
        <div className="mt-8">
          <h3 className="kicker has-icon mb-4"><Icon name="dashboard" className="w-4 h-4" /> Site photos</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {p.photos.map((ph) => (
              <figure key={ph.id} className="cover-frame aspect-[4/3] relative group">
                <img src={photoSrc(ph.url)} alt={ph.caption} loading="lazy" className="absolute inset-0 w-full h-full object-cover duotone" />
                <div className="absolute inset-0 scrim-b" />
                {ph.caption && <figcaption className="absolute bottom-0 inset-x-0 p-3 text-xs text-white">{ph.caption}</figcaption>}
              </figure>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}

function ClientPortal({ data, code, pin, onExit }) {
  const [sel, setSel] = useState(null);
  const projects = data.projects || [];
  const active = projects.filter((p) => p.status === 'Active').length;
  const done = projects.filter((p) => p.status === 'Completed').length;
  const value = projects.reduce((a, p) => a + (p.budget || 0), 0);
  const pins = projects.filter((p) => p.lat != null && p.lng != null).map((p) => ({ ...p, client: data.client.name }));
  const selected = projects.find((p) => p.id === sel);

  return (
    <section className="pt-24 md:pt-28 pb-16 bg-steel min-h-screen relative">
      <div className="absolute inset-x-0 top-0 h-72 grad-steel -z-0" aria-hidden />
      <div className="relative shell">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <span className="grid place-items-center w-12 h-12 rounded-md grad-red text-white font-display text-lg">{data.client.name.split(' ').map((w) => w[0]).slice(0, 2).join('')}</span>
            <div>
              <p className="mono-label text-red-400">Client portal</p>
              <h1 className="font-display text-2xl text-white leading-none mt-0.5">{data.client.name}</h1>
              <p className="text-sm text-white/70 mt-1">{projects.length} project{projects.length !== 1 ? 's' : ''} with Asset Reliability Services</p>
            </div>
          </div>
          <button onClick={onExit} className="btn btn-glass !py-2.5">Sign out</button>
        </div>

        {selected ? (
          <div className="panel p-5 sm:p-7"><ProjectDetail p={selected} code={code} pin={pin} onBack={() => setSel(null)} /></div>
        ) : (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
              {[['Projects', projects.length, 'dashboard'], ['Active', active, 'gauge'], ['Completed', done, 'check'], ['Contract value', money(value), 'analytics']].map(([l, v, ic]) => (
                <div key={l} className="panel-800 ticked p-4 sm:p-5">
                  <span className="grid place-items-center w-9 h-9 rounded bg-steel-800 text-red-500 mb-3"><Icon name={ic} className="w-5 h-5" /></span>
                  <p className="font-display text-xl sm:text-2xl text-steel-50 tabnum">{v}</p>
                  <p className="mono-label text-steel-500 mt-1">{l}</p>
                </div>
              ))}
            </div>

            {pins.length > 0 && (
              <div className="panel p-2 mb-6">
                <WorkMap pins={pins} height={300} />
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-4">
              {projects.map((p) => (
                <button key={p.id} onClick={() => setSel(p.id)} className="panel lift ticked p-5 text-left group">
                  <div className="flex items-center justify-between mb-3"><StatusBadge s={p.status} /><span className="mono-label text-steel-500">{p.type}</span></div>
                  <h3 className="font-display text-lg text-steel-50 group-hover:text-red-400 transition-colors">{p.title}</h3>
                  {p.location && <p className="text-sm text-steel-400 mt-1 inline-flex items-center gap-1.5"><Icon name="pin" className="w-3.5 h-3.5" /> {p.location}</p>}
                  <div className="flex items-center justify-between mt-4 mb-2"><span className="mono-label text-steel-500">{p.progress}% complete</span><span className="font-mono text-sm text-steel-100 tabnum">{money(p.budget)}</span></div>
                  <Progress v={p.progress} color={STATUS_HEX[p.status]} />
                  <div className="flex items-center justify-between mt-4 text-steel-500">
                    <span className="mono-label">{p.start_date} → {p.due_date}</span>
                    <span className="inline-flex items-center gap-1 text-red-400 font-display text-sm">Open <Icon name="arrowRight" className="w-4 h-4" /></span>
                  </div>
                </button>
              ))}
            </div>
          </>
        )}
        <p className="font-mono text-[0.68rem] text-steel-600 mt-8 text-center">Secure client portal · Asset Reliability Services (Pvt) Ltd</p>
      </div>
    </section>
  );
}

/* ═══════════════ SIGN IN (client code + PIN, demo dashboard secondary) ═══════════════ */
function SignIn({ onClient }) {
  const { signInGoogle, signInDemo } = useAuth();
  const loc = useLocation();
  const preset = new URLSearchParams(loc.search).get('c') || '';
  const [code, setCode] = useState(preset);
  const [pin, setPin] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (code.length < 3 || pin.length !== 4) { toast.error('Enter your access code and 4-digit PIN'); return; }
    setBusy(true);
    try {
      const data = await portalAccess(code.trim(), pin.trim());
      toast.success(`Welcome, ${data.client.name}`);
      onClient(data, code.trim(), pin.trim());
    } catch (err) {
      toast.error(err.message || 'Invalid code or PIN');
    } finally { setBusy(false); }
  };

  return (
    <section className="relative min-h-[100svh] grid lg:grid-cols-2 bg-steel-950">
      <div className="relative hidden lg:block overflow-hidden">
        <img src="/img/photos/gallery4.jpg" alt="" className="absolute inset-0 w-full h-full object-cover opacity-45 img-rich duotone" />
        <div className="absolute inset-0 scrim-steel" />
        <div className="absolute inset-0 grid-blueprint opacity-60" />
        <div className="absolute inset-0 glow-red opacity-70" />
        <div className="relative h-full flex flex-col justify-end p-14">
          <img src="/img/logo-light.png" alt="ARS" className="h-11 w-auto mb-8" />
          <h2 className="display-2 text-white max-w-md">Every job, <span className="text-red-400">on the record.</span></h2>
          <p className="lead !text-white/70 mt-4 max-w-sm">Work history, live progress, site photos, costs and reports for every project we run for you — in one secure place.</p>
          <div className="flex items-center gap-6 mt-8 font-mono text-[0.72rem] text-white/60">
            <span className="inline-flex items-center gap-2"><Icon name="lock" className="w-3.5 h-3.5" /> PIN-protected</span>
            <span className="inline-flex items-center gap-2"><Icon name="pin" className="w-3.5 h-3.5" /> Live map</span>
            <span className="inline-flex items-center gap-2"><Icon name="download" className="w-3.5 h-3.5" /> Reports</span>
          </div>
        </div>
      </div>
      <div className="relative flex items-center justify-center px-6 py-24">
        <div className="absolute inset-0 grid-fine opacity-30 lg:hidden" />
        <div className="relative w-full max-w-sm">
          <p className="kicker mb-4">Client portal</p>
          <h1 className="display-3 text-steel-50">Access your projects</h1>
          <p className="text-steel-400 mt-2 text-sm">Enter the access code and 4-digit PIN from Asset Reliability Services.</p>
          <form onSubmit={submit} className="mt-8 space-y-3">
            <div><label className="field-label">Access code</label><input value={code} onChange={(e) => setCode(e.target.value)} className="input font-mono" placeholder="e.g. mimosa" autoCapitalize="none" /></div>
            <div><label className="field-label">4-digit PIN</label><input value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))} inputMode="numeric" className="input font-mono text-center text-2xl tracking-[0.6em]" placeholder="••••" /></div>
            <button type="submit" disabled={busy} className="btn btn-red w-full !py-3.5 disabled:opacity-60">{busy ? 'Checking…' : 'Enter portal'}</button>
          </form>
          <p className="text-center text-sm text-steel-400 mt-4">No access code? <Link to="/contact" className="text-red-400 link-underline">Contact us</Link></p>

          <div className="flex items-center gap-3 my-6"><span className="h-px flex-1 bg-steel-800" /><span className="mono-label text-steel-500">ARS staff</span><span className="h-px flex-1 bg-steel-800" /></div>
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => { signInGoogle(); }} className="flex items-center justify-center gap-2 bg-white text-steel-50 font-display text-sm rounded-md py-2.5 border-2 border-line hover:border-steel-400 transition"><Icon name="google" className="w-4 h-4" strokeWidth={0} /> Google</button>
            <button onClick={() => { signInDemo(); }} className="btn btn-ghost !py-2.5 justify-center">Demo dashboard</button>
          </div>
          <p className="font-mono text-[0.66rem] text-steel-600 text-center mt-4">Staff sign-in opens the live monitoring dashboard demo</p>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════ ASSET MONITORING DASHBOARD (demo, via staff sign-in) ═══════════════ */
const KPI_SPARK = {
  'Assets monitored': [131, 134, 138, 140, 143, 145, 148],
  'Plant availability': [97.4, 97.7, 97.9, 98.1, 98.2, 98.4, 98.4],
  'Open alerts': [7, 6, 5, 5, 4, 4, 3],
  'Mean time between failures': [372, 384, 390, 398, 404, 409, 412],
};
const woNext = { Open: 'In progress', 'In progress': 'Scheduled', Scheduled: 'Closed', Closed: 'Closed' };
const prioColor = { High: 'var(--color-crit)', Medium: 'var(--color-warn)', Low: 'var(--color-ok)' };

function AssetDrawer({ asset, onClose, onRaise }) {
  useEffect(() => {
    const h = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);
  if (!asset) return null;
  const d = assetDetail[asset.id] || {};
  return (
    <AnimatePresence>
      <motion.div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
        <motion.aside className="absolute right-0 top-0 h-full w-full sm:max-w-md bg-steel-950 border-l border-steel-800 overflow-y-auto"
          initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 30, stiffness: 260 }} onClick={(e) => e.stopPropagation()}>
          <div className="sticky top-0 flex items-center justify-between px-6 py-4 bg-steel-950/90 backdrop-blur border-b border-steel-800">
            <div><p className="mono-label text-red-400">{asset.id}</p><h3 className="font-display text-lg text-steel-50 leading-tight">{asset.name}</h3></div>
            <button onClick={onClose} className="grid place-items-center w-9 h-9 rounded-md bg-steel-850 text-steel-300 hover:text-red-400"><Icon name="x" className="w-5 h-5" /></button>
          </div>
          <div className="p-6 space-y-6">
            <div className="flex items-center gap-5">
              <Ring value={asset.health} label="health" color={statusColor[asset.status]} />
              <div className="space-y-1.5">
                <span className="inline-flex items-center gap-1.5 font-mono text-[0.7rem] uppercase" style={{ color: statusColor[asset.status] }}><span className="w-1.5 h-1.5 rounded-full" style={{ background: statusColor[asset.status] }} /> {statusLabel[asset.status]}</span>
                <p className="text-sm text-steel-300">{asset.type} · {asset.param}</p>
                <p className="font-mono text-sm text-steel-100">Latest: {asset.reading} <span className="text-steel-500">/ limit {d.limit}</span></p>
              </div>
            </div>
            <div className="panel-800 p-4">
              <div className="flex items-center justify-between mb-2"><p className="mono-label text-steel-500">Health trend · 10 surveys</p><span className="mono-label" style={{ color: statusColor[asset.status] }}>{asset.param}</span></div>
              <div className="h-16"><Spark data={d.trend || [asset.health]} color={statusColor[asset.status]} className="w-full h-full" /></div>
            </div>
            <div className="panel-800 p-4">
              <p className="mono-label text-red-400 mb-2">Recommended action</p>
              <p className="text-sm text-steel-200 leading-relaxed">{d.note}</p>
              <p className="mono-label text-steel-500 mt-3">Next scheduled survey · {d.next}</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => onRaise(asset)} className="btn btn-red flex-1 !py-3"><Icon name="clipboardcheck" className="w-4 h-4" /> Raise work order</button>
              <a href={`https://wa.me/${brand.waNumber}?text=${encodeURIComponent(`Hi ${brand.short}, re asset ${asset.id} (${asset.name}).`)}`} target="_blank" rel="noreferrer" aria-label="Discuss on WhatsApp" className="grid place-items-center w-14 rounded-md border-2 border-steel-700 text-steel-100 hover:border-red-500 hover:text-red-500 transition-colors"><Icon name="whatsapp" className="w-5 h-5" /></a>
            </div>
          </div>
        </motion.aside>
      </motion.div>
    </AnimatePresence>
  );
}

function Dashboard() {
  const { user, signOut } = useAuth();
  const [tab, setTab] = useState('overview');
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [selected, setSelected] = useState(null);
  const [orders, setOrders] = useState(workOrdersSeed);
  const [rtype, setRtype] = useState('All');

  const filtered = useMemo(() => portalAssets.filter((a) =>
    (filter === 'all' || a.status === filter) &&
    (a.name.toLowerCase().includes(query.toLowerCase()) || a.id.toLowerCase().includes(query.toLowerCase()))
  ), [query, filter]);
  const dist = { ok: 0, warn: 0, crit: 0 };
  portalAssets.forEach((a) => { dist[a.status]++; });

  const raiseOrder = (asset) => {
    if (orders.some((o) => o.asset === asset.id)) { toast('Work order already open for ' + asset.id); return; }
    const ref = 'WO-' + (4472 + orders.length);
    setOrders([{ ref, id: ref, asset: asset.id, title: `${asset.name} — condition follow-up`, priority: asset.status === 'crit' ? 'High' : 'Medium', status: 'Open', due: (assetDetail[asset.id] || {}).next || 'TBC' }, ...orders]);
    toast.success(`${ref} raised for ${asset.id}`); setSelected(null); setTab('orders');
  };
  const advance = (ref) => { setOrders((o) => o.map((w) => w.ref === ref ? { ...w, status: woNext[w.status] } : w)); toast('Work order updated'); };
  const reportTypes = ['All', ...new Set(portalReports.map((r) => r.type))];
  const shownReports = rtype === 'All' ? portalReports : portalReports.filter((r) => r.type === rtype);
  const TABS = [['overview', 'Asset health', 'gauge'], ['trends', 'Trends', 'analytics'], ['reports', 'Reports', 'file'], ['orders', 'Work orders', 'clipboardcheck']];

  return (
    <section className="pt-24 md:pt-28 pb-16 bg-steel min-h-screen relative">
      <div className="absolute inset-x-0 top-0 h-72 grad-steel -z-0" aria-hidden />
      <div className="relative shell">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <span className="grid place-items-center w-12 h-12 rounded-md grad-red text-white font-display text-lg">{user.name.split(' ').map((w) => w[0]).slice(0, 2).join('')}</span>
            <div>
              <p className="mono-label text-red-400">Monitoring dashboard · demo</p>
              <h1 className="font-display text-2xl text-white leading-none mt-0.5">Welcome, {user.name.split(' ')[0]}</h1>
              <p className="text-sm text-white/70 mt-1">{user.company} · {user.role}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/admin" className="btn btn-light !py-2.5"><Icon name="dashboard" className="w-4 h-4" /> <span className="hidden sm:inline">Admin / CMS</span><span className="sm:hidden">Admin</span></Link>
            <button onClick={() => { signOut(); toast('Signed out'); }} className="btn btn-glass !py-2.5">Sign out</button>
          </div>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
          {portalKpis.map((k) => (
            <div key={k.label} className="panel-800 ticked p-4 sm:p-5">
              <div className="flex items-start justify-between">
                <span className="grid place-items-center w-9 h-9 sm:w-10 sm:h-10 rounded bg-steel-800 text-red-500"><Icon name={k.icon} className="w-5 h-5" /></span>
                <span className="mono-label" style={{ color: k.trend.startsWith('-') ? (k.label === 'Open alerts' ? 'var(--color-ok)' : 'var(--color-crit)') : 'var(--color-ok)' }}>{k.trend}</span>
              </div>
              <p className="font-display text-2xl sm:text-3xl text-steel-50 tabnum mt-3">{k.value}</p>
              <p className="mono-label text-steel-500 mt-1 line-clamp-1">{k.label}</p>
              <div className="h-6 mt-2 -mb-1"><Spark data={KPI_SPARK[k.label] || []} color={k.label === 'Open alerts' ? 'var(--color-ok)' : 'var(--color-red-500)'} className="w-full h-full" /></div>
            </div>
          ))}
        </div>
        <div className="flex gap-1 mb-5 border-b border-steel-800 overflow-x-auto no-scrollbar">
          {TABS.map(([id, lbl, ic]) => (
            <button key={id} onClick={() => setTab(id)} className={`shrink-0 inline-flex items-center gap-2 px-4 py-3 font-display text-sm border-b-2 -mb-px transition-colors ${tab === id ? 'border-red-500 text-steel-50' : 'border-transparent text-steel-400 hover:text-steel-100'}`}>
              <Icon name={ic} className="w-4 h-4" /> {lbl}
            </button>
          ))}
        </div>
        {tab === 'overview' && (
          <>
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <label className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-steel-400"><Icon name="search" className="w-4 h-4" /></span>
                <input value={query} onChange={(e) => setQuery(e.target.value)} className="input !pl-9 w-full" placeholder="Search asset or tag…" />
              </label>
              <div className="flex gap-2">
                {[['all', 'All'], ['ok', 'Healthy'], ['warn', 'Watch'], ['crit', 'Critical']].map(([v, l]) => (
                  <button key={v} onClick={() => setFilter(v)} className={`px-3 py-2 rounded-md font-mono text-[0.72rem] uppercase border transition-colors ${filter === v ? 'bg-red-500 text-white border-red-500' : 'bg-steel-850 text-steel-300 border-steel-700 hover:border-steel-500'}`}>{l}</button>
                ))}
              </div>
            </div>
            <div className="panel overflow-hidden">
              <div className="hidden md:grid grid-cols-[1.6fr_1fr_1.4fr_1fr_1fr_auto] gap-4 px-5 py-3 border-b border-steel-800 mono-label text-steel-500">
                <span>Asset</span><span>Parameter</span><span>Health</span><span>Reading</span><span>Status</span><span></span>
              </div>
              {filtered.map((a) => (
                <button key={a.id} onClick={() => setSelected(a)} className="w-full text-left grid grid-cols-[1fr_auto] md:grid-cols-[1.6fr_1fr_1.4fr_1fr_1fr_auto] gap-3 md:gap-4 px-4 sm:px-5 py-4 border-b border-steel-800 last:border-0 items-center hover:bg-steel-850 transition-colors">
                  <div className="min-w-0"><p className="font-mono text-xs text-red-400">{a.id}</p><p className="text-sm text-steel-100 truncate">{a.name}</p><p className="text-xs text-steel-500 mt-0.5 md:hidden">{a.param} · {a.reading}</p></div>
                  <span className="text-sm text-steel-400 hidden md:block">{a.param}</span>
                  <div className="hidden md:flex items-center gap-2">
                    <div className="flex-1 h-2 rounded-full bg-steel-700 overflow-hidden max-w-[8rem]"><div className="h-full rounded-full" style={{ width: `${a.health}%`, background: statusColor[a.status] }} /></div>
                    <span className="font-mono text-xs tabnum" style={{ color: statusColor[a.status] }}>{a.health}%</span>
                  </div>
                  <span className="font-mono text-xs text-steel-200 hidden md:block">{a.reading}</span>
                  <span className="hidden md:inline-flex items-center gap-1.5 font-mono text-[0.7rem] uppercase" style={{ color: statusColor[a.status] }}><span className="w-1.5 h-1.5 rounded-full" style={{ background: statusColor[a.status] }} /> {statusLabel[a.status]}</span>
                  <div className="flex items-center gap-3 justify-self-end">
                    <span className="md:hidden font-mono text-xs tabnum" style={{ color: statusColor[a.status] }}>{a.health}%</span>
                    <Icon name="chevronRight" className="w-4 h-4 text-steel-500" />
                  </div>
                </button>
              ))}
              {filtered.length === 0 && <p className="mono-label text-steel-500 py-12 text-center">No assets match your filter.</p>}
            </div>
          </>
        )}
        {tab === 'trends' && (
          <div className="grid lg:grid-cols-[1.5fr_1fr] gap-4">
            <div className="panel p-5 sm:p-6"><div className="flex items-center justify-between mb-4"><h3 className="font-display text-steel-50">Plant availability</h3><span className="mono-label text-steel-500">12 months · %</span></div><LineChart data={portalAvailability} labels={portalMonths} suffix="%" /></div>
            <div className="panel p-5 sm:p-6"><h3 className="font-display text-steel-50 mb-4">Fleet condition</h3><div className="flex items-center gap-5"><Ring value={Math.round((dist.ok / portalAssets.length) * 100)} label="healthy" color="var(--color-ok)" /><ul className="space-y-2 text-sm flex-1">{[['ok', 'Healthy'], ['warn', 'Watch'], ['crit', 'Critical']].map(([k, l]) => (<li key={k} className="flex items-center justify-between"><span className="inline-flex items-center gap-2 text-steel-300"><span className="w-2 h-2 rounded-full" style={{ background: statusColor[k] }} /> {l}</span><span className="font-mono text-steel-100 tabnum">{dist[k]}</span></li>))}</ul></div></div>
            <div className="panel p-5 sm:p-6 lg:col-span-2"><div className="flex items-center justify-between mb-4"><h3 className="font-display text-steel-50">Open alerts by month</h3><span className="mono-label text-steel-500">lower is better</span></div><BarChart data={portalAlertsSeries} labels={portalMonths} /></div>
          </div>
        )}
        {tab === 'reports' && (
          <>
            <div className="flex flex-wrap gap-2 mb-4">{reportTypes.map((t) => (<button key={t} onClick={() => setRtype(t)} className={`px-3 py-2 rounded-md font-mono text-[0.72rem] uppercase border transition-colors ${rtype === t ? 'bg-red-500 text-white border-red-500' : 'bg-steel-850 text-steel-300 border-steel-700 hover:border-steel-500'}`}>{t}</button>))}</div>
            <div className="grid sm:grid-cols-2 gap-4">{shownReports.map((r) => (<div key={r.title} className="panel p-5 flex items-center gap-4"><span className="grid place-items-center w-11 h-11 rounded bg-steel-800 text-red-500 shrink-0"><Icon name="file" className="w-5 h-5" /></span><div className="flex-1 min-w-0"><p className="font-display text-steel-50 text-sm leading-tight">{r.title}</p><p className="mono-label text-steel-500 mt-1">{r.date} · {r.type} · <span style={{ color: r.status === 'Action required' ? 'var(--color-warn)' : 'var(--color-ok)' }}>{r.status}</span></p></div><button onClick={() => toast.success('Report downloaded (demo)')} className="grid place-items-center w-10 h-10 rounded bg-steel-800 text-steel-200 hover:text-red-400 shrink-0"><Icon name="download" className="w-5 h-5" /></button></div>))}</div>
          </>
        )}
        {tab === 'orders' && (
          <div className="space-y-3">
            {orders.map((w) => (
              <div key={w.ref} className="panel p-4 sm:p-5 flex flex-wrap items-center gap-4">
                <span className="grid place-items-center w-11 h-11 rounded bg-steel-800 shrink-0" style={{ color: prioColor[w.priority] }}><Icon name="clipboardcheck" className="w-5 h-5" /></span>
                <div className="flex-1 min-w-[12rem]"><div className="flex items-center gap-2"><p className="font-mono text-xs text-red-400">{w.ref}</p><span className="font-mono text-[0.62rem] uppercase px-1.5 py-0.5 rounded" style={{ color: prioColor[w.priority], background: 'var(--color-steel-850)' }}>{w.priority}</span></div><p className="text-sm text-steel-100 mt-0.5">{w.title}</p><p className="mono-label text-steel-500 mt-1">Asset {w.asset} · due {w.due}</p></div>
                <div className="flex items-center gap-3"><span className="font-mono text-[0.7rem] uppercase" style={{ color: w.status === 'Closed' ? 'var(--color-ok)' : 'var(--color-steel-300)' }}>{w.status}</span>{w.status !== 'Closed' && <button onClick={() => advance(w.ref)} className="btn btn-ghost !py-2 !px-3 text-[0.75rem]">Advance <Icon name="arrowRight" className="w-3.5 h-3.5" /></button>}</div>
              </div>
            ))}
          </div>
        )}
      </div>
      <AssetDrawer asset={selected} onClose={() => setSelected(null)} onRaise={raiseOrder} />
    </section>
  );
}

export default function Portal() {
  const { user } = useAuth();
  const [session, setSession] = useState(null);
  if (session) return <ClientPortal data={session.data} code={session.code} pin={session.pin} onExit={() => setSession(null)} />;
  if (user) return <Dashboard />;
  return <SignIn onClient={(data, code, pin) => setSession({ data, code, pin })} />;
}
