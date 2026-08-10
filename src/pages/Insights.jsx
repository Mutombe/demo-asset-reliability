import { useState, useRef, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../components/Icon';
import PageHero from '../components/PageHero';
import { autoLink } from '../components/ContentLink';
import { Reveal, motion } from '../lib/motion';
import { AnimatePresence } from 'framer-motion';
import { insights, insightCats, faqs, aiTopics, brand, wa } from '../data';

/* Category → representative icon for tiles + dropdown rows */
const CAT_ICON = {
  All: 'dashboard', Articles: 'file', 'Case Studies': 'analytics',
  Videos: 'play', 'AI in Engineering': 'robot', Standards: 'clipboardcheck',
};

/* Entry tiles — each selects a category and scrolls to the browse grid. */
const AREAS = [
  { cat: 'Articles', tint: 'red', desc: 'Engineer-written notes on reliability, failure modes and preventive strategy.' },
  { cat: 'Case Studies', tint: 'navy', desc: 'Real reliability wins — faults caught early, assets saved, downtime avoided.' },
  { cat: 'Videos', tint: 'navy', desc: 'Short explainers on the methods behind condition monitoring, embedded to watch here.' },
  { cat: 'AI in Engineering', tint: 'red', desc: 'How predictive models and smart sensors are reshaping maintenance.' },
  { cat: 'Standards', tint: 'navy', desc: 'The ISO and IEC codes behind every report, calibration and inspection we deliver.' },
  { faq: true, tint: 'navy', label: 'Common questions', desc: 'Straight answers to what plant and reliability managers ask us most.' },
];

const scrollToId = (id) => { const el = document.getElementById(id); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' }); };

/* ─────────────── 1 · EXPLORE (category entry tiles) ─────────────── */
function KnowledgeBase({ onPick }) {
  return (
    <section id="knowledge" className="section bg-white scroll-mt-24 md:scroll-mt-28">
      <div className="shell">
        <div className="max-w-2xl mb-10 md:mb-12">
          <Reveal><p className="kicker has-icon mb-5"><Icon name="dashboard" className="w-4 h-4" /> The knowledge base</p></Reveal>
          <Reveal delay={0.05}><h2 className="display-2 text-steel-50">Everything we know, <span className="text-red">in one place.</span></h2></Reveal>
          <Reveal delay={0.1}><p className="lead mt-5">{autoLink('Pick a lane into two decades of reliability practice — articles, case studies, video explainers, a look at AI in engineering, and the standards behind our condition monitoring work.', { maxLinks: 2 })}</p></Reveal>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          {AREAS.map((a, i) => (
            <Reveal key={a.cat || a.label} delay={(i % 3) * 0.05} className="h-full">
              <button
                onClick={() => (a.faq ? scrollToId('faqs') : onPick(a.cat))}
                className="group panel-bold lift h-full w-full text-left flex items-start gap-4 p-5 sm:p-6"
              >
                <span className="relative grid place-items-center w-14 h-14 rounded-2xl overflow-hidden shrink-0 grad-navy text-white">
                  {a.tint === 'red'
                    ? <span className="absolute inset-0 grad-red" aria-hidden />
                    : <span className="absolute inset-0 grad-red opacity-0 group-hover:opacity-100 transition-opacity duration-300" aria-hidden />}
                  <Icon name={a.faq ? 'search' : (CAT_ICON[a.cat] || 'file')} className="relative w-7 h-7" />
                </span>
                <span className="min-w-0">
                  <span className="flex items-center gap-1.5 font-display text-[1.05rem] font-semibold text-steel-50 leading-tight">
                    {a.label || a.cat}
                    <Icon name="arrowRight" className="w-3.5 h-3.5 text-red-500 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  </span>
                  <span className="block text-[0.85rem] leading-relaxed text-steel-400 mt-1.5">{a.desc}</span>
                </span>
              </button>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────── CATEGORY DROPDOWN (real useState menu) ─────────────── */
function CategoryDropdown({ value, onChange, counts }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const onDoc = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onDoc); document.removeEventListener('keydown', onKey); };
  }, []);

  return (
    <div ref={ref} className="relative w-full sm:w-auto">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="group inline-flex items-center gap-3 w-full sm:w-[17rem] justify-between panel-bold px-4 py-3 hover:border-red-500 transition-colors"
      >
        <span className="inline-flex items-center gap-2.5 min-w-0">
          <span className="grid place-items-center w-8 h-8 rounded-lg bg-red-500/10 text-red-500 shrink-0"><Icon name={CAT_ICON[value] || 'dashboard'} className="w-4 h-4" /></span>
          <span className="min-w-0">
            <span className="block font-mono text-[0.6rem] uppercase tracking-[0.14em] text-steel-400 leading-none">Category</span>
            <span className="block font-display font-semibold text-steel-50 leading-tight truncate">{value}</span>
          </span>
        </span>
        <Icon name="chevronDown" className={`w-4 h-4 text-steel-400 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.ul
            initial={{ opacity: 0, y: 8, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 6, scale: 0.98 }}
            transition={{ duration: 0.2, ease: [0.2, 0.7, 0.3, 1] }}
            role="listbox"
            className="absolute z-30 mt-2 w-full sm:w-[17rem] panel-bold overflow-hidden p-1.5 shadow-[8px_8px_0_0_var(--bd)]"
          >
            {insightCats.map((c) => {
              const active = c === value;
              return (
                <li key={c}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={active}
                    onClick={() => { onChange(c); setOpen(false); }}
                    className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-left transition-colors ${active ? 'bg-red-500 text-white' : 'text-steel-100 hover:bg-mist'}`}
                  >
                    <span className="inline-flex items-center gap-2.5">
                      <Icon name={CAT_ICON[c] || 'file'} className={`w-4 h-4 ${active ? 'text-white' : 'text-red-500'}`} />
                      <span className="font-display font-medium">{c}</span>
                    </span>
                    <span className={`font-mono text-[0.7rem] tabnum ${active ? 'text-white/80' : 'text-steel-400'}`}>{counts[c]}</span>
                  </button>
                </li>
              );
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─────────────── UNIFIED INSIGHT CARD ─────────────── */
function InsightCard({ item, index, onPlay }) {
  const img = item.image || item.thumb;
  const isVideo = item.kind === 'video';
  return (
    <Reveal delay={(index % 3) * 0.05} className="h-full">
      <Link to={`/insights/${item.slug}`} className="group panel-bold lift overflow-hidden h-full flex flex-col">
        <div className="relative aspect-[16/9] overflow-hidden bd-b-bold">
          <img src={img} alt={item.title} loading="lazy" className="absolute inset-0 w-full h-full object-cover img-rich transition-transform duration-[1.1s] group-hover:scale-105" />
          <span className="absolute top-3 left-3 chip chip-red">{item.category}</span>
          {isVideo && (
            <>
              <div className="absolute inset-0 bg-black/25 group-hover:bg-black/10 transition-colors" aria-hidden />
              <button
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); onPlay(item); }}
                aria-label={`Play ${item.title}`}
                className="absolute inset-0 grid place-items-center"
              >
                <span className="grid place-items-center w-16 h-16 rounded-full grad-red text-white shadow-[0_12px_34px_-8px_rgba(226,33,28,.6)] transition-transform duration-300 group-hover:scale-110">
                  <Icon name="play" className="w-7 h-7 translate-x-0.5" />
                </span>
              </button>
            </>
          )}
        </div>
        <div className="p-5 sm:p-6 flex flex-col flex-1">
          <p className="mono-label inline-flex items-center gap-2 text-steel-400"><Icon name={isVideo ? 'play' : 'clock'} className="w-3.5 h-3.5" /> {item.topic}{item.read ? ` · ${item.read}` : ''}</p>
          <h3 className="font-display text-[1.15rem] text-steel-50 mt-2 leading-snug underline decoration-transparent decoration-2 underline-offset-4 group-hover:decoration-red-500 transition-colors">{item.title}</h3>
          {item.excerpt && <p className="text-[0.9rem] text-steel-400 mt-2.5 leading-relaxed line-clamp-2 flex-1">{item.excerpt}</p>}
          <span className="inline-flex items-center gap-2 mt-4 font-display text-sm font-semibold text-red-500">
            {isVideo ? 'Watch' : 'Read'} <Icon name="arrowRight" className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </span>
        </div>
      </Link>
    </Reveal>
  );
}

/* ─────────────── 2 · BROWSE (dropdown-filtered grid) ─────────────── */
function Browse({ cat, setCat, counts, onPlay }) {
  const shown = cat === 'All' ? insights : insights.filter((i) => i.category === cat);
  return (
    <section id="browse" className="section bg-mist scroll-mt-24 md:scroll-mt-28">
      <div className="shell">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-9">
          <div className="max-w-xl">
            <Reveal><p className="kicker has-icon mb-5"><Icon name="file" className="w-4 h-4" /> Browse the knowledge base</p></Reveal>
            <Reveal delay={0.05}><h2 className="display-2 text-steel-50">Filter by <span className="text-red">what you need.</span></h2></Reveal>
          </div>
          <Reveal delay={0.1} className="lg:pb-1">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <CategoryDropdown value={cat} onChange={setCat} counts={counts} />
              <span className="mono-label text-steel-400">{shown.length} {shown.length === 1 ? 'result' : 'results'}</span>
            </div>
          </Reveal>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={cat}
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5"
          >
            {shown.map((item, i) => <InsightCard key={item.slug} item={item} index={i} onPlay={onPlay} />)}
          </motion.div>
        </AnimatePresence>

        {shown.length === 0 && <p className="mono-label text-steel-500 py-16 text-center">Nothing in this category yet.</p>}
      </div>
    </section>
  );
}

/* ─────────────── 3 · WATCH & LEARN (videos + lightbox) ─────────────── */
function WatchLearn({ videos, onPlay }) {
  return (
    <section id="videos" className="section bg-white scroll-mt-24 md:scroll-mt-28">
      <div className="shell">
        <div className="flex flex-wrap items-end justify-between gap-6 mb-10">
          <div className="max-w-xl">
            <Reveal><p className="kicker has-icon mb-5"><Icon name="play" className="w-4 h-4" /> Watch &amp; learn</p></Reveal>
            <Reveal delay={0.05}><h2 className="display-2 text-steel-50">See the ideas <span className="text-red">in motion.</span></h2></Reveal>
          </div>
          <Reveal delay={0.1}><p className="mono-label !normal-case text-steel-400 max-w-xs sm:text-right leading-relaxed">Tap any video to watch it here, or open its full page.</p></Reveal>
        </div>

        <div className="grid md:grid-cols-2 gap-4 md:gap-5">
          {videos.map((v, i) => (
            <Reveal key={v.slug} delay={(i % 2) * 0.06} className="h-full">
              <div className="group panel-bold lift overflow-hidden h-full flex flex-col">
                <button onClick={() => onPlay(v)} aria-label={`Play ${v.title}`} className="relative aspect-video overflow-hidden bd-b-bold w-full text-left">
                  <img src={v.thumb} alt={v.title} loading="lazy" className="absolute inset-0 w-full h-full object-cover img-rich transition-transform duration-[1.1s] group-hover:scale-105" />
                  <div className="absolute inset-0 bg-black/30 group-hover:bg-black/15 transition-colors" aria-hidden />
                  <span className="absolute inset-0 grid place-items-center">
                    <span className="grid place-items-center w-16 h-16 rounded-full grad-red text-white shadow-[0_12px_34px_-8px_rgba(226,33,28,.6)] transition-transform duration-300 group-hover:scale-110">
                      <Icon name="play" className="w-7 h-7 translate-x-0.5" />
                    </span>
                  </span>
                  <span className="absolute top-3 left-3 chip chip-red">{v.topic}</span>
                </button>
                <div className="p-5 sm:p-6 flex items-center justify-between gap-4">
                  <h3 className="font-display text-[1.1rem] text-steel-50 leading-snug">{v.title}</h3>
                  <Link to={`/insights/${v.slug}`} className="shrink-0 inline-flex items-center gap-1.5 font-display text-sm font-semibold text-red-500 link-underline pb-0.5">Full page <Icon name="arrowRight" className="w-4 h-4" /></Link>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────── 4 · COMMON QUESTIONS ─────────────── */
function CommonQuestions() {
  const [open, setOpen] = useState(0);
  return (
    <section id="faqs" className="section bg-mist scroll-mt-24 md:scroll-mt-28">
      <div className="shell max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <Reveal><p className="kicker has-icon mb-5 justify-center"><Icon name="search" className="w-4 h-4" /> Common questions</p></Reveal>
          <Reveal delay={0.05}><h2 className="display-2 text-steel-50">Straight <span className="text-red">answers.</span></h2></Reveal>
        </div>
        <div className="space-y-3">
          {faqs.map((f, i) => {
            const isOpen = open === i;
            return (
              <Reveal key={f.q} delay={0.05 + i * 0.05}>
                <div className={`panel-bold overflow-hidden transition-shadow ${isOpen ? 'shadow-[6px_6px_0_0_var(--bd)]' : ''}`}>
                  <button onClick={() => setOpen(isOpen ? -1 : i)} className="w-full flex items-center justify-between gap-4 p-5 text-left" aria-expanded={isOpen}>
                    <span className="font-display text-[1.02rem] font-semibold text-steel-50 leading-snug">{f.q}</span>
                    <span className={`grid place-items-center w-8 h-8 rounded-lg shrink-0 transition-all ${isOpen ? 'bg-red-500 text-white' : 'bg-mist text-red-500'}`}>
                      <Icon name="chevronDown" className={`w-4 h-4 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                    </span>
                  </button>
                  <div className={`grid transition-all duration-300 ease-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                    <div className="overflow-hidden"><p className="px-5 pb-5 text-[0.92rem] text-steel-400 leading-relaxed">{f.a}</p></div>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ─────────────── 5 · AI IN ENGINEERING (dark banner) ─────────────── */
function AiBanner() {
  return (
    <section id="ai" className="section bg-white scroll-mt-24 md:scroll-mt-28">
      <div className="shell">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl grad-navy text-white p-7 sm:p-10 lg:p-14">
            <div className="absolute inset-0 grid-blueprint opacity-70" aria-hidden />
            <div className="absolute inset-0 glow-red opacity-80" aria-hidden />
            <div className="relative grid lg:grid-cols-2 gap-10 lg:gap-14 items-center">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full bg-red-500/15 border border-red-500/30 px-3.5 py-1.5 font-mono text-[0.66rem] font-medium uppercase tracking-[0.12em] text-red-300">
                  <Icon name="robot" className="w-4 h-4" /> AI in engineering
                </span>
                <h2 className="display-2 text-white mt-5 max-w-lg">The machine no longer <span className="text-red-400">waits to fail.</span></h2>
                <p className="text-white/70 mt-5 leading-relaxed max-w-md">
                  Predictive models, anomaly detection, smart sensors and automated reporting are reshaping preventive maintenance — telling us, days ahead, exactly where to look.
                </p>
                <div className="flex flex-wrap gap-3 mt-8">
                  <Link to="/insights/predictive-ai-rul" className="btn btn-light">Read the deep dive <Icon name="arrowRight" className="w-4 h-4" /></Link>
                  <Link to="/services" className="btn btn-glass-bold">Explore services</Link>
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                {aiTopics.map((t, i) => (
                  <Reveal key={t.title} delay={(i % 2) * 0.06} className="h-full">
                    <div className="h-full flex flex-col gap-3 rounded-2xl border border-white/12 bg-white/[0.04] p-5 transition-colors hover:border-red-500/40 hover:bg-white/[0.06]">
                      <span className="grid place-items-center w-12 h-12 rounded-xl bg-red-500/15 border border-red-500/25 text-red-300 shrink-0"><Icon name={t.icon} className="w-6 h-6" /></span>
                      <h3 className="font-display text-[1.05rem] font-semibold text-white leading-snug mt-1">{t.title}</h3>
                      <p className="text-[0.86rem] text-white/60 leading-relaxed">{t.desc}</p>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ─────────────── VIDEO LIGHTBOX ─────────────── */
function VideoModal({ video, onClose }) {
  if (!video) return null;
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.25 }}
      className="fixed inset-0 z-[100] grid place-items-center p-4 sm:p-6"
      onClick={onClose} role="dialog" aria-modal="true" aria-label={video.title}
    >
      <div className="absolute inset-0 bg-black/85 backdrop-blur-md" aria-hidden />
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.2, 0.7, 0.3, 1] }}
        className="relative w-full max-w-4xl" onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-4 mb-3">
          <div className="min-w-0">
            <p className="mono-label text-red-400">{video.topic}</p>
            <h3 className="font-display text-base sm:text-lg text-white truncate">{video.title}</h3>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Link to={`/insights/${video.slug}`} onClick={onClose} className="hidden sm:inline-flex btn btn-glass-bold !py-2.5 !px-4 !text-[0.8rem]">Full page</Link>
            <button onClick={onClose} aria-label="Close video" className="grid place-items-center w-10 h-10 rounded-xl bg-white/10 border border-white/25 text-white hover:bg-red-500 hover:border-red-500 transition-colors"><Icon name="x" className="w-5 h-5" /></button>
          </div>
        </div>
        <div className="relative aspect-video w-full overflow-hidden rounded-xl border-2 border-white/15 bg-black">
          <iframe
            className="absolute inset-0 w-full h-full"
            src={`https://www.youtube.com/embed/${video.yt}?autoplay=1`}
            title={video.title} frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>
        <p className="mono-label !normal-case text-white/45 mt-3">Educational explainer · embedded from YouTube</p>
      </motion.div>
    </motion.div>
  );
}

/* ─────────────── PAGE ─────────────── */
export default function Insights() {
  const [cat, setCat] = useState('All');
  const [activeVideo, setActiveVideo] = useState(null);

  const videos = useMemo(() => insights.filter((i) => i.kind === 'video'), []);
  const counts = useMemo(() => {
    const c = { All: insights.length };
    insightCats.forEach((k) => { if (k !== 'All') c[k] = insights.filter((i) => i.category === k).length; });
    return c;
  }, []);

  const pick = (c) => { setCat(c); requestAnimationFrame(() => scrollToId('browse')); };

  return (
    <>
      <PageHero
        kicker="Insights"
        icon="file"
        title='The reliability <span class="text-red">knowledge base.</span>'
        sub="Articles, case studies, video explainers, standards and a look at how AI is reshaping predictive maintenance — everything our engineers know, gathered in one place."
        image="/img/photos/monitoring.jpg"
      />
      <KnowledgeBase onPick={pick} />
      <Browse cat={cat} setCat={setCat} counts={counts} onPlay={setActiveVideo} />
      <WatchLearn videos={videos} onPlay={setActiveVideo} />
      <CommonQuestions />
      <AiBanner />

      <AnimatePresence>
        {activeVideo && <VideoModal video={activeVideo} onClose={() => setActiveVideo(null)} />}
      </AnimatePresence>
    </>
  );
}
