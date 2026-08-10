import React, { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Icon from './Icon';
import { nav, brand, services, wa } from '../data';
import { useCart } from '../lib/cart';

function ScrollTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' }); }, [pathname]);
  return null;
}

function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const loc = useLocation();
  const { count, openCart } = useCart();
  useEffect(() => { const s = () => setScrolled(window.scrollY > 10); s(); window.addEventListener('scroll', s, { passive: true }); return () => window.removeEventListener('scroll', s); }, []);
  useEffect(() => { setOpen(false); }, [loc.pathname]);
  useEffect(() => { document.body.style.overflow = open ? 'hidden' : ''; return () => { document.body.style.overflow = ''; }; }, [open]);
  // pages that open with a full-bleed dark hero → nav is transparent while at the top
  const heroRoutes = ['/', '/services', '/products', '/insights', '/about', '/contact'];
  const onHero = heroRoutes.includes(loc.pathname) && !scrolled;

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div className={`hidden md:block border-b transition-colors duration-300 ${onHero ? 'bg-black/25 backdrop-blur-sm border-white/10 text-white/80' : 'bg-navy-950 border-white/[0.06] text-white/65'}`}>
        <div className="shell flex items-center justify-between h-10 text-[0.75rem]">
          <div className="flex items-center gap-4 lg:gap-5">
            <span className="inline-flex items-center gap-2 font-medium text-white/90">
              <span className="w-1.5 h-1.5 rounded-full animate-pulse-dot" style={{ background: 'var(--color-ok)' }} />
              {brand.promise}
            </span>
            <span className="h-3.5 w-px bg-white/15" aria-hidden />
            <span className="inline-flex items-center gap-1.5"><Icon name="pin" className="w-3.5 h-3.5 text-red-400" /> Belvedere, Harare</span>
            <span className="hidden xl:inline-flex items-center gap-1.5"><Icon name="clock" className="w-3.5 h-3.5 text-red-400" /> {brand.hours}</span>
          </div>
          <div className="flex items-center gap-4 lg:gap-5">
            <a href={`tel:${brand.phoneRaw}`} className="inline-flex items-center gap-1.5 hover:text-white transition-colors"><Icon name="phone" className="w-3.5 h-3.5 text-red-400" /> {brand.phone}</a>
            <a href={`mailto:${brand.email}`} className="hidden lg:inline-flex items-center gap-1.5 hover:text-white transition-colors"><Icon name="mail" className="w-3.5 h-3.5 text-red-400" /> {brand.email}</a>
            <span className="h-3.5 w-px bg-white/15" aria-hidden />
            <div className="flex items-center gap-1">
              {brand.socials.map(([ic, h]) => (
                <a key={ic} href={h} target="_blank" rel="noreferrer" aria-label={ic} className="grid place-items-center w-7 h-7 rounded-md text-white/70 hover:text-white hover:bg-white/10 transition-colors"><Icon name={ic} className="w-4 h-4" /></a>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className={`transition-all duration-300 ${onHero ? 'bg-transparent' : 'glass-nav shadow-[0_10px_30px_-24px_rgba(11,24,58,.5)]'}`}>
        <div className="shell flex items-center justify-between h-[60px] md:h-[70px] gap-4">
          <Link to="/" aria-label="Asset Reliability Services home" className="shrink-0">
            <img src={onHero ? '/img/logo-light.png' : '/img/logo.png'} alt="Asset Reliability Services" className="h-8 md:h-10 w-auto object-contain" />
          </Link>
          <nav className="hidden lg:flex items-center gap-7">
            {nav.map((l) => (
              <NavLink key={l.to} to={l.to} className={({ isActive }) => `link-underline text-[0.9rem] font-display font-medium transition-colors ${isActive ? 'text-red-500' : onHero ? 'text-white/85 hover:text-white' : 'text-navy-900 hover:text-red-500'}`}>{l.label}</NavLink>
            ))}
          </nav>
          <div className="flex items-center gap-2 md:gap-3">
            <Link to="/portal" className={`hidden md:inline-flex items-center gap-2 font-mono text-[0.72rem] uppercase tracking-wide transition-colors ${onHero ? 'text-white/80 hover:text-white' : 'text-steel-400 hover:text-navy-900'}`}><Icon name="lock" className="w-4 h-4" /> Portal</Link>
            <button onClick={openCart} className={`relative grid place-items-center w-10 h-10 transition ${onHero ? 'text-white hover:text-red-300' : 'text-navy-900 hover:text-red-500'}`} aria-label="Cart">
              <Icon name="cart" className="w-5 h-5" />
              {count > 0 && <span className="absolute top-0.5 right-0.5 grid place-items-center min-w-[1.05rem] h-[1.05rem] px-1 rounded-full bg-red-500 text-white text-[0.62rem] font-bold tabnum">{count}</span>}
            </button>
            <Link to="/contact" className="hidden sm:inline-flex btn btn-red !py-2.5 !px-5 !text-[0.82rem]">Book a survey</Link>
            <button onClick={() => setOpen((v) => !v)} className={`lg:hidden grid place-items-center w-10 h-10 rounded-lg ${onHero ? 'bg-white/15 text-white' : 'bg-navy-800 text-white'}`} aria-label="Menu">
              {open ? <Icon name="x" className="w-5 h-5" /> : <Icon name="menu" className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="lg:hidden fixed inset-0 top-[60px] bg-white z-40 overflow-y-auto">
            <div className="shell py-6 flex flex-col">
              {[...nav, { label: 'Client Portal', to: '/portal' }].map((l, i) => (
                <motion.div key={l.to} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                  <NavLink to={l.to} className={({ isActive }) => `flex items-center justify-between py-4 font-display text-2xl border-b border-line ${isActive ? 'text-red-500' : 'text-navy-900'}`}>{l.label} <Icon name="arrowUpRight" className="w-6 h-6 text-steel-400" /></NavLink>
                </motion.div>
              ))}
              <Link to="/contact" className="btn btn-red w-full mt-6">Book a survey</Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="relative grad-navy text-white/70 overflow-hidden">
      {/* fading blueprint grid + glow */}
      <div className="absolute inset-0 grid-blueprint-fine opacity-80" aria-hidden />
      <div className="absolute inset-0 glow-red opacity-60" aria-hidden />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-red-500/60 to-transparent" aria-hidden />

      {/* spec strip */}
      <div className="relative border-b border-white/10">
        <div className="shell flex flex-wrap items-center justify-between gap-x-8 gap-y-2 py-4 font-mono text-[0.68rem] uppercase tracking-[0.14em] text-white/40">
          <span className="inline-flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full animate-pulse-dot" style={{ background: 'var(--color-ok)' }} /> Systems monitoring · live</span>
          <span className="hidden sm:inline">17.8292° S, 31.0522° E · Harare</span>
          <span>{brand.hours}</span>
        </div>
      </div>

      {/* CTA band */}
      <div className="relative border-b border-white/10">
        <div className="shell py-16 md:py-20 grid gap-10 lg:grid-cols-[1.5fr_1fr] lg:items-center">
          <div>
            <p className="kicker mb-6" style={{ color: 'var(--color-red-400)' }}>Reliability, engineered</p>
            <h3 className="display-2 text-white max-w-xl leading-[1.02]">Ready to design out <span className="text-red-400">failure?</span></h3>
            <p className="lead !text-white/60 mt-6 max-w-lg">Book a condition survey and get a clear, costed picture of your plant's health, from the team Zimbabwe's biggest names already trust.</p>
          </div>
          <div className="flex flex-wrap gap-3.5 lg:justify-end">
            <Link to="/contact" className="btn btn-red !px-8">Book a survey <Icon name="arrowRight" className="w-4 h-4" /></Link>
            <Link to="/portal" className="btn btn-glass-bold !px-8"><Icon name="lock" className="w-4 h-4" /> Client portal</Link>
          </div>
        </div>
      </div>

      {/* main columns */}
      <div className="relative shell pt-16 md:pt-20 pb-14 grid gap-x-10 gap-y-12 lg:grid-cols-[1.7fr_1fr_1fr_1.3fr]">
        <div>
          <img src="/img/logo-light.png" alt="Asset Reliability Services" className="h-12 w-auto mb-6" />
          <p className="text-[0.95rem] leading-relaxed text-white/55 max-w-xs">{brand.positioning}</p>
          <div className="flex gap-3 mt-8">
            {brand.socials.map(([i, h]) => (
              <a key={i} href={h} target="_blank" rel="noreferrer" aria-label={i} className="grid place-items-center w-11 h-11 rounded-xl bg-white/[0.06] border border-white/15 hover:bg-red-500 hover:border-red-500 hover:-translate-y-0.5 transition-all"><Icon name={i} className="w-5 h-5 text-white" /></a>
            ))}
          </div>
        </div>
        <div>
          <p className="mono-label mb-6" style={{ color: 'var(--color-red-400)' }}>Services</p>
          <ul className="space-y-3.5 text-[0.92rem]">
            {services.slice(0, 6).map((s) => <li key={s.slug}><Link to="/services" className="tlink-d">{s.name}</Link></li>)}
          </ul>
        </div>
        <div>
          <p className="mono-label mb-6" style={{ color: 'var(--color-red-400)' }}>Company</p>
          <ul className="space-y-3.5 text-[0.92rem]">
            <li><Link to="/products" className="tlink-d">Products</Link></li>
            <li><Link to="/insights" className="tlink-d">Insights</Link></li>
            <li><Link to="/about" className="tlink-d">About</Link></li>
            <li><Link to="/portal" className="tlink-d">Client portal</Link></li>
            <li><Link to="/admin" className="tlink-d">Admin / CMS</Link></li>
          </ul>
        </div>
        <div>
          <p className="mono-label mb-6" style={{ color: 'var(--color-red-400)' }}>Get in touch</p>
          <ul className="space-y-4 text-[0.92rem] text-white/60">
            <li className="flex items-start gap-3"><Icon name="pin" className="w-5 h-5 mt-0.5 text-red-400 shrink-0" /> {brand.address}</li>
            <li className="flex items-center gap-3"><Icon name="phone" className="w-5 h-5 text-red-400 shrink-0" /> <a href={`tel:${brand.phoneRaw}`} className="tlink-d">{brand.phone}</a></li>
            <li className="flex items-center gap-3"><Icon name="phone" className="w-5 h-5 text-red-400 shrink-0" /> <a href="tel:+263773145386" className="tlink-d">{brand.phone2}</a></li>
            <li className="flex items-center gap-3"><Icon name="mail" className="w-5 h-5 text-red-400 shrink-0" /> <a href={`mailto:${brand.email}`} className="tlink-d">{brand.email}</a></li>
          </ul>
        </div>
      </div>

      {/* giant fading promise wordmark — sized to fit one line on screen */}
      <div className="relative overflow-hidden select-none pointer-events-none px-4" aria-hidden>
        <p className="font-display font-extrabold leading-[0.9] text-center text-white/[0.05] whitespace-nowrap" style={{ fontSize: 'clamp(0.85rem, 5.55vw, 6.6rem)', letterSpacing: '-0.03em' }}>ALL FAILURES ARE PREVENTABLE</p>
      </div>

      <div className="relative border-t border-white/10">
        <div className="shell py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[0.72rem] text-white/45 uppercase tracking-wide font-medium">
          <p>© {year} {brand.legal}</p>
          <p className="hidden md:block text-red-400/80">{brand.tagline}</p>
          <a href="https://bitstudio.dev" target="_blank" rel="noreferrer" className="group inline-flex items-center gap-2 text-white/45 hover:text-white transition-colors">
            Engineered by
            <span className="inline-flex items-center gap-1.5 font-display font-bold tracking-normal normal-case text-white/80 group-hover:text-red-400 transition-colors">
              <span className="grid place-items-center w-4 h-4 rounded-[4px] bg-red-500 text-white text-[0.6rem] font-black">B</span> Bit Studio
            </span>
          </a>
        </div>
      </div>
    </footer>
  );
}

export default function Layout() {
  const { pathname } = useLocation();
  const appPage = pathname === '/portal' || pathname === '/admin';
  // portal & admin keep the original type scale (no site-wide enlargement)
  useEffect(() => {
    document.documentElement.classList.toggle('app-mode', appPage);
    return () => document.documentElement.classList.remove('app-mode');
  }, [appPage]);

  if (appPage) {
    // standalone app screens — their own sidebar / sign-out, no site nav or footer
    return (
      <>
        <ScrollTop />
        <Outlet />
      </>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <ScrollTop />
      <Nav />
      <main className="flex-1"><Outlet /></main>
      <Footer />
    </div>
  );
}
