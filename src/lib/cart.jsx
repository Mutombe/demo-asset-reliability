import React, { createContext, useContext, useEffect, useMemo, useReducer, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Icon from '../components/Icon';
import { money, wa } from '../data';

const CartCtx = createContext(null);
export const useCart = () => useContext(CartCtx);
const KEY = 'ars-cart-v1';
const load = () => { try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch { return []; } };

function reducer(state, a) {
  switch (a.type) {
    case 'add': { const ex = state.find((i) => i.id === a.item.id); if (ex) return state.map((i) => i.id === a.item.id ? { ...i, qty: i.qty + (a.item.qty || 1) } : i); return [...state, { ...a.item, qty: a.item.qty || 1 }]; }
    case 'qty': return state.map((i) => i.id === a.id ? { ...i, qty: Math.max(1, a.qty) } : i);
    case 'remove': return state.filter((i) => i.id !== a.id);
    case 'clear': return [];
    default: return state;
  }
}

export function CartProvider({ children }) {
  const [items, dispatch] = useReducer(reducer, undefined, load);
  const [open, setOpen] = useState(false);
  useEffect(() => { localStorage.setItem(KEY, JSON.stringify(items)); }, [items]);
  useEffect(() => { document.body.style.overflow = open ? 'hidden' : ''; return () => { document.body.style.overflow = ''; }; }, [open]);
  const count = items.reduce((n, i) => n + i.qty, 0);
  const total = items.reduce((n, i) => n + i.price * i.qty, 0);
  const value = useMemo(() => ({
    items, count, total, open,
    addItem: (item) => { dispatch({ type: 'add', item }); setOpen(true); },
    setQty: (id, qty) => dispatch({ type: 'qty', id, qty }),
    remove: (id) => dispatch({ type: 'remove', id }),
    clear: () => dispatch({ type: 'clear' }),
    openCart: () => setOpen(true), closeCart: () => setOpen(false),
  }), [items, count, total, open]);
  return <CartCtx.Provider value={value}>{children}<CartDrawer /></CartCtx.Provider>;
}

function CartDrawer() {
  const { items, total, open, closeCart, setQty, remove } = useCart();
  const waMsg = 'Hello ARS, I would like to order:\n' + items.map((i) => `• ${i.qty} × ${i.name} — ${money(i.price * i.qty)}`).join('\n') + `\n\nTotal: ${money(total)}`;
  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[90]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={closeCart} style={{ background: 'rgba(10,12,16,.7)', backdropFilter: 'blur(4px)' }}>
          <motion.aside onClick={(e) => e.stopPropagation()} initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'tween', duration: 0.32, ease: [0.2, 0.7, 0.3, 1] }}
            className="absolute right-0 top-0 h-full w-full max-w-[27rem] bg-steel-900 border-l border-steel-700 flex flex-col shadow-2xl">
            <div className="flex items-center justify-between px-6 py-5 border-b border-steel-700">
              <p className="font-display font-semibold text-xl text-steel-50">Your cart <span className="font-mono text-steel-400 text-sm">[{items.reduce((n, i) => n + i.qty, 0)}]</span></p>
              <button onClick={closeCart} className="grid place-items-center w-9 h-9 rounded bg-steel-800 text-steel-200 hover:text-white" aria-label="Close"><Icon name="x" className="w-5 h-5" /></button>
            </div>
            {items.length === 0 ? (
              <div className="flex-1 grid place-items-center text-center px-8">
                <div>
                  <span className="inline-grid place-items-center w-16 h-16 rounded bg-steel-800 text-red-500 mb-4"><Icon name="cart" className="w-8 h-8" /></span>
                  <p className="font-display text-lg text-steel-50">Your cart is empty</p>
                  <p className="text-sm text-steel-400 mt-1">Add products from the shop to get started.</p>
                  <Link to="/products" onClick={closeCart} className="btn btn-red mt-6">Browse products</Link>
                </div>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 no-scrollbar">
                  {items.map((i) => (
                    <div key={i.id} className="flex gap-3.5">
                      <div className="w-18 h-18 w-[4.5rem] h-[4.5rem] rounded overflow-hidden bg-steel-800 shrink-0 border border-steel-700"><img src={i.image} alt={i.name} className="w-full h-full object-cover" /></div>
                      <div className="flex-1 min-w-0">
                        <p className="font-display text-sm text-steel-50 leading-tight">{i.name}</p>
                        <p className="font-mono text-[0.72rem] text-steel-400 mt-0.5">{i.cat}</p>
                        <div className="flex items-center justify-between mt-2">
                          <div className="inline-flex items-center rounded border border-steel-600">
                            <button onClick={() => setQty(i.id, i.qty - 1)} className="grid place-items-center w-7 h-7 text-steel-200 hover:text-red-400"><Icon name="minus" className="w-3.5 h-3.5" /></button>
                            <span className="w-7 text-center text-sm tabnum text-steel-100">{i.qty}</span>
                            <button onClick={() => setQty(i.id, i.qty + 1)} className="grid place-items-center w-7 h-7 text-steel-200 hover:text-red-400"><Icon name="plus" className="w-3.5 h-3.5" /></button>
                          </div>
                          <span className="font-display text-sm text-steel-50 tabnum">{money(i.price * i.qty)}</span>
                        </div>
                      </div>
                      <button onClick={() => remove(i.id)} className="text-steel-400 hover:text-red-400 self-start" aria-label="Remove"><Icon name="x" className="w-4 h-4" /></button>
                    </div>
                  ))}
                </div>
                <div className="border-t border-steel-700 px-6 py-5 space-y-3">
                  <div className="flex items-center justify-between"><span className="text-steel-400 text-sm mono-label">Subtotal</span><span className="font-display text-xl text-steel-50 tabnum">{money(total)}</span></div>
                  <Link to="/checkout" onClick={closeCart} className="btn btn-red w-full">Checkout <Icon name="arrowRight" className="w-4 h-4" /></Link>
                  <a href={wa(waMsg)} target="_blank" rel="noreferrer" className="btn btn-steel w-full"><Icon name="whatsapp" className="w-5 h-5" /> Order on WhatsApp</a>
                  <p className="font-mono text-[0.66rem] text-steel-500 text-center uppercase tracking-wide">Demonstration store · prices indicative</p>
                </div>
              </>
            )}
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
