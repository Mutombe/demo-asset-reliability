import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import PageHero from '../components/PageHero';
import Icon from '../components/Icon';
import { useCart } from '../lib/cart';
import { payments, money, wa } from '../data';

export default function Checkout() {
  const { items, total, clear } = useCart();
  const [pay, setPay] = useState('ecocash');
  const [placed, setPlaced] = useState(false);
  const delivery = items.length ? 15 : 0;
  const grand = total + delivery;

  const waMsg = useMemo(() => 'Hello ARS, I would like to order:\n' + items.map((i) => `• ${i.qty} × ${i.name} — ${money(i.price * i.qty)}`).join('\n') + `\nTotal: ${money(grand)}`, [items, grand]);
  const place = (e) => { e.preventDefault(); setPlaced(true); clear(); toast.success('Order confirmed — this is a demonstration checkout.'); window.scrollTo({ top: 0, behavior: 'smooth' }); };

  if (placed) {
    return (
      <>
        <PageHero kicker="Checkout" title="Order confirmed." image="/img/photos/gallery5.jpg" />
        <section className="section bg-steel">
          <div className="shell max-w-xl">
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="panel-800 ticked p-8 md:p-10 text-center">
              <span className="inline-grid place-items-center w-16 h-16 rounded-md bg-red-500/12 text-red-400 mb-5"><Icon name="check" className="w-9 h-9" /></span>
              <h2 className="display-3 text-steel-50">Thank you.</h2>
              <p className="text-steel-400 mt-3 leading-relaxed">Your order has been received. In a live store you would now get an email confirmation and dispatch details. For this demonstration, no payment was taken.</p>
              <div className="flex flex-wrap justify-center gap-3 mt-7">
                <Link to="/products" className="btn btn-red">Continue shopping</Link>
                <Link to="/" className="btn btn-ghost">Back home</Link>
              </div>
            </motion.div>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <PageHero kicker="Checkout" title="Complete your order." sub="Enter your details and choose how to pay. This is a demonstration checkout, no real payment is processed." image="/img/photos/team1.jpg" />
      <section className="section bg-steel">
        <div className="shell">
          {items.length === 0 ? (
            <div className="panel p-12 text-center max-w-xl mx-auto">
              <span className="inline-grid place-items-center w-16 h-16 rounded-md bg-steel-800 text-red-500 mb-6"><Icon name="cart" className="w-8 h-8" /></span>
              <h2 className="display-3 text-steel-50">Your cart is empty</h2>
              <p className="text-steel-400 mt-2">Add products and they will appear here.</p>
              <Link to="/products" className="btn btn-red mt-6">Browse products</Link>
            </div>
          ) : (
            <div className="grid lg:grid-cols-[1.5fr_1fr] gap-6 lg:gap-8 items-start">
              <form onSubmit={place} className="panel p-6 md:p-8 space-y-8">
                <div>
                  <h2 className="font-display text-xl text-steel-50 mb-5 flex items-center gap-3"><span className="grid place-items-center w-7 h-7 rounded bg-red-500 text-white font-mono text-sm">1</span> Your details</h2>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div><label className="field-label">Full name</label><input required className="input" placeholder="Jane Moyo" /></div>
                    <div><label className="field-label">Company</label><input className="input" placeholder="Company (optional)" /></div>
                    <div><label className="field-label">Email</label><input required type="email" className="input" placeholder="you@company.com" /></div>
                    <div><label className="field-label">Phone</label><input required className="input" placeholder="+263 …" /></div>
                    <div className="sm:col-span-2"><label className="field-label">Delivery address</label><input required className="input" placeholder="Street, suburb, city" /></div>
                  </div>
                </div>
                <div>
                  <h2 className="font-display text-xl text-steel-50 mb-5 flex items-center gap-3"><span className="grid place-items-center w-7 h-7 rounded bg-red-500 text-white font-mono text-sm">2</span> Payment method</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {payments.map((m) => (
                      <button type="button" key={m.id} onClick={() => setPay(m.id)}
                        className={`relative rounded-md border p-3 h-[4.75rem] grid place-items-center transition-all ${pay === m.id ? 'border-red-500 bg-red-500/8' : 'border-steel-600 bg-white/95 hover:border-steel-400'}`}>
                        <img src={m.logo} alt={m.label} className="max-h-8 max-w-[80%] w-auto object-contain" />
                        {pay === m.id && <span className="absolute top-1.5 right-1.5 text-red-500"><Icon name="check" className="w-4 h-4" /></span>}
                      </button>
                    ))}
                  </div>
                  <p className="flex items-center gap-1.5 font-mono text-[0.72rem] text-steel-500 mt-3"><Icon name="lock" className="w-3.5 h-3.5" /> Secure mock checkout · no real payment is taken.</p>
                </div>
                <div className="space-y-3">
                  <button type="submit" className="btn btn-red w-full !py-4"><Icon name="shield" className="w-5 h-5" /> Place order · {money(grand)}</button>
                  <a href={wa(waMsg)} target="_blank" rel="noreferrer" className="btn btn-steel w-full !py-4"><Icon name="whatsapp" className="w-5 h-5" /> Order on WhatsApp instead</a>
                </div>
              </form>

              <aside className="panel p-6 lg:sticky lg:top-24">
                <h2 className="font-display text-lg text-steel-50 mb-5">Order summary</h2>
                <div className="space-y-4 max-h-[22rem] overflow-y-auto no-scrollbar pr-1">
                  {items.map((i) => (
                    <div key={i.id} className="flex gap-3">
                      <div className="w-14 h-14 rounded overflow-hidden bg-steel-800 shrink-0 relative border border-steel-700">
                        <img src={i.image} alt={i.name} className="w-full h-full object-cover duotone" />
                        <span className="absolute -top-1.5 -right-1.5 grid place-items-center w-5 h-5 rounded-full bg-red-500 text-white text-[0.62rem] font-bold ring-2 ring-steel-900 tabnum">{i.qty}</span>
                      </div>
                      <div className="flex-1 min-w-0"><p className="font-display text-sm text-steel-50 leading-tight">{i.name}</p><p className="mono-label text-steel-500 mt-0.5">{i.cat}</p></div>
                      <span className="font-display text-sm text-steel-50">{money(i.price * i.qty)}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-steel-700 mt-5 pt-4 space-y-2 text-sm">
                  <div className="flex justify-between text-steel-400"><span>Subtotal</span><span className="text-steel-100">{money(total)}</span></div>
                  <div className="flex justify-between text-steel-400"><span>Delivery</span><span className="text-steel-100">{money(delivery)}</span></div>
                  <div className="flex justify-between items-center pt-2 border-t border-steel-700 mt-2"><span className="font-display text-steel-50">Total</span><span className="font-display text-2xl text-red-500 tabnum">{money(grand)}</span></div>
                </div>
                <p className="mono-label text-steel-600 text-center mt-4">Demonstration store · prices indicative</p>
              </aside>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
