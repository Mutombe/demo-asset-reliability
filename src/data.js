/* ============ ASSET RELIABILITY SERVICES (Pvt) Ltd ============
   Zimbabwe's precision maintenance & condition monitoring engineers.
   "All failures are preventable." Data sourced from ars.co.zw + brief. */

export const brand = {
  name: 'Asset Reliability Services',
  short: 'ARS',
  legal: 'Asset Reliability Services (Pvt) Ltd',
  tagline: 'Trusted Partners. Innovative Solutions.',
  promise: 'All failures are preventable.',
  positioning: 'We help companies build wealth and a distinctive competitive advantage through world-class precision maintenance and reliability tools.',
  phone: '+263 242 571 023',
  phone2: '+263 77 314 5386',
  phoneRaw: '263242571023',
  waNumber: '263773145386',
  email: 'info@ars.co.zw',
  address: '7 Justice Morton Ave, Belvedere, Harare, Zimbabwe',
  hours: 'Mon–Fri 08:00–17:00',
  socials: [['whatsapp', '#'], ['mail', 'mailto:info@ars.co.zw'], ['phone', 'tel:+263242571023']],
};
export const wa = (msg) => `https://wa.me/${brand.waNumber}?text=${encodeURIComponent(msg)}`;

export const nav = [
  { label: 'Services', to: '/services' },
  { label: 'Products', to: '/products' },
  { label: 'Insights', to: '/insights' },
  { label: 'About', to: '/about' },
  { label: 'Contact', to: '/contact' },
];

export const serviceCats = ['Condition Monitoring', 'Fluid Management', 'Lifting & Load', 'Precision & Training'];

/* ---- SERVICES (15) ----
   Each service carries a detail-page payload: overview, deliverables,
   steps, benefits, specs and faqs. Keep base fields (slug/name/cat/icon/
   image/tag/blurb) intact — Services.jsx cards read them. */
export const services = [
  {
    slug: 'vibration-analysis', name: 'Vibration Analysis', cat: 'Condition Monitoring', icon: 'waveform', image: '/img/photos/vibration.jpg', tag: 'Online & offline',
    blurb: 'Our vibration analysts deliver accurate findings and actionable recommendations, catching bearing, misalignment and imbalance faults long before failure.',
    overview: 'Route-based and online vibration monitoring reads the mechanical signature of every rotating machine on your plant. Our certified analysts separate bearing defects, misalignment, imbalance and looseness from normal running — then tell you exactly which component to touch, and when.',
    deliverables: ['Full spectrum and time-waveform capture on all critical points', 'Bearing-defect (enveloping) and gear-mesh analysis', 'Fault severity graded against ISO 20816 vibration zones', 'Trended history so you see a fault developing, not just today', 'A prioritised action list — component, cause and lead-time', 'Optional permanent online sensors for round-the-clock assets'],
    steps: [{ title: 'Baseline', desc: 'We map measurement points and record a healthy reference for every machine.' }, { title: 'Capture', desc: 'Tri-axial readings taken on a scheduled route or streamed from online sensors.' }, { title: 'Diagnose', desc: 'Analysts interpret spectra and waveforms to name the fault and its severity.' }, { title: 'Report', desc: 'You receive a ranked action list with the failure lead-time — never raw data.' }],
    benefits: ['Catch bearing and gear faults weeks to months before failure', 'Plan repairs into shutdowns instead of reacting to breakdowns', 'Verify repairs and new installs actually fixed the problem'],
    specs: [['Standard', 'ISO 20816 / 10816'], ['Detection lead-time', 'Weeks to months'], ['Frequency range', '0.5 Hz – 20 kHz'], ['Turnaround', 'Report in 24–48 h'], ['Delivery', 'On-site route or online']],
    faqs: [{ q: 'How often should machines be monitored?', a: 'Critical assets suit a four-weekly route or permanent online sensors; balance-of-plant is typically eight to twelve weekly. We set the interval to each machine’s criticality.' }, { q: 'Can you monitor slow-speed equipment?', a: 'Yes. We use enveloping and low-frequency techniques to diagnose bearings on kiln, mill and conveyor drives turning under 60 rpm.' }],
  },
  {
    slug: 'thermography', name: 'Thermography', cat: 'Condition Monitoring', icon: 'thermal', image: '/img/photos/thermography.jpg', tag: 'Thermal anomaly inspection',
    blurb: 'A professional, reliable team for your entire thermal anomaly inspection, pinpointing hot spots in electrical and mechanical systems.',
    overview: 'Infrared surveys make invisible heat visible. We scan electrical distribution, motors, bearings and mechanical drives under load to find the loose connection, overloaded circuit or failing component quietly heating up toward failure — or fire.',
    deliverables: ['Radiometric thermal images of every scanned asset', 'Temperature rise (delta-T) measured against a reference', 'Severity classified — monitor, plan, or act now', 'Root-cause note per anomaly (load, connection, cooling)', 'Photo-paired report your insurers and auditors accept', 'Follow-up scan to confirm the repair now runs cool'],
    steps: [{ title: 'Load check', desc: 'We confirm circuits and machines run under representative load so faults show.' }, { title: 'Scan', desc: 'A calibrated radiometric camera captures switchgear, motors and drives.' }, { title: 'Classify', desc: 'Each hot spot is graded by temperature rise and criticality.' }, { title: 'Report', desc: 'Prioritised anomalies with thermal and visible images, plus a recommended action.' }],
    benefits: ['Prevent electrical fires and unplanned outages', 'No shutdown — surveyed live, under normal load', 'Satisfies insurer and statutory electrical inspection needs'],
    specs: [['Standard', 'ISO 18434 / NETA'], ['Thermal sensitivity', '< 40 mK'], ['Detects', 'Loose joints, overloads, hot bearings'], ['Turnaround', 'Report in 24–48 h'], ['Delivery', 'On-site, live under load']],
    faqs: [{ q: 'Does the plant need to shut down?', a: 'No — the opposite. Thermography works best with equipment running under normal or higher load, so surveys happen live with zero production loss.' }, { q: 'What do you scan?', a: 'Main intake and MCC switchgear, transformers, motors, cable joints, bearings, couplings, steam traps — any surface where abnormal heat signals a fault.' }],
  },
  {
    slug: 'ultrasound', name: 'Ultrasound', cat: 'Condition Monitoring', icon: 'soundwave', image: '/img/photos/ultrasound.jpg', tag: 'Leading provider',
    blurb: 'Asset Reliability Services is the leading service provider in ultrasound condition monitoring, detecting leaks, arcing and lubrication faults early.',
    overview: 'Airborne and structure-borne ultrasound detects the high-frequency sound of trouble long before it is audible or hot. We pinpoint compressed-air and gas leaks, electrical arcing and corona, steam-trap faults and the earliest signs of bearing lubrication distress.',
    deliverables: ['Leak survey with the location, size and cost of each loss', 'Electrical arcing, tracking and corona detection', 'Acoustic bearing condition and precision-lubrication guidance', 'Steam-trap and valve pass / fail assessment', 'A tagged, costed leak register for the workshop', 'Compressed-air savings estimate in kWh and dollars'],
    steps: [{ title: 'Survey', desc: 'We sweep air lines, switchgear and rotating assets with a directional detector.' }, { title: 'Locate', desc: 'Faults are pinpointed to the exact fitting, joint or component.' }, { title: 'Quantify', desc: 'Leaks are sized and costed; bearing and electrical faults are graded.' }, { title: 'Report', desc: 'A tagged, prioritised register with repair actions and expected savings.' }],
    benefits: ['Slash compressed-air energy waste — often the biggest quick win', 'Find electrical faults invisible to thermography', 'Lubricate bearings by sound — never over- or under-greasing'],
    specs: [['Standard', 'ISO 18436-8'], ['Detects', 'Leaks, arcing, bearing wear'], ['Frequency', '20 – 100 kHz'], ['Turnaround', 'Report in 24–48 h'], ['Delivery', 'On-site survey']],
    faqs: [{ q: 'Why ultrasound as well as vibration?', a: 'Ultrasound catches lubrication and very early bearing distress before it shows in vibration, and finds air leaks and electrical faults the other tools miss. They complement each other.' }, { q: 'How much can leak detection save?', a: 'Compressed air is one of the most expensive utilities in a plant. A single survey typically finds leaks worth thousands of dollars a year in wasted generation.' }],
  },
  {
    slug: 'motor-circuit-analysis', name: 'Motor Circuit Analysis (MCA)', cat: 'Condition Monitoring', icon: 'motor', image: '/img/photos/motors.jpg', tag: 'Comprehensive testing',
    blurb: 'Comprehensive electrical motor testing, evaluating insulation, windings and rotor health to prevent unplanned electrical failures.',
    overview: 'De-energised and energised electrical testing that looks inside your motors. MCA evaluates insulation, windings, connections and rotor bars to reveal faults that vibration alone cannot see — before an unplanned electrical failure stops the line.',
    deliverables: ['Static (de-energised) winding and insulation results', 'Dynamic (energised) power and current-signature analysis', 'Rotor-bar and air-gap condition assessment', 'Insulation-to-ground and phase-balance readings', 'A trended motor health index per unit', 'A repair, rewind or run recommendation with severity'],
    steps: [{ title: 'Static test', desc: 'De-energised measurement of resistance, impedance, inductance and insulation.' }, { title: 'Dynamic test', desc: 'Energised power analysis and current-signature capture under load.' }, { title: 'Assess', desc: 'Winding, connection, rotor and power-quality faults are identified and graded.' }, { title: 'Report', desc: 'A motor health index with a clear repair, rewind or run recommendation.' }],
    benefits: ['See winding and rotor faults vibration cannot detect', 'Test spares before they go on the shelf or into service', 'Avoid the cost and downtime of a failed critical drive'],
    specs: [['Tests', 'Static + dynamic (ESA / MCSA)'], ['Assesses', 'Insulation, windings, rotor, power'], ['Range', 'LV & MV motors'], ['Turnaround', 'Report in 24–48 h'], ['Delivery', 'On-site testing']],
    faqs: [{ q: 'Does the motor need to be disconnected?', a: 'Static testing is done de-energised at the motor or MCC; dynamic testing is done live under load. We combine both for a complete picture.' }, { q: 'Can you test spare motors?', a: 'Yes. Testing spares before installation catches storage damage and winding faults, so you never fit a bad motor during a breakdown.' }],
  },
  {
    slug: 'shaft-laser-alignment', name: 'Shaft Laser Alignment', cat: 'Condition Monitoring', icon: 'crosshair', image: '/img/photos/laser.jpg', tag: 'Move once, shim once',
    blurb: 'Align with the best. Precision laser alignment that gets it right the first time, extending seal, bearing and coupling life.',
    overview: 'Precision laser shaft alignment corrects the number-one cause of premature bearing, seal and coupling failure. We align coupled machines to tight tolerance, account for thermal growth and soft foot, and hand you a before-and-after certificate — move once, shim once.',
    deliverables: ['Soft-foot check and correction before alignment', 'Horizontal and vertical alignment to tolerance', 'Thermal-growth (target) compensation for hot running', 'Live shim and move values — no trial and error', 'A before / after alignment certificate', 'Coupling and baseplate condition note'],
    steps: [{ title: 'Inspect', desc: 'We check coupling, baseplate and correct soft foot first.' }, { title: 'Measure', desc: 'Laser heads read true shaft position through rotation.' }, { title: 'Align', desc: 'Guided vertical and horizontal moves to the target tolerance.' }, { title: 'Certify', desc: 'Final readings are recorded on a before / after alignment certificate.' }],
    benefits: ['Extend seal, bearing and coupling life dramatically', 'Cut vibration, heat and energy loss from misalignment', 'Right first time — no repeated shimming or guesswork'],
    specs: [['Tolerance', 'Manufacturer / ANSI'], ['Accuracy', '0.01 mm resolution'], ['Corrects', 'Offset, angularity, soft foot'], ['Turnaround', 'Same-day on site'], ['Deliverable', 'Alignment certificate']],
    faqs: [{ q: 'How is laser better than dial gauges?', a: 'Laser measurement removes bar sag and reading error, resolves to hundredths of a millimetre, and calculates the exact shim and move live — far faster and far more accurate.' }, { q: 'Do you allow for thermal growth?', a: 'Yes. Hot machines move as they warm. We align cold to a calculated offset so the shafts run true at operating temperature.' }],
  },
  {
    slug: 'transformer-oil-purification', name: 'Transformer Oil Purification', cat: 'Fluid Management', icon: 'transformer', image: '/img/photos/transformer.jpg', tag: 'Elevate performance',
    blurb: 'Revitalize transformers, purify oils and ensure efficiency, with expert condition monitoring that elevates performance.',
    overview: 'On-site purification removes moisture, dissolved gases and particulate from transformer insulating oil, restoring its dielectric strength. Done live or de-energised, it extends transformer life and defers the major cost of an oil change or replacement.',
    deliverables: ['Vacuum dehydration removing water and dissolved gas', 'Fine filtration to a target particle count', 'Dielectric breakdown voltage restored to standard', 'Before / after oil test results (BDV, moisture)', 'Live (energised) processing option to avoid an outage', 'Condition report with a recommended re-test interval'],
    steps: [{ title: 'Sample', desc: 'We test the oil for moisture, dielectric strength and contamination.' }, { title: 'Process', desc: 'Oil is circulated through vacuum dehydration and fine filtration on site.' }, { title: 'Verify', desc: 'Dielectric strength and moisture are re-tested against the target.' }, { title: 'Report', desc: 'Before / after results with a recommended re-test interval.' }],
    benefits: ['Restore dielectric strength without buying new oil', 'Extend transformer life and defer capital replacement', 'Processed on site — often while energised, no outage'],
    specs: [['Standard', 'IEC 60422 / ASTM D3487'], ['Removes', 'Moisture, gas, particulate'], ['Target', 'BDV restored to spec'], ['Turnaround', 'On site, per volume'], ['Option', 'Energised processing']],
    faqs: [{ q: 'Can you purify oil while the transformer is live?', a: 'Yes. For critical transformers we process energised, so you keep supply and avoid a costly outage. Where preferred, we also work de-energised.' }, { q: 'Purify or regenerate?', a: 'Purification suits oil that is sound but wet or gassy. When oil is aged and acidic, regeneration restores it further — we test first and advise.' }],
  },
  {
    slug: 'transformer-oil-regeneration', name: 'Transformer Oil Regeneration', cat: 'Fluid Management', icon: 'recycle', image: '/img/photos/transformer2.jpg', tag: 'Confidence & precision',
    blurb: 'Regenerate transformer oil with confidence and precision, using cutting-edge methods that revive oils to like-new condition.',
    overview: 'Regeneration goes beyond purification: it passes aged, acidic oil through Fuller’s-earth media to strip the ageing by-products purification leaves behind, returning the oil to near-new chemistry. It revives both the oil and the paper insulation it protects.',
    deliverables: ['Fuller’s-earth regeneration of acidic, aged oil', 'Acidity, colour and interfacial tension restored to near-new', 'Moisture and dissolved gas removed', 'In-place media reactivation for continuous processing', 'A full before / after oil-quality test suite', 'A life-extension assessment for the transformer'],
    steps: [{ title: 'Assess', desc: 'Oil is tested for acidity, colour, interfacial tension and breakdown voltage.' }, { title: 'Regenerate', desc: 'Oil circulates through Fuller’s-earth columns that remove ageing by-products.' }, { title: 'Reactivate', desc: 'Media is reactivated in place for continuous, low-waste processing.' }, { title: 'Verify', desc: 'The full oil-quality suite is re-run to confirm near-new chemistry.' }],
    benefits: ['Restore oil chemistry, not just dryness', 'Slow ageing of the transformer’s paper insulation', 'A fraction of the cost and waste of an oil replacement'],
    specs: [['Standard', 'IEC 60422'], ['Restores', 'Acidity, IFT, colour, BDV'], ['Media', 'Reactivatable Fuller’s earth'], ['Turnaround', 'On site, per volume'], ['Best for', 'Aged, acidic oil']],
    faqs: [{ q: 'How does regeneration differ from purification?', a: 'Purification removes water, gas and particles. Regeneration additionally removes the acids and sludge precursors of ageing, restoring the oil’s chemistry — not just its dryness.' }, { q: 'Does it help the transformer itself?', a: 'Yes. Clean, de-acidified oil slows degradation of the cellulose paper insulation — the part of a transformer you cannot replace without a rewind.' }],
  },
  {
    slug: 'hydraulic-oil-purification', name: 'Hydraulic Oil Purification', cat: 'Fluid Management', icon: 'hydraulic', image: '/img/photos/hydraulic.jpg', tag: 'Minimize downtime',
    blurb: 'Maximize efficiency and minimize downtime. Invest in hydraulic oil purification to protect pumps, valves and actuators.',
    overview: 'Contaminated hydraulic oil is the leading cause of pump, valve and actuator failure. On-site filtration and dehydration restore oil cleanliness to the target ISO code, protecting expensive components and extending both fluid and machine life.',
    deliverables: ['Particle count measured to the ISO 4406 cleanliness code', 'Fine filtration and water removal on site', 'Cleanliness restored to the component target code', 'Before / after ISO code and moisture results', 'Contamination-source note (ingress, wear, water)', 'A filtration schedule to hold the target'],
    steps: [{ title: 'Sample', desc: 'Oil is analysed for particle count, water and wear metals.' }, { title: 'Filter', desc: 'Circulated through fine and dehydration filtration to target cleanliness.' }, { title: 'Verify', desc: 'The ISO 4406 code is re-measured to confirm the target is met.' }, { title: 'Advise', desc: 'The contamination source is identified and a filtration schedule set.' }],
    benefits: ['Extend pump, valve and actuator life several-fold', 'Cut oil spend by keeping fluid in service longer', 'Prevent sudden hydraulic failures and lost production'],
    specs: [['Standard', 'ISO 4406 / 4407'], ['Target', 'Component-specific code'], ['Removes', 'Particulate + water'], ['Turnaround', 'On site, per volume'], ['Method', 'Kidney-loop filtration']],
    faqs: [{ q: 'Isn’t new oil already clean?', a: 'Rarely to a hydraulic target. New oil often arrives dirtier than a system needs, so we filter on fill as well as in service to protect close-tolerance components.' }, { q: 'What cleanliness do you target?', a: 'It depends on the components — servo valves need far cleaner oil than simple rams. We set the ISO 4406 target to the most sensitive component in the circuit.' }],
  },
  {
    slug: 'total-fluid-management', name: 'Total Fluid Management', cat: 'Fluid Management', icon: 'fluid', image: '/img/photos/fluids.jpg', tag: 'Mining · construction · manufacturing',
    blurb: 'Total fluid management excellence, tailored for the mining, construction and manufacturing industries.',
    overview: 'A managed programme that takes ownership of every lubricant and fluid on your site — selection, storage, filtration, sampling and disposal. Built for mining, construction and manufacturing, it turns ad-hoc oil handling into a controlled reliability programme.',
    deliverables: ['A lubricant survey and consolidation across the plant', 'Clean storage, handling and transfer systems', 'Scheduled oil sampling and trend analysis', 'On-site filtration and top-up management', 'Contamination-control and cleanliness targets', 'KPI reporting on consumption, cleanliness and savings'],
    steps: [{ title: 'Audit', desc: 'We survey every lubricant, store and application on site.' }, { title: 'Design', desc: 'A consolidated lubricant list, clean storage and a sampling plan.' }, { title: 'Manage', desc: 'Filtration, top-ups and scheduled sampling run to a programme.' }, { title: 'Report', desc: 'KPIs on consumption, cleanliness and reliability savings.' }],
    benefits: ['Fewer lubricant types, less waste, lower spend', 'Contamination controlled from delivery to disposal', 'One accountable partner for all plant fluids'],
    specs: [['Scope', 'Selection to disposal'], ['Sectors', 'Mining, construction, mfg'], ['Includes', 'Storage, filtration, sampling'], ['Reporting', 'Consumption + cleanliness KPIs'], ['Delivery', 'On-site programme']],
    faqs: [{ q: 'Is this only for large plants?', a: 'It scales. A small site benefits from consolidated lubricants and clean storage; a mine benefits from full sampling, filtration and KPI reporting. We size the programme to you.' }, { q: 'Do you handle used-oil disposal?', a: 'Yes. Responsible handling and disposal of used fluids is part of the programme, keeping you compliant and your site clean.' }],
  },
  {
    slug: 'proof-load-testing', name: 'Proof Load Testing', cat: 'Lifting & Load', icon: 'weight', image: '/img/photos/lifting2.jpg', tag: 'Safety-conscious',
    blurb: 'Beyond minimum requirements. We prioritise adherence to safe working loads with world-class standards and best practice.',
    overview: 'Proof load testing verifies that cranes, hoists, slings and lifting structures can safely carry their rated load. We apply a certified overload with calibrated test equipment and issue the documentation that proves compliance with safe-working-load requirements.',
    deliverables: ['Proof load applied to a certified percentage of SWL', 'Calibrated water-bags or load cells as the test medium', 'Function and brake test through the full motion', 'Deflection and structural observation under load', 'A test certificate with load, date and result', 'Register update and next-due date'],
    steps: [{ title: 'Plan', desc: 'We confirm SWL, the test factor and the safest method for the equipment.' }, { title: 'Rig', desc: 'Calibrated load cells or water-bags are applied under controlled conditions.' }, { title: 'Test', desc: 'The rated overload is held and the equipment functioned through its motions.' }, { title: 'Certify', desc: 'The result is documented on a proof-load certificate for your records.' }],
    benefits: ['Prove lifting gear is safe before it carries people or plant', 'Meet statutory and insurer safe-working-load duties', 'Documented evidence for audits and incident defence'],
    specs: [['Basis', 'SWL / statutory factor'], ['Test load', '110–125 % of SWL'], ['Method', 'Load cell / water-bag'], ['Deliverable', 'Proof-load certificate'], ['Delivery', 'On-site or workshop']],
    faqs: [{ q: 'How much overload do you apply?', a: 'The test factor depends on the equipment and standard — commonly 110 to 125 % of safe working load. We confirm the correct factor first and never exceed the design limit.' }, { q: 'Do you test new and repaired gear?', a: 'Both. New installations, modified or repaired lifting gear, and periodic re-tests all require proof loading before return to service.' }],
  },
  {
    slug: 'lifting-equipment-servicing', name: 'Lifting Equipment Installation, Servicing & Inspection', cat: 'Lifting & Load', icon: 'crane', image: '/img/photos/crane.jpg', tag: 'Raising safety',
    blurb: 'Your trusted partner in raising safety while ensuring performance through innovative lifting solutions.',
    overview: 'End-to-end care for your lifting fleet — from installing new cranes and hoists to routine servicing and thorough examination. We keep overhead cranes, chain blocks, jibs and gantries safe, compliant and performing, with the maintenance records to prove it.',
    deliverables: ['Installation and commissioning of new lifting equipment', 'Scheduled preventive servicing of cranes and hoists', 'Thorough examination and defect reporting', 'Brake, chain, hook and rope wear assessment', 'Spare-parts supply and repair', 'Maintenance history and next-service scheduling'],
    steps: [{ title: 'Survey', desc: 'We assess the equipment, its duty and its service history.' }, { title: 'Service', desc: 'Preventive maintenance on brakes, gearing, chain, ropes and hooks.' }, { title: 'Inspect', desc: 'A thorough examination with defects graded and reported.' }, { title: 'Record', desc: 'Work is logged with the next service scheduled.' }],
    benefits: ['Maximise lifting uptime and safe performance', 'One partner for install, service, spares and repair', 'A complete, audit-ready maintenance history'],
    specs: [['Scope', 'Install · service · inspect'], ['Equipment', 'Cranes, hoists, jibs, gantries'], ['Includes', 'Spares + repair'], ['Interval', 'Duty-based schedule'], ['Delivery', 'On-site']],
    faqs: [{ q: 'Do you service equipment you didn’t supply?', a: 'Yes. We service and inspect lifting equipment of any make, and can supply spares and repairs to keep older kit safely in service.' }, { q: 'How often should it be serviced?', a: 'Interval depends on duty and environment. Heavily used or harsh-environment equipment needs more frequent servicing; we set a schedule from its classification and history.' }],
  },
  {
    slug: 'statutory-inspection', name: 'Lifting Equipment Statutory Inspection', cat: 'Lifting & Load', icon: 'clipboardcheck', image: '/img/photos/lifting1.jpg', tag: 'Compliant · reliable',
    blurb: 'Expert inspection for safe lifting. Compliant, reliable and fully documented to statutory standard.',
    overview: 'Independent thorough examination of lifting equipment to satisfy statutory duty. Our examiners inspect, test where required and issue the legal report of thorough examination — so your cranes, chains, slings and accessories stay compliant and insurable.',
    deliverables: ['Thorough examination by a competent examiner', 'A report of thorough examination per statute', 'Defects classified by severity and timescale', 'Colour-coding and tagging of passed equipment', 'A register of all lifting equipment and due dates', 'Advice on any remedial action required'],
    steps: [{ title: 'Register', desc: 'We compile or update the register of all lifting equipment on site.' }, { title: 'Examine', desc: 'Each item is thoroughly examined, and tested where the standard requires.' }, { title: 'Classify', desc: 'Defects are graded with a clear timescale for action.' }, { title: 'Certify', desc: 'The statutory report is issued and passed items are tagged.' }],
    benefits: ['Meet your legal thorough-examination duty', 'Keep equipment insured and audit-ready', 'A clear register so nothing falls out of date'],
    specs: [['Basis', 'Statutory examination'], ['Interval', '6 / 12-monthly by item'], ['Covers', 'Cranes, chains, slings, gear'], ['Deliverable', 'Report of examination'], ['Delivery', 'On-site']],
    faqs: [{ q: 'How often is inspection required?', a: 'Typically every 12 months for lifting equipment and every 6 months for accessories or equipment lifting people — we track each item’s due date for you.' }, { q: 'What happens if an item fails?', a: 'It is tagged out of service and the defect reported with a timescale. We can then quote the repair or replacement to bring it back into compliance.' }],
  },
  {
    slug: 'calibration', name: 'Calibration', cat: 'Precision & Training', icon: 'gauge', image: '/img/photos/calibration.jpg', tag: 'Measure with certainty',
    blurb: 'Calibrate with us, measure with certainty. Traceable calibration for your instruments and measuring equipment.',
    overview: 'Traceable calibration of the instruments your decisions depend on. We calibrate pressure, temperature, electrical and dimensional equipment against reference standards and issue certificates traceable to national standards — so you measure with certainty.',
    deliverables: ['Calibration against traceable reference standards', 'As-found and as-left readings recorded', 'Measurement uncertainty stated on the certificate', 'Adjustment where the instrument is out of tolerance', 'A calibration certificate and label', 'A recall schedule for the next due date'],
    steps: [{ title: 'Receive', desc: 'The instrument is identified and its tolerance and range confirmed.' }, { title: 'Calibrate', desc: 'Compared against traceable reference standards across its range.' }, { title: 'Adjust', desc: 'Out-of-tolerance instruments are adjusted and re-verified.' }, { title: 'Certify', desc: 'An as-found / as-left certificate with uncertainty is issued and recall set.' }],
    benefits: ['Trust your measurements — traceable and documented', 'Meet quality-system and audit requirements', 'Catch drifting instruments before they cost you'],
    specs: [['Traceability', 'National standards'], ['Disciplines', 'Pressure, temp, electrical, dim.'], ['Records', 'As-found + as-left'], ['Deliverable', 'Calibration certificate'], ['Delivery', 'On-site or workshop']],
    faqs: [{ q: 'Is your calibration traceable?', a: 'Yes. Every calibration is performed against reference standards traceable to national standards, with measurement uncertainty stated on the certificate.' }, { q: 'Can you calibrate on site?', a: 'Many instruments can be calibrated on site to avoid downtime; others requiring stable conditions are done in the workshop. We advise per instrument.' }],
  },
  {
    slug: 'dynamic-balancing', name: 'Dynamic Balancing', cat: 'Precision & Training', icon: 'balance', image: '/img/photos/rotor.jpg', tag: 'Balancing OK @ 5mm/s',
    blurb: 'You name it, we balance it. On-site and workshop dynamic balancing that eliminates destructive vibration.',
    overview: 'Unbalance is a leading source of destructive vibration in rotating machinery. We balance fans, rotors, impellers, couplings and shafts — on site in their own bearings or in the workshop — to a fine tolerance that quietens the machine and protects its bearings.',
    deliverables: ['Single- and two-plane dynamic balancing', 'On-site (in-situ) or workshop balancing', 'Residual unbalance verified to an ISO grade', 'Vibration before / after in mm/s', 'A trial-and-correction weight record', 'A balancing certificate with the achieved grade'],
    steps: [{ title: 'Measure', desc: 'Baseline vibration and phase are captured on the rotating assembly.' }, { title: 'Correct', desc: 'Trial weights are placed and correction masses calculated.' }, { title: 'Verify', desc: 'Residual unbalance and vibration are re-measured to the target grade.' }, { title: 'Certify', desc: 'The achieved balance grade and final vibration are documented.' }],
    benefits: ['Eliminate vibration at its source, not just its symptom', 'Extend bearing and seal life on fans and rotors', 'Balanced in place — often no removal or re-install'],
    specs: [['Standard', 'ISO 21940 (ISO 1940)'], ['Planes', 'Single & two-plane'], ['Target', 'OK @ 5 mm/s'], ['Location', 'In-situ or workshop'], ['Deliverable', 'Balance certificate']],
    faqs: [{ q: 'Do you have to remove the rotor?', a: 'Usually not. In-situ balancing corrects the rotor in its own bearings — faster, cheaper and true to real running conditions. Workshop balancing is available where needed.' }, { q: 'What can you balance?', a: 'Fans, blowers, impellers, rotors, couplings, spindles, pulleys — if it rotates and can carry a correction weight, we can balance it.' }],
  },
  {
    slug: 'training', name: 'Training', cat: 'Precision & Training', icon: 'cap', image: '/img/photos/training1.jpg', tag: 'Build capability',
    blurb: '“What if I train them and they leave?” — “What if you don’t, and they stay?” Practical reliability and maintenance training.',
    overview: 'Practical reliability and maintenance training builds lasting capability in your own team. From vibration and thermography awareness to precision maintenance and lubrication, our courses turn theory into skills your technicians use on the plant floor the next day.',
    deliverables: ['Courses in condition monitoring and precision maintenance', 'Hands-on practical sessions on real equipment', 'Vibration, thermography, alignment and lubrication modules', 'Tailored in-house or scheduled delivery', 'Course materials and reference guides', 'A certificate of completion for each delegate'],
    steps: [{ title: 'Scope', desc: 'We agree the topics, level and outcomes your team needs.' }, { title: 'Deliver', desc: 'Classroom theory paired with hands-on practical exercises.' }, { title: 'Practise', desc: 'Delegates apply the skills on real or representative equipment.' }, { title: 'Certify', desc: 'Competency is assessed and certificates issued.' }],
    benefits: ['Build reliability capability that stays in-house', 'Practical, plant-relevant skills — not just theory', 'Fewer failures as your team catches faults earlier'],
    specs: [['Topics', 'CM, precision maint., lubrication'], ['Format', 'In-house or scheduled'], ['Style', 'Theory + hands-on practical'], ['Levels', 'Awareness to practitioner'], ['Deliverable', 'Certificate of completion']],
    faqs: [{ q: 'Can training run at our site?', a: 'Yes. In-house delivery on your own equipment is the most effective format and lets us tailor examples to your plant. Scheduled open courses are also available.' }, { q: 'What if we train people and they leave?', a: 'As we like to say — what if you don’t, and they stay? Trained technicians prevent far more downtime than the cost of developing them, and capability compounds across the team.' }],
  },
];
export const serviceBySlug = (s) => services.find((x) => x.slug === s);

/* ---- PRODUCTS ---- */
export const productCats = [
  { name: 'Bearings', icon: 'bearing' },
  { name: 'Cranes & Lifting Equipment', icon: 'crane' },
  { name: 'Lubrication Equipment', icon: 'oilcan' },
  { name: 'Crane Spares', icon: 'chain' },
  { name: 'Condition Monitoring Products', icon: 'sensor' },
  { name: 'Fire Suppression Products', icon: 'flame' },
  { name: 'Hydraulic Fittings & Products', icon: 'pipe' },
  { name: 'Transmission Products', icon: 'gear' },
];
export const products = [
  {
    id: 'bearing-6205', name: 'Deep-Groove Ball Bearing 6205', cat: 'Bearings', price: 18, image: '/img/photos/rotor.jpg', tag: 'In stock',
    sku: 'ARS-BR-6205', brand: 'SKF', rating: 4.8, stock: 'In stock',
    gallery: ['/img/photos/rotor.jpg', '/img/photos/motors.jpg'],
    blurb: 'A single-row deep-groove ball bearing built for electric motors, pumps and fans. Low friction, high speed capability and long service life under radial and light axial load.',
    features: ['Chrome-steel races, hardened to 60 HRC', 'Pre-lubricated with high-temp grease', 'Interchangeable with all 6205-standard housings', 'Low-noise C3 clearance for motor duty'],
    specs: [['Bore diameter', '25 mm'], ['Outer diameter', '52 mm'], ['Width', '15 mm'], ['Dynamic load rating', '14.0 kN'], ['Max speed', '15,000 rpm'], ['Seal type', '2RS (rubber both sides)']],
  },
  {
    id: 'bearing-taper', name: 'Tapered Roller Bearing Set', cat: 'Bearings', price: 46, image: '/img/photos/motors.jpg',
    sku: 'ARS-BR-TR30', brand: 'Timken', rating: 4.7, stock: 'In stock',
    gallery: ['/img/photos/motors.jpg', '/img/photos/rotor.jpg'],
    blurb: 'Cup-and-cone tapered roller set engineered to carry heavy combined radial and axial loads. Ideal for gearboxes, wheel hubs and heavy rotating assemblies.',
    features: ['Matched cup and cone supplied as a set', 'Case-hardened rollers for shock resistance', 'Handles combined radial + thrust loads', 'Adjustable preload for precise running'],
    specs: [['Bore diameter', '30 mm'], ['Outer diameter', '62 mm'], ['Width', '17.25 mm'], ['Dynamic load rating', '41.2 kN'], ['Cage material', 'Pressed steel'], ['Configuration', 'Single-row set']],
  },
  {
    id: 'sensor-accel', name: 'Industrial Accelerometer Sensor', cat: 'Condition Monitoring Products', price: 320, image: '/img/photos/ultrasound.jpg', tag: 'Popular',
    sku: 'ARS-CM-ACC1', brand: 'ARS', rating: 4.6, stock: 'In stock',
    gallery: ['/img/photos/ultrasound.jpg', '/img/photos/vibration.jpg'],
    blurb: 'A rugged piezoelectric accelerometer for permanent or route-based vibration monitoring. Pairs with any handheld analyser or online system for early fault detection.',
    features: ['100 mV/g sensitivity, IEPE constant-current', 'Hermetically sealed 316 stainless housing', 'Top or side cable exit options', 'M8 stud mount for repeatable readings'],
    specs: [['Sensitivity', '100 mV/g'], ['Frequency range', '0.5 – 10,000 Hz'], ['Measuring range', '±80 g'], ['Enclosure', 'IP67 stainless'], ['Connector', '2-pin MIL-C-5015'], ['Operating temp', '-50 to +120 °C']],
  },
  {
    id: 'vib-pen', name: 'Handheld Vibration Meter', cat: 'Condition Monitoring Products', price: 540, image: '/img/photos/vibration.jpg',
    sku: 'ARS-CM-VM2', brand: 'ARS', rating: 4.5, stock: 'Low stock',
    gallery: ['/img/photos/vibration.jpg', '/img/photos/ultrasound.jpg'],
    blurb: 'A pocket-sized vibration meter that reads velocity, acceleration and bearing condition on the spot. The fast way to triage machine health on a walk-round.',
    features: ['ISO 10816 velocity + bearing (enveloping) readings', 'Colour OLED with go / caution / alarm bands', 'Onboard logging of up to 1,000 points', 'Rechargeable, 20-hour battery life'],
    specs: [['Parameters', 'Velocity, acceleration, bearing'], ['Velocity range', '0.1 – 200 mm/s'], ['Frequency range', '10 Hz – 10 kHz'], ['Display', 'Colour OLED'], ['Memory', '1,000 measurements'], ['Standard', 'ISO 10816 zones']],
  },
  {
    id: 'thermal-cam', name: 'Thermal Imaging Camera', cat: 'Condition Monitoring Products', price: 1850, image: '/img/photos/thermography.jpg', tag: 'New',
    sku: 'ARS-CM-TC8', brand: 'FLIR', rating: 4.9, stock: 'In stock',
    gallery: ['/img/photos/thermography.jpg', '/img/photos/transformer.jpg'],
    blurb: 'A professional-grade infrared camera for electrical and mechanical inspections. Spot hot connections, overloaded circuits and failing bearings before they fail.',
    features: ['76,800-pixel (320×240) thermal detector', 'MSX detail-blending with visible camera', 'On-image spot, box and delta-T tools', 'Wi-Fi report export to phone or laptop'],
    specs: [['Resolution', '320 × 240 (76,800 px)'], ['Thermal sensitivity', '<40 mK'], ['Temp range', '-20 to +550 °C'], ['Accuracy', '±2 °C or ±2 %'], ['Field of view', '24° × 18°'], ['Storage', 'Wi-Fi + microSD']],
  },
  {
    id: 'oil-can', name: 'Precision Lubrication Oil Can 500ml', cat: 'Lubrication Equipment', price: 24, image: '/img/photos/hydraulic.jpg',
    sku: 'ARS-LB-OC500', brand: 'ARS', rating: 4.4, stock: 'In stock',
    gallery: ['/img/photos/hydraulic.jpg', '/img/photos/fluids.jpg'],
    blurb: 'A precision pump-action oil can for accurate spot lubrication. Rigid steel spout delivers a controlled dose exactly where the oil needs to go.',
    features: ['Thumb-pump delivers a metered shot', 'Flexible + rigid spouts included', 'Leak-proof screw base', 'Colour-code ready for lubricant identification'],
    specs: [['Capacity', '500 ml'], ['Body', 'Zinc-plated steel'], ['Spout', 'Rigid + flexible (2)'], ['Delivery', '~1 ml per stroke'], ['Fluid', 'Oils up to ISO VG 220'], ['Weight', '0.4 kg empty']],
  },
  {
    id: 'grease-gun', name: 'Pneumatic Grease Gun', cat: 'Lubrication Equipment', price: 68, image: '/img/photos/fluids.jpg',
    sku: 'ARS-LB-GG1', brand: 'Lincoln', rating: 4.6, stock: 'In stock',
    gallery: ['/img/photos/fluids.jpg', '/img/photos/hydraulic.jpg'],
    blurb: 'An air-powered grease gun for fast, high-volume lubrication of fleet and plant. Continuous or shot delivery through a heavy-duty flexible hose.',
    features: ['Runs on standard shop air (40–150 psi)', 'Continuous or single-shot delivery', 'Loads by cartridge, bulk or suction', 'Air-bleeder valve for easy priming'],
    specs: [['Operating pressure', '40 – 150 psi'], ['Output pressure', 'Up to 6,000 psi'], ['Delivery', '1.5 g per cycle'], ['Cartridge', '400 g / bulk fill'], ['Hose', '750 mm flexible'], ['Coupler', 'Standard hydraulic']],
  },
  {
    id: 'chain-hoist', name: '2-Ton Chain Hoist', cat: 'Cranes & Lifting Equipment', price: 410, image: '/img/photos/crane.jpg', tag: 'Best seller',
    sku: 'ARS-LF-CH2T', brand: 'Kito', rating: 4.8, stock: 'In stock',
    gallery: ['/img/photos/crane.jpg', '/img/photos/lifting2.jpg'],
    blurb: 'A manual chain block rated to 2 tonnes for workshop and site lifting. Compact, low-effort gearing with a Grade 80 load chain and safety-latch hooks.',
    features: ['2,000 kg working load limit', 'Grade 80 heat-treated load chain', 'Weston-type mechanical load brake', 'Safety latches on top + bottom hooks'],
    specs: [['Working load limit', '2,000 kg'], ['Standard lift', '3 m (extendable)'], ['Chain grade', 'Grade 80'], ['Test load', '150 % of WLL'], ['Effort to lift', '~34 kg at WLL'], ['Standard', 'EN 13157 compliant']],
  },
  {
    id: 'lifting-sling', name: 'Certified Lifting Sling 4T', cat: 'Cranes & Lifting Equipment', price: 95, image: '/img/photos/lifting2.jpg',
    sku: 'ARS-LF-SL4T', brand: 'Crosby', rating: 4.7, stock: 'In stock',
    gallery: ['/img/photos/lifting2.jpg', '/img/photos/lifting1.jpg'],
    blurb: 'A round polyester lifting sling rated to 4 tonnes, supplied with a test certificate. Soft, load-hugging and lightweight for safe general rigging.',
    features: ['4,000 kg vertical working load limit', 'Colour-coded grey per EN 1492-2', 'Double-jacket wear sleeve', 'Individually serial-numbered + certified'],
    specs: [['Working load limit', '4,000 kg (vertical)'], ['Material', 'High-tenacity polyester'], ['Length', '2 m endless'], ['Safety factor', '7:1'], ['Colour code', 'Grey (4 t)'], ['Certificate', 'Supplied, EN 1492-2']],
  },
  {
    id: 'crane-wheel', name: 'Crane Wheel Assembly', cat: 'Crane Spares', price: 220, image: '/img/photos/lifting1.jpg',
    sku: 'ARS-CS-CW1', brand: 'ARS', rating: 4.5, stock: 'Low stock',
    gallery: ['/img/photos/lifting1.jpg', '/img/photos/crane.jpg'],
    blurb: 'A machined double-flanged crane wheel supplied on a sealed bearing block, ready to bolt on. Built to keep overhead travelling cranes running true.',
    features: ['Forged and hardened running tread', 'Double flange for reliable rail tracking', 'Sealed-for-life bearing housing', 'Machined to OEM rail profiles'],
    specs: [['Tread diameter', '250 mm'], ['Flange type', 'Double flange'], ['Bearing', 'Sealed spherical roller'], ['Material', 'Forged EN9 steel'], ['Tread hardness', '300–340 HB'], ['Max wheel load', '5,000 kg']],
  },
  {
    id: 'fire-extinguisher', name: 'Automatic Fire Suppression Unit', cat: 'Fire Suppression Products', price: 480, image: '/img/photos/transformer.jpg',
    sku: 'ARS-FS-AU1', brand: 'Ansul', rating: 4.7, stock: 'In stock',
    gallery: ['/img/photos/transformer.jpg', '/img/photos/motors.jpg'],
    blurb: 'A self-activating fire suppression unit for electrical panels, engine bays and machine enclosures. Detects and discharges automatically, with no power required.',
    features: ['Heat-activated tube bursts at the fire source', 'Clean agent leaves no residue on electronics', 'Fully autonomous — no wiring or power', 'Pressure gauge for at-a-glance readiness'],
    specs: [['Agent', 'Clean agent (HFC-227ea)'], ['Activation', 'Thermal, 93 °C tube'], ['Coverage', 'Up to 1.5 m³ enclosure'], ['Charge', '2 kg'], ['Working pressure', '15 bar'], ['Service interval', '12 months']],
  },
  {
    id: 'hyd-fitting', name: 'Hydraulic Coupling Fitting Set', cat: 'Hydraulic Fittings & Products', price: 34, image: '/img/photos/hydraulic.jpg',
    sku: 'ARS-HY-CF1', brand: 'Parker', rating: 4.6, stock: 'In stock',
    gallery: ['/img/photos/hydraulic.jpg', '/img/photos/fluids.jpg'],
    blurb: 'A set of quick-release hydraulic couplings for high-pressure lines. Clean, drip-free connect and disconnect for tools, cylinders and power packs.',
    features: ['Flat-face design for near-zero spillage', 'Push-to-connect under residual pressure', 'Hardened steel with zinc-nickel plating', 'Male + female halves supplied as a pair'],
    specs: [['Thread size', '1/2" BSP'], ['Working pressure', '350 bar'], ['Burst pressure', '1,400 bar'], ['Flow rate', 'Up to 45 L/min'], ['Body', 'Zinc-nickel steel'], ['Seal', 'FKM (Viton)']],
  },
  {
    id: 'v-belt', name: 'Industrial V-Belt (Pack)', cat: 'Transmission Products', price: 42, image: '/img/photos/motors.jpg',
    sku: 'ARS-TR-VB1', brand: 'Gates', rating: 4.5, stock: 'In stock',
    gallery: ['/img/photos/motors.jpg', '/img/photos/rotor.jpg'],
    blurb: 'A pack of matched-length industrial V-belts for reliable power transmission on drives, pumps and fans. Wrapped construction for long, quiet service.',
    features: ['Length-matched set for multi-belt drives', 'Fabric-wrapped, oil + heat resistant', 'Aramid-reinforced tensile cords', 'Anti-static and maintenance-free'],
    specs: [['Profile', 'SPB / 17 mm'], ['Pitch length', '1,600 mm'], ['Pack quantity', '3 belts'], ['Temp range', '-30 to +80 °C'], ['Construction', 'Wrapped, aramid cord'], ['Standard', 'ISO 4184']],
  },
  {
    id: 'coupling', name: 'Flexible Shaft Coupling', cat: 'Transmission Products', price: 78, image: '/img/photos/rotor.jpg',
    sku: 'ARS-TR-FC1', brand: 'ARS', rating: 4.6, stock: 'In stock',
    gallery: ['/img/photos/rotor.jpg', '/img/photos/motors.jpg'],
    blurb: 'A jaw-type flexible coupling that transmits torque while absorbing misalignment and shock. Protects motors, pumps and gearboxes from destructive vibration.',
    features: ['Accommodates angular + parallel misalignment', 'Snap-in elastomer spider dampens shock', 'Fail-safe drive if the spider wears', 'No lubrication required'],
    specs: [['Bore range', '19 – 42 mm'], ['Rated torque', '160 Nm'], ['Max speed', '5,000 rpm'], ['Misalignment', '1° angular / 0.4 mm parallel'], ['Spider', 'NBR 92 Shore-A'], ['Hubs', 'Cast iron GG25']],
  },
];
export const productById = (id) => products.find((p) => p.id === id);
/* map a product category to a duotone icon name (from productCats) */
export const catIcon = (cat) => (productCats.find((c) => c.name === cat) || { icon: 'box' }).icon;
export const money = (n) => 'US$' + Number(n).toLocaleString();

/* ---- STATS ---- */
export const stats = [
  { value: 15, suffix: '+', label: 'Services delivered' },
  { value: 20, suffix: '+', label: 'Blue-chip clients' },
  { value: 5, suffix: 'mm/s', label: 'Balancing standard' },
  { value: 100, suffix: '%', label: 'Preventable failures' },
];

/* ---- CLIENTS ---- */
export const clients = [
  { name: 'Anglo American', logo: '/img/clients/Anglo-American.png' },
  { name: 'Zimplats', logo: '/img/clients/zimplatslogo.png' },
  { name: 'Delta Corporation', logo: '/img/clients/delta-56-1.png' },
  { name: 'National Foods', logo: '/img/clients/national-foods-57-1.png' },
  { name: 'PPC Cement', logo: '/img/clients/PPC_Cement-logo-735531C881-seeklogo.com_.png' },
  { name: 'Tongaat Hulett', logo: '/img/clients/Tongaat-Huletts-Logo.png' },
  { name: 'Mimosa Mine', logo: '/img/clients/Mimosa-Mine-1.png' },
  { name: 'Metallon', logo: '/img/clients/9cN13PvE_400x400-1.png' },
];

/* ---- WHY / VALUES ---- */
export const pillars = [
  { icon: 'target', title: 'Predict, don’t react', desc: 'Condition monitoring catches faults early, so failures are designed out, not fought.' },
  { icon: 'shield', title: 'World-class standards', desc: 'Best-practice methods, traceable calibration and safe-working-load compliance on every job.' },
  { icon: 'analytics', title: 'Data you can act on', desc: 'Clear findings and prioritised recommendations, not raw numbers. You always know what to do next.' },
  { icon: 'handshake', title: 'Trusted partners', desc: 'Innovative solutions and a team the biggest names in mining and manufacturing rely on.' },
];

/* ---- PROCESS ---- */
export const process = [
  { n: '01', title: 'Assess', desc: 'We baseline your critical assets and define what "healthy" looks like.' },
  { n: '02', title: 'Monitor', desc: 'Vibration, thermal, ultrasound and oil data captured on a schedule that fits.' },
  { n: '03', title: 'Diagnose', desc: 'Our analysts interpret the data and flag developing faults with severity.' },
  { n: '04', title: 'Act', desc: 'Prioritised, costed recommendations that prevent the failure before it happens.' },
];

/* ---- INSIGHTS ---- */
export const articles = [
  { slug: 'all-failures-preventable', title: 'Why we say all failures are preventable', category: 'Reliability', image: '/img/photos/engineer.jpg', date: 'Aug 2026', read: '6 min', excerpt: 'Every unexpected breakdown leaves a signature in vibration, heat or oil long before it stops the plant. Here is how we read it.' },
  { slug: 'vibration-vs-thermography', title: 'Vibration or thermography: which tells you first?', category: 'Condition Monitoring', image: '/img/photos/thermography.jpg', date: 'Jul 2026', read: '5 min', excerpt: 'Two of the most powerful predictive tools, and when each one gives you the earliest, clearest warning.' },
  { slug: 'oil-analysis-roi', title: 'The ROI of oil purification in mining', category: 'Fluid Management', image: '/img/photos/gallery2.jpg', date: 'Jul 2026', read: '7 min', excerpt: 'What clean oil actually saves a mine, in pumps, downtime and diesel, over a single season.' },
  { slug: 'safe-lifting', title: 'Statutory lifting inspection, made simple', category: 'Lifting & Load', image: '/img/photos/crane.jpg', date: 'Jun 2026', read: '4 min', excerpt: 'What the law requires, what auditors look for, and how to stay compliant without the paperwork pain.' },
];
export const articleBySlug = (s) => articles.find((a) => a.slug === s);

export const videos = [
  { title: 'Inside a vibration analysis route', topic: 'condition monitoring', thumb: '/img/photos/vibration.jpg', duration: '8:12', yt: 'ScMzIvxBSi4' },
  { title: 'Thermography: reading the heat', topic: 'thermography', thumb: '/img/photos/thermography.jpg', duration: '6:40', yt: 'ScMzIvxBSi4' },
  { title: 'Laser alignment, move once shim once', topic: 'alignment', thumb: '/img/photos/laser.jpg', duration: '5:18', yt: 'ScMzIvxBSi4' },
];

/* ---- INSIGHTS HUB (unified, typed model) ----
   One collection powers the Insights hub (category dropdown + cards) and the
   /insights/:slug detail pages. `kind` drives how the detail page renders
   (article vs video vs case-study). `category` is the dropdown bucket.
   YouTube ids are real, honest engineering explainers (generic descriptions —
   we don't claim they are ARS footage). Thumbs use img.youtube.com hqdefault. */
export const insightCats = ['All', 'Articles', 'Case Studies', 'Videos', 'AI in Engineering', 'Standards'];

const ytThumb = (id) => `https://img.youtube.com/vi/${id}/hqdefault.jpg`;

export const insights = [
  /* ── Articles ── */
  {
    kind: 'article', category: 'Articles', slug: 'all-failures-preventable', topic: 'Reliability',
    title: 'Why we say all failures are preventable', image: '/img/photos/engineer.jpg', date: 'Aug 2026', read: '6 min',
    excerpt: 'Every unexpected breakdown leaves a signature in vibration, heat or oil long before it stops the plant. Here is how we read it.',
    body: [
      'It sounds like a bold claim on a workshop wall, but we mean it literally. A machine almost never fails without warning. Long before a bearing seizes or a winding burns out, the fault announces itself — as a change in vibration, a rise in temperature, a shift in the ultrasound it emits, or a trace of wear metal in its oil.',
      'The whole discipline of condition monitoring exists to catch those early signals. A developing bearing defect changes a machine\'s vibration spectrum weeks to months before it is audible. A loose electrical connection heats up long before it trips. Contaminated oil degrades a hydraulic pump gradually, not overnight. Each of these is a warning written in data.',
      { quote: 'The failure was always going to happen. What we change is whether you meet it on a planned shutdown, or at 3am with the line down.' },
      'That is the shift from reactive to predictive maintenance. Instead of running a machine until it breaks, we read its health on a schedule, grade the severity of what we find, and hand you a prioritised action with a lead-time. The breakdown becomes a planned repair — cheaper, safer and on your terms.',
      'So when we say every failure is preventable, we are not promising machines never wear out. We are promising that with the right measurement, you will see it coming — and that is the difference between a maintenance budget you control and one that controls you.',
    ],
  },
  {
    kind: 'article', category: 'Articles', slug: 'vibration-vs-thermography', topic: 'Condition Monitoring',
    title: 'Vibration or thermography: which tells you first?', image: '/img/photos/thermography.jpg', date: 'Jul 2026', read: '5 min',
    excerpt: 'Two of the most powerful predictive tools, and when each one gives you the earliest, clearest warning.',
    body: [
      'Plant managers often ask which condition-monitoring technique they should invest in first. The honest answer is that the best programmes use several together, because each tool sees a different kind of fault earliest and clearest.',
      'Vibration analysis is unrivalled for rotating machinery. Bearings, gears, misalignment, imbalance and looseness all leave a distinct fingerprint in the vibration spectrum, often months before failure. If your critical assets are motors, pumps, fans and gearboxes, this is usually where the biggest wins are.',
      'Thermography earns its place everywhere heat signals trouble. A loose or corroded electrical connection, an overloaded circuit, a failing bearing or a blocked cooler all run hot under load. An infrared survey finds them live, with no shutdown, which makes it the fastest way to sweep an entire switchroom for fire risk.',
      { quote: 'The right question is not vibration or thermography — it is which fault, on which asset, shows up first in which signal.' },
      'For a complete picture we layer them: vibration for the mechanical health of rotating equipment, thermography for electrical and thermal faults, and ultrasound to catch lubrication and very early bearing distress before either of the others. Together they leave a developing failure with nowhere to hide.',
    ],
  },
  {
    kind: 'article', category: 'Articles', slug: 'oil-analysis-roi', topic: 'Fluid Management',
    title: 'The ROI of oil purification in mining', image: '/img/photos/gallery2.jpg', date: 'Jul 2026', read: '7 min',
    excerpt: 'What clean oil actually saves a mine, in pumps, downtime and diesel, over a single season.',
    body: [
      'Oil is cheap until you count what dirty oil costs. Contamination — water, particulate and wear debris — is the single biggest cause of hydraulic and lubrication failures on a mine, and those failures rarely stop at the oil itself.',
      'When cleanliness drifts past a component\'s target, close-tolerance parts start to erode. A servo valve or a pump that should last years can be scrapped in months. Fluid management and on-site oil purification hold cleanliness to the target code, so components reach the life the manufacturer designed for.',
      'The savings compound. Fewer pump and valve replacements, less unplanned downtime, longer oil-drain intervals and lower disposal volumes all land in the same season. On a busy mine the filtration programme routinely pays for itself several times over before the year is out.',
      { quote: 'Clean oil is not a running cost. It is the cheapest insurance you can buy against your most expensive components.' },
      'The trick is to measure, not guess. We sample, report the ISO 4406 cleanliness code, purify to the component target, and set a schedule that keeps it there — turning oil from a consumable you replace into an asset you protect.',
    ],
  },
  {
    kind: 'article', category: 'Articles', slug: 'safe-lifting', topic: 'Lifting & Load',
    title: 'Statutory lifting inspection, made simple', image: '/img/photos/crane.jpg', date: 'Jun 2026', read: '4 min',
    excerpt: 'What the law requires, what auditors look for, and how to stay compliant without the paperwork pain.',
    body: [
      'Every crane, hoist, sling and lifting accessory on your site carries a legal duty: it must be thoroughly examined by a competent person at set intervals, and the examination must be documented. Miss it, and you are not just non-compliant — you are uninsured the moment something goes wrong.',
      'In practice the rules are simpler than they look. Lifting equipment is typically examined every twelve months, and accessories or anything lifting people every six. Each item needs a report of thorough examination, a clear register, and a defect timescale where something is found.',
      'Where sites come unstuck is the register, not the inspection. Kit falls out of date because nobody is tracking due dates. That is exactly what a managed statutory inspection programme fixes — one register, colour-coded tags, and a due-date reminder so nothing lapses.',
      { quote: 'Compliance is not about passing one inspection. It is about never having a single item quietly go out of date.' },
      'Pair the statutory examination with proof load testing on new or repaired gear and you have a lifting fleet that is provably safe, fully insurable and audit-ready — without the paperwork ever becoming your problem.',
    ],
  },

  /* ── Case Studies (illustrative, no client named) ── */
  {
    kind: 'case-study', category: 'Case Studies', slug: 'gearbox-caught-early', topic: 'Vibration Analysis',
    title: 'Catching a conveyor gearbox failure six weeks early', image: '/img/photos/motors.jpg', date: 'Aug 2026', read: '5 min',
    excerpt: 'A routine vibration route flagged a developing gear-mesh fault long before it could stop a production line.',
    body: [
      'On a scheduled vibration route, a conveyor gearbox that had read healthy for months showed a new peak at gear-mesh frequency, with sidebands beginning to grow around it. Individually the numbers were still inside the alarm band. The trend, though, was unmistakable — a tooth-wear fault was developing.',
      'Because the machine was trended rather than checked once, the analyst could see the rate of change, not just the level. That let us grade the severity and put a lead-time on it: weeks, not days. The recommendation was specific — inspect and replace the affected gear set at the next planned shutdown.',
      { quote: 'Nothing had failed yet. That is exactly the point — we were looking at a repair on the calendar, not a breakdown on the floor.' },
      'The gearbox was changed out during a planned stop, with the spare on hand and the crew scheduled. There was no emergency call-out, no unplanned line stoppage, and no collateral damage to the driven equipment. The fault was real; the failure never happened.',
      'It is the clearest illustration of what predictive maintenance buys you: the same repair, done on your terms, at a fraction of the cost and none of the risk of a 3am breakdown.',
    ],
  },
  {
    kind: 'case-study', category: 'Case Studies', slug: 'transformer-oil-saved', topic: 'Fluid Management',
    title: 'Restoring transformer oil instead of replacing it', image: '/img/photos/transformer2.jpg', date: 'Jul 2026', read: '6 min',
    excerpt: 'An ageing transformer with failing oil was brought back to standard on site — no new oil, no long outage.',
    body: [
      'A distribution transformer\'s insulating oil had aged: the dielectric breakdown voltage had fallen, moisture was up, and acidity was climbing. The default assumption was a full oil change — expensive, slow, and a large volume of oil to dispose of responsibly.',
      'Testing told a more useful story. The oil was not just wet, it was chemically aged, so simple purification would not be enough on its own. Regeneration — passing the oil through Fuller\'s-earth media — could strip the ageing by-products and return it close to new chemistry.',
      { quote: 'The cheapest transformer oil is often the one already in the tank — if you restore it before the paper insulation pays the price.' },
      'Processed on site, the oil\'s breakdown voltage, acidity and moisture were all brought back to standard, verified by before-and-after tests. Just as importantly, de-acidifying the oil slows the degradation of the transformer\'s paper insulation — the one part you cannot replace without a rewind.',
      'The result was a transformer returned to service at a fraction of the cost of replacement, a fraction of the waste, and years added to the life of an asset that had been written down for change-out.',
    ],
  },

  /* ── Videos (real YouTube explainers, embedded on the detail page) ── */
  {
    kind: 'video', category: 'Videos', slug: 'vibration-analysis-explained', topic: 'Condition Monitoring',
    title: 'Vibration analysis: reading a machine\'s signature', yt: 'JFYd_UuAHa4', thumb: ytThumb('JFYd_UuAHa4'), duration: 'Watch', date: '2026',
    excerpt: 'A clear primer on how vibration analysis reveals bearing, alignment and imbalance faults in rotating machinery.',
    body: [
      'Vibration analysis is the backbone of any condition-monitoring programme for rotating equipment. This explainer walks through the fundamentals — how a machine\'s vibration carries a signature, and how analysts separate normal running from a developing fault.',
      'It is a useful introduction to the ideas behind our own vibration analysis service: capturing spectra and time-waveforms, interpreting them, and turning the result into a prioritised action rather than a wall of raw numbers.',
    ],
  },
  {
    kind: 'video', category: 'Videos', slug: 'infrared-thermography-explained', topic: 'Condition Monitoring',
    title: 'Infrared thermography for electrical inspection', yt: 'ZwkNTwWJP5k', thumb: ytThumb('ZwkNTwWJP5k'), duration: 'Watch', date: '2026',
    excerpt: 'How infrared cameras make invisible heat visible, revealing loose connections and overloads before they fail.',
    body: [
      'Infrared thermography turns heat into a picture, and heat is one of the earliest and most reliable signs of an electrical or mechanical fault. This video introduces how thermal imaging is used to survey switchgear, motors and connections under load.',
      'The principles shown here are exactly what our thermography surveys apply on site — scanning live equipment, grading each hot spot by temperature rise, and reporting a clear action to prevent outages and fire risk.',
    ],
  },
  {
    kind: 'video', category: 'Videos', slug: 'shaft-alignment-explained', topic: 'Precision Maintenance',
    title: 'Precision shaft alignment, step by step', yt: '8KOYyfZbPzo', thumb: ytThumb('8KOYyfZbPzo'), duration: 'Watch', date: '2026',
    excerpt: 'Why misalignment destroys bearings and seals, and how laser alignment corrects it right first time.',
    body: [
      'Misalignment is one of the most common — and most preventable — causes of premature bearing, seal and coupling failure. This explainer covers why it matters and how precision alignment is measured and corrected.',
      'It pairs naturally with our shaft laser alignment service, where we correct soft foot, account for thermal growth, and align coupled machines to tight tolerance with a before-and-after certificate.',
    ],
  },
  {
    kind: 'video', category: 'Videos', slug: 'lubrication-fundamentals', topic: 'Fluid Management',
    title: 'Lubrication fundamentals for rotating equipment', yt: '0gvTA4yfDCY', thumb: ytThumb('0gvTA4yfDCY'), duration: 'Watch', date: '2026',
    excerpt: 'Getting lubrication right — the quiet discipline behind long bearing life and clean, reliable machinery.',
    body: [
      'Good lubrication is one of the highest-return, lowest-cost reliability practices there is — and one of the easiest to get wrong. This video introduces the fundamentals of lubricating rotating equipment correctly.',
      'The same thinking underpins our total fluid management and lubrication work: the right lubricant, kept clean, applied in the right amount, and monitored so contamination never quietly shortens the life of your machines.',
    ],
  },

  /* ── AI in Engineering ── */
  {
    kind: 'article', category: 'AI in Engineering', slug: 'predictive-ai-rul', topic: 'AI in Engineering',
    title: 'How predictive AI forecasts a machine\'s remaining life', image: '/img/photos/monitoring.jpg', date: 'Aug 2026', read: '6 min',
    excerpt: 'Machine-learning models are learning to read sensor history and estimate how long a machine has left.',
    body: [
      'For decades, condition monitoring has relied on an expert reading the data and applying judgement. That judgement is still irreplaceable — but it is now being amplified by machine-learning models that can watch thousands of sensor streams at once and learn what "healthy" looks like for each one.',
      'The most powerful application is remaining-useful-life estimation. By training on a machine\'s own history — and on the patterns that preceded past failures — a model can forecast not just that a fault exists, but roughly how long you have before it becomes critical.',
      { quote: 'AI does not replace the analyst. It hands the analyst a shortlist of exactly which machines to look at, and why.' },
      'That is the honest promise of AI in reliability engineering: not magic, but leverage. Anomaly detection flags the abnormal reading a human route might miss; predictive models put a horizon on it; and automated reporting drafts the findings so the engineer starts from an answer, not a spreadsheet.',
      'We treat these tools as an extension of predictive maintenance, not a substitute for it — smart sensors and models doing the watching, experienced analysts doing the deciding.',
    ],
  },
  {
    kind: 'article', category: 'AI in Engineering', slug: 'anomaly-detection-plant-floor', topic: 'AI in Engineering',
    title: 'Anomaly detection on the plant floor', image: '/img/photos/ultrasound.jpg', date: 'Jul 2026', read: '5 min',
    excerpt: 'Always-on sensors and algorithms that flag the one abnormal reading a periodic route would miss.',
    body: [
      'A route-based programme is powerful, but it is a snapshot — it sees each machine once every few weeks. Faults that develop quickly, or that only appear under certain loads, can begin and escalate between visits. That is the gap always-on monitoring closes.',
      'Wireless smart sensors feed a continuous picture of asset health, and anomaly-detection algorithms watch that stream for the reading that does not fit the pattern. Instead of waiting for the next route, the system raises a flag the moment behaviour changes.',
      { quote: 'The value is not more data. It is being told, in real time, which single machine just started behaving differently.' },
      'Used well, this is condition monitoring that never blinks — periodic routes for depth and diagnosis, continuous sensors for coverage and speed. Together they give reliability teams both the early warning and the context to act on it.',
    ],
  },

  /* ── Standards ── */
  {
    kind: 'standard', category: 'Standards', slug: 'iso-20816', topic: 'Vibration',
    title: 'ISO 20816 — evaluating machine vibration', image: '/img/photos/vibration.jpg', date: 'Reference', read: '3 min',
    excerpt: 'The standard that defines vibration severity zones, from a healthy machine to one that needs action.',
    body: [
      'ISO 20816 is the international standard for the measurement and evaluation of machine vibration. It defines the evaluation zones — from Zone A, a machine in new condition, through to Zone D, where vibration is high enough to cause damage — that let an analyst say objectively whether a reading is acceptable.',
      'Every vibration report we issue grades severity against these zones, so "high vibration" is never a matter of opinion. It is measured against a recognised standard, tied to the machine\'s class and mounting, and trended over time.',
      'You can read the standard on the ISO 20816 catalogue entry. It underpins our vibration analysis and dynamic balancing work.',
    ],
  },
  {
    kind: 'standard', category: 'Standards', slug: 'iso-18436-2', topic: 'Certification',
    title: 'ISO 18436-2 — vibration analyst certification', image: '/img/photos/calibration.jpg', date: 'Reference', read: '3 min',
    excerpt: 'The framework that defines what a certified vibration analyst is qualified to do, by category.',
    body: [
      'ISO 18436-2 sets out the categories of competence for vibration condition-monitoring personnel. It defines what each level of analyst is trained and qualified to do — from data collection through to advanced diagnosis and programme management.',
      'It matters because a vibration report is only as good as the person interpreting it. The ISO 18436-2 framework is the benchmark for that competence, and it shapes how we structure both our own analysts\' development and the reliability training we deliver to client teams.',
      'The full ISO 18436-2 scheme is published on the ISO catalogue.',
    ],
  },
  {
    kind: 'standard', category: 'Standards', slug: 'iso-4406', topic: 'Oil Cleanliness',
    title: 'ISO 4406 — coding oil cleanliness', image: '/img/photos/hydraulic.jpg', date: 'Reference', read: '3 min',
    excerpt: 'How the cleanliness of a hydraulic or lubricating oil is measured and expressed as a code.',
    body: [
      'ISO 4406 is the standard for reporting the cleanliness of a fluid. It counts particles by size and expresses the result as a three-number code, giving a precise, comparable measure of how contaminated an oil is.',
      'That code is the target we work to in hydraulic oil purification and fluid management. Different components tolerate different cleanliness levels — a servo valve needs far cleaner oil than a simple ram — so we set the ISO 4406 target to the most sensitive component in the circuit and filter to hold it.',
      'The ISO 4406 method is available on the ISO catalogue.',
    ],
  },
  {
    kind: 'standard', category: 'Standards', slug: 'iec-60422', topic: 'Transformer Oil',
    title: 'IEC 60422 — mineral insulating oil maintenance', image: '/img/photos/transformer.jpg', date: 'Reference', read: '3 min',
    excerpt: 'The maintenance and supervision limits that govern when transformer oil needs attention.',
    body: [
      'IEC 60422 is the guide for the maintenance and supervision of mineral insulating oils in electrical equipment. It sets the limits — for breakdown voltage, moisture, acidity and more — that tell you when transformer oil is still fit for service, and when it needs treatment.',
      'These limits drive our transformer oil purification and regeneration decisions. Rather than replacing oil on a fixed schedule, we test against IEC 60422, then purify or regenerate only when the oil actually calls for it — extending both the oil\'s life and the transformer\'s.',
      'The IEC 60422 guidance is published on the IEC and ISO catalogues.',
    ],
  },
];
export const insightBySlug = (s) => insights.find((i) => i.slug === s);

export const aiTopics = [
  { icon: 'robot', title: 'Predictive AI models', desc: 'Machine-learning models that forecast remaining useful life from your sensor history.' },
  { icon: 'analytics', title: 'Anomaly detection', desc: 'Algorithms that flag the abnormal reading a human route might miss, in real time.' },
  { icon: 'sensor', title: 'Smart sensors & IIoT', desc: 'Always-on wireless sensors feeding a live picture of asset health to the cloud.' },
  { icon: 'dashboard', title: 'Automated reporting', desc: 'AI that drafts the condition report and prioritises actions before your engineer opens it.' },
];

export const faqs = [
  { q: 'What is condition monitoring?', a: 'Measuring the health of your machinery (vibration, temperature, ultrasound, oil) so developing faults are caught and fixed before they cause a breakdown.' },
  { q: 'Do you work on site?', a: 'Yes. Our teams travel to mines, plants and factories across Zimbabwe and the region, on scheduled routes or for once-off diagnostics.' },
  { q: 'Do you sell products as well as services?', a: 'Yes. We supply bearings, lifting equipment, lubrication and condition-monitoring products, all available in our online shop.' },
  { q: 'Can you train our team?', a: 'Absolutely. We run practical reliability and maintenance training so your people build lasting capability in-house.' },
];

/* ---- CLIENT PORTAL (mock condition-monitoring dashboard) ---- */
export const portalKpis = [
  { label: 'Assets monitored', value: '148', trend: '+6', icon: 'cog' },
  { label: 'Plant availability', value: '98.4%', trend: '+0.6', icon: 'analytics' },
  { label: 'Open alerts', value: '3', trend: '-2', icon: 'bell' },
  { label: 'Mean time between failures', value: '412d', trend: '+18', icon: 'clock' },
];
export const portalAssets = [
  { id: 'MTR-014', name: 'Ball Mill Motor 2', type: 'Motor', health: 96, status: 'ok', reading: '2.1 mm/s', param: 'Vibration' },
  { id: 'PMP-208', name: 'Slurry Pump A', type: 'Pump', health: 74, status: 'warn', reading: '58 °C', param: 'Thermal' },
  { id: 'GBX-031', name: 'Conveyor Gearbox 7', type: 'Gearbox', health: 41, status: 'crit', reading: '9.4 mm/s', param: 'Vibration' },
  { id: 'TRF-002', name: 'Main Transformer', type: 'Transformer', health: 91, status: 'ok', reading: '12 ppm', param: 'Oil (moisture)' },
  { id: 'CRN-119', name: 'Overhead Crane 3', type: 'Crane', health: 88, status: 'ok', reading: 'Passed', param: 'Load test' },
  { id: 'FAN-076', name: 'ID Fan 1', type: 'Fan', health: 67, status: 'warn', reading: '5.6 mm/s', param: 'Vibration' },
];
export const portalReports = [
  { title: 'Vibration route — Mill 2', date: '05 Aug 2026', type: 'Vibration', status: 'Reviewed' },
  { title: 'Thermography survey — MCC Room', date: '02 Aug 2026', type: 'Thermal', status: 'Action required' },
  { title: 'Transformer oil analysis Q3', date: '28 Jul 2026', type: 'Oil', status: 'Reviewed' },
  { title: 'Statutory lifting inspection', date: '21 Jul 2026', type: 'Lifting', status: 'Certified' },
];

/* ---- ADMIN / CMS (mock) ---- */
export const cmsStats = [
  { label: 'Published articles', value: 24, icon: 'file' },
  { label: 'Products live', value: 86, icon: 'box' },
  { label: 'Client accounts', value: 32, icon: 'user' },
  { label: 'Reports this month', value: 57, icon: 'analytics' },
];
export const cmsContent = [
  { title: 'Why we say all failures are preventable', type: 'Article', status: 'Published', date: '05 Aug 2026' },
  { title: 'Thermal imaging camera FLIR E8', type: 'Product', status: 'Published', date: '04 Aug 2026' },
  { title: 'Vibration or thermography', type: 'Article', status: 'Draft', date: '03 Aug 2026' },
  { title: 'Mimosa Mine case study', type: 'Case study', status: 'Review', date: '01 Aug 2026' },
  { title: 'Chain hoist 2-ton', type: 'Product', status: 'Published', date: '30 Jul 2026' },
];

/* ---- PORTAL: richer condition-monitoring data (charts, history, work orders) ---- */
// 12-month plant availability + open-alerts series for the Trends tab
export const portalAvailability = [96.9, 97.2, 97.0, 97.6, 98.1, 97.8, 98.3, 98.0, 98.5, 98.2, 98.4, 98.4];
export const portalAlertsSeries = [7, 6, 8, 5, 4, 6, 5, 4, 3, 5, 4, 3];
export const portalMonths = ['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'];
// per-asset detail: 10-point health trend, next service, thresholds, recommended action
export const assetDetail = {
  'MTR-014': { trend: [95, 96, 94, 96, 95, 97, 96, 96, 97, 96], next: '18 Sep 2026', limit: '4.5 mm/s', note: 'Baseline stable. Continue quarterly route monitoring.' },
  'PMP-208': { trend: [88, 86, 84, 82, 80, 78, 77, 75, 74, 74], next: '22 Aug 2026', limit: '65 °C', note: 'Rising bearing temperature. Inspect lubrication and coupling alignment.' },
  'GBX-031': { trend: [78, 72, 68, 61, 55, 50, 47, 44, 42, 41], next: '14 Aug 2026', limit: '7.1 mm/s', note: 'Gear-mesh fault developing fast. Schedule shutdown inspection within 2 weeks.' },
  'TRF-002': { trend: [93, 92, 93, 91, 92, 90, 91, 91, 90, 91], next: '02 Oct 2026', limit: '20 ppm', note: 'Moisture within limits. Next oil sample due Q4.' },
  'CRN-119': { trend: [90, 89, 91, 88, 90, 89, 88, 89, 88, 88], next: '21 Jul 2027', limit: 'SWL 10 t', note: 'Statutory load test passed. Certificate valid 12 months.' },
  'FAN-076': { trend: [82, 80, 78, 76, 74, 72, 70, 69, 68, 67], next: '20 Aug 2026', limit: '7.1 mm/s', note: 'Imbalance trending up. Plan on-site balancing at next stoppage.' },
};
export const workOrdersSeed = [
  { id: 'WO-4471', asset: 'GBX-031', title: 'Conveyor Gearbox 7 — gear-mesh inspection', priority: 'High', status: 'Open', due: '14 Aug 2026' },
  { id: 'WO-4468', asset: 'PMP-208', title: 'Slurry Pump A — lubrication & alignment check', priority: 'Medium', status: 'In progress', due: '22 Aug 2026' },
  { id: 'WO-4455', asset: 'FAN-076', title: 'ID Fan 1 — on-site dynamic balancing', priority: 'Medium', status: 'Scheduled', due: '20 Aug 2026' },
];

/* ---- ADMIN: analytics + reports + settings ---- */
export const cmsMonthly = [12, 9, 14, 11, 16, 13, 18, 15, 21, 17, 24, 22]; // items published / month
export const cmsReports = [
  { ref: 'RPT-0912', client: 'Mimosa Mine', type: 'Vibration', date: '05 Aug 2026', size: '3.2 MB', status: 'Delivered' },
  { ref: 'RPT-0911', client: 'Hwange Colliery', type: 'Thermal', date: '02 Aug 2026', size: '5.1 MB', status: 'Action required' },
  { ref: 'RPT-0908', client: 'Zimplats', type: 'Oil', date: '28 Jul 2026', size: '1.8 MB', status: 'Delivered' },
  { ref: 'RPT-0904', client: 'Delta Beverages', type: 'Lifting', date: '21 Jul 2026', size: '2.4 MB', status: 'Certified' },
  { ref: 'RPT-0901', client: 'PPC Cement', type: 'Vibration', date: '17 Jul 2026', size: '3.9 MB', status: 'Delivered' },
];
export const adminSettingsSeed = [
  { key: 'alerts', label: 'Critical asset alerts', desc: 'Notify account managers the moment an asset crosses a threshold.', on: true },
  { key: 'weekly', label: 'Weekly client digest', desc: 'Email a condition-summary to every active client each Monday.', on: true },
  { key: 'autopub', label: 'Auto-publish reviewed reports', desc: 'Release reports to the client portal once an analyst signs off.', on: false },
  { key: 'twofa', label: 'Enforce two-factor sign-in', desc: 'Require 2FA for all admin and analyst accounts.', on: true },
  { key: 'maint', label: 'Maintenance mode', desc: 'Show a maintenance notice on the public site and shop.', on: false },
];

export const payments = [
  { id: 'ecocash', label: 'EcoCash', logo: '/img/pay/ecocash.png' },
  { id: 'onemoney', label: 'OneMoney', logo: '/img/pay/one-money.png' },
  { id: 'innbucks', label: 'InnBucks', logo: '/img/pay/pm_innbucks.png' },
  { id: 'zimswitch', label: 'Zimswitch', logo: '/img/pay/pm_zimswitch.png' },
  { id: 'card', label: 'Visa / Mastercard', logo: '/img/pay/visa-mastercard.png' },
];
