import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import Icon from '../components/Icon';
import { cmsStats, cmsContent, products, clients, money } from '../data';

const NAVI = [['dashboard', 'Dashboard'], ['file', 'Content'], ['box', 'Products'], ['user', 'Clients'], ['analytics', 'Reports'], ['cog', 'Settings']];
const statusChip = (s) => s === 'Published' ? 'text-ok' : s === 'Draft' ? 'text-steel-400' : 'text-warn';

export default function Admin() {
  const [view, setView] = useState('Dashboard');
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
          {/* topbar */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
            <div>
              <p className="mono-label text-red-400">Content management</p>
              <h1 className="font-display text-2xl text-steel-50 mt-0.5">{view}</h1>
            </div>
            <div className="flex items-center gap-2">
              <label className="relative hidden sm:block">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-steel-400"><Icon name="search" className="w-4 h-4" /></span>
                <input className="input !py-2 !pl-9 w-48" placeholder="Search…" />
              </label>
              <button onClick={() => toast.success('New item (demo)')} className="btn btn-red !py-2.5"><Icon name="plus" className="w-4 h-4" /> New</button>
            </div>
          </div>

          {/* mobile view switch */}
          <div className="lg:hidden flex gap-2 overflow-x-auto no-scrollbar mb-6">
            {NAVI.map(([ic, lbl]) => (
              <button key={lbl} onClick={() => setView(lbl)} className={`shrink-0 px-3 py-2 rounded-md text-[0.78rem] font-display border ${view === lbl ? 'bg-red-500 text-white border-red-500' : 'bg-steel-850 text-steel-300 border-steel-700'}`}>{lbl}</button>
            ))}
          </div>

          {(view === 'Dashboard') && (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {cmsStats.map((s) => (
                  <div key={s.label} className="panel-800 ticked p-5">
                    <span className="grid place-items-center w-10 h-10 rounded bg-steel-800 text-red-500 mb-4"><Icon name={s.icon} className="w-5 h-5" /></span>
                    <p className="font-display text-3xl text-steel-50 tabnum">{s.value}</p>
                    <p className="mono-label text-steel-500 mt-1">{s.label}</p>
                  </div>
                ))}
              </div>
              <div className="grid lg:grid-cols-[1.5fr_1fr] gap-4">
                <ContentTable rows={cmsContent} />
                <div className="panel p-6">
                  <h3 className="font-display text-lg text-steel-50 mb-4">Recent activity</h3>
                  <ul className="space-y-4">
                    {[['file', 'Article published', '“Why we say all failures are preventable”', '2h'], ['box', 'Product updated', 'Thermal imaging camera', '5h'], ['user', 'New client account', 'Mimosa Mine', '1d'], ['analytics', 'Report uploaded', 'Vibration route — Mill 2', '1d']].map(([ic, t, d, tm]) => (
                      <li key={t} className="flex items-start gap-3">
                        <span className="grid place-items-center w-8 h-8 rounded bg-steel-800 text-red-500 shrink-0"><Icon name={ic} className="w-4 h-4" /></span>
                        <div className="flex-1"><p className="text-sm text-steel-100">{t}</p><p className="text-xs text-steel-500">{d}</p></div>
                        <span className="mono-label text-steel-600">{tm}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </>
          )}

          {view === 'Content' && <ContentTable rows={cmsContent} full />}

          {view === 'Products' && (
            <div className="panel overflow-hidden">
              <div className="hidden md:grid grid-cols-[2fr_1.2fr_1fr_1fr_auto] gap-4 px-5 py-3 border-b border-steel-800 mono-label text-steel-500"><span>Product</span><span>Category</span><span>Price</span><span>Status</span><span></span></div>
              {products.map((p) => (
                <div key={p.id} className="grid grid-cols-2 md:grid-cols-[2fr_1.2fr_1fr_1fr_auto] gap-3 px-5 py-3.5 border-b border-steel-800 last:border-0 items-center hover:bg-steel-850">
                  <div className="flex items-center gap-3"><div className="w-9 h-9 rounded overflow-hidden bg-steel-800 shrink-0"><img src={p.image} alt="" className="w-full h-full object-cover duotone" /></div><p className="text-sm text-steel-100 leading-tight">{p.name}</p></div>
                  <span className="text-sm text-steel-400 hidden md:block">{p.cat}</span>
                  <span className="font-mono text-sm text-steel-200">{money(p.price)}</span>
                  <span className="font-mono text-[0.7rem] uppercase text-ok hidden md:block">Live</span>
                  <button onClick={() => toast('Edit product (demo)')} className="text-steel-400 hover:text-red-400 justify-self-end"><Icon name="wrench" className="w-4 h-4" /></button>
                </div>
              ))}
            </div>
          )}

          {view === 'Clients' && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {clients.map((c) => (
                <div key={c.name} className="panel p-5 flex flex-col items-center gap-3 text-center">
                  <span className="grid place-items-center h-14 w-full bg-white rounded px-3"><img src={c.logo} alt={c.name} className="max-h-9 max-w-full object-contain" /></span>
                  <p className="text-sm text-steel-100">{c.name}</p>
                  <span className="mono-label text-ok">Active</span>
                </div>
              ))}
            </div>
          )}

          {(view === 'Reports' || view === 'Settings') && (
            <div className="panel p-12 text-center">
              <span className="grid place-items-center w-14 h-14 mx-auto rounded bg-steel-800 text-red-500 mb-5"><Icon name={view === 'Reports' ? 'analytics' : 'cog'} className="w-7 h-7" /></span>
              <h3 className="font-display text-2xl text-steel-50">{view}</h3>
              <p className="text-steel-400 mt-2 max-w-md mx-auto">This panel is part of the demonstration CMS. In production it would manage {view === 'Reports' ? 'condition-monitoring reports and client delivery' : 'roles, branding and integrations'}.</p>
            </div>
          )}

          <p className="font-mono text-[0.68rem] text-steel-600 mt-8 text-center">Demonstration admin panel · no data is saved</p>
        </div>
      </div>
    </section>
  );
}

function ContentTable({ rows, full }) {
  return (
    <div className="panel overflow-hidden">
      <div className="px-5 py-3.5 border-b border-steel-800 flex items-center justify-between"><h3 className="font-display text-steel-50">{full ? 'All content' : 'Latest content'}</h3><span className="mono-label text-steel-500">{rows.length} items</span></div>
      <div className="hidden sm:grid grid-cols-[2fr_1fr_1fr_1fr] gap-4 px-5 py-2.5 border-b border-steel-800 mono-label text-steel-500"><span>Title</span><span>Type</span><span>Status</span><span>Date</span></div>
      {rows.map((r) => (
        <div key={r.title} className="grid grid-cols-2 sm:grid-cols-[2fr_1fr_1fr_1fr] gap-3 px-5 py-3.5 border-b border-steel-800 last:border-0 items-center hover:bg-steel-850">
          <p className="text-sm text-steel-100 leading-tight col-span-2 sm:col-span-1">{r.title}</p>
          <span className="text-sm text-steel-400">{r.type}</span>
          <span className={`font-mono text-[0.7rem] uppercase ${statusChip(r.status)}`}>{r.status}</span>
          <span className="font-mono text-xs text-steel-500">{r.date}</span>
        </div>
      ))}
    </div>
  );
}
