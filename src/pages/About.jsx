import React from 'react';
import { Link } from 'react-router-dom';
import PageHero from '../components/PageHero';
import Icon from '../components/Icon';
import { autoLink } from '../components/ContentLink';
import { Reveal, CountUp } from '../lib/motion';
import { brand, pillars, stats, clients, services, wa } from '../data';

export default function About() {
  return (
    <>
      <PageHero
        kicker="About ARS"
        icon="shield"
        title='All failures are <span class="text-red">preventable.</span>'
        sub="Asset Reliability Services is a Zimbabwean engineering company built on precision maintenance and condition monitoring."
        image="/img/photos/about.jpg"
      />

      {/* ─────────────── STORY / MISSION ─────────────── */}
      <section className="section bg-steel relative overflow-hidden">
        <div className="absolute inset-0 grid-fine opacity-30" aria-hidden />
        <div className="relative shell grid lg:grid-cols-[1.15fr_1fr] gap-12 lg:gap-16 items-center">
          {/* text */}
          <div>
            <Reveal><p className="kicker has-icon mb-5"><Icon name="handshake" className="w-4 h-4" /> Who we are</p></Reveal>
            <Reveal delay={0.05}>
              <h2 className="display-2 text-steel-50 text-balance">
                Precision maintenance and reliability engineers, <span className="text-red">under one roof.</span>
              </h2>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="lead mt-6 max-w-xl">
                {autoLink('We are a team of precision maintenance and reliability engineers who believe every breakdown can be seen coming. Machines do not fail without warning. The warning is written in vibration analysis, heat, ultrasound and oil analysis, and our job is to read it before your plant stops.', { maxLinks: 3 })}
              </p>
            </Reveal>
            <div className="mt-6 space-y-4 max-w-xl text-steel-400 leading-relaxed">
              <Reveal delay={0.14}>
                <p>
                  Our purpose is simple. {brand.positioning}{' '}
                  {autoLink('Predictive, condition-based maintenance is how we turn unplanned downtime into planned, costed action, and how we hand our clients a genuine edge over anyone still waiting for things to break.', { maxLinks: 2 })}
                </p>
              </Reveal>
              <Reveal delay={0.18}>
                <p>
                  Based in Harare, we serve the mining, manufacturing and construction industries across Zimbabwe and the wider region. Our teams travel to plants, factories and mine sites, on scheduled monitoring routes or for once-off diagnostics, wherever the critical assets are.
                </p>
              </Reveal>
              <Reveal delay={0.22}>
                <p>
                  {autoLink('What sets us apart is breadth. The full reliability toolkit sits under one roof: condition monitoring, fluid management, lifting equipment and load testing, calibration and training. One partner, one standard, one accountable team for the health of your assets.', { maxLinks: 4 })}
                </p>
              </Reveal>
            </div>
            <Reveal delay={0.26}>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link to="/services" className="btn btn-red">Explore our services <Icon name="arrowRight" className="w-4 h-4" /></Link>
                <a href={wa('Hello ARS, I would like to learn more about your reliability services.')} target="_blank" rel="noopener noreferrer" className="btn btn-ghost">
                  <Icon name="whatsapp" className="w-4 h-4" /> Talk to us
                </a>
              </div>
            </Reveal>
          </div>

          {/* framed image */}
          <Reveal delay={0.1}>
            <div className="panel ticked p-3 relative">
              <div className="relative overflow-hidden rounded-md aspect-[4/5]">
                <img src="/img/photos/careers.jpg" alt="ARS reliability engineers on site" className="w-full h-full object-cover duotone" />
                <div className="absolute inset-0 scrim-b" aria-hidden />
                <div className="absolute inset-0 grid-fine opacity-20" aria-hidden />
                <div className="absolute left-4 bottom-4 right-4 flex items-end justify-between gap-3">
                  <div>
                    <p className="font-display text-3xl text-steel-50 tabnum leading-none">100%</p>
                    <p className="mono-label text-steel-300 mt-1">Preventable failures</p>
                  </div>
                  <span className="chip chip-red"><span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse-dot" /> On site</span>
                </div>
              </div>
              <p className="mono-label text-steel-500 mt-3 px-1">FIG.01 · Condition-based maintenance in the field</p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ─────────────── STATS BAND ─────────────── */}
      <section className="bg-steel-900 border-y border-steel-800 relative overflow-hidden">
        <div className="absolute inset-0 glow-red opacity-40" aria-hidden />
        <div className="relative shell py-14 md:py-16">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((s, i) => (
              <Reveal key={s.label} delay={i * 0.06} className="text-center lg:text-left">
                <p className="font-display text-5xl md:text-6xl text-red-500 tabnum"><CountUp value={s.value} suffix={s.suffix} /></p>
                <p className="mono-label text-steel-400 mt-2">{s.label}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────── VALUES / WHY ─────────────── */}
      <section className="section bg-steel">
        <div className="shell">
          <div className="max-w-2xl mb-12">
            <Reveal><p className="kicker has-icon mb-5"><Icon name="shield" className="w-4 h-4" /> What we stand for</p></Reveal>
            <Reveal delay={0.05}>
              <h2 className="display-2 text-steel-50">Predict. Prioritise. <span className="text-red">Prevent.</span></h2>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="lead mt-5">The principles behind every survey we run and every report we hand over.</p>
            </Reveal>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {pillars.map((p, i) => (
              <Reveal key={p.title} delay={(i % 4) * 0.06} className="h-full">
                <div className="panel lift h-full p-6">
                  <span className="grid place-items-center w-12 h-12 rounded-md bg-red-500/12 text-red-400 mb-5"><Icon name={p.icon} className="w-6 h-6" /></span>
                  <h3 className="font-display text-lg text-steel-50">{p.title}</h3>
                  <p className="text-sm text-steel-400 mt-2 leading-relaxed">{p.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────── CLIENTS ─────────────── */}
      <section className="section bg-steel-900 relative overflow-hidden">
        <div className="absolute inset-0 grid-fine opacity-30" aria-hidden />
        <div className="relative shell">
          <div className="max-w-2xl mb-12">
            <Reveal><p className="kicker has-icon mb-5"><Icon name="analytics" className="w-4 h-4" /> Track record</p></Reveal>
            <Reveal delay={0.05}>
              <h2 className="display-2 text-steel-50">Clients we have <span className="text-red">worked with.</span></h2>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="lead mt-5">Some of Zimbabwe's biggest names in mining, manufacturing and processing trust us with the reliability of their critical assets.</p>
            </Reveal>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {clients.map((c, i) => (
              <Reveal key={c.name} delay={(i % 4) * 0.05}>
                <div className="panel lift ticked p-5 h-full flex flex-col items-center justify-center gap-3">
                  <span className="grid place-items-center h-16 w-full bg-white rounded-md px-4">
                    <img src={c.logo} alt={c.name} className="max-h-10 max-w-full object-contain" />
                  </span>
                  <p className="mono-label text-steel-500 text-center">{c.name}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────── WHAT WE DO ─────────────── */}
      <section className="section bg-steel">
        <div className="shell">
          <div className="flex flex-wrap items-end justify-between gap-6 mb-10">
            <div className="max-w-xl">
              <Reveal><p className="kicker has-icon mb-5"><Icon name="wrench" className="w-4 h-4" /> The toolkit</p></Reveal>
              <Reveal delay={0.05}>
                <h2 className="display-2 text-steel-50">Everything reliability, <span className="text-red">in one place.</span></h2>
              </Reveal>
            </div>
            <Reveal delay={0.1}>
              <Link to="/services" className="link-underline text-steel-100 inline-flex items-center gap-2 pb-1">All services <Icon name="arrowRight" className="w-4 h-4" /></Link>
            </Reveal>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {services.slice(0, 8).map((s, i) => (
              <Reveal key={s.slug} delay={(i % 4) * 0.04} className="h-full">
                <Link to="/services" className="group panel lift h-full p-4 flex items-center gap-3">
                  <span className="grid place-items-center w-11 h-11 rounded-md bg-steel-800 border border-steel-700 text-red-500 shrink-0 group-hover:bg-red-500 group-hover:text-white transition-colors"><Icon name={s.icon} className="w-5 h-5" /></span>
                  <div className="min-w-0">
                    <p className="font-mono text-[0.62rem] text-steel-600">{String(i + 1).padStart(2, '0')}</p>
                    <h3 className="font-display text-[0.95rem] text-steel-100 leading-tight group-hover:text-red-400 transition-colors">{s.name}</h3>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
