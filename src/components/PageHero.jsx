import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from '../lib/motion';
import Icon from './Icon';

/* Premium page hero — full-bleed dark band with richly treated photography,
   a fading blueprint grid, breadcrumb, and generous spacing. The site nav
   sits transparent over the top of this band. */
export default function PageHero({ kicker, title, sub, image, children, spec, icon }) {
  const { pathname } = useLocation();
  const crumb = kicker || pathname.replace('/', '');
  return (
    <section className="relative overflow-hidden grad-navy text-white pt-36 md:pt-48 pb-16 md:pb-24 min-h-[58vh] md:min-h-[64vh] flex items-end">
      {image && (
        <>
          <img src={image} alt="" className="absolute inset-0 w-full h-full object-cover opacity-40 img-rich duotone-navy" />
          <div className="absolute inset-0 scrim-navy" />
          <div className="absolute inset-0 vignette" aria-hidden />
        </>
      )}
      <div className="absolute inset-0 grid-blueprint opacity-70" aria-hidden />
      <div className="absolute inset-0 glow-red opacity-70" aria-hidden />
      {/* corner spec marks */}
      <div className="absolute top-28 md:top-36 right-6 md:right-10 hidden sm:flex items-center gap-2 font-mono text-[0.66rem] uppercase tracking-[0.18em] text-white/40" aria-hidden>
        <span className="w-8 h-px bg-white/25" /> ARS / Engineering
      </div>

      <div className="relative shell w-full">
        {/* breadcrumb */}
        <motion.nav initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="flex items-center gap-2.5 mb-8 font-mono text-[0.72rem] uppercase tracking-wide text-white/55">
          <Link to="/" className="tlink-d">Home</Link>
          <Icon name="chevronRight" className="w-3.5 h-3.5 text-white/30" />
          <span className="text-red-400">{crumb}</span>
        </motion.nav>

        <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.05 }} className={`kicker mb-7 ${icon ? 'has-icon' : ''}`} style={{ color: 'var(--color-red-400)' }}>{icon && <Icon name={icon} className="w-4 h-4" />}{kicker}</motion.p>
        <motion.h1 initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.75, delay: 0.12 }}
          className="display-1 font-hero font-bold text-white max-w-4xl" style={{ fontSize: 'clamp(2.5rem,5.4vw,4.8rem)' }} dangerouslySetInnerHTML={{ __html: title }} />
        {sub && <motion.p initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.22 }} className="lead !text-white/80 mt-7 max-w-2xl">{sub}</motion.p>}
        {children}

        {/* bottom accent rule with spec ticks */}
        <div className="flex items-center gap-4 mt-12 md:mt-14">
          <span className="h-[3px] w-16 rounded-full bg-red-500" />
          <span className="h-px flex-1 bg-white/12" />
          <span className="font-mono text-[0.66rem] uppercase tracking-[0.18em] text-white/40">{spec || 'All failures are preventable'}</span>
        </div>
      </div>
    </section>
  );
}
