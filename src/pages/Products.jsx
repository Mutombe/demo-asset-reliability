import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import PageHero from '../components/PageHero';
import Icon from '../components/Icon';
import { autoLink } from '../components/ContentLink';
import { Reveal } from '../lib/motion';
import { useCart } from '../lib/cart';
import { products, productCats, money, catIcon } from '../data';

/* ambient theme-bleed masks — each card auto-tints to its own photo's colours */
const AMBIENT_MASK = 'linear-gradient(to bottom, transparent 34%, #000 70%)';
const COVER_FADE = 'linear-gradient(to bottom, #000 76%, transparent 100%)';

/* compact star rating (fills whole/half/empty against a 5-star track) */
export function Stars({ value = 0, className = '' }) {
  return (
    <span className={`inline-flex items-center gap-1 ${className}`}>
      <span className="relative inline-flex">
        <span className="inline-flex text-steel-700">{[0, 1, 2, 3, 4].map((i) => <Icon key={i} name="star" className="w-3.5 h-3.5" />)}</span>
        <span className="absolute inset-0 inline-flex overflow-hidden text-amber-400" style={{ width: `${(value / 5) * 100}%` }}>{[0, 1, 2, 3, 4].map((i) => <Icon key={i} name="star" className="w-3.5 h-3.5 shrink-0" />)}</span>
      </span>
      <span className="mono-label text-steel-400">{value.toFixed(1)}</span>
    </span>
  );
}

export function ProductCard({ p }) {
  const { addItem } = useCart();
  const low = /low/i.test(p.stock || '');
  const out = /out/i.test(p.stock || '');
  const add = (e) => {
    e.preventDefault(); e.stopPropagation();
    if (out) return;
    addItem({ id: p.id, name: p.name, price: p.price, image: p.image, cat: p.cat });
    toast.success(`${p.name} added to cart`);
  };
  return (
    <Link to={`/products/${p.id}`} className="group relative panel-bold lift overflow-hidden flex flex-col h-full">
      {/* 1. blurred saturated bleed behind the whole card */}
      <img src={p.image} aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full scale-125 object-cover opacity-25 blur-2xl saturate-150"
        style={{ maskImage: AMBIENT_MASK, WebkitMaskImage: AMBIENT_MASK }} />
      {/* 2. real cover photo, bottom edge faded out */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <img src={p.image} alt={p.name} loading="lazy"
          className="w-full h-full object-cover img-rich transition-transform duration-[1.1s] group-hover:scale-105"
          style={{ maskImage: COVER_FADE, WebkitMaskImage: COVER_FADE }} />
        <div className="absolute top-4 left-4 flex flex-col items-start gap-1.5">
          {p.tag && <span className="chip chip-red">{p.tag}</span>}
          <span className="glass inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 font-mono text-[0.6rem] uppercase tracking-[0.06em] font-medium text-white"><span className="w-1.5 h-1.5 rounded-full" style={{ background: out ? 'var(--color-crit)' : low ? 'var(--color-warn)' : 'var(--color-ok)' }} />{p.stock || 'In stock'}</span>
        </div>
        <span className="absolute top-4 right-4 grid place-items-center w-12 h-12 rounded-2xl glass text-white"><Icon name={catIcon(p.cat)} className="w-7 h-7" /></span>
        {/* quick-add — slides up on hover (desktop) */}
        <button onClick={add} disabled={out} aria-label={`Add ${p.name} to cart`}
          className="hidden sm:flex absolute bottom-4 right-4 items-center gap-1.5 btn btn-red !py-2 !px-3.5 text-[0.78rem] opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 disabled:opacity-0">
          <Icon name="cart" className="w-4 h-4" /> Quick add
        </button>
      </div>
      {/* 3. body overlaps the fade */}
      <div className="relative -mt-6 flex flex-1 flex-col px-6 pb-6">
        <div className="flex items-center justify-between gap-2">
          <p className="mono-label text-red-500 truncate">{p.brand || p.cat}</p>
          {p.rating ? <Stars value={p.rating} /> : null}
        </div>
        <h3 className="font-display font-semibold text-lg text-steel-50 leading-tight mt-1.5 flex-1 underline decoration-transparent group-hover:decoration-red-400 underline-offset-4 transition-colors">{p.name}</h3>
        <p className="font-mono text-[0.64rem] text-steel-500 mt-2">{p.sku}</p>
        <div className="flex items-end justify-between gap-2 mt-4 pt-4 bd-t-bold">
          <div className="min-w-0">
            <span className="font-display font-bold text-2xl text-red-500 tabnum">{money(p.price)}</span>
            <span className="block mono-label mt-0.5" style={{ color: out ? 'var(--color-crit)' : low ? 'var(--color-warn)' : 'var(--color-ok)' }}>{out ? 'Out of stock' : low ? 'Low stock — order soon' : 'In stock · ships 48h'}</span>
          </div>
          <button onClick={add} disabled={out} className="btn btn-steel !py-2.5 !px-4 text-[0.82rem] disabled:opacity-50 shrink-0"><Icon name="cart" className="w-4 h-4" /> Add</button>
        </div>
      </div>
    </Link>
  );
}

export default function Products() {
  const [cat, setCat] = useState('All');
  const [q, setQ] = useState('');
  const cats = useMemo(() => ['All', ...productCats.map((c) => c.name)], []);
  const shown = products.filter((p) => (cat === 'All' || p.cat === cat) && `${p.name} ${p.cat}`.toLowerCase().includes(q.trim().toLowerCase()));

  return (
    <>
      <PageHero kicker="The shop" icon="cart" title='Reliability products, <span class="text-red">in stock.</span>'
        sub="Bearings, lifting gear, lubrication, condition-monitoring instruments and more. Order online or over WhatsApp." image="/img/photos/gallery6.jpg" />

      <section className="section bg-steel">
        <div className="shell">
          {/* demo notice */}
          <Reveal>
            <div className="flex items-start gap-3 panel-800 p-4 mb-8">
              <span className="grid place-items-center w-9 h-9 rounded bg-red-500/12 text-red-400 shrink-0"><Icon name="cart" className="w-5 h-5" /></span>
              <p className="text-sm text-steel-300">{autoLink('Demonstration store with indicative pricing — bearings, lifting gear and condition monitoring instruments that pair with our reliability services. Add items to your cart, then check out with a mock payment or send your order to our team on WhatsApp.', { maxLinks: 3 })}</p>
            </div>
          </Reveal>

          {/* category tiles */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
            {productCats.map((c) => (
              <button key={c.name} onClick={() => setCat(cat === c.name ? 'All' : c.name)} className={`panel lift p-4 flex items-center gap-3 text-left transition-all ${cat === c.name ? '!border-red-500' : ''}`}>
                <span className={`grid place-items-center w-10 h-10 rounded shrink-0 ${cat === c.name ? 'bg-red-500 text-white' : 'bg-steel-800 text-red-500'}`}><Icon name={c.icon} className="w-5 h-5" /></span>
                <span className="font-display text-[0.82rem] text-steel-100 leading-tight">{c.name}</span>
              </button>
            ))}
          </div>

          {/* controls */}
          <div className="flex flex-col sm:flex-row items-center gap-3 mb-8">
            <label className="relative block w-full sm:max-w-xs">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-steel-400"><Icon name="search" className="w-5 h-5" /></span>
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search products…" className="input !pl-11" />
            </label>
            <div className="flex items-center gap-2 sm:ml-auto">
              <span className="mono-label text-steel-500">Filter:</span>
              <span className="chip chip-red">{cat}</span>
              {cat !== 'All' && <button onClick={() => setCat('All')} className="text-steel-400 hover:text-red-400"><Icon name="x" className="w-4 h-4" /></button>}
            </div>
          </div>

          <p className="mono-label text-steel-500 mb-5">{shown.length} product{shown.length !== 1 ? 's' : ''}</p>

          {shown.length === 0 ? (
            <div className="panel text-center py-16 px-6">
              <span className="grid place-items-center w-14 h-14 mx-auto rounded bg-steel-800 text-red-500 mb-5"><Icon name="box" className="w-7 h-7" /></span>
              <h3 className="font-display text-2xl text-steel-50">Nothing matches that.</h3>
              <p className="text-steel-400 mt-2">Try another category, or ask us to source it.</p>
              <Link to="/contact" className="btn btn-red mt-6">Request a quote</Link>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {shown.map((p, i) => <Reveal key={p.id} delay={(i % 4) * 0.04} className="h-full"><ProductCard p={p} /></Reveal>)}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
