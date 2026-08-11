import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { STATUS_HEX } from '../api';

/* Work-history map — vanilla Leaflet with status-coloured progress-ring markers
   (SVG divIcon, no external marker assets), popups, and auto fit-bounds.
   Modelled on the demo-construction-engine site map. */

const money = (n) => 'US$' + Number(n || 0).toLocaleString();

function markerIcon(status, progress = 0) {
  const color = STATUS_HEX[status] || '#e2211c';
  const safe = Math.max(0, Math.min(100, Math.round(progress)));
  const size = 42, cx = size / 2, r = 15, c = 2 * Math.PI * r, off = c - (safe / 100) * c;
  const fs = safe >= 100 ? 9.5 : 11;
  const html = `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" style="display:block;filter:drop-shadow(0 2px 4px rgba(0,0,0,.3))">
    <circle cx="${cx}" cy="${cx}" r="${r}" fill="#fff" stroke="rgba(17,17,17,.12)" stroke-width="3.5"/>
    <circle cx="${cx}" cy="${cx}" r="${r}" fill="none" stroke="${color}" stroke-width="3.5" stroke-linecap="round"
      stroke-dasharray="${c}" stroke-dashoffset="${off}" transform="rotate(-90 ${cx} ${cx})"/>
    <text x="${cx}" y="${cx}" dy=".06em" text-anchor="middle" dominant-baseline="central"
      font-family="system-ui,sans-serif" font-size="${fs}" font-weight="700" fill="${color}">${safe}%</text></svg>`;
  return L.divIcon({ className: 'ars-marker', html, iconSize: [size, size], iconAnchor: [cx, cx], popupAnchor: [0, -(cx - 2)] });
}

export default function WorkMap({ pins = [], height = 420, className = '' }) {
  const elRef = useRef(null);
  const mapRef = useRef(null);
  const layerRef = useRef(null);

  useEffect(() => {
    if (mapRef.current || !elRef.current) return;
    const map = L.map(elRef.current, { scrollWheelZoom: false, attributionControl: true }).setView([-18.5, 29.5], 6);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors', maxZoom: 19,
    }).addTo(map);
    layerRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;
    setTimeout(() => map.invalidateSize(), 200);
    return () => { map.remove(); mapRef.current = null; };
  }, []);

  useEffect(() => {
    const map = mapRef.current, layer = layerRef.current;
    if (!map || !layer) return;
    layer.clearLayers();
    const valid = pins.filter((p) => p.lat != null && p.lng != null);
    valid.forEach((p) => {
      const m = L.marker([p.lat, p.lng], { icon: markerIcon(p.status, p.progress) });
      m.bindPopup(
        `<div style="min-width:180px;font-family:system-ui,sans-serif">
          <div style="font-size:10px;letter-spacing:.05em;text-transform:uppercase;color:${STATUS_HEX[p.status] || '#e2211c'};font-weight:700">${p.status} · ${Math.round(p.progress || 0)}%</div>
          <div style="font-weight:700;color:#17181c;margin:2px 0">${p.title || ''}</div>
          ${p.client ? `<div style="font-size:12px;color:#555">${p.client}</div>` : ''}
          ${p.location ? `<div style="font-size:12px;color:#888">${p.location}</div>` : ''}
          ${p.budget ? `<div style="font-size:12px;color:#17181c;margin-top:3px">${money(p.budget)}</div>` : ''}
        </div>`, { closeButton: true }
      );
      layer.addLayer(m);
    });
    if (valid.length) {
      const b = L.latLngBounds(valid.map((p) => [p.lat, p.lng]));
      map.fitBounds(b.pad(0.35), { maxZoom: 11 });
    }
    setTimeout(() => map.invalidateSize(), 150);
  }, [pins]);

  return <div ref={elRef} className={className} style={{ height, width: '100%', borderRadius: 'var(--radius-md)', overflow: 'hidden', zIndex: 0 }} />;
}
