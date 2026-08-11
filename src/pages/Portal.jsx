import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from '../components/Icon';
import { Spark, LineChart, BarChart, Ring } from '../components/Charts';
import { useAuth } from '../lib/auth';
import { brand, portalKpis, portalAssets, portalReports, assetDetail, portalAvailability, portalAlertsSeries, portalMonths, workOrdersSeed } from '../data';

const statusColor = { ok: 'var(--color-ok)', warn: 'var(--color-warn)', crit: 'var(--color-crit)' };
const statusLabel = { ok: 'Healthy', warn: 'Watch', crit: 'Critical' };
const KPI_SPARK = {
  'Assets monitored': [131, 134, 138, 140, 143, 145, 148],
  'Plant availability': [97.4, 97.7, 97.9, 98.1, 98.2, 98.4, 98.4],
  'Open alerts': [7, 6, 5, 5, 4, 4, 3],
  'Mean time between failures': [372, 384, 390, 398, 404, 409, 412],
};
const woNext = { Open: 'In progress', 'In progress': 'Scheduled', Scheduled: 'Closed', Closed: 'Closed' };
const prioColor = { High: 'var(--color-crit)', Medium: 'var(--color-warn)', Low: 'var(--color-ok)' };

/* ── SIGN IN ── */
function SignIn() {
  const { signInGoogle, signInDemo } = useAuth();
  return (
    <section className="relative min-h-[100svh] grid lg:grid-cols-2 bg-steel-950">
      <div className="relative hidden lg:block overflow-hidden">
        <img src="/img/photos/gallery4.jpg" alt="" className="absolute inset-0 w-full h-full object-cover opacity-45 img-rich duotone" />
        <div className="absolute inset-0 scrim-steel" />
        <div className="absolute inset-0 grid-blueprint opacity-60" />
        <div className="absolute inset-0 glow-red opacity-70" />
        <div className="relative h-full flex flex-col justify-end p-14">
          <img src="/img/logo-light.png" alt="ARS" className="h-11 w-auto mb-8" />
          <h2 className="display-2 text-white max-w-md">Your plant’s health, <span className="text-red-400">at a glance.</span></h2>
          <p className="lead !text-white/70 mt-4 max-w-sm">Live asset condition, reports and alerts from every ARS survey, in one secure place.</p>
          <div className="flex items-center gap-6 mt-8 font-mono text-[0.72rem] text-white/60">
            <span className="inline-flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--color-ok)' }} /> Live data</span>
            <span className="inline-flex items-center gap-2"><Icon name="lock" className="w-3.5 h-3.5" /> Encrypted</span>
            <span className="inline-flex items-center gap-2"><Icon name="download" className="w-3.5 h-3.5" /> Reports</span>
          </div>
        </div>
      </div>
      <div className="relative flex items-center justify-center px-6 py-24">
        <div className="absolute inset-0 grid-fine opacity-30 lg:hidden" />
        <div className="relative w-full max-w-sm">
          <p className="kicker mb-4">Client portal</p>
          <h1 className="display-3 text-steel-50">Sign in to your dashboard</h1>
          <p className="text-steel-400 mt-2 text-sm">Access your live asset health, condition reports and alerts.</p>
          <button onClick={() => { signInGoogle(); toast.success('Signed in with Google (demo)'); }} className="mt-8 w-full flex items-center justify-center gap-3 bg-white text-steel-50 font-display font-medium rounded-md py-3.5 border-2 border-line hover:border-steel-400 transition">
            <Icon name="google" className="w-5 h-5" strokeWidth={0} /> Continue with Google
          </button>
          <div className="flex items-center gap-3 my-5"><span className="h-px flex-1 bg-steel-700" /><span className="mono-label text-steel-500">or</span><span className="h-px flex-1 bg-steel-700" /></div>
          <form onSubmit={(e) => { e.preventDefault(); signInDemo(); toast.success('Signed in (demo)'); }} className="space-y-3">
            <div><label className="field-label">Work email</label><input className="input" placeholder="you@company.co.zw" defaultValue="demo@ars.co.zw" /></div>
            <div><label className="field-label">Password</label><input type="password" className="input" placeholder="••••••••" defaultValue="demo1234" /></div>
            <button type="submit" className="btn btn-red w-full !py-3.5">Sign in</button>
          </form>
          <p className="font-mono text-[0.68rem] text-steel-600 text-center mt-5">Demonstration only · no real authentication</p>
          <p className="text-center text-sm text-steel-400 mt-4">New client? <Link to="/contact" className="text-red-400 link-underline">Request access</Link></p>
        </div>
      </div>
    </section>
  );
}

/* ── ASSET DETAIL DRAWER ── */
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
        <motion.aside
          className="absolute right-0 top-0 h-full w-full sm:max-w-md bg-steel-950 border-l border-steel-800 overflow-y-auto"
          initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 30, stiffness: 260 }}
          onClick={(e) => e.stopPropagation()}
        >
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

/* ── DASHBOARD ── */
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
    toast.success(`${ref} raised for ${asset.id}`);
    setSelected(null); setTab('orders');
  };
  const advance = (ref) => { setOrders((o) => o.map((w) => w.ref === ref ? { ...w, status: woNext[w.status] } : w)); toast('Work order updated'); };

  const reportTypes = ['All', ...new Set(portalReports.map((r) => r.type))];
  const shownReports = rtype === 'All' ? portalReports : portalReports.filter((r) => r.type === rtype);

  const TABS = [['overview', 'Asset health', 'gauge'], ['trends', 'Trends', 'analytics'], ['reports', 'Reports', 'file'], ['orders', 'Work orders', 'clipboardcheck']];

  return (
    <section className="pt-24 md:pt-28 pb-16 bg-steel min-h-screen relative">
      <div className="absolute inset-x-0 top-0 h-72 grad-steel -z-0" aria-hidden />
      <div className="relative shell">
        {/* header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <span className="grid place-items-center w-12 h-12 rounded-md grad-red text-white font-display text-lg">{user.name.split(' ').map((w) => w[0]).slice(0, 2).join('')}</span>
            <div>
              <p className="mono-label text-red-400">Client portal</p>
              <h1 className="font-display text-2xl text-white leading-none mt-0.5">Welcome, {user.name.split(' ')[0]}</h1>
              <p className="text-sm text-white/70 mt-1">{user.company} · {user.role}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/admin" className="btn btn-light !py-2.5"><Icon name="dashboard" className="w-4 h-4" /> <span className="hidden sm:inline">Admin / CMS</span><span className="sm:hidden">Admin</span></Link>
            <button onClick={() => { signOut(); toast('Signed out'); }} className="btn btn-glass !py-2.5">Sign out</button>
          </div>
        </div>

        {/* KPIs with sparklines */}
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

        {/* tabs — scrollable on mobile */}
        <div className="flex gap-1 mb-5 border-b border-steel-800 overflow-x-auto no-scrollbar">
          {TABS.map(([id, lbl, ic]) => (
            <button key={id} onClick={() => setTab(id)} className={`shrink-0 inline-flex items-center gap-2 px-4 py-3 font-display text-sm border-b-2 -mb-px transition-colors ${tab === id ? 'border-red-500 text-steel-50' : 'border-transparent text-steel-400 hover:text-steel-100'}`}>
              <Icon name={ic} className="w-4 h-4" /> {lbl}
            </button>
          ))}
        </div>

        {/* ── OVERVIEW / ASSET HEALTH ── */}
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
            <p className="mono-label text-steel-500 mt-3">Tap any asset for its trend, thresholds and recommended action.</p>
          </>
        )}

        {/* ── TRENDS ── */}
        {tab === 'trends' && (
          <div className="grid lg:grid-cols-[1.5fr_1fr] gap-4">
            <div className="panel p-5 sm:p-6">
              <div className="flex items-center justify-between mb-4"><h3 className="font-display text-steel-50">Plant availability</h3><span className="mono-label text-steel-500">12 months · %</span></div>
              <LineChart data={portalAvailability} labels={portalMonths} suffix="%" />
            </div>
            <div className="panel p-5 sm:p-6">
              <h3 className="font-display text-steel-50 mb-4">Fleet condition</h3>
              <div className="flex items-center gap-5">
                <Ring value={Math.round((dist.ok / portalAssets.length) * 100)} label="healthy" color="var(--color-ok)" />
                <ul className="space-y-2 text-sm flex-1">
                  {[['ok', 'Healthy'], ['warn', 'Watch'], ['crit', 'Critical']].map(([k, l]) => (
                    <li key={k} className="flex items-center justify-between"><span className="inline-flex items-center gap-2 text-steel-300"><span className="w-2 h-2 rounded-full" style={{ background: statusColor[k] }} /> {l}</span><span className="font-mono text-steel-100 tabnum">{dist[k]}</span></li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="panel p-5 sm:p-6 lg:col-span-2">
              <div className="flex items-center justify-between mb-4"><h3 className="font-display text-steel-50">Open alerts by month</h3><span className="mono-label text-steel-500">lower is better</span></div>
              <BarChart data={portalAlertsSeries} labels={portalMonths} />
            </div>
          </div>
        )}

        {/* ── REPORTS ── */}
        {tab === 'reports' && (
          <>
            <div className="flex flex-wrap gap-2 mb-4">
              {reportTypes.map((t) => (
                <button key={t} onClick={() => setRtype(t)} className={`px-3 py-2 rounded-md font-mono text-[0.72rem] uppercase border transition-colors ${rtype === t ? 'bg-red-500 text-white border-red-500' : 'bg-steel-850 text-steel-300 border-steel-700 hover:border-steel-500'}`}>{t}</button>
              ))}
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              {shownReports.map((r) => (
                <div key={r.title} className="panel p-5 flex items-center gap-4">
                  <span className="grid place-items-center w-11 h-11 rounded bg-steel-800 text-red-500 shrink-0"><Icon name="file" className="w-5 h-5" /></span>
                  <div className="flex-1 min-w-0">
                    <p className="font-display text-steel-50 text-sm leading-tight">{r.title}</p>
                    <p className="mono-label text-steel-500 mt-1">{r.date} · {r.type} · <span style={{ color: r.status === 'Action required' ? 'var(--color-warn)' : 'var(--color-ok)' }}>{r.status}</span></p>
                  </div>
                  <button onClick={() => toast.success('Report downloaded (demo)')} className="grid place-items-center w-10 h-10 rounded bg-steel-800 text-steel-200 hover:text-red-400 shrink-0"><Icon name="download" className="w-5 h-5" /></button>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ── WORK ORDERS ── */}
        {tab === 'orders' && (
          <div className="space-y-3">
            {orders.map((w) => (
              <div key={w.ref} className="panel p-4 sm:p-5 flex flex-wrap items-center gap-4">
                <span className="grid place-items-center w-11 h-11 rounded bg-steel-800 shrink-0" style={{ color: prioColor[w.priority] }}><Icon name="clipboardcheck" className="w-5 h-5" /></span>
                <div className="flex-1 min-w-[12rem]">
                  <div className="flex items-center gap-2"><p className="font-mono text-xs text-red-400">{w.ref}</p><span className="font-mono text-[0.62rem] uppercase px-1.5 py-0.5 rounded" style={{ color: prioColor[w.priority], background: 'var(--color-steel-850)' }}>{w.priority}</span></div>
                  <p className="text-sm text-steel-100 mt-0.5">{w.title}</p>
                  <p className="mono-label text-steel-500 mt-1">Asset {w.asset} · due {w.due}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[0.7rem] uppercase" style={{ color: w.status === 'Closed' ? 'var(--color-ok)' : 'var(--color-steel-300)' }}>{w.status}</span>
                  {w.status !== 'Closed' && <button onClick={() => advance(w.ref)} className="btn btn-glass !py-2 !px-3 text-[0.75rem]">Advance <Icon name="arrowRight" className="w-3.5 h-3.5" /></button>}
                </div>
              </div>
            ))}
            <p className="mono-label text-steel-500 pt-1">Raise a new work order from any asset in the Asset health tab.</p>
          </div>
        )}

        <p className="font-mono text-[0.68rem] text-steel-600 mt-8 text-center">Demonstration portal · sample data, no live plant connection</p>
      </div>

      <AssetDrawer asset={selected} onClose={() => setSelected(null)} onRaise={raiseOrder} />
    </section>
  );
}

export default function Portal() {
  const { user } = useAuth();
  return user ? <Dashboard /> : <SignIn />;
}
