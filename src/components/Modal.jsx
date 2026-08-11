import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from './Icon';

/* Reusable centered modal dialog: dim + blur backdrop, spring-in card,
   Escape / click-outside to close. Card is light (steel-950 = near-white). */
export default function Modal({ open, onClose, children, maxW = 'max-w-md', closable = true }) {
  useEffect(() => {
    if (!open || !closable) return;
    const h = (e) => e.key === 'Escape' && onClose?.();
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [open, onClose, closable]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[70] grid place-items-center p-4 overflow-y-auto bg-black/55 backdrop-blur-md"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={() => closable && onClose?.()}
        >
          <motion.div
            className={`relative w-full ${maxW} my-8 bg-steel-950 border border-steel-800 rounded-2xl shadow-[0_30px_80px_-20px_rgba(0,0,0,.6)] overflow-hidden`}
            initial={{ opacity: 0, y: 24, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 24, scale: 0.98 }}
            transition={{ type: 'spring', damping: 26, stiffness: 280 }}
            onClick={(e) => e.stopPropagation()}
          >
            {closable && onClose && (
              <button onClick={onClose} aria-label="Close" className="absolute top-3 right-3 grid place-items-center w-9 h-9 rounded-md text-steel-400 hover:text-red-400 hover:bg-steel-850 transition z-10">
                <Icon name="x" className="w-5 h-5" />
              </button>
            )}
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
