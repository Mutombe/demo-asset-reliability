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

export function ProductCard({ p }) {
  const { addItem } = useCart();
  const add = (e) => {
    e.preventDefault(); e.stopPropagation();
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
        {p.tag && <span className="absolute top-4 left-4 chip chip-red">{p.tag}</span>}
        <span className="absolute top-4 right-4 grid place-items-center w-12 h-12 rounded-2xl glass text-white"><Icon name={catIcon(p.cat)} className="w-7 h-7" /></span>
      </div>
      {/* 3. body overlaps the fade */}
      <div className="relative -mt-6 flex flex-1 flex-col px-6 pb-6">
        <p className="mono-label text-red-500">{p.cat}</p>
        <h3 className="font-display font-semibold text-lg text-steel-50 leading-tight mt-1.5 flex-1 underline decoration-transparent group-hover:decoration-red-400 underline-offset-4 transition-colors">{p.name}</h3>
        <div className="flex items-center justify-between gap-2 mt-5 pt-5 bd-t-bold">
          <span className="font-display font-bold text-2xl text-red-500 tabnum">{money(p.price)}</span>
          <button onClick={add} className="btn btn-steel !py-2.5 !px-4 text-[0.82rem]"><Icon name="cart" className="w-4 h-4" /> Add</button>
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
