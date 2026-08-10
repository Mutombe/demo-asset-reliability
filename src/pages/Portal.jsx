import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import Icon from '../components/Icon';
import { Reveal } from '../lib/motion';
import { useAuth } from '../lib/auth';
import { brand, portalKpis, portalAssets, portalReports } from '../data';

const statusColor = { ok: 'var(--color-ok)', warn: 'var(--color-warn)', crit: 'var(--color-crit)' };
const statusLabel = { ok: 'Healthy', warn: 'Watch', crit: 'Critical' };

/* ── SIGN IN ── */
function SignIn() {
  const { signInGoogle, signInDemo } = useAuth();
  return (
    <section className="relative min-h-[100svh] grid lg:grid-cols-2 bg-steel-950">
      {/* left visual */}
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
      {/* right form */}
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

/* ── DASHBOARD ── */
function Dashboard() {
  const { user, signOut } = useAuth();
  const [tab, setTab] = useState('overview');
  return (
    <section className="pt-24 md:pt-28 pb-16 bg-steel min-h-screen">
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
            <Link to="/admin" className="btn btn-light !py-2.5"><Icon name="dashboard" className="w-4 h-4" /> Admin / CMS</Link>
            <button onClick={() => { signOut(); toast('Signed out'); }} className="btn btn-glass !py-2.5">Sign out</button>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {portalKpis.map((k) => (
            <div key={k.label} className="panel-800 ticked p-5">
              <div className="flex items-start justify-between">
                <span className="grid place-items-center w-10 h-10 rounded bg-steel-800 text-red-500"><Icon name={k.icon} className="w-5 h-5" /></span>
                <span className="mono-label" style={{ color: k.trend.startsWith('-') ? 'var(--color-crit)' : 'var(--color-ok)' }}>{k.trend}</span>
              </div>
              <p className="font-display text-3xl text-steel-50 tabnum mt-4">{k.value}</p>
              <p className="mono-label text-steel-500 mt-1">{k.label}</p>
            </div>
          ))}
        </div>

        {/* tabs */}
        <div className="flex gap-2 mb-5 border-b border-steel-800">
          {[['overview', 'Asset health'], ['reports', 'Reports'], ['alerts', 'Alerts']].map(([id, lbl]) => (
            <button key={id} onClick={() => setTab(id)} className={`px-4 py-3 font-display text-sm border-b-2 -mb-px transition-colors ${tab === id ? 'border-red-500 text-steel-50' : 'border-transparent text-steel-400 hover:text-steel-100'}`}>{lbl}</button>
          ))}
        </div>

        {tab === 'overview' && (
          <div className="panel overflow-hidden">
            <div className="hidden md:grid grid-cols-[1.6fr_1fr_1.4fr_1fr_1fr] gap-4 px-5 py-3 border-b border-steel-800 mono-label text-steel-500">
              <span>Asset</span><span>Parameter</span><span>Health</span><span>Reading</span><span>Status</span>
            </div>
            {portalAssets.map((a) => (
              <div key={a.id} className="grid grid-cols-2 md:grid-cols-[1.6fr_1fr_1.4fr_1fr_1fr] gap-3 md:gap-4 px-5 py-4 border-b border-steel-800 last:border-0 items-center hover:bg-steel-850 transition-colors">
                <div><p className="font-mono text-xs text-red-400">{a.id}</p><p className="text-sm text-steel-100">{a.name}</p></div>
                <span className="text-sm text-steel-400 hidden md:block">{a.param}</span>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 rounded-full bg-steel-700 overflow-hidden max-w-[8rem]"><div className="h-full rounded-full" style={{ width: `${a.health}%`, background: statusColor[a.status] }} /></div>
                  <span className="font-mono text-xs tabnum" style={{ color: statusColor[a.status] }}>{a.health}%</span>
                </div>
                <span className="font-mono text-xs text-steel-200 hidden md:block">{a.reading}</span>
                <span className="inline-flex items-center gap-1.5 font-mono text-[0.7rem] uppercase" style={{ color: statusColor[a.status] }}><span className="w-1.5 h-1.5 rounded-full" style={{ background: statusColor[a.status] }} /> {statusLabel[a.status]}</span>
              </div>
            ))}
          </div>
        )}

        {tab === 'reports' && (
          <div className="grid sm:grid-cols-2 gap-4">
            {portalReports.map((r) => (
              <div key={r.title} className="panel p-5 flex items-center gap-4">
                <span className="grid place-items-center w-11 h-11 rounded bg-steel-800 text-red-500 shrink-0"><Icon name="file" className="w-5 h-5" /></span>
                <div className="flex-1 min-w-0">
                  <p className="font-display text-steel-50 text-sm leading-tight">{r.title}</p>
                  <p className="mono-label text-steel-500 mt-1">{r.date} · {r.type} · {r.status}</p>
                </div>
                <button onClick={() => toast.success('Report downloaded (demo)')} className="grid place-items-center w-10 h-10 rounded bg-steel-800 text-steel-200 hover:text-red-400 shrink-0"><Icon name="download" className="w-5 h-5" /></button>
              </div>
            ))}
          </div>
        )}

        {tab === 'alerts' && (
          <div className="space-y-3">
            {portalAssets.filter((a) => a.status !== 'ok').map((a) => (
              <div key={a.id} className="panel p-5 flex items-center gap-4 border-l-2" style={{ borderLeftColor: statusColor[a.status] }}>
                <Icon name="bell" className="w-5 h-5 shrink-0" style={{ color: statusColor[a.status] }} />
                <div className="flex-1"><p className="font-display text-steel-50 text-sm">{a.name} <span className="font-mono text-xs text-steel-500">({a.id})</span></p><p className="text-sm text-steel-400 mt-0.5">{a.param} reading {a.reading} — {statusLabel[a.status]}. Recommended action: schedule inspection.</p></div>
                <Link to="/contact" className="btn btn-red !py-2 !px-4 text-[0.78rem] shrink-0">Act</Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default function Portal() {
  const { user } = useAuth();
  return user ? <Dashboard /> : <SignIn />;
}
