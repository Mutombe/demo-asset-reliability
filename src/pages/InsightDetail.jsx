import React, { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import Icon from '../components/Icon';
import { autoLink } from '../components/ContentLink';
import { Reveal, motion } from '../lib/motion';
import { insights, insightBySlug, brand, wa } from '../data';

const KIND_LABEL = { article: 'Article', 'case-study': 'Case study', video: 'Video', standard: 'Standard' };
const KIND_ICON = { article: 'file', 'case-study': 'analytics', video: 'play', standard: 'clipboardcheck' };

/* ── compact related-insight card ── */
function RelatedCard({ item, index }) {
  const img = item.image || item.thumb;
  return (
    <Reveal delay={(index % 3) * 0.05} className="h-full">
      <Link to={`/insights/${item.slug}`} className="group panel-bold lift overflow-hidden flex flex-col h-full">
        <div className="relative aspect-[16/9] overflow-hidden bd-b-bold">
          <img src={img} alt={item.title} loading="lazy" className="absolute inset-0 w-full h-full object-cover img-rich transition-transform duration-[1.1s] group-hover:scale-105" />
          <span className="absolute top-3 left-3 chip chip-red">{item.category}</span>
          {item.kind === 'video' && (
            <span className="absolute inset-0 grid place-items-center">
              <span className="grid place-items-center w-14 h-14 rounded-full grad-red text-white shadow-[0_12px_34px_-8px_rgba(226,33,28,.6)] transition-transform duration-300 group-hover:scale-110">
                <Icon name="play" className="w-6 h-6 translate-x-0.5" />
              </span>
            </span>
          )}
        </div>
        <div className="p-5 flex flex-col flex-1">
          <p className="mono-label text-steel-400">{item.topic}</p>
          <h3 className="font-display text-[1.05rem] text-steel-50 mt-1.5 leading-snug underline decoration-transparent group-hover:decoration-red-400 underline-offset-4 group-hover:text-red-500 transition-colors">{item.title}</h3>
        </div>
      </Link>
    </Reveal>
  );
}

/* ── typeset body: strings → paragraphs (auto-linked), {quote} → pull-quote ── */
function ArticleBody({ blocks, kind }) {
  let firstPara = true;
  return (
    <div className="mt-8 space-y-6">
      {blocks.map((b, i) => {
        if (typeof b === 'string') {
          const drop = firstPara && (kind === 'article' || kind === 'case-study');
          firstPara = false;
          return (
            <p
              key={i}
              className={`text-[1.06rem] leading-[1.75] text-steel-300 ${drop ? 'first-letter:float-left first-letter:font-display first-letter:font-extrabold first-letter:text-red-500 first-letter:text-[3.4rem] first-letter:leading-[0.72] first-letter:mr-3 first-letter:mt-1.5' : ''}`}
            >
              {autoLink(b, { maxLinks: 3 })}
            </p>
          );
        }
        if (b && b.quote) {
          return (
            <blockquote key={i} className="relative my-8 pl-6 border-l-4 border-red-500">
              <span className="absolute -top-3 left-4 font-display text-5xl text-red-500/25 leading-none select-none" aria-hidden>“</span>
              <p className="font-display text-[1.35rem] sm:text-[1.6rem] leading-snug text-steel-50 tracking-[-0.01em]">{b.quote}</p>
            </blockquote>
          );
        }
        if (b && b.h) {
          return <h2 key={i} className="display-3 text-steel-50 pt-4">{b.h}</h2>;
        }
        return null;
      })}
    </div>
  );
}

export default function InsightDetail() {
  const { slug } = useParams();
  const item = insightBySlug(slug);

  const related = useMemo(() => {
    if (!item) return [];
    const same = insights.filter((x) => x.slug !== item.slug && x.category === item.category);
    const other = insights.filter((x) => x.slug !== item.slug && x.category !== item.category);
    return same.concat(other).slice(0, 3);
  }, [item]);

  if (!item) {
    return (
      <section className="section bg-steel pt-32 md:pt-36">
        <div className="shell">
          <div className="panel-bold text-center py-20 px-6 max-w-xl mx-auto">
            <span className="grid place-items-center w-16 h-16 mx-auto rounded-2xl bg-mist text-red-500 mb-6"><Icon name="file" className="w-8 h-8" /></span>
            <h1 className="font-display text-3xl text-steel-50">Insight not found</h1>
            <p className="text-steel-400 mt-3">We couldn’t find that insight. It may have been renamed or moved.</p>
            <Link to="/insights" className="btn btn-red mt-7"><Icon name="arrowLeft" className="w-4 h-4" /> Back to insights</Link>
          </div>
        </div>
      </section>
    );
  }

  const isVideo = item.kind === 'video';
  const meta = isVideo ? 'Video' : (item.read || '');
  const waMsg = `Hi ${brand.short}, I'd like to talk about "${item.title}".`;

  return (
    <section className="bg-steel pt-32 md:pt-36 pb-16 md:pb-24">
      <div className="shell">
        {/* breadcrumb */}
        <nav className="flex flex-wrap items-center gap-2 mono-label text-steel-400 mb-8">
          <Link to="/" className="tlink">Home</Link>
          <Icon name="chevronRight" className="w-3.5 h-3.5 text-steel-500" />
          <Link to="/insights" className="tlink">Insights</Link>
          <Icon name="chevronRight" className="w-3.5 h-3.5 text-steel-500" />
          <span className="text-steel-50 truncate max-w-[60vw]">{item.title}</span>
        </nav>

        {/* header */}
        <div className="max-w-3xl mx-auto">
          <Reveal>
            <div className="flex flex-wrap items-center gap-3">
              <span className="chip chip-red"><Icon name={KIND_ICON[item.kind] || 'file'} className="w-3.5 h-3.5" /> {item.category}</span>
              <span className="mono-label inline-flex items-center gap-2 text-steel-400">
                <Icon name={isVideo ? 'play' : 'clock'} className="w-3.5 h-3.5" /> {KIND_LABEL[item.kind]}{item.date ? ` · ${item.date}` : ''}{meta && !isVideo ? ` · ${meta}` : ''}
              </span>
            </div>
            <h1 className="display-1 text-steel-50 mt-5 leading-[1.0]" style={{ fontSize: 'clamp(2.1rem,4.6vw,3.6rem)' }}>{item.title}</h1>
            {item.excerpt && <p className="lead mt-6">{item.excerpt}</p>}
          </Reveal>
        </div>

        {/* hero media — embedded player for videos, photo otherwise */}
        <Reveal delay={0.06} className="max-w-4xl mx-auto mt-10">
          {isVideo ? (
            <figure>
              <div className="relative aspect-video w-full overflow-hidden rounded-[var(--radius-lg)] border-2 border-[var(--bd)] bg-black">
                <iframe
                  className="absolute inset-0 w-full h-full"
                  src={`https://www.youtube.com/embed/${item.yt}`}
                  title={item.title}
                  loading="lazy"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>
              <figcaption className="mono-label !normal-case text-steel-400 mt-3 text-center">Educational explainer · embedded from YouTube</figcaption>
            </figure>
          ) : (
            <div className="relative panel-bold overflow-hidden">
              <div className="relative aspect-[16/9] overflow-hidden">
                <motion.img
                  key={item.image} src={item.image} alt={item.title}
                  initial={{ opacity: 0, scale: 1.03 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, ease: [0.2, 0.7, 0.3, 1] }}
                  className="w-full h-full object-cover img-rich"
                />
                <span className="absolute top-4 left-4 chip chip-red">{item.topic}</span>
              </div>
            </div>
          )}
        </Reveal>

        {/* body */}
        <div className="max-w-3xl mx-auto">
          <Reveal delay={0.08}>
            <ArticleBody blocks={item.body || []} kind={item.kind} />
          </Reveal>

          {/* end matter — CTA */}
          <div className="mt-12 panel-navy p-7 sm:p-9 relative overflow-hidden">
            <div className="absolute inset-0 glow-red opacity-60" aria-hidden />
            <div className="relative flex flex-col sm:flex-row sm:items-center gap-5 justify-between">
              <div className="max-w-md">
                <p className="mono-label text-red-400 mb-2">Talk to an engineer</p>
                <p className="font-display text-xl text-white leading-snug">Have a question this raised on your own plant?</p>
              </div>
              <div className="flex flex-wrap gap-3 shrink-0">
                <a href={wa(waMsg)} target="_blank" rel="noreferrer noopener" className="btn btn-red"><Icon name="whatsapp" className="w-5 h-5" /> Ask our engineers</a>
                <Link to="/insights" className="btn btn-glass-bold"><Icon name="arrowLeft" className="w-4 h-4" /> All insights</Link>
              </div>
            </div>
          </div>
        </div>

        {/* related */}
        {related.length > 0 && (
          <div className="mt-16 md:mt-20">
            <div className="flex items-end justify-between gap-4 mb-6">
              <div>
                <p className="kicker has-icon mb-3"><Icon name="file" className="w-4 h-4" /> Keep reading</p>
                <h2 className="display-3 text-steel-50">Related insights</h2>
              </div>
              <Link to="/insights" className="btn btn-outline-bold shrink-0 !hidden sm:!inline-flex">All insights <Icon name="arrowRight" className="w-4 h-4" /></Link>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {related.map((r, i) => <RelatedCard key={r.slug} item={r} index={i} />)}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
