import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import Icon from '../components/Icon';
import { BarChart, Ring } from '../components/Charts';
import { cmsStats, cmsContent, products, clients, money, cmsMonthly, cmsReports, adminSettingsSeed, portalMonths } from '../data';

const NAVI = [['dashboard', 'Dashboard'], ['file', 'Content'], ['box', 'Products'], ['user', 'Clients'], ['analytics', 'Reports'], ['gear', 'Settings']];
const STATUS_CYCLE = { Draft: 'Review', Review: 'Published', Published: 'Draft' };
const statusChip = (s) => s === 'Published' ? 'text-ok' : s === 'Draft' ? 'text-steel-400' : 'text-warn';

/* toggle switch */
function Switch({ on, onClick }) {
  return (
    <button onClick={onClick} role="switch" aria-checked={on} className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${on ? 'bg-red-500' : 'bg-steel-700'}`}>
      <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${on ? 'translate-x-5' : ''}`} />
    </button>
  );
}

export default function Admin() {
  const [view, setView] = useState('Dashboard');
  const [rows, setRows] = useState(cmsContent);
  const [query, setQuery] = useState('');
  const [settings, setSettings] = useState(adminSettingsSeed);
  const [rtype, setRtype] = useState('All');

  const q = query.toLowerCase();
  const shownContent = useMemo(() => rows.filter((r) => r.title.toLowerCase().includes(q) || r.type.toLowerCase().includes(q)), [rows, q]);
  const shownProducts = useMemo(() => products.filter((p) => p.name.toLowerCase().includes(q) || p.cat.toLowerCase().includes(q)), [q]);

  const addContent = () => {
    const n = rows.filter((r) => r.title.startsWith('Untitled draft')).length;
    setRows([{ title: `Untitled draft${n ? ' ' + (n + 1) : ''}`, type: 'Article', status: 'Draft', date: '11 Aug 2026' }, ...rows]);
    setView('Content'); toast.success('Draft created');
  };
  const cycle = (title) => setRows((rs) => rs.map((r) => r.title === title ? { ...r, status: STATUS_CYCLE[r.status] } : r));
  const del = (title) => { setRows((rs) => rs.filter((r) => r.title !== title)); toast('Item deleted'); };
  const toggle = (key) => setSettings((s) => s.map((x) => x.key === key ? { ...x, on: !x.on } : x));

  const reportTypes = ['All', ...new Set(cmsReports.map((r) => r.type))];
  const shownReports = rtype === 'All' ? cmsReports : cmsReports.filter((r) => r.type === rtype);
  const byType = reportTypes.slice(1).map((t) => cmsReports.filter((r) => r.type === t).length);

  return (
    <section className="pt-[62px] md:pt-[72px] bg-steel-950 min-h-screen">
      <div className="flex">
        {/* sidebar */}
        <aside className="hidden lg:flex flex-col w-60 shrink-0 bg-steel-900 border-r border-steel-800 min-h-[calc(100vh-72px)] sticky top-[72px] p-4">
          <p className="mono-label text-steel-500 px-3 mb-3">Admin · CMS</p>
          {NAVI.map(([ic, lbl]) => (
            <button key={lbl} onClick={() => setView(lbl)} className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-display transition-colors mb-1 ${view === lbl ? 'bg-red-500/12 text-red-400' : 'text-steel-300 hover:bg-steel-850 hover:text-steel-100'}`}>
              <Icon name={ic} className="w-5 h-5" /> {lbl}
            </button>
          ))}
          <div className="mt-auto panel p-4">
            <p className="mono-label text-steel-500">Signed in as</p>
            <p className="text-sm text-steel-100 mt-1">Admin</p>
            <Link to="/portal" className="btn btn-ghost w-full mt-3 !py-2 text-[0.78rem]">Client portal</Link>
          </div>
        </aside>

        {/* main */}
        <div className="flex-1 min-w-0 p-5 md:p-8">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
            <div>
              <p className="mono-label text-red-400">Content management</p>
              <h1 className="font-display text-2xl text-steel-50 mt-0.5">{view}</h1>
            </div>
            <div className="flex items-center gap-2">
              <label className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-steel-400"><Icon name="search" className="w-4 h-4" /></span>
                <input value={query} onChange={(e) => setQuery(e.target.value)} className="input !py-2 !pl-9 w-36 sm:w-48" placeholder="Search…" />
              </label>
              <button onClick={addContent} className="btn btn-red !py-2.5"><Icon name="plus" className="w-4 h-4" /> <span className="hidden sm:inline">New</span></button>
            </div>
          </div>

          {/* mobile view switch */}
          <div className="lg:hidden flex gap-2 overflow-x-auto no-scrollbar mb-6 -mx-1 px-1">
            {NAVI.map(([ic, lbl]) => (
              <button key={lbl} onClick={() => setView(lbl)} className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-2 rounded-md text-[0.78rem] font-display border ${view === lbl ? 'bg-red-500 text-white border-red-500' : 'bg-steel-850 text-steel-300 border-steel-700'}`}><Icon name={ic} className="w-4 h-4" />{lbl}</button>
            ))}
          </div>

          {view === 'Dashboard' && (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
                {cmsStats.map((s) => (
                  <div key={s.label} className="panel-800 ticked p-4 sm:p-5">
                    <span className="grid place-items-center w-10 h-10 rounded bg-steel-800 text-red-500 mb-4"><Icon name={s.icon} className="w-5 h-5" /></span>
                    <p className="font-display text-2xl sm:text-3xl text-steel-50 tabnum">{s.value}</p>
                    <p className="mono-label text-steel-500 mt-1 line-clamp-1">{s.label}</p>
                  </div>
                ))}
              </div>
              <div className="grid lg:grid-cols-[1.5fr_1fr] gap-4 mb-4">
                <div className="panel p-5 sm:p-6">
                  <div className="flex items-center justify-between mb-4"><h3 className="font-display text-steel-50">Content published</h3><span className="mono-label text-steel-500">12 months</span></div>
                  <BarChart data={cmsMonthly} labels={portalMonths} />
                </div>
                <div className="panel p-6">
                  <h3 className="font-display text-lg text-steel-50 mb-4">Recent activity</h3>
                  <ul className="space-y-4">
                    {[['file', 'Article published', '“Why we say all failures are preventable”', '2h'], ['box', 'Product updated', 'Thermal imaging camera', '5h'], ['user', 'New client account', 'Mimosa Mine', '1d'], ['analytics', 'Report uploaded', 'Vibration route — Mill 2', '1d']].map(([ic, t, d, tm]) => (
                      <li key={t} className="flex items-start gap-3">
                        <span className="grid place-items-center w-8 h-8 rounded bg-steel-800 text-red-500 shrink-0"><Icon name={ic} className="w-4 h-4" /></span>
                        <div className="flex-1 min-w-0"><p className="text-sm text-steel-100">{t}</p><p className="text-xs text-steel-500 truncate">{d}</p></div>
                        <span className="mono-label text-steel-600">{tm}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <ContentTable rows={shownContent.slice(0, 5)} cycle={cycle} del={del} />
            </>
          )}

          {view === 'Content' && <ContentTable rows={shownContent} cycle={cycle} del={del} full />}

          {view === 'Products' && (
            <div className="panel overflow-hidden">
              <div className="hidden md:grid grid-cols-[2fr_1.2fr_1fr_1fr_auto] gap-4 px-5 py-3 border-b border-steel-800 mono-label text-steel-500"><span>Product</span><span>Category</span><span>Price</span><span>Status</span><span></span></div>
              {shownProducts.map((p) => (
                <div key={p.id} className="grid grid-cols-[1fr_auto] md:grid-cols-[2fr_1.2fr_1fr_1fr_auto] gap-3 px-4 sm:px-5 py-3.5 border-b border-steel-800 last:border-0 items-center hover:bg-steel-850">
                  <div className="flex items-center gap-3 min-w-0"><div className="w-9 h-9 rounded overflow-hidden bg-steel-800 shrink-0"><img src={p.image} alt="" className="w-full h-full object-cover duotone" /></div><div className="min-w-0"><p className="text-sm text-steel-100 leading-tight truncate">{p.name}</p><p className="text-xs text-steel-500 md:hidden">{p.cat} · {money(p.price)}</p></div></div>
                  <span className="text-sm text-steel-400 hidden md:block">{p.cat}</span>
                  <span className="font-mono text-sm text-steel-200 hidden md:block">{money(p.price)}</span>
                  <span className="font-mono text-[0.7rem] uppercase text-ok hidden md:block">Live</span>
                  <button onClick={() => toast('Edit product (demo)')} className="text-steel-400 hover:text-red-400 justify-self-end"><Icon name="wrench" className="w-4 h-4" /></button>
                </div>
              ))}
              {shownProducts.length === 0 && <p className="mono-label text-steel-500 py-12 text-center">No products match “{query}”.</p>}
            </div>
          )}

          {view === 'Clients' && (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {clients.map((c) => (
                <div key={c.name} className="panel p-5 flex flex-col items-center gap-3 text-center">
                  <span className="grid place-items-center h-14 w-full bg-white rounded px-3"><img src={c.logo} alt={c.name} className="max-h-9 max-w-full object-contain" /></span>
                  <p className="text-sm text-steel-100">{c.name}</p>
                  <span className="mono-label text-ok">Active</span>
                </div>
              ))}
            </div>
          )}

          {view === 'Reports' && (
            <div className="grid lg:grid-cols-[1fr_1.4fr] gap-4">
              <div className="panel p-5 sm:p-6">
                <h3 className="font-display text-steel-50 mb-4">Reports by discipline</h3>
                <BarChart data={byType} labels={reportTypes.slice(1)} height={160} />
                <div className="flex items-center gap-4 mt-5 pt-5 border-t border-steel-800">
                  <Ring value={80} label="delivered" size={80} />
                  <p className="text-sm text-steel-400">{cmsReports.length} reports issued this cycle. 4 of 5 delivered, 1 awaiting client action.</p>
                </div>
              </div>
              <div className="panel overflow-hidden">
                <div className="px-5 py-3.5 border-b border-steel-800 flex flex-wrap items-center justify-between gap-3">
                  <h3 className="font-display text-steel-50">Delivered reports</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {reportTypes.map((t) => (
                      <button key={t} onClick={() => setRtype(t)} className={`px-2.5 py-1.5 rounded font-mono text-[0.68rem] uppercase border transition-colors ${rtype === t ? 'bg-red-500 text-white border-red-500' : 'bg-steel-850 text-steel-300 border-steel-700'}`}>{t}</button>
                    ))}
                  </div>
                </div>
                <div className="hidden sm:grid grid-cols-[1fr_1.4fr_1fr_auto] gap-4 px-5 py-2.5 border-b border-steel-800 mono-label text-steel-500"><span>Ref</span><span>Client</span><span>Date</span><span></span></div>
                {shownReports.map((r) => (
                  <div key={r.ref} className="grid grid-cols-[1fr_auto] sm:grid-cols-[1fr_1.4fr_1fr_auto] gap-3 px-5 py-3.5 border-b border-steel-800 last:border-0 items-center hover:bg-steel-850">
                    <div className="min-w-0"><p className="font-mono text-xs text-red-400">{r.ref}</p><p className="text-sm text-steel-100 truncate sm:hidden">{r.client}</p><p className="text-xs text-steel-500 sm:hidden">{r.type} · {r.date}</p></div>
                    <span className="text-sm text-steel-100 hidden sm:block truncate">{r.client}</span>
                    <span className="font-mono text-xs text-steel-400 hidden sm:block">{r.date}</span>
                    <button onClick={() => toast.success(`${r.ref} downloaded (demo)`)} className="grid place-items-center w-9 h-9 rounded bg-steel-800 text-steel-200 hover:text-red-400 justify-self-end"><Icon name="download" className="w-4 h-4" /></button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {view === 'Settings' && (
            <div className="grid lg:grid-cols-2 gap-4">
              <div className="panel p-5 sm:p-6">
                <h3 className="font-display text-lg text-steel-50 mb-1">Notifications & security</h3>
                <p className="text-sm text-steel-400 mb-5">Control how ARS and your clients are alerted.</p>
                <ul className="space-y-4">
                  {settings.map((s) => (
                    <li key={s.key} className="flex items-start justify-between gap-4">
                      <div><p className="text-sm text-steel-100">{s.label}</p><p className="text-xs text-steel-500 mt-0.5 max-w-xs">{s.desc}</p></div>
                      <Switch on={s.on} onClick={() => toggle(s.key)} />
                    </li>
                  ))}
                </ul>
              </div>
              <div className="panel p-5 sm:p-6">
                <h3 className="font-display text-lg text-steel-50 mb-1">Brand & workspace</h3>
                <p className="text-sm text-steel-400 mb-5">Preview of the identity applied across the portal.</p>
                <div className="rounded-lg overflow-hidden border border-steel-800">
                  <div className="h-24 grad-red grid place-items-center"><img src="/img/logo-light.png" alt="ARS" className="h-9" /></div>
                  <div className="p-4 bg-steel-900 space-y-3">
                    <div className="flex items-center justify-between text-sm"><span className="text-steel-400">Primary colour</span><span className="inline-flex items-center gap-2 font-mono text-steel-100"><span className="w-4 h-4 rounded bg-red-500" /> #e2211c</span></div>
                    <div className="flex items-center justify-between text-sm"><span className="text-steel-400">Workspace</span><span className="font-mono text-steel-100">ars.co.zw</span></div>
                    <div className="flex items-center justify-between text-sm"><span className="text-steel-400">Plan</span><span className="font-mono text-ok">Enterprise</span></div>
                    <button onClick={() => toast.success('Settings saved (demo)')} className="btn btn-red w-full !py-2.5 mt-2">Save changes</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          <p className="font-mono text-[0.68rem] text-steel-600 mt-8 text-center">Demonstration admin panel · changes are in-session only</p>
        </div>
      </div>
    </section>
  );
}

function ContentTable({ rows, cycle, del, full }) {
  return (
    <div className="panel overflow-hidden">
      <div className="px-5 py-3.5 border-b border-steel-800 flex items-center justify-between"><h3 className="font-display text-steel-50">{full ? 'All content' : 'Latest content'}</h3><span className="mono-label text-steel-500">{rows.length} items</span></div>
      <div className="hidden sm:grid grid-cols-[2fr_1fr_1fr_1fr_auto] gap-4 px-5 py-2.5 border-b border-steel-800 mono-label text-steel-500"><span>Title</span><span>Type</span><span>Status</span><span>Date</span><span></span></div>
      {rows.map((r) => (
        <div key={r.title} className="grid grid-cols-2 sm:grid-cols-[2fr_1fr_1fr_1fr_auto] gap-3 px-4 sm:px-5 py-3.5 border-b border-steel-800 last:border-0 items-center hover:bg-steel-850">
          <p className="text-sm text-steel-100 leading-tight col-span-2 sm:col-span-1">{r.title}</p>
          <span className="text-sm text-steel-400">{r.type}</span>
          <button onClick={() => cycle(r.title)} title="Click to change status" className={`font-mono text-[0.7rem] uppercase text-left ${statusChip(r.status)} hover:opacity-70`}>{r.status} ↻</button>
          <span className="font-mono text-xs text-steel-500">{r.date}</span>
          <button onClick={() => del(r.title)} className="text-steel-500 hover:text-red-400 justify-self-end" title="Delete"><Icon name="x" className="w-4 h-4" /></button>
        </div>
      ))}
      {rows.length === 0 && <p className="mono-label text-steel-500 py-12 text-center">No content.</p>}
    </div>
  );
}
