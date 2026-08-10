import React, { useEffect, useRef, useState } from 'react';
import { motion, useInView, useScroll, useTransform, useReducedMotion } from 'framer-motion';

const EASE = [0.2, 0.7, 0.3, 1];

/* Reveal — animates in on view, with a grace fallback so content is NEVER stuck hidden. */
export function Reveal({ children, delay = 0, y = 22, className = '', as = 'div', once = true }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once, margin: '-10% 0px -8% 0px' });
  const [grace, setGrace] = useState(false);
  useEffect(() => { const t = setTimeout(() => setGrace(true), 750 + delay * 1000); return () => clearTimeout(t); }, [delay]);
  const show = inView || grace;
  const M = motion[as] || motion.div;
  return (
    <M ref={ref} className={className} initial={{ opacity: 0, y }} animate={show ? { opacity: 1, y: 0 } : { opacity: 0, y }}
      transition={{ duration: 0.65, delay: grace && !inView ? 0 : delay, ease: EASE }}>{children}</M>
  );
}

export function Parallax({ children, speed = 60, className = '', style = {} }) {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], [speed, -speed]);
  if (reduce) return <div className={className} style={style}>{children}</div>;
  return <motion.div ref={ref} className={className} style={{ ...style, y }}>{children}</motion.div>;
}

export function CountUp({ value, suffix = '', prefix = '', duration = 1600, className = '' }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-30px' });
  const [forced, setForced] = useState(false);
  const [n, setN] = useState(0);
  const raw = String(value);
  const target = parseFloat(raw.replace(/,/g, '')) || 0;
  const grouped = raw.includes(',');
  useEffect(() => { const t = setTimeout(() => setForced(true), 2000); return () => clearTimeout(t); }, []);
  const go = inView || forced;
  useEffect(() => {
    if (!go) return; let raf; const start = performance.now();
    const tick = (now) => { const p = Math.min(1, (now - start) / duration); const e = 1 - Math.pow(1 - p, 3); setN(target * e); if (p < 1) raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick); return () => cancelAnimationFrame(raf);
  }, [go, target, duration]);
  const shown = Math.round(n).toLocaleString('en-US', { useGrouping: grouped });
  return <span ref={ref} className={className}>{prefix}{shown}{suffix}</span>;
}

export { motion, useScroll, useTransform };
