import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../components/Icon';
import { autoLink } from '../components/ContentLink';
import { Reveal, CountUp, motion } from '../lib/motion';
import { AnimatePresence } from 'framer-motion';
import { brand, services, serviceCats, clients, stats, pillars, process, products, articles, aiTopics, portalAssets, portalKpis } from '../data';

const statusColor = { ok: 'var(--color-ok)', warn: 'var(--color-warn)', crit: 'var(--color-crit)' };
const statusLabel = { ok: 'Healthy', warn: 'Watch', crit: 'Critical' };
const gallery = ['/img/photos/gallery1.jpg', '/img/photos/gallery2.jpg', '/img/photos/gallery3.jpg', '/img/photos/gallery4.jpg', '/img/photos/gallery5.jpg', '/img/photos/gallery6.jpg'];

/* ─────────────── HERO (full-bleed one-screen carousel) ─────────────── */
const heroSlides = [
  { img: '/img/photos/hero1.jpg', label: 'Condition monitoring on site' },
  { img: '/img/photos/hero2.jpg', label: 'Plants running, around the clock' },
  { img: '/img/photos/hero3.jpg', label: 'Mining & heavy industry' },
];
function HeroImage({ i }) {
  return (
    <AnimatePresence>
      <motion.img
        key={i}
        src={heroSlides[i].img}
        alt={heroSlides[i].label}
        initial={{ opacity: 0, scale: 1.06 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0 }}
        transition={{ opacity: { duration: 1.1 }, scale: { duration: 6.5, ease: 'linear' } }}
        className="absolute inset-0 w-full h-full object-cover object-center img-rich"
      />
    </AnimatePresence>
  );
}
function HeroDots({ i, setI, className = '' }) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {heroSlides.map((s, k) => (
        <button key={k} onClick={() => setI(k)} aria-label={s.label} className={`h-[6px] rounded-full transition-all duration-500 ${k === i ? 'w-9 bg-red-500' : 'w-3 bg-white/40 hover:bg-white/70'}`} />
      ))}
    </div>
  );
}
function HeroMarquee() {
  return (
    <div className="bg-black/40 backdrop-blur-md border-t border-white/15 overflow-hidden">
      <div className="shell flex items-center gap-4 sm:gap-8 py-3">
        <span className="hidden sm:inline-flex items-center gap-2 shrink-0 font-display text-[0.66rem] font-medium uppercase tracking-[0.16em] text-white/50">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse-dot" /> Trusted by industry leaders
        </span>
        <span className="hidden sm:block h-8 w-px bg-white/15 shrink-0" aria-hidden />
        <div className="relative flex-1 overflow-hidden" style={{ WebkitMaskImage: 'linear-gradient(to right, transparent, #000 6%, #000 94%, transparent)', maskImage: 'linear-gradient(to right, transparent, #000 6%, #000 94%, transparent)' }}>
          <div className="flex items-center gap-3 sm:gap-3.5 w-max animate-marquee">
            {[...clients, ...clients].map((c, k) => (
              <span key={k} className="grid place-items-center h-9 sm:h-10 px-3.5 sm:px-4 rounded-xl bg-white/92 shrink-0 ring-1 ring-white/10">
                <img src={c.logo} alt={c.name} className="max-h-5 sm:max-h-6 w-auto object-contain" />
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
function Hero() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((v) => (v + 1) % heroSlides.length), 5500);
    return () => clearInterval(t);
  }, []);
  const Kicker = <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="kicker mb-5" style={{ color: 'var(--color-red-400)' }}>Condition monitoring · Precision maintenance · Harare</motion.p>;
  const Heading = <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.08 }} className="display-1 text-white text-balance max-w-4xl">All failures are <span className="text-red-500">preventable.</span></motion.h1>;

  return (
    <section className="relative w-full overflow-hidden bg-navy-950">
      {/* ===== MOBILE: full-bleed one-screen hero — fits 390×844, no scroll ===== */}
      <div className="sm:hidden relative h-svh min-h-[560px] max-h-[900px] flex flex-col overflow-hidden">
        <HeroImage i={i} />
        <div className="absolute inset-0 scrim-l" aria-hidden />
        <div className="absolute inset-0 bg-gradient-to-t from-black/92 via-black/45 to-black/25" aria-hidden />
        <div className="relative flex-1 min-h-0 flex flex-col justify-end px-5 pt-24 pb-5">
          {Kicker}
          <motion.h1 initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.08 }}
            className="font-display font-extrabold text-white text-balance leading-[0.96] tracking-[-0.03em] mt-1"
            style={{ fontSize: 'clamp(2.35rem, 11vw, 3.4rem)' }}>All failures are <span className="text-red-500">preventable.</span></motion.h1>
          <motion.p initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2 }} className="text-white/75 mt-3.5 text-[0.94rem] leading-relaxed line-clamp-3">{brand.positioning}</motion.p>
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.32 }} className="grid grid-cols-2 gap-3 mt-6">
            <Link to="/contact" className="btn btn-red w-full !px-4">Book a survey <Icon name="arrowRight" className="w-4 h-4" /></Link>
            <Link to="/services" className="btn btn-glass-bold w-full !px-4">Services</Link>
          </motion.div>
          <HeroDots i={i} setI={setI} className="mt-6" />
        </div>
        <HeroMarquee />
      </div>

      {/* ===== DESKTOP: full-bleed one-screen carousel ===== */}
      <div className="hidden sm:block relative h-svh min-h-[640px] overflow-hidden">
        <HeroImage i={i} />
        <div className="absolute inset-0 scrim-l" aria-hidden />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-black/55" aria-hidden />
        <div className="relative h-full shell flex flex-col justify-end pt-[120px] pb-[100px]">
          {Kicker}
          {Heading}
          <div className="grid lg:grid-cols-[1.3fr_1fr] gap-6 lg:gap-16 items-end mt-6">
            <motion.p initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.24 }} className="lead !text-white/85 max-w-xl">{brand.positioning}</motion.p>
            <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.36 }} className="flex flex-wrap gap-3 lg:justify-end">
              <Link to="/contact" className="btn btn-red !px-7">Book a survey <Icon name="arrowRight" className="w-4 h-4" /></Link>
              <Link to="/services" className="btn btn-glass-bold !px-6">Explore services</Link>
            </motion.div>
          </div>
          <HeroDots i={i} setI={setI} className="mt-7" />
        </div>
        <div className="absolute inset-x-0 bottom-0"><HeroMarquee /></div>
      </div>
    </section>
  );
}

/* ─────────────── STAT BAND ─────────────── */
function StatBand() {
  return (
    <section className="section bg-white">
      <div className="shell">
        <div className="grid lg:grid-cols-[1fr_1fr] gap-8 lg:gap-16 items-start mb-14">
          <Reveal>
            <p className="kicker has-icon mb-5"><Icon name="shield" className="w-4 h-4" />About ARS</p>
            <h2 className="display-2 text-steel-50 max-w-lg">One of Zimbabwe’s most trusted names in <span className="text-red-500">reliability engineering.</span></h2>
          </Reveal>
          <Reveal delay={0.08} className="lg:pt-12">
            <p className="lead">{autoLink('We help mining, manufacturing and construction leaders build wealth and a competitive edge through world-class precision maintenance. Vibration analysis, thermography, ultrasound, oil analysis and lifting equipment, under one roof.')}</p>
            <Link to="/about" className="group inline-flex items-center gap-3 mt-6"><span className="arrow-btn arrow-red"><Icon name="arrowRight" className="w-5 h-5" /></span><span className="font-display font-medium text-steel-50">About the company</span></Link>
          </Reveal>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 bd-t-bold">
          {stats.map((s, i) => (
            <Reveal key={s.label} delay={i * 0.06} className={`py-8 lg:pr-8 ${i > 0 ? 'lg:pl-8 lg:border-l border-line' : ''}`}>
              <p className="stat-num"><CountUp value={s.value} suffix={s.suffix} /></p>
              <p className="mono-label text-steel-400 mt-3">{s.label}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────── SERVICES (photo cards) ─────────────── */
function Services() {
  const [cat, setCat] = useState('All');
  const shown = cat === 'All' ? services : services.filter((s) => s.cat === cat);
  return (
    <section className="section bg-mist">
      <div className="shell">
        <div className="flex flex-wrap items-end justify-between gap-6 mb-8">
          <div className="max-w-xl">
            <Reveal><p className="kicker has-icon mb-5"><Icon name="wrench" className="w-4 h-4" />What we do</p></Reveal>
            <Reveal delay={0.05}><h2 className="display-2 text-steel-50">Fifteen ways we keep <span className="text-red-500">plants running.</span></h2></Reveal>
          </div>
          <Reveal delay={0.1}><Link to="/services" className="link-underline text-steel-50 inline-flex items-center gap-2 pb-1">All services <Icon name="arrowRight" className="w-4 h-4" /></Link></Reveal>
        </div>
        <div className="flex flex-wrap gap-2 mb-8">
          {['All', ...serviceCats].map((c) => (
            <button key={c} onClick={() => setCat(c)} className={`px-4 py-2 rounded-xl font-mono text-[0.72rem] uppercase tracking-wide border transition-all ${cat === c ? 'bg-red-500 text-white border-red-500' : 'bg-white text-steel-400 border-line hover:border-steel-50 hover:text-steel-50'}`}>{c}</button>
          ))}
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
          {shown.map((s, i) => (
            <Reveal key={s.slug} delay={(i % 3) * 0.04} className="h-full">
              <Link to="/services" className="group relative cover-frame lift block h-full aspect-[3/4] sm:aspect-[5/6]" style={{ borderRadius: 'var(--radius-md)' }}>
                <img src={s.image} alt={s.name} loading="lazy" className="absolute inset-0 w-full h-full object-cover img-rich transition-transform duration-[1.1s] group-hover:scale-105" />
                {/* legibility scrim — stronger on mobile where cards are small */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#08080a] via-[#08080a]/45 to-transparent sm:scrim-b" aria-hidden />
                <div className="absolute inset-0 grad-red opacity-0 group-hover:opacity-20 transition-opacity duration-500" aria-hidden />
                {/* icon — smaller & tighter on mobile */}
                <span className="absolute top-3 left-3 sm:top-5 sm:left-5 grid place-items-center w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl glass text-white group-hover:bg-red-500 group-hover:border-red-500 transition-colors"><Icon name={s.icon} className="w-5 h-5 sm:w-7 sm:h-7" strokeWidth={1.5} /></span>
                {/* decorative arrow: desktop only (no hover on mobile) */}
                <span className="absolute top-5 right-5 arrow-btn arrow-static w-11 h-11 glass text-white group-hover:bg-white group-hover:text-steel-50 transition-colors hidden sm:grid"><Icon name="arrowUpRight" className="w-5 h-5" /></span>
                <div className="absolute inset-x-0 bottom-0 p-3.5 sm:p-7">
                  <p className="font-mono text-[0.6rem] sm:text-[0.7rem] tracking-[0.06em] uppercase text-red-300 leading-tight line-clamp-1">{s.tag}</p>
                  <h3 className="font-display font-semibold text-[0.95rem] sm:text-xl text-white leading-snug mt-1.5 line-clamp-2 underline decoration-transparent group-hover:decoration-red-400 underline-offset-4 transition-colors">{s.name}</h3>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────── MONITORING (image + data) ─────────────── */
function Monitoring() {
  return (
    <section className="section bg-white">
      <div className="shell grid lg:grid-cols-2 gap-6 lg:gap-10 items-stretch">
        <Reveal className="h-full">
          <div className="relative cover-frame h-full min-h-[26rem]" style={{ borderRadius: 'var(--radius-lg)' }}>
            <img src="/img/photos/monitoring.jpg" alt="Condition monitoring control room" className="absolute inset-0 w-full h-full object-cover img-rich" />
            <div className="absolute inset-0 scrim-b" aria-hidden />
            <div className="absolute inset-x-0 bottom-0 p-7">
              <p className="kicker has-icon mb-4" style={{ color: 'var(--color-red-400)' }}><Icon name="waveform" className="w-4 h-4" />Condition monitoring</p>
              <h2 className="display-3 text-white max-w-sm">We read the machine before it breaks.</h2>
            </div>
            {/* floating data chip */}
            <div className="absolute top-5 right-5 bg-white rounded-2xl p-4 frame-bold w-40">
              <p className="mono-label text-steel-400">GBX-031</p>
              <p className="stat-num" style={{ fontSize: '2rem', color: 'var(--color-crit)' }}>9.4<span className="text-sm text-steel-400 font-mono ml-1">mm/s</span></p>
              <p className="mono-label" style={{ color: 'var(--color-crit)' }}>Critical</p>
            </div>
          </div>
        </Reveal>
        <div className="grid grid-rows-[auto_1fr] gap-4">
          <Reveal delay={0.06}>
            <div className="panel-bold p-7">
              <div className="flex items-center justify-between mb-6">
                <p className="font-display text-lg text-steel-50 font-semibold">Live asset health</p>
                <span className="chip chip-red"><span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse-dot" /> Monitoring</span>
              </div>
              <div className="grid sm:grid-cols-3 gap-4">
                {portalAssets.slice(0, 3).map((a) => (
                  <div key={a.id} className="rounded-2xl border-2 border-line p-5">
                    <p className="font-mono text-[0.68rem] text-steel-400">{a.id}</p>
                    <p className="stat-num mt-2" style={{ fontSize: '2rem', color: statusColor[a.status] }}>{a.reading.split(' ')[0]}<span className="text-xs text-steel-400 font-mono ml-1">{a.reading.split(' ').slice(1).join(' ')}</span></p>
                    <p className="mono-label mt-1" style={{ color: statusColor[a.status] }}>{statusLabel[a.status]}</p>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="grid grid-cols-3 gap-4 h-full">
              {portalKpis.slice(0, 2).map((k) => (
                <div key={k.label} className="panel-800 p-5 flex flex-col justify-center">
                  <p className="stat-num" style={{ fontSize: '2.2rem' }}>{k.value}</p>
                  <p className="mono-label text-steel-400 mt-2">{k.label}</p>
                </div>
              ))}
              <Link to="/portal" className="group grad-red rounded-[var(--radius-md)] p-5 flex flex-col justify-between text-white relative overflow-hidden">
                <p className="relative font-display text-lg leading-tight">Open the client portal</p>
                <span className="relative arrow-btn arrow-outline self-end mt-4"><Icon name="arrowUpRight" className="w-5 h-5" /></span>
              </Link>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ─────────────── PRODUCTS (photo cards) ─────────────── */
function Products() {
  const list = products.slice(0, 4);
  return (
    <section className="section bg-mist">
      <div className="shell">
        <div className="flex flex-wrap items-end justify-between gap-6 mb-10">
          <div className="max-w-xl">
            <Reveal><p className="kicker has-icon mb-5"><Icon name="cart" className="w-4 h-4" />The shop</p></Reveal>
            <Reveal delay={0.05}><h2 className="display-2 text-steel-50">Reliability products, <span className="text-red-500">delivered.</span></h2></Reveal>
          </div>
          <Reveal delay={0.1}><Link to="/products" className="btn btn-navy"><Icon name="cart" className="w-4 h-4" /> Shop all products</Link></Reveal>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          {list.map((p, i) => (
            <Reveal key={p.id} delay={(i % 4) * 0.05}>
              <Link to="/products" className="group panel lift overflow-hidden block h-full flex flex-col">
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img src={p.image} alt={p.name} loading="lazy" className="w-full h-full object-cover img-rich transition-transform duration-[1.1s] group-hover:scale-105" />
                  {p.tag && <span className="absolute top-3.5 left-3.5 chip chip-red">{p.tag}</span>}
                </div>
                <div className="p-6 flex flex-col flex-1">
                  <p className="mono-label text-steel-400">{p.cat}</p>
                  <h3 className="font-display font-semibold text-[1.02rem] text-steel-50 leading-tight mt-1.5 flex-1 underline decoration-transparent group-hover:decoration-red-400 underline-offset-4 group-hover:text-red-500 transition-colors">{p.name}</h3>
                  <p className="font-display font-bold text-xl text-red-500 mt-4">US${p.price.toLocaleString()}</p>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────── PROCESS (image + list) ─────────────── */
function Process() {
  return (
    <section className="section bg-white">
      <div className="shell grid lg:grid-cols-[1fr_1.1fr] gap-10 lg:gap-16 items-center">
        <Reveal>
          <div className="relative cover-frame aspect-[4/3]" style={{ borderRadius: 'var(--radius-lg)' }}>
            <img src="/img/photos/team1.jpg" alt="ARS engineers" className="absolute inset-0 w-full h-full object-cover img-rich" />
            <div className="absolute inset-0 scrim-b" />
            <div className="absolute inset-x-0 bottom-0 p-8">
              <p className="mono-label text-red-300">Our method</p>
              <p className="font-display text-3xl text-white mt-2 max-w-xs">Predict. Prioritise. Prevent.</p>
            </div>
          </div>
        </Reveal>
        <div>
          <Reveal><p className="kicker has-icon mb-5"><Icon name="target" className="w-4 h-4" />How we work</p></Reveal>
          <Reveal delay={0.05}><h2 className="display-2 text-steel-50 mb-6">A method that <span className="text-red-500">designs out failure.</span></h2></Reveal>
          <div className="border-t border-line">
            {process.map((p, i) => (
              <Reveal key={p.n} delay={i * 0.05}>
                <div className="group flex items-start gap-5 py-5 border-b border-line">
                  <span className="font-mono text-lg text-red-500 tabnum w-8 shrink-0">{p.n}</span>
                  <div className="flex-1"><h3 className="font-display text-lg text-steel-50">{p.title}</h3><p className="text-sm text-steel-400 mt-1 leading-relaxed">{p.desc}</p></div>
                  <span className="text-steel-400 group-hover:text-red-500 transition-colors mt-1"><Icon name="arrowUpRight" className="w-5 h-5" /></span>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────── GALLERY STRIP ─────────────── */
function Gallery() {
  return (
    <section className="pb-4">
      <div className="px-3 sm:px-4">
        <div className="grid grid-cols-3 lg:grid-cols-6 gap-4">
          {gallery.map((g, i) => (
            <Reveal key={g} delay={(i % 6) * 0.04}>
              <div className="group cover-frame aspect-square lift" style={{ borderRadius: 'var(--radius-md)' }}>
                <img src={g} alt="" loading="lazy" className="w-full h-full object-cover img-rich transition-transform duration-[1.1s] group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" aria-hidden />
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────── CLIENTS ─────────────── */
function Clients() {
  const row = [...clients, ...clients];
  return (
    <section className="bg-white border-y border-line py-10">
      <div className="shell">
        <p className="mono-label text-center text-steel-400 mb-6">Trusted by Zimbabwe’s biggest names in mining & manufacturing</p>
        <div className="overflow-hidden">
          <div className="flex items-center animate-marquee">
            {row.map((c, i) => (
              <span key={i} className="mx-4 shrink-0 grid place-items-center h-16 w-40 panel px-5"><img src={c.logo} alt={c.name} className="max-h-9 max-w-full object-contain" /></span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────── PILLARS ─────────────── */
function Pillars() {
  return (
    <section className="section bg-mist">
      <div className="shell">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {pillars.map((p, i) => (
            <Reveal key={p.title} delay={(i % 4) * 0.06} className="h-full">
              <div className="panel-bold lift h-full p-7 md:p-8">
                <span className="grid place-items-center w-16 h-16 rounded-2xl bg-red-50 text-red-500 mb-7 frame-bold"><Icon name={p.icon} className="w-8 h-8" /></span>
                <h3 className="font-display font-semibold text-xl text-steel-50">{p.title}</h3>
                <p className="text-[0.95rem] text-steel-400 mt-3 leading-relaxed">{p.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────── INSIGHTS ─────────────── */
function Insights() {
  return (
    <section className="section bg-white">
      <div className="shell">
        <div className="flex flex-wrap items-end justify-between gap-6 mb-10">
          <div className="max-w-xl">
            <Reveal><p className="kicker has-icon mb-5"><Icon name="robot" className="w-4 h-4" />Insights · AI in engineering</p></Reveal>
            <Reveal delay={0.05}><h2 className="display-2 text-steel-50">Where reliability meets <span className="text-red-500">intelligence.</span></h2></Reveal>
          </div>
          <Reveal delay={0.1}><Link to="/insights" className="link-underline text-steel-50 inline-flex items-center gap-2 pb-1">All insights <Icon name="arrowRight" className="w-4 h-4" /></Link></Reveal>
        </div>
        <div className="grid lg:grid-cols-[1.3fr_1fr] gap-4">
          <div className="grid sm:grid-cols-2 gap-4">
            {articles.slice(0, 2).map((a, i) => (
              <Reveal key={a.slug} delay={i * 0.06}>
                <Link to={`/insights/${a.slug}`} className="group panel lift overflow-hidden block h-full flex flex-col">
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <img src={a.image} alt={a.title} className="w-full h-full object-cover img-rich transition-transform duration-[1.1s] group-hover:scale-105" />
                    <span className="absolute top-3.5 left-3.5 chip chip-red">{a.category}</span>
                  </div>
                  <div className="p-5 flex flex-col flex-1">
                    <p className="mono-label text-steel-400">{a.date} · {a.read}</p>
                    <h3 className="font-display text-lg text-steel-50 mt-1.5 leading-tight underline decoration-transparent group-hover:decoration-red-400 underline-offset-4 group-hover:text-red-500 transition-colors">{a.title}</h3>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
          <Reveal delay={0.1}>
            <div className="panel-navy h-full p-6 relative overflow-hidden grid-tech-d">
              <div className="absolute inset-0 glow-red opacity-50" aria-hidden />
              <div className="relative">
                <span className="grid place-items-center w-12 h-12 rounded-xl grad-red text-white mb-5"><Icon name="robot" className="w-6 h-6" /></span>
                <h3 className="font-display text-xl text-white">AI in Engineering</h3>
                <p className="text-sm text-white/60 mt-2">{autoLink('Predictive maintenance models, anomaly detection and smart sensors are changing how we prevent failure — read the insights.', { maxLinks: 3 })}</p>
                <ul className="mt-5 space-y-2.5">
                  {aiTopics.map((t) => (
                    <li key={t.title} className="flex items-center gap-3 text-sm text-white/85"><span className="text-red-400"><Icon name={t.icon} className="w-4 h-4" /></span> {t.title}</li>
                  ))}
                </ul>
                <Link to="/insights" className="btn btn-light w-full mt-6"><Icon name="play" className="w-4 h-4" /> Watch & read</Link>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <>
      <Hero />
      <StatBand />
      <Services />
      <Monitoring />
      <Products />
      <Process />
      <Gallery />
      <Clients />
      <Pillars />
      <Insights />
    </>
  );
}
