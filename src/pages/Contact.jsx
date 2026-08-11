import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import PageHero from '../components/PageHero';
import Icon from '../components/Icon';
import { Reveal, motion } from '../lib/motion';
import { brand, services, wa, faqs } from '../data';

const ADDRESS_Q = '7%20Justice%20Morton%20Ave%2C%20Belvedere%2C%20Harare%2C%20Zimbabwe';
const DIRECTIONS = `https://www.google.com/maps/dir/?api=1&destination=7%20Justice%20Morton%20Ave%2C%20Belvedere%2C%20Harare`;

const contactRows = [
  { icon: 'phone', label: 'Phone', value: brand.phone, href: `tel:${brand.phone.replace(/\s/g, '')}` },
  { icon: 'phone', label: 'Mobile', value: brand.phone2, href: `tel:${brand.phone2.replace(/\s/g, '')}` },
  { icon: 'mail', label: 'Email', value: brand.email, href: `mailto:${brand.email}` },
  { icon: 'pin', label: 'Office', value: brand.address, href: DIRECTIONS, external: true },
  { icon: 'clock', label: 'Hours', value: brand.hours },
];

const interests = [
  'Condition Monitoring',
  'Fluid Management',
  'Lifting & Load',
  'Calibration',
  'Training',
  'Products',
  'Not sure',
];

/* ─────────────── LEFT: contact details ─────────────── */
function ContactDetails() {
  return (
    <div className="panel ticked p-6 sm:p-8 h-full flex flex-col">
      <p className="mono-label text-steel-500 mb-6">Reach the reliability desk</p>

      <div className="space-y-2.5">
        {contactRows.map((r) => {
          const Row = r.href ? 'a' : 'div';
          const linkProps = r.href
            ? { href: r.href, ...(r.external ? { target: '_blank', rel: 'noreferrer' } : {}) }
            : {};
          return (
            <Row
              key={r.label}
              {...linkProps}
              className={`group flex items-start gap-4 rounded-md p-3 -mx-1 transition-colors ${r.href ? 'hover:bg-steel-800' : ''}`}
            >
              <span className="grid place-items-center w-11 h-11 rounded-md bg-steel-800 border border-steel-700 text-red-500 shrink-0 group-hover:bg-red-500 group-hover:text-white transition-colors">
                <Icon name={r.icon} className="w-5 h-5" strokeWidth={1.6} />
              </span>
              <span className="min-w-0">
                <span className="field-label !mb-1">{r.label}</span>
                <span className={`block text-steel-100 font-display text-[0.98rem] leading-snug break-words ${r.href ? 'group-hover:text-red-400 transition-colors' : ''}`}>
                  {r.value}
                </span>
              </span>
            </Row>
          );
        })}
      </div>

      <a
        href={wa('Hello ARS, I would like to book a condition monitoring survey.')}
        target="_blank"
        rel="noreferrer"
        className="btn btn-red w-full mt-7 !py-3.5"
      >
        <Icon name="whatsapp" className="w-5 h-5" /> Chat on WhatsApp
      </a>

      {/* reassurance */}
      <div className="flex items-start gap-3 mt-6 pt-6 border-t border-steel-700">
        <span className="text-red-500 shrink-0 mt-0.5"><Icon name="shield" className="w-5 h-5" /></span>
        <p className="text-sm text-steel-400 leading-relaxed">
          Trusted by Zimbabwe's biggest names in mining and manufacturing. A reliability engineer, not a call centre, answers your enquiry.
        </p>
      </div>

      {/* service chips */}
      <div className="mt-7">
        <p className="mono-label text-steel-500 mb-3">What can we help with?</p>
        <div className="flex flex-wrap gap-2">
          {services.map((s) => (
            <span key={s.slug} className="chip">{s.name}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─────────────── RIGHT: enquiry form ─────────────── */
function EnquiryForm() {
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    toast.success('Enquiry received. A reliability engineer will be in touch shortly.');
    setSent(true);
  };

  if (sent) {
    return (
      <div className="panel-800 ticked p-6 sm:p-8 h-full flex flex-col items-center justify-center text-center min-h-[420px]">
        <motion.span
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: [0.2, 0.7, 0.3, 1] }}
          className="grid place-items-center w-16 h-16 rounded-md grad-red text-white mb-6"
        >
          <Icon name="check" className="w-8 h-8" strokeWidth={2} />
        </motion.span>
        <h3 className="display-3 text-steel-50">Enquiry received.</h3>
        <p className="text-steel-400 mt-3 max-w-sm leading-relaxed">
          Thank you. A reliability engineer will review your plant details and get back to you fast, usually within one business day.
        </p>
        <button onClick={() => setSent(false)} className="btn btn-steel mt-7">
          <Icon name="arrowLeft" className="w-4 h-4" /> Send another enquiry
        </button>
        <p className="mono-label text-steel-600 mt-6">This is a demonstration form, no message is actually sent.</p>
      </div>
    );
  }

  return (
    <div className="panel-800 ticked p-6 sm:p-8 h-full">
      <div className="flex items-center justify-between mb-6">
        <p className="font-mono text-xs text-steel-400 uppercase tracking-wide">Book a survey</p>
        <span className="chip chip-red"><span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse-dot" /> Enquiry</span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="name" className="field-label">Name</label>
            <input id="name" name="name" type="text" required autoComplete="name" placeholder="Your name" className="input" />
          </div>
          <div>
            <label htmlFor="company" className="field-label">Company</label>
            <input id="company" name="company" type="text" autoComplete="organization" placeholder="Company or plant" className="input" />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="email" className="field-label">Email</label>
            <input id="email" name="email" type="email" required autoComplete="email" placeholder="you@company.co.zw" className="input" />
          </div>
          <div>
            <label htmlFor="phone" className="field-label">Phone</label>
            <input id="phone" name="phone" type="tel" autoComplete="tel" placeholder="+263 ..." className="input" />
          </div>
        </div>

        <div>
          <label htmlFor="interest" className="field-label">Interest</label>
          <div className="relative">
            <select id="interest" name="interest" defaultValue="" required className="input appearance-none pr-10 cursor-pointer">
              <option value="" disabled>Select an area</option>
              {interests.map((i) => (
                <option key={i} value={i}>{i}</option>
              ))}
            </select>
            <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-steel-400">
              <Icon name="chevronDown" className="w-4 h-4" />
            </span>
          </div>
        </div>

        <div>
          <label htmlFor="message" className="field-label">Message</label>
          <textarea id="message" name="message" rows={5} placeholder="Tell us about your plant, your critical assets and what you would like to prevent." className="input resize-y" />
        </div>

        <button type="submit" className="btn btn-red w-full !py-3.5">
          Send enquiry <Icon name="arrowRight" className="w-4 h-4" />
        </button>

        <p className="mono-label text-steel-600 text-center pt-1">This is a demonstration form, no message is actually sent.</p>
      </form>
    </div>
  );
}

/* ─────────────── MAP / OFFICE ─────────────── */
function OfficeMap() {
  return (
    <section className="section bg-steel-900 relative overflow-hidden">
      <div className="absolute inset-0 grid-fine opacity-40" aria-hidden />
      <div className="relative shell">
        <div className="flex flex-wrap items-end justify-between gap-6 mb-9">
          <div className="max-w-xl">
            <Reveal><p className="kicker has-icon mb-5"><Icon name="pin" className="w-4 h-4" /> Find us</p></Reveal>
            <Reveal delay={0.05}><h2 className="display-2 text-steel-50">Our office in <span className="text-red">Belvedere.</span></h2></Reveal>
          </div>
          <Reveal delay={0.1}>
            <a href={DIRECTIONS} target="_blank" rel="noreferrer" className="btn btn-ghost">
              <Icon name="pin" className="w-4 h-4" /> Get directions
            </a>
          </Reveal>
        </div>

        <Reveal delay={0.1}>
          <div className="panel ticked p-3 sm:p-4">
            <div className="rounded-lg overflow-hidden aspect-[16/9] lg:aspect-[16/7] bg-steel-800 border border-steel-700">
              <iframe
                title="Asset Reliability Services office, 7 Justice Morton Ave, Belvedere, Harare"
                src={`https://www.google.com/maps?q=${ADDRESS_Q}&output=embed`}
                className="w-full h-full grayscale-[0.2]"
                style={{ border: 0, filter: 'invert(0.06) contrast(1.05)' }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3 px-2 pt-4 pb-1">
              <div className="flex items-center gap-3">
                <span className="grid place-items-center w-9 h-9 rounded-md bg-steel-800 border border-steel-700 text-red-500 shrink-0">
                  <Icon name="pin" className="w-4 h-4" />
                </span>
                <p className="text-steel-200 text-sm font-display">{brand.address}</p>
              </div>
              <a href={DIRECTIONS} target="_blank" rel="noreferrer" className="link-underline text-steel-100 inline-flex items-center gap-2 pb-1 text-sm">
                Open in Google Maps <Icon name="arrowUpRight" className="w-4 h-4" />
              </a>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ─────────────── FAQ ─────────────── */
function Faq() {
  return (
    <section className="section bg-steel">
      <div className="shell">
        <div className="max-w-2xl mb-11">
          <Reveal><p className="kicker has-icon mb-5"><Icon name="clipboardcheck" className="w-4 h-4" /> Before you ask</p></Reveal>
          <Reveal delay={0.05}><h2 className="display-2 text-steel-50">Frequently asked <span className="text-red">questions.</span></h2></Reveal>
        </div>
        <div className="grid lg:grid-cols-2 gap-4">
          {faqs.map((f, i) => (
            <Reveal key={f.q} delay={(i % 2) * 0.06} className="h-full">
              <div className="panel h-full p-6 border-l-2 border-l-red-500">
                <div className="flex items-start gap-3">
                  <span className="font-mono text-sm text-steel-600 tabnum mt-0.5">{String(i + 1).padStart(2, '0')}</span>
                  <div>
                    <h3 className="font-display text-lg text-steel-50 leading-snug">{f.q}</h3>
                    <p className="text-sm text-steel-400 mt-2.5 leading-relaxed">{f.a}</p>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function Contact() {
  return (
    <>
      <PageHero
        kicker="Get in touch"
        icon="mail"
        title='Book a survey. <span class="text-red">Prevent a failure.</span>'
        sub="Tell us about your plant and your assets. A reliability engineer will get back to you fast."
        image="/img/photos/cta.jpg"
      />

      <section className="section bg-steel">
        <div className="shell">
          <div className="grid lg:grid-cols-[1fr_1.15fr] gap-6 lg:gap-8 items-stretch">
            <Reveal className="h-full"><ContactDetails /></Reveal>
            <Reveal delay={0.08} className="h-full"><EnquiryForm /></Reveal>
          </div>
        </div>
      </section>

      <OfficeMap />
      <Faq />
    </>
  );
}
