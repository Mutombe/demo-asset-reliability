// ─────────────────────────────────────────────────────────────
// Cross-linking map for the ARS "reliability wiki" interlinking
// system. Consumed by ContentLink + autoLink (see
// components/ContentLink.jsx). Keys are the keywords matched in
// body copy (case-insensitive, word-boundary, longest first).
//   { to:'/route' }            → internal react-router Link
//   { href:'https://…' }       → external <a target="_blank">
// Keep every `to` accurate to a real route in App.jsx / data.js.
// ─────────────────────────────────────────────────────────────

export const crossLinks = {
  // ── Condition monitoring services ──
  'vibration analysis': { to: '/services/vibration-analysis', label: 'Vibration Analysis' },
  'vibration monitoring': { to: '/services/vibration-analysis', label: 'Vibration Analysis' },
  'vibration': { to: '/services/vibration-analysis', label: 'Vibration Analysis' },
  'thermography': { to: '/services/thermography', label: 'Thermography' },
  'thermal imaging': { to: '/services/thermography', label: 'Thermography' },
  'infrared': { to: '/services/thermography', label: 'Thermography' },
  'ultrasound': { to: '/services/ultrasound', label: 'Ultrasound' },
  'leak detection': { to: '/services/ultrasound', label: 'Ultrasound leak detection' },
  'motor circuit analysis': { to: '/services/motor-circuit-analysis', label: 'Motor Circuit Analysis' },
  'motor testing': { to: '/services/motor-circuit-analysis', label: 'Motor Circuit Analysis' },
  'shaft laser alignment': { to: '/services/shaft-laser-alignment', label: 'Shaft Laser Alignment' },
  'laser alignment': { to: '/services/shaft-laser-alignment', label: 'Shaft Laser Alignment' },
  'shaft alignment': { to: '/services/shaft-laser-alignment', label: 'Shaft Laser Alignment' },
  'alignment': { to: '/services/shaft-laser-alignment', label: 'Shaft Laser Alignment' },

  // ── Fluid management services ──
  'transformer oil purification': { to: '/services/transformer-oil-purification', label: 'Transformer Oil Purification' },
  'transformer oil regeneration': { to: '/services/transformer-oil-regeneration', label: 'Transformer Oil Regeneration' },
  'oil regeneration': { to: '/services/transformer-oil-regeneration', label: 'Transformer Oil Regeneration' },
  'oil purification': { to: '/services/transformer-oil-purification', label: 'Oil Purification' },
  'transformer oil': { to: '/services/transformer-oil-purification', label: 'Transformer Oil Purification' },
  'hydraulic oil purification': { to: '/services/hydraulic-oil-purification', label: 'Hydraulic Oil Purification' },
  'hydraulic oil': { to: '/services/hydraulic-oil-purification', label: 'Hydraulic Oil Purification' },
  'total fluid management': { to: '/services/total-fluid-management', label: 'Total Fluid Management' },
  'fluid management': { to: '/services/total-fluid-management', label: 'Total Fluid Management' },
  'oil analysis': { to: '/services/total-fluid-management', label: 'Oil Analysis' },
  'lubrication': { to: '/services/total-fluid-management', label: 'Lubrication management' },

  // ── Lifting & load services ──
  'proof load testing': { to: '/services/proof-load-testing', label: 'Proof Load Testing' },
  'proof load': { to: '/services/proof-load-testing', label: 'Proof Load Testing' },
  'load testing': { to: '/services/proof-load-testing', label: 'Proof Load Testing' },
  'lifting equipment': { to: '/services/lifting-equipment-servicing', label: 'Lifting Equipment Servicing' },
  'statutory inspection': { to: '/services/statutory-inspection', label: 'Statutory Inspection' },
  'thorough examination': { to: '/services/statutory-inspection', label: 'Statutory Inspection' },
  'safe working load': { to: '/services/proof-load-testing', label: 'Proof Load Testing' },

  // ── Precision & training services ──
  'calibration': { to: '/services/calibration', label: 'Calibration' },
  'dynamic balancing': { to: '/services/dynamic-balancing', label: 'Dynamic Balancing' },
  'balancing': { to: '/services/dynamic-balancing', label: 'Dynamic Balancing' },
  'training': { to: '/services/training', label: 'Reliability Training' },

  // ── Cross-cutting concepts → services hub ──
  'condition monitoring': { to: '/services', label: 'Condition Monitoring' },
  'condition-based maintenance': { to: '/services', label: 'Condition-based maintenance' },
  'predictive maintenance': { to: '/services', label: 'Predictive maintenance' },
  'precision maintenance': { to: '/services', label: 'Precision maintenance' },
  'preventive maintenance': { to: '/services', label: 'Preventive maintenance' },
  'reliability engineering': { to: '/services', label: 'Reliability engineering' },
  'reliability': { to: '/services', label: 'Reliability engineering' },
  'our services': { to: '/services', label: 'Our services' },

  // ── Products (shop) ──
  'thermal imaging camera': { to: '/products/thermal-cam', label: 'Thermal Imaging Camera' },
  'accelerometer': { to: '/products/sensor-accel', label: 'Industrial Accelerometer' },
  'vibration meter': { to: '/products/vib-pen', label: 'Handheld Vibration Meter' },
  'grease gun': { to: '/products/grease-gun', label: 'Pneumatic Grease Gun' },
  'chain hoist': { to: '/products/chain-hoist', label: '2-Ton Chain Hoist' },
  'bearings': { to: '/products', label: 'Bearings' },
  'lifting gear': { to: '/products', label: 'Lifting gear' },
  'smart sensors': { to: '/products', label: 'Condition-monitoring sensors' },
  'products': { to: '/products', label: 'Products' },
  'online shop': { to: '/products', label: 'Online shop' },
  'the shop': { to: '/products', label: 'The shop' },

  // ── Key pages ──
  'insights': { to: '/insights', label: 'Insights' },
  'knowledge base': { to: '/insights', label: 'Knowledge base' },
  'client portal': { to: '/portal', label: 'Client Portal' },
  'portal': { to: '/portal', label: 'Client Portal' },
  'about us': { to: '/about', label: 'About ARS' },
  'contact us': { to: '/contact', label: 'Contact us' },
  'book a survey': { to: '/contact', label: 'Book a survey' },

  // ── External standards & references (open in a new tab) ──
  'ISO 20816': { href: 'https://www.iso.org/search.html?q=ISO%2020816', label: 'ISO 20816' },
  'ISO 10816': { href: 'https://www.iso.org/search.html?q=ISO%2010816', label: 'ISO 10816' },
  'ISO 4406': { href: 'https://www.iso.org/search.html?q=ISO%204406', label: 'ISO 4406' },
  'ISO 18436-2': { href: 'https://www.iso.org/search.html?q=ISO%2018436', label: 'ISO 18436-2' },
  'ISO 18436': { href: 'https://www.iso.org/search.html?q=ISO%2018436', label: 'ISO 18436' },
  'ISO 21940': { href: 'https://www.iso.org/search.html?q=ISO%2021940', label: 'ISO 21940' },
  'IEC 60422': { href: 'https://www.iso.org/search.html?q=IEC%2060422', label: 'IEC 60422' },
};

export default crossLinks;
