import React, { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import Icon from '../components/Icon';
import { autoLink } from '../components/ContentLink';
import { Reveal, motion } from '../lib/motion';
import { useCart } from '../lib/cart';
import { products, productById, money, wa, brand, catIcon } from '../data';
import { ProductCard } from './Products';

/* ambient theme-bleed masks — the hero frame auto-tints to the product photo */
const AMBIENT_MASK = 'linear-gradient(to bottom, transparent 30%, #000 72%)';
const COVER_FADE = 'linear-gradient(to bottom, #000 82%, transparent 100%)';

function Stars({ rating }) {
  const full = Math.round(rating);
  return (
    <span className="inline-flex items-center gap-2">
      <span className="inline-flex text-red-500" aria-hidden="true">
        {[0, 1, 2, 3, 4].map((i) => (
          <Icon key={i} name="star" className={`w-4 h-4 ${i < full ? 'opacity-100' : 'opacity-25'}`} />
        ))}
      </span>
      <span className="mono-label text-steel-400">{Number(rating).toFixed(1)}</span>
    </span>
  );
}

const TRUST = [
  { icon: 'box', title: 'Nationwide delivery', desc: 'Dispatched from Harare across Zimbabwe.' },
  { icon: 'shield', title: '12-month warranty', desc: 'Genuine parts, backed and certified.' },
  { icon: 'whatsapp', title: 'Engineer support', desc: 'Talk specs with our team on WhatsApp.' },
];

export default function ProductDetail() {
  const { id } = useParams();
  const p = productById(id);
  const { addItem } = useCart();
  const [qty, setQty] = useState(1);

  const gallery = useMemo(() => (p ? (p.gallery && p.gallery.length ? p.gallery : [p.image]) : []), [p]);
  const [active, setActive] = useState(0);
  const related = useMemo(() => (p ? products.filter((x) => x.id !== p.id && x.cat === p.cat).concat(products.filter((x) => x.id !== p.id && x.cat !== p.cat)).slice(0, 4) : []), [p]);

  if (!p) {
    return (
      <section className="bg-steel pt-40 pb-24">
        <div className="shell">
          <div className="panel-bold text-center py-20 px-6 max-w-xl mx-auto">
            <span className="grid place-items-center w-16 h-16 mx-auto rounded-2xl bg-mist text-red-500 mb-6"><Icon name="box" className="w-8 h-8" /></span>
            <h1 className="font-display text-3xl text-steel-50">Product not found</h1>
            <p className="text-steel-400 mt-3">We couldn’t find that item. It may have been renamed or is no longer stocked.</p>
            <Link to="/products" className="btn btn-red mt-7"><Icon name="arrowLeft" className="w-4 h-4" /> Back to the shop</Link>
          </div>
        </div>
      </section>
    );
  }

  const hero = gallery[active] || p.image;
  const low = /low/i.test(p.stock || '');
  const add = () => { addItem({ id: p.id, name: p.name, price: p.price, image: p.image, cat: p.cat, qty }); toast.success(`${qty} × ${p.name} added to cart`); };
  const waMsg = `Hello ${brand.short}, I'm interested in the ${p.name} (${p.sku}) — ${money(p.price)}. Qty: ${qty}. Please share availability.`;

  return (
    <section className="bg-steel pt-32 md:pt-40 pb-16 md:pb-24">
      <div className="shell">
        {/* breadcrumb */}
        <nav className="flex flex-wrap items-center gap-2 mono-label text-steel-400 mb-8">
          <Link to="/" className="tlink">Home</Link>
          <Icon name="chevronRight" className="w-3.5 h-3.5 text-steel-500" />
          <Link to="/products" className="tlink">Products</Link>
          <Icon name="chevronRight" className="w-3.5 h-3.5 text-steel-500" />
          <span className="text-steel-50 truncate max-w-[60vw]">{p.name}</span>
        </nav>

        {/* main two-column */}
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start">
          {/* LEFT — image with ambient bleed */}
          <Reveal>
            <div className="lg:sticky lg:top-28">
              <div className="relative panel-bold overflow-hidden">
                <img src={hero} aria-hidden="true"
                  className="pointer-events-none absolute inset-0 h-full w-full scale-125 object-cover opacity-30 blur-2xl saturate-150"
                  style={{ maskImage: AMBIENT_MASK, WebkitMaskImage: AMBIENT_MASK }} />
                <div className="relative aspect-[4/3] overflow-hidden">
                  <motion.img key={hero} src={hero} alt={p.name}
                    initial={{ opacity: 0, scale: 1.03 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, ease: [0.2, 0.7, 0.3, 1] }}
                    className="w-full h-full object-cover img-rich"
                    style={{ maskImage: COVER_FADE, WebkitMaskImage: COVER_FADE }} />
                  {p.tag && <span className="absolute top-4 left-4 chip chip-red">{p.tag}</span>}
                  <span className="absolute top-4 right-4 grid place-items-center w-12 h-12 rounded-2xl glass text-white"><Icon name={catIcon(p.cat)} className="w-7 h-7" /></span>
                </div>
              </div>
              {gallery.length > 1 && (
                <div className="flex gap-3 mt-4">
                  {gallery.map((g, i) => (
                    <button key={g + i} onClick={() => setActive(i)} aria-label={`View image ${i + 1}`}
                      className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 transition-colors ${i === active ? 'border-red-500' : 'border-steel-700 hover:border-steel-500'}`}>
                      <img src={g} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </Reveal>

          {/* RIGHT — buy box */}
          <Reveal delay={0.05}>
            <div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                <span className="mono-label text-red-500">{p.brand}</span>
                <Stars rating={p.rating} />
                <span className="mono-label text-steel-500">SKU {p.sku}</span>
              </div>

              <h1 className="font-display text-3xl sm:text-4xl text-steel-50 leading-[1.04] mt-3">{p.name}</h1>

              <div className="flex items-center gap-3 mt-5">
                <span className="font-display font-bold text-4xl text-red-500 tabnum">{money(p.price)}</span>
                <span className={`chip ${low ? '' : 'chip-red'}`}>
                  <Icon name={low ? 'bell' : 'check'} className="w-3.5 h-3.5" />{p.stock}
                </span>
              </div>

              <p className="text-steel-300 mt-5 leading-relaxed">{autoLink(p.blurb, { maxLinks: 2, exclude: [p.name.toLowerCase()] })}</p>

              {/* quantity + actions */}
              <div className="flex flex-wrap items-center gap-4 mt-7">
                <div className="inline-flex items-center rounded-xl border-2 border-steel-700 bg-white">
                  <button onClick={() => setQty((n) => Math.max(1, n - 1))} className="grid place-items-center w-11 h-11 text-steel-50 hover:text-red-500" aria-label="Decrease quantity"><Icon name="minus" className="w-4 h-4" /></button>
                  <span className="w-12 text-center font-display text-lg text-steel-50 tabnum">{qty}</span>
                  <button onClick={() => setQty((n) => n + 1)} className="grid place-items-center w-11 h-11 text-steel-50 hover:text-red-500" aria-label="Increase quantity"><Icon name="plus" className="w-4 h-4" /></button>
                </div>
                <button onClick={add} className="btn btn-red flex-1 min-w-[12rem]"><Icon name="cart" className="w-5 h-5" /> Add to cart</button>
              </div>
              <a href={wa(waMsg)} target="_blank" rel="noreferrer" className="btn btn-outline-bold w-full mt-3"><Icon name="whatsapp" className="w-5 h-5" /> Order on WhatsApp</a>

              {/* trust row */}
              <div className="grid sm:grid-cols-3 gap-3 mt-8">
                {TRUST.map((t) => (
                  <div key={t.title} className="panel-800 p-4">
                    <span className="grid place-items-center w-10 h-10 rounded-xl bg-red-500/12 text-red-500 mb-3"><Icon name={t.icon} className="w-6 h-6" /></span>
                    <p className="font-display font-semibold text-[0.92rem] text-steel-50 leading-tight">{t.title}</p>
                    <p className="text-[0.82rem] text-steel-400 mt-1 leading-snug">{t.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>

        {/* features + specs */}
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 mt-16">
          <Reveal>
            <div>
              <p className="kicker has-icon mb-4"><Icon name="star" className="w-4 h-4" /> Key features</p>
              <ul className="grid sm:grid-cols-2 gap-3">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-3 panel p-4">
                    <span className="grid place-items-center w-7 h-7 rounded-lg bg-red-500/12 text-red-500 shrink-0 mt-0.5"><Icon name="check" className="w-4 h-4" /></span>
                    <span className="text-[0.92rem] text-steel-100 leading-snug">{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>

          <Reveal delay={0.05}>
            <div>
              <p className="kicker has-icon mb-4"><Icon name="clipboardcheck" className="w-4 h-4" /> Specifications</p>
              <div className="panel-bold overflow-hidden">
                <table className="w-full text-sm">
                  <tbody>
                    {p.specs.map(([label, value], i) => (
                      <tr key={label} className={i % 2 ? 'bg-mist' : 'bg-white'}>
                        <td className="mono-label text-steel-400 px-5 py-3.5 align-top w-1/2">{label}</td>
                        <td className="px-5 py-3.5 text-steel-50 font-medium text-right tabnum">{value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </Reveal>
        </div>

        {/* related */}
        {related.length > 0 && (
          <div className="mt-20">
            <div className="flex items-end justify-between gap-4 mb-6">
              <div>
                <p className="kicker has-icon mb-3"><Icon name="cart" className="w-4 h-4" /> More from the shop</p>
                <h2 className="font-display text-2xl sm:text-3xl text-steel-50">Related products</h2>
              </div>
              <Link to="/products" className="btn btn-outline-bold shrink-0 !hidden sm:!inline-flex">All products <Icon name="arrowRight" className="w-4 h-4" /></Link>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {related.map((r, i) => <Reveal key={r.id} delay={(i % 4) * 0.04} className="h-full"><ProductCard p={r} /></Reveal>)}
            </div>
            <Link to="/products" className="btn btn-outline-bold w-full mt-6 sm:hidden">All products <Icon name="arrowRight" className="w-4 h-4" /></Link>
          </div>
        )}
      </div>
    </section>
  );
}
