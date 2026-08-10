import React from 'react';
import {
  Gear, Lightning, Drop, Recycle, GasCan, Barbell, Gauge, Anchor, ClipboardText,
  Waveform, Crosshair, Thermometer, Engine, Pulse, Scales, GraduationCap, CircleDashed,
  Crane, Broadcast, Fire, Pipe, LinkSimple, ChartBar, ShieldCheck, Wrench, Cube, Flask,
  Robot, Truck, ArrowRight, ArrowUpRight, ArrowLeft, CaretDown, CaretRight, CaretLeft,
  Check, X, List, ShoppingCart, MagnifyingGlass, Phone, Envelope, MapPin, Plus, Minus,
  Play, Star, User, Lock, Bell, DownloadSimple, SquaresFour, Package, Clock, FileText,
  WhatsappLogo, Handshake, Target,
} from '@phosphor-icons/react';

/* Phosphor icon set, mapped to the site's semantic names so every existing
   <Icon name="..."/> call site keeps working. Domain/feature icons render in
   DUOTONE for a richer, two-tone look; line UI icons render bold; the Google
   mark keeps its brand colours. */

const MAP = {
  /* ── domain / services (duotone) ── */
  gear: Gear, cog: Gear, transformer: Lightning, oildrop: Drop, oilcan: Drop, recycle: Recycle,
  hydraulic: GasCan, fluid: Drop, weight: Barbell, gauge: Gauge, hook: Anchor,
  clipboardcheck: ClipboardText, soundwave: Waveform, crosshair: Crosshair, thermal: Thermometer,
  motor: Engine, waveform: Pulse, balance: Scales, cap: GraduationCap, bearing: CircleDashed,
  crane: Crane, sensor: Broadcast, flame: Fire, pipe: Pipe, chain: LinkSimple, analytics: ChartBar,
  shield: ShieldCheck, wrench: Wrench, cube: Cube, microscope: Flask, robot: Robot, truck: Truck,
  dashboard: SquaresFour, box: Package, file: FileText, clock: Clock, bell: Bell, user: User,
  lock: Lock, cart: ShoppingCart, search: MagnifyingGlass, phone: Phone, mail: Envelope,
  pin: MapPin, handshake: Handshake, target: Target, download: DownloadSimple,

  /* ── line UI (bold) ── */
  arrowRight: ArrowRight, arrowUpRight: ArrowUpRight, arrowLeft: ArrowLeft,
  chevronDown: CaretDown, chevronRight: CaretRight, chevronLeft: CaretLeft,
  check: Check, x: X, menu: List, plus: Plus, minus: Minus, play: Play,

  /* ── filled ── */
  star: Star, whatsapp: WhatsappLogo,
};

const BOLD = new Set(['arrowRight', 'arrowUpRight', 'arrowLeft', 'chevronDown', 'chevronRight', 'chevronLeft', 'check', 'x', 'menu', 'plus', 'minus', 'play']);
const FILL = new Set(['star', 'whatsapp']);

/* Google keeps its multi-colour brand mark */
const GoogleMark = ({ className }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
    <path d="M21 12.2c0-.7-.06-1.4-.18-2H12v3.9h5.05a4.3 4.3 0 0 1-1.87 2.82v2.34h3.02C19.96 17.6 21 15.1 21 12.2Z" fill="#4285F4" />
    <path d="M12 21c2.52 0 4.63-.83 6.18-2.26l-3.02-2.34c-.84.56-1.9.9-3.16.9-2.43 0-4.5-1.64-5.23-3.85H3.66v2.42A9 9 0 0 0 12 21Z" fill="#34A853" />
    <path d="M6.77 13.45a5.4 5.4 0 0 1 0-3.45V7.58H3.66a9 9 0 0 0 0 8.09l3.11-2.42Z" fill="#FBBC05" />
    <path d="M12 6.6c1.37 0 2.6.47 3.57 1.4l2.67-2.67A9 9 0 0 0 3.66 7.58l3.11 2.42C7.5 8.24 9.57 6.6 12 6.6Z" fill="#EA4335" />
  </svg>
);

export default function Icon({ name, className = '', strokeWidth, weight, ...rest }) {
  if (name === 'google') return <GoogleMark className={className} />;
  const C = MAP[name] || Gear;
  const w = weight || (FILL.has(name) ? 'fill' : BOLD.has(name) ? 'bold' : 'duotone');
  return <C className={className} weight={w} aria-hidden="true" {...rest} />;
}
