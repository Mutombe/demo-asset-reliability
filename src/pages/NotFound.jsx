import React from 'react';
import { Link } from 'react-router-dom';
import Icon from '../components/Icon';

export default function NotFound() {
  return (
    <section className="relative min-h-[85vh] grid place-items-center grad-steel text-steel-50 overflow-hidden pt-32 pb-20">
      <div className="absolute inset-0 grid-tech opacity-60" aria-hidden />
      <div className="absolute inset-0 glow-red-c opacity-70" aria-hidden />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-red-500/8" aria-hidden><Icon name="gear" className="w-[26rem] h-[26rem] animate-spin-slow" strokeWidth={0.5} /></div>
      <div className="relative shell text-center max-w-lg">
        <p className="font-display text-[7rem] md:text-[10rem] leading-none text-red-400 tabnum">404</p>
        <h1 className="display-3 text-white mt-2">This asset is offline.</h1>
        <p className="lead !text-white/70 mt-4">The page you are looking for could not be found. Let’s get you back to something that works.</p>
        <div className="flex flex-wrap justify-center gap-3 mt-8">
          <Link to="/" className="btn btn-red">Back home</Link>
          <Link to="/services" className="btn btn-glass">Our services</Link>
        </div>
      </div>
    </section>
  );
}
