import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../components/Icon';
import PageHero from '../components/PageHero';
import { autoLink } from '../components/ContentLink';
import { Reveal, CountUp, motion } from '../lib/motion';
import { services, serviceCats, process, stats, brand, wa } from '../data';

/* ─────────────── FEATURE CARD (wide, image + content) ─────────────── */
function FeatureCard({ s, index }) {
  return (
    <Reveal className="h-full sm:col-span-2 lg:col-span-2">
      <Link to={`/services/${s.slug}`} className="group panel lift ticked h-full overflow-hidden flex flex-col sm:flex-row">
        <div className="relative sm:w-[46%] shrink-0 overflow-hidden aspect-[16/10] sm:aspect-auto sm:min-h-[16rem]">
          <img src={s.image} alt={s.name} className="absolute inset-0 w-full h-full object-cover duotone transition-transform duration-[1.1s] group-hover:scale-105" />
          <div className="absolute inset-0 scrim-b sm:hidden" aria-hidden />
          <span className="absolute top-3 left-3 chip chip-red">{s.cat}</span>
          <span className="absolute bottom-3 left-3 grid place-items-center w-12 h-12 rounded-md bg-steel-900/80 backdrop-blur border border-steel-700 text-red-500 group-hover:bg-red-500 group-hover:text-white transition-colors">
            <Icon name={s.icon} className="w-6 h-6" strokeWidth={1.5} />
          </span>
        </div>
        <div className="p-6 md:p-7 flex flex-col flex-1">
          <span className="mono-label text-steel-600">{String(index + 1).padStart(2, '0')} / featured</span>
          <h3 className="display-3 text-steel-50 mt-3 leading-tight group-hover:text-red-400 transition-colors">{s.name}</h3>
          <p className="mono-label text-steel-500 mt-2">{s.tag}</p>
          <p className="text-sm text-steel-400 mt-4 leading-relaxed flex-1">{s.blurb}</p>
          <span className="inline-flex items-center gap-2 text-red-400 font-display text-sm mt-6 group-hover:gap-3 transition-all">View details <Icon name="arrowRight" className="w-4 h-4" /></span>
        </div>
      </Link>
    </Reveal>
  );
}

/* ─────────────── STANDARD CARD (image-top) ─────────────── */
function ServiceCard({ s, index, spanClass = '' }) {
  return (
    <Reveal delay={(index % 3) * 0.04} className={`h-full ${spanClass}`}>
      <Link to={`/services/${s.slug}`} className="group panel lift ticked h-full overflow-hidden flex flex-col">
        <div className="relative overflow-hidden aspect-[16/10]">
          <img src={s.image} alt={s.name} className="absolute inset-0 w-full h-full object-cover duotone transition-transform duration-[1.1s] group-hover:scale-105" />
          <div className="absolute inset-0 scrim-b" aria-hidden />
          <span className="absolute top-3 left-3 chip chip-red">{s.cat}</span>
          <span className="absolute bottom-3 right-3 mono-label text-steel-500">{String(index + 1).padStart(2, '0')}</span>
          <span className="absolute bottom-3 left-3 grid place-items-center w-12 h-12 rounded-md bg-steel-900/80 backdrop-blur border border-steel-700 text-red-500 group-hover:bg-red-500 group-hover:text-white transition-colors">
            <Icon name={s.icon} className="w-6 h-6" strokeWidth={1.5} />
          </span>
        </div>
        <div className="p-5 flex flex-col flex-1">
          <h3 className="font-display text-lg text-steel-50 leading-tight group-hover:text-red-400 transition-colors">{s.name}</h3>
          <p className="mono-label text-steel-500 mt-1">{s.tag}</p>
          <p className="text-sm text-steel-400 mt-3 leading-relaxed flex-1 line-clamp-2">{s.blurb}</p>
          <span className="inline-flex items-center gap-2 text-red-400 font-display text-sm mt-4 group-hover:gap-3 transition-all">View details <Icon name="arrowRight" className="w-4 h-4" /></span>
        </div>
      </Link>
    </Reveal>
  );
}

/* ─────────────── SERVICES GRID (filterable) ─────────────── */
function ServicesGrid() {
  const [cat, setCat] = useState('All');
  const shown = cat === 'All' ? services : services.filter((s) => s.cat === cat);
  return (
    <section className="section bg-steel relative overflow-hidden">
      <div className="absolute inset-0 grid-fine opacity-30" aria-hidden />
      <div className="relative shell">
        <div className="flex flex-wrap items-end justify-between gap-6 mb-10">
          <div className="max-w-xl">
            <Reveal><p className="kicker has-icon mb-5"><Icon name="wrench" className="w-4 h-4" /> The reliability toolkit</p></Reveal>
            <Reveal delay={0.05}><h2 className="display-2 text-steel-50">Every discipline that keeps a plant <span className="text-red">alive.</span></h2></Reveal>
            <Reveal delay={0.1}><p className="lead mt-5">{autoLink('Filter by discipline, or browse the full set — condition monitoring, fluid management, calibration and more. Each service is delivered on site by analysts who hand you a prioritised action, never a raw spreadsheet.', { maxLinks: 3 })}</p></Reveal>
          </div>
          <Reveal delay={0.1}><span className="chip"><span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse-dot" /> {String(services.length).padStart(2, '0')} services</span></Reveal>
        </div>

        {/* category filter */}
        <div className="flex flex-wrap gap-2 mb-8">
          {['All', ...serviceCats].map((c) => (
            <button key={c} onClick={() => setCat(c)} className={`px-4 py-2 rounded-md font-mono text-[0.72rem] uppercase tracking-wide border transition-all ${cat === c ? 'bg-red-500 text-white border-red-500' : 'bg-steel-850 text-steel-300 border-steel-700 hover:border-steel-500'}`}>{c}</button>
          ))}
        </div>

        {/* bento grid: first card featured/wide, rest image-top */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-stretch">
          {shown.map((s, i) => {
            if (i === 0) return <FeatureCard key={s.slug} s={s} index={i} />;
            // feature card occupies 2 column-units, so total units = n + 1; fill any trailing gap with the last card.
            const n = shown.length, last = i === n - 1;
            const rL = (n + 1) % 3, rS = (n + 1) % 2;
            const span = last ? `${rS === 1 ? 'sm:col-span-2' : ''} ${rL === 1 ? 'lg:col-span-3' : rL === 2 ? 'lg:col-span-2' : ''}` : '';
            return <ServiceCard key={s.slug} s={s} index={i} spanClass={span} />;
          })}
        </div>

        {shown.length === 0 && (
          <p className="mono-label text-steel-500 py-16 text-center">No services in this discipline.</p>
        )}
      </div>
    </section>
  );
}

/* ─────────────── PROCESS ─────────────── */
function Process() {
  return (
    <section className="section bg-steel-900 relative overflow-hidden">
      <div className="absolute inset-0 glow-red opacity-50" aria-hidden />
      <div className="relative shell">
        <div className="max-w-2xl mb-12">
          <Reveal><p className="kicker has-icon mb-5"><Icon name="gauge" className="w-4 h-4" /> How we work</p></Reveal>
          <Reveal delay={0.05}><h2 className="display-2 text-steel-50">Predict. Prioritise. <span className="text-red">Prevent.</span></h2></Reveal>
          <Reveal delay={0.1}><p className="lead mt-5">One method behind all fifteen services, from first baseline to the prioritised action that stops the failure.</p></Reveal>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {process.map((p, i) => (
            <Reveal key={p.n} delay={(i % 4) * 0.06} className="h-full">
              <div className="panel h-full p-6 border-t-2 border-t-red-500">
                <p className="font-mono text-3xl text-steel-600 tabnum">{p.n}</p>
                <h3 className="font-display text-xl text-steel-50 mt-3">{p.title}</h3>
                <p className="text-sm text-steel-400 mt-2 leading-relaxed">{p.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────── STATS BAND ─────────────── */
function StatsBand() {
  return (
    <section className="section bg-steel">
      <div className="shell">
        <div className="panel-800 ticked p-8 md:p-12 relative overflow-hidden">
          <div className="absolute inset-0 dots opacity-40" aria-hidden />
          <div className="relative">
            <Reveal><p className="kicker has-icon mb-8"><Icon name="analytics" className="w-4 h-4" /> By the numbers</p></Reveal>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              {stats.map((s, i) => (
                <Reveal key={s.label} delay={i * 0.06} className="text-center lg:text-left">
                  <p className="font-display text-5xl md:text-6xl text-red-500 tabnum"><CountUp value={s.value} suffix={s.suffix} /></p>
                  <p className="mono-label text-steel-400 mt-2">{s.label}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Services() {
  return (
    <>
      <PageHero
        kicker="Our services"
        icon="wrench"
        title='Fifteen services. One mission: <span class="text-red">zero surprises.</span>'
        sub="Condition monitoring, fluid management, lifting and load, precision and training. The full reliability toolkit, delivered on site."
        image="/img/photos/about2.jpg"
      >
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }} className="flex flex-wrap gap-3 mt-8">
          <Link to="/contact" className="btn btn-red !px-7">Book a survey <Icon name="arrowRight" className="w-4 h-4" /></Link>
          <a href={wa(`Hi ${brand.short}, I would like to discuss your reliability services.`)} target="_blank" rel="noreferrer" className="btn btn-glass !px-6"><Icon name="whatsapp" className="w-4 h-4" /> Talk to an engineer</a>
        </motion.div>
        <div className="flex flex-wrap gap-2 mt-7">
          {serviceCats.map((c) => (
            <span key={c} className="chip">{c}</span>
          ))}
        </div>
      </PageHero>

      <ServicesGrid />
      <Process />
      <StatsBand />
    </>
  );
}
