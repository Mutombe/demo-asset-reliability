import React, { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import Icon from '../components/Icon';
import { autoLink } from '../components/ContentLink';
import { crossLinks } from '../data/crossLinks';
import { Reveal, motion } from '../lib/motion';
import { services, serviceBySlug, brand, wa } from '../data';

/* ambient theme-bleed masks — the hero frame auto-tints to the service photo */
const AMBIENT_MASK = 'linear-gradient(to bottom, transparent 34%, #000 70%)';
const COVER_FADE = 'linear-gradient(to bottom, #000 76%, transparent 100%)';

/* ── compact related-service card (links to its own detail page) ── */
function RelatedCard({ s, index }) {
  return (
    <Reveal delay={(index % 3) * 0.05} className="h-full">
      <Link to={`/services/${s.slug}`} className="group panel-bold lift overflow-hidden flex flex-col h-full">
        <div className="relative aspect-[16/10] overflow-hidden">
          <img src={s.image} aria-hidden="true"
            className="pointer-events-none absolute inset-0 h-full w-full scale-125 object-cover opacity-25 blur-2xl saturate-150"
            style={{ maskImage: AMBIENT_MASK, WebkitMaskImage: AMBIENT_MASK }} />
          <img src={s.image} alt={s.name} loading="lazy"
            className="w-full h-full object-cover img-rich transition-transform duration-[1.1s] group-hover:scale-105"
            style={{ maskImage: COVER_FADE, WebkitMaskImage: COVER_FADE }} />
          <span className="absolute top-3 left-3 chip chip-red">{s.cat}</span>
          <span className="absolute top-3 right-3 grid place-items-center w-11 h-11 rounded-2xl glass text-white"><Icon name={s.icon} className="w-6 h-6" /></span>
        </div>
        <div className="relative -mt-5 flex flex-1 flex-col px-5 pb-5">
          <h3 className="font-display font-semibold text-[1.05rem] text-steel-50 leading-tight underline decoration-transparent group-hover:decoration-red-400 underline-offset-4 transition-colors">{s.name}</h3>
          <p className="text-sm text-steel-400 mt-2 leading-snug line-clamp-2 flex-1">{s.blurb}</p>
          <span className="inline-flex items-center gap-2 text-red-500 font-display text-sm mt-4 group-hover:gap-3 transition-all">View service <Icon name="arrowRight" className="w-4 h-4" /></span>
        </div>
      </Link>
    </Reveal>
  );
}

export default function ServiceDetail() {
  const { slug } = useParams();
  const s = serviceBySlug(slug);

  const related = useMemo(() => {
    if (!s) return [];
    const same = services.filter((x) => x.slug !== s.slug && x.cat === s.cat);
    const other = services.filter((x) => x.slug !== s.slug && x.cat !== s.cat);
    return same.concat(other).slice(0, 3);
  }, [s]);

  // don't let a service link to itself inside its own body copy
  const selfKeywords = useMemo(
    () => (s ? Object.keys(crossLinks).filter((k) => crossLinks[k].to === `/services/${s.slug}`) : []),
    [s]
  );

  if (!s) {
    return (
      <section className="section bg-steel pt-32 md:pt-36">
        <div className="shell">
          <div className="panel-bold text-center py-20 px-6 max-w-xl mx-auto">
            <span className="grid place-items-center w-16 h-16 mx-auto rounded-2xl bg-mist text-red-500 mb-6"><Icon name="wrench" className="w-8 h-8" /></span>
            <h1 className="font-display text-3xl text-steel-50">Service not found</h1>
            <p className="text-steel-400 mt-3">We couldn’t find that service. It may have been renamed or moved.</p>
            <Link to="/services" className="btn btn-red mt-7"><Icon name="arrowLeft" className="w-4 h-4" /> Back to all services</Link>
          </div>
        </div>
      </section>
    );
  }

  const waMsg = `Hello ${brand.short}, I would like to book the ${s.name} service. Please share availability and pricing.`;

  return (
    <>
      {/* ─────────────── HERO ─────────────── */}
      <section className="relative bg-steel pt-32 md:pt-36 pb-14 md:pb-20 overflow-hidden">
        <div className="absolute inset-0 grid-fine opacity-30" aria-hidden />
        <div className="relative shell">
          {/* breadcrumb */}
          <nav className="flex flex-wrap items-center gap-2 mono-label text-steel-400 mb-8">
            <Link to="/" className="tlink">Home</Link>
            <Icon name="chevronRight" className="w-3.5 h-3.5 text-steel-500" />
            <Link to="/services" className="tlink">Services</Link>
            <Icon name="chevronRight" className="w-3.5 h-3.5 text-steel-500" />
            <span className="text-steel-50 truncate max-w-[60vw]">{s.name}</span>
          </nav>

          <div className="grid lg:grid-cols-2 gap-8 lg:gap-14 items-center">
            {/* LEFT — content */}
            <Reveal>
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <span className="chip chip-red"><Icon name={s.icon} className="w-3.5 h-3.5" /> {s.cat}</span>
                  <span className="mono-label text-steel-500">{s.tag}</span>
                </div>

                <h1 className="display-1 text-steel-50 mt-5 leading-[0.98]" style={{ fontSize: 'clamp(2.2rem,4.8vw,4rem)' }}>{s.name}</h1>

                <p className="lead mt-6 max-w-xl">{autoLink(s.overview, { maxLinks: 3, exclude: selfKeywords })}</p>

                {/* key spec highlights */}
                <div className="flex flex-wrap gap-2 mt-7">
                  {s.specs.slice(0, 3).map(([label, value]) => (
                    <span key={label} className="inline-flex items-center gap-2 panel-800 px-3.5 py-2 rounded-xl">
                      <span className="mono-label text-steel-500">{label}</span>
                      <span className="font-display text-sm text-red-500">{value}</span>
                    </span>
                  ))}
                </div>

                {/* CTAs */}
                <div className="flex flex-wrap gap-3 mt-8">
                  <Link to="/contact" className="btn btn-red !px-7">Book this survey <Icon name="arrowRight" className="w-4 h-4" /></Link>
                  <a href={wa(waMsg)} target="_blank" rel="noreferrer" className="btn btn-outline-bold"><Icon name="whatsapp" className="w-5 h-5" /> Ask on WhatsApp</a>
                </div>
              </div>
            </Reveal>

            {/* RIGHT — image with ambient bleed */}
            <Reveal delay={0.08}>
              <div className="relative panel-bold overflow-hidden">
                <img src={s.image} aria-hidden="true"
                  className="pointer-events-none absolute inset-0 h-full w-full scale-125 object-cover opacity-30 blur-2xl saturate-150"
                  style={{ maskImage: AMBIENT_MASK, WebkitMaskImage: AMBIENT_MASK }} />
                <div className="relative aspect-[4/3] overflow-hidden">
                  <motion.img key={s.image} src={s.image} alt={s.name}
                    initial={{ opacity: 0, scale: 1.03 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, ease: [0.2, 0.7, 0.3, 1] }}
                    className="w-full h-full object-cover img-rich"
                    style={{ maskImage: COVER_FADE, WebkitMaskImage: COVER_FADE }} />
                  <span className="absolute top-4 left-4 chip chip-red">{s.tag}</span>
                  <span className="absolute top-4 right-4 grid place-items-center w-12 h-12 rounded-2xl glass text-white"><Icon name={s.icon} className="w-7 h-7" /></span>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ─────────────── DELIVERABLES + HOW IT WORKS ─────────────── */}
      <section className="section bg-steel-900 relative overflow-hidden">
        <div className="absolute inset-0 grid-fine opacity-30" aria-hidden />
        <div className="relative shell grid lg:grid-cols-2 gap-10 lg:gap-14 items-start">
          {/* what we deliver */}
          <Reveal>
            <div>
              <p className="kicker has-icon mb-5"><Icon name="check" className="w-4 h-4" /> What we deliver</p>
              <h2 className="display-3 text-steel-50 mb-6">Every job hands you an <span className="text-red">action</span>, not a spreadsheet.</h2>
              <ul className="grid gap-3">
                {s.deliverables.map((d) => (
                  <li key={d} className="flex items-start gap-3 panel p-4">
                    <span className="grid place-items-center w-7 h-7 rounded-lg bg-red-500/12 text-red-500 shrink-0 mt-0.5"><Icon name="check" className="w-4 h-4" /></span>
                    <span className="text-[0.94rem] text-steel-100 leading-snug">{autoLink(d, { maxLinks: 1, exclude: selfKeywords })}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>

          {/* how it works */}
          <Reveal delay={0.06}>
            <div>
              <p className="kicker has-icon mb-5"><Icon name="gauge" className="w-4 h-4" /> How it works</p>
              <h2 className="display-3 text-steel-50 mb-6">A clear, repeatable method.</h2>
              <ol className="grid gap-3">
                {s.steps.map((step, i) => (
                  <li key={step.title} className="panel-bold p-5 flex gap-4 items-start">
                    <span className="font-display font-bold text-2xl text-red-500 tabnum shrink-0 w-9">{String(i + 1).padStart(2, '0')}</span>
                    <div>
                      <h3 className="font-display font-semibold text-lg text-steel-50 leading-tight">{step.title}</h3>
                      <p className="text-sm text-steel-400 mt-1.5 leading-relaxed">{step.desc}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ─────────────── SPECS + WHY IT MATTERS ─────────────── */}
      <section className="section bg-steel">
        <div className="shell grid lg:grid-cols-2 gap-10 lg:gap-14 items-start">
          {/* specs table */}
          <Reveal>
            <div>
              <p className="kicker has-icon mb-5"><Icon name="clipboardcheck" className="w-4 h-4" /> At a glance</p>
              <div className="panel-bold overflow-hidden">
                <table className="w-full text-sm">
                  <tbody>
                    {s.specs.map(([label, value], i) => (
                      <tr key={label} className={i % 2 ? 'bg-mist' : 'bg-white'}>
                        <td className="mono-label text-steel-400 px-5 py-3.5 align-top w-1/2">{label}</td>
                        <td className="px-5 py-3.5 text-steel-50 font-medium text-right">{value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </Reveal>

          {/* why it matters */}
          <Reveal delay={0.06}>
            <div>
              <p className="kicker has-icon mb-5"><Icon name="target" className="w-4 h-4" /> Why it matters</p>
              <h2 className="display-3 text-steel-50 mb-6">What this prevents.</h2>
              <ul className="grid gap-3">
                {s.benefits.map((b) => (
                  <li key={b} className="flex items-start gap-3 panel-800 p-4">
                    <span className="grid place-items-center w-8 h-8 rounded-xl bg-red-500/12 text-red-500 shrink-0 mt-0.5"><Icon name="shield" className="w-5 h-5" /></span>
                    <span className="text-[0.94rem] text-steel-100 leading-snug">{b}</span>
                  </li>
                ))}
              </ul>
              <div className="panel-navy p-6 mt-4 relative overflow-hidden">
                <div className="absolute inset-0 glow-red opacity-60" aria-hidden />
                <p className="relative mono-label text-red-400 mb-2">The ARS promise</p>
                <p className="relative font-display text-xl text-white leading-snug">{brand.promise}</p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ─────────────── FAQ ─────────────── */}
      {Array.isArray(s.faqs) && s.faqs.length > 0 && (
        <section className="section bg-steel-900 relative overflow-hidden">
          <div className="relative shell">
            <p className="kicker has-icon mb-5"><Icon name="file" className="w-4 h-4" /> Good to know</p>
            <h2 className="display-2 text-steel-50 mb-8 max-w-2xl">Questions about <span className="text-red">{s.name}</span>.</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {s.faqs.map((f) => (
                <Reveal key={f.q} className="h-full">
                  <div className="panel p-6 h-full">
                    <h3 className="font-display text-lg text-steel-50 leading-snug flex items-start gap-3">
                      <span className="text-red-500 shrink-0"><Icon name="chevronRight" className="w-5 h-5 mt-0.5" /></span>
                      {f.q}
                    </h3>
                    <p className="text-[0.94rem] text-steel-400 mt-3 leading-relaxed">{autoLink(f.a, { maxLinks: 2, exclude: selfKeywords })}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─────────────── CTA BAND ─────────────── */}
      <section className="section bg-steel">
        <div className="shell">
          <div className="relative grad-navy overflow-hidden rounded-[var(--radius-lg)] p-8 md:p-14 text-white">
            <div className="absolute inset-0 grid-blueprint opacity-60" aria-hidden />
            <div className="absolute inset-0 glow-red opacity-70" aria-hidden />
            <div className="relative max-w-2xl">
              <p className="kicker has-icon mb-5" style={{ color: 'var(--color-red-400)' }}><Icon name="clock" className="w-4 h-4" /> Ready when you are</p>
              <h2 className="display-2 text-white">Book a <span className="text-red">{s.name.replace(/\s*\(.*\)\s*/, '')}</span> survey.</h2>
              <p className="lead !text-white/80 mt-5">Tell us your site, assets and timeline. We’ll scope the work and get an analyst to you — with a prioritised report, not a raw spreadsheet.</p>
              <div className="flex flex-wrap gap-3 mt-8">
                <Link to="/contact" className="btn btn-light !px-7">Request a quote <Icon name="arrowRight" className="w-4 h-4" /></Link>
                <a href={wa(waMsg)} target="_blank" rel="noreferrer" className="btn btn-glass-bold"><Icon name="whatsapp" className="w-5 h-5" /> Chat on WhatsApp</a>
                <a href={`tel:${brand.phone}`} className="btn btn-glass"><Icon name="phone" className="w-4 h-4" /> {brand.phone}</a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────── RELATED SERVICES ─────────────── */}
      {related.length > 0 && (
        <section className="section bg-steel-900 relative overflow-hidden">
          <div className="absolute inset-0 grid-fine opacity-30" aria-hidden />
          <div className="relative shell">
            <div className="flex items-end justify-between gap-4 mb-6">
              <div>
                <p className="kicker has-icon mb-4"><Icon name="wrench" className="w-4 h-4" /> Keep exploring</p>
                <h2 className="display-2 text-steel-50">Related services</h2>
              </div>
              <Link to="/services" className="btn btn-outline-bold shrink-0 !hidden sm:!inline-flex">All services <Icon name="arrowRight" className="w-4 h-4" /></Link>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {related.map((r, i) => <RelatedCard key={r.slug} s={r} index={i} />)}
            </div>
            <Link to="/services" className="btn btn-outline-bold w-full mt-6 sm:hidden">All services <Icon name="arrowRight" className="w-4 h-4" /></Link>
          </div>
        </section>
      )}
    </>
  );
}
