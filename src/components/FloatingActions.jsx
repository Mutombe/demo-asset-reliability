import React, { useEffect, useState } from 'react';
import Icon from './Icon';
import { brand, wa } from '../data';

/* Fixed contact rail on the right edge — WhatsApp + email.
   Labels slide out on hover (desktop); tap targets stay large on mobile. */
function Fab({ href, external, label, icon, bg, ring, pulse }) {
  const props = external ? { target: '_blank', rel: 'noreferrer' } : {};
  return (
    <a href={href} {...props} aria-label={label} className="group relative flex items-center justify-end">
      <span className="pointer-events-none absolute right-full mr-3 hidden sm:block whitespace-nowrap rounded-lg bg-navy-950 text-white text-[0.72rem] font-medium px-3 py-1.5 shadow-lg opacity-0 translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">{label}</span>
      <span className="relative grid place-items-center w-12 h-12 sm:w-14 sm:h-14 rounded-full text-white shadow-[0_12px_30px_-8px_rgba(0,0,0,.45)] hover:scale-105 active:scale-95 transition-transform" style={{ background: bg }}>
        {pulse && <span className="absolute inset-0 rounded-full animate-ping opacity-30" style={{ background: bg }} aria-hidden />}
        <span className="absolute inset-0 rounded-full ring-2" style={{ '--tw-ring-color': ring }} aria-hidden />
        <Icon name={icon} className="w-6 h-6 sm:w-7 sm:h-7 relative" />
      </span>
    </a>
  );
}

export default function FloatingActions() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const s = () => setShow(window.scrollY > 320);
    s(); window.addEventListener('scroll', s, { passive: true });
    return () => window.removeEventListener('scroll', s);
  }, []);
  return (
    <div className={`fixed right-4 sm:right-5 bottom-5 sm:bottom-6 z-40 flex flex-col gap-3 transition-all duration-500 ${show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
      <Fab href={wa('Hello ARS, I would like to enquire about your reliability services.')} external label="Chat on WhatsApp" icon="whatsapp" bg="#25D366" ring="rgba(37,211,102,.35)" pulse />
      <Fab href={`mailto:${brand.email}`} label={`Email ${brand.email}`} icon="mail" bg="var(--color-red-500)" ring="rgba(226,33,28,.35)" />
    </div>
  );
}
