import React from 'react';
import { motion } from 'framer-motion';

/* Lightweight, dependency-free SVG charts for the portal + admin dashboards.
   All use a viewBox so they scale fluidly inside any container (mobile-safe). */

const RED = '#e2211c';

/* ── Sparkline — inline trend, no axes ── */
export function Spark({ data = [], color = RED, className = '', strokeWidth = 2 }) {
  if (data.length < 2) return null;
  const w = 100, h = 32, min = Math.min(...data), max = Math.max(...data), span = max - min || 1;
  const pts = data.map((v, i) => [(i / (data.length - 1)) * w, h - ((v - min) / span) * (h - 4) - 2]);
  const d = pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ');
  const [lx, ly] = pts[pts.length - 1];
  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className={className} aria-hidden>
      <path d={d} fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
      <circle cx={lx} cy={ly} r={2.4} fill={color} vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

/* ── Line chart with soft area fill, gridlines and axis labels ── */
export function LineChart({ data = [], labels = [], color = RED, height = 180, suffix = '', pad = 26 }) {
  if (data.length < 2) return null;
  const w = 640, h = height;
  const min = Math.min(...data), max = Math.max(...data), span = max - min || 1;
  const x = (i) => pad + (i / (data.length - 1)) * (w - pad * 1.5);
  const y = (v) => pad * 0.5 + (1 - (v - min) / span) * (h - pad * 1.8);
  const line = data.map((v, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(' ');
  const area = `${line} L${x(data.length - 1).toFixed(1)} ${h - pad}L${x(0).toFixed(1)} ${h - pad}Z`;
  const gid = 'lg' + Math.round(min + max);
  const rows = 4;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ height }} role="img">
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.28" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {Array.from({ length: rows + 1 }).map((_, r) => {
        const gy = pad * 0.5 + (r / rows) * (h - pad * 1.8);
        return <line key={r} x1={pad} y1={gy} x2={w - pad * 0.5} y2={gy} stroke="var(--color-steel-800)" strokeWidth="1" strokeDasharray="2 4" />;
      })}
      <motion.path d={area} fill={`url(#${gid})`} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.8 }} />
      <motion.path d={line} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
        initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ duration: 1.1, ease: 'easeInOut' }} />
      {data.map((v, i) => <circle key={i} cx={x(i)} cy={y(v)} r="3" fill="var(--color-steel-900)" stroke={color} strokeWidth="2" />)}
      {labels.map((l, i) => (i % 2 === 0 || data.length <= 8) && (
        <text key={i} x={x(i)} y={h - pad * 0.35} textAnchor="middle" className="fill-steel-500" style={{ fontSize: 11, fontFamily: 'var(--font-mono)' }}>{l}</text>
      ))}
      <text x={pad} y={y(max) - 6} className="fill-steel-500" style={{ fontSize: 11, fontFamily: 'var(--font-mono)' }}>{max}{suffix}</text>
    </svg>
  );
}

/* ── Vertical bar chart ── */
export function BarChart({ data = [], labels = [], color = RED, height = 180, pad = 26 }) {
  if (!data.length) return null;
  const w = 640, h = height, max = Math.max(...data) || 1;
  const bw = (w - pad * 1.5) / data.length;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ height }} role="img">
      {Array.from({ length: 4 }).map((_, r) => {
        const gy = pad * 0.5 + (r / 3) * (h - pad * 1.8);
        return <line key={r} x1={pad} y1={gy} x2={w - pad * 0.5} y2={gy} stroke="var(--color-steel-800)" strokeWidth="1" strokeDasharray="2 4" />;
      })}
      {data.map((v, i) => {
        const bh = (v / max) * (h - pad * 1.8);
        const bx = pad + i * bw + bw * 0.18, by = (h - pad) - bh;
        return (
          <g key={i}>
            <motion.rect x={bx} width={bw * 0.64} rx="3" fill={color} fillOpacity={i === data.length - 1 ? 1 : 0.55}
              initial={{ height: 0, y: h - pad }} whileInView={{ height: bh, y: by }} viewport={{ once: true }} transition={{ duration: 0.6, delay: i * 0.04 }} />
            {labels[i] && <text x={pad + i * bw + bw * 0.5} y={h - pad * 0.35} textAnchor="middle" className="fill-steel-500" style={{ fontSize: 11, fontFamily: 'var(--font-mono)' }}>{labels[i]}</text>}
          </g>
        );
      })}
    </svg>
  );
}

/* ── Circular progress ring ── */
export function Ring({ value = 0, size = 96, stroke = 9, color = RED, label }) {
  const r = (size - stroke) / 2, c = 2 * Math.PI * r, off = c * (1 - value / 100);
  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--color-steel-800)" strokeWidth={stroke} />
        <motion.circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={c} initial={{ strokeDashoffset: c }} whileInView={{ strokeDashoffset: off }} viewport={{ once: true }} transition={{ duration: 1, ease: 'easeOut' }} />
      </svg>
      <div className="absolute text-center">
        <span className="font-display text-xl text-steel-50 tabnum">{value}<span className="text-sm text-steel-400">%</span></span>
        {label && <p className="mono-label text-steel-500 leading-none mt-0.5">{label}</p>}
      </div>
    </div>
  );
}
