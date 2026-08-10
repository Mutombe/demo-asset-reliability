import { Link } from 'react-router-dom';
import { ArrowUpRight } from '@phosphor-icons/react';
import { crossLinks } from '../data/crossLinks';

/**
 * ContentLink — inline cross-link for the ARS "reliability wiki" system.
 * Brand styling: red (#e2211c) text, dotted underline that snaps to solid
 * with a subtle red wash on hover, and an ArrowUpRight glyph on external links.
 *
 *   <ContentLink to="/services/vibration-analysis">vibration analysis</ContentLink>
 *   <ContentLink href="https://www.iso.org/…" external>ISO 20816</ContentLink>
 */
export default function ContentLink({ to, href, external, children, className = '' }) {
  const base =
    'inline items-baseline font-medium text-red-500 ' +
    'underline decoration-dotted decoration-red-500/45 decoration-1 underline-offset-[3px] ' +
    'hover:decoration-solid hover:decoration-red-500 hover:decoration-2 ' +
    'hover:bg-red-500/[0.07] rounded-[3px] px-[2px] -mx-[2px] ' +
    'transition-all duration-200 ' + className;

  // External → open in a new tab, with an arrow glyph
  if (href || external) {
    const url = href || to;
    return (
      <a href={url} target="_blank" rel="noreferrer noopener" className={`${base} whitespace-nowrap`}>
        {children}
        <ArrowUpRight size={12} weight="bold" className="inline-block align-baseline opacity-55 ml-[1px]" aria-hidden="true" />
      </a>
    );
  }

  // Internal → react-router Link
  return (
    <Link to={to} className={base}>
      {children}
    </Link>
  );
}

/**
 * autoLink — turns known keywords inside a plain string into <ContentLink>s.
 * Matches are word-boundary, case-insensitive, longest keyword first, and each
 * keyword links only on its first occurrence. Returns a React-renderable array
 * (mix of strings and nodes) — drop it straight inside a <p>{autoLink(text)}</p>.
 *
 * Options:
 *   maxLinks: cap links per call so paragraphs never over-link (default 4)
 *   exclude:  keyword keys to skip (e.g. the current page's own keyword)
 */
export function autoLink(text, { maxLinks = 4, exclude = [] } = {}) {
  if (!text || typeof text !== 'string') return text;

  const skip = new Set(exclude.map((k) => k.toLowerCase()));
  const keywords = Object.keys(crossLinks)
    .filter((k) => !skip.has(k.toLowerCase()))
    .sort((a, b) => b.length - a.length);

  const lower = text.toLowerCase();
  const isBoundary = (ch) => ch === undefined || /[\s,.:;!?()\[\]'"“”/–—-]/.test(ch);
  const matches = [];

  for (const keyword of keywords) {
    if (matches.length >= maxLinks) break;
    const kw = keyword.toLowerCase();
    let from = 0;
    while (from < lower.length) {
      const idx = lower.indexOf(kw, from);
      if (idx === -1) break;
      const before = idx > 0 ? lower[idx - 1] : undefined;
      const after = idx + kw.length < lower.length ? lower[idx + kw.length] : undefined;
      if (isBoundary(before) && isBoundary(after)) {
        const overlaps = matches.some((m) => idx < m.end && idx + kw.length > m.start);
        if (!overlaps) {
          matches.push({ start: idx, end: idx + kw.length, keyword, text: text.slice(idx, idx + kw.length) });
          break; // first occurrence of each keyword only
        }
      }
      from = idx + 1;
    }
  }

  if (matches.length === 0) return text;
  matches.sort((a, b) => a.start - b.start);

  const out = [];
  let last = 0;
  matches.forEach((m, i) => {
    if (m.start > last) out.push(text.slice(last, m.start));
    const data = crossLinks[m.keyword];
    out.push(
      data.href
        ? <ContentLink key={i} href={data.href} external>{m.text}</ContentLink>
        : <ContentLink key={i} to={data.to}>{m.text}</ContentLink>
    );
    last = m.end;
  });
  if (last < text.length) out.push(text.slice(last));
  return out;
}
