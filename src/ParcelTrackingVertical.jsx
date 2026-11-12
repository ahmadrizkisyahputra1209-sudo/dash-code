import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {Grade, Grain, Vignette} from './postfx.jsx';

// 12. PARCEL TRACKING VERTICAL — 1080x1920, e-commerce / logistics.
// Bright light background, smartphone showing a delivery map: dashed route
// (fully drawn at frame 0), parcel pin travelling the route in a loop,
// 3 checkpoint dots lighting up in sequence, progress bar filling and
// emptying periodically. Frame 0: phone + map + route fully composed.
// Niche: online shopping delivery tracking — vertical social/e-commerce,
// 34% of new uploads are vertical (Storyblocks via VoxBooster). Pure code,
// numbers only, no words.
const ROUTE = [
  {x: 200, y: 1150}, {x: 330, y: 1000}, {x: 300, y: 850}, {x: 520, y: 780},
  {x: 760, y: 850}, {x: 830, y: 650}, {x: 700, y: 500}, {x: 850, y: 360},
];
function routePoint(t) {
  const segs = ROUTE.length - 1;
  const ft = t * segs;
  const i = Math.min(segs - 1, Math.floor(ft));
  const f = ft - i;
  return {
    x: ROUTE[i].x + (ROUTE[i + 1].x - ROUTE[i].x) * f,
    y: ROUTE[i].y + (ROUTE[i + 1].y - ROUTE[i].y) * f,
    seg: i,
  };
}
export const ParcelTrackingVertical = () => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const p = frame / durationInFrames;
  const cyc = 2 * Math.PI * p;
  const pin = routePoint(p);
  const d = 'M' + ROUTE.map((r) => `${r.x},${r.y}`).join(' L');
  const prog = 0.15 + 0.85 * p; // 15%..100% across loop, resets at loop point
  const checks = [0.25, 0.55, 0.85].map((t) => p >= t - 0.02);
  return (
    <AbsoluteFill style={{backgroundColor: '#EAF4F8', overflow: 'hidden'}}>
      <Grade>
        <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, #DDF0F7 0%, #F4F8FB 45%, #E3F0F7 100%)'}} />
        {/* soft background blobs — slowly drifting */}
        <div style={{position: 'absolute', left: -120 + 60 * Math.sin(cyc), top: 120 + 40 * Math.cos(cyc), width: 420, height: 420, borderRadius: '50%', background: 'rgba(14,165,165,0.16)', filter: 'blur(30px)'}} />
        <div style={{position: 'absolute', right: -140 + 50 * Math.cos(cyc), top: 1150 + 50 * Math.sin(cyc), width: 480, height: 480, borderRadius: '50%', background: 'rgba(242,140,40,0.16)', filter: 'blur(30px)'}} />
        {/* slow light wash */}
        <div style={{position: 'absolute', inset: 0, background: `radial-gradient(ellipse at ${50 + 25 * Math.sin(cyc * 1.3)}% ${30 + 20 * Math.cos(cyc)}%, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0) 55%)`}} />
        {/* phone */}
        <div style={{position: 'absolute', left: 140, top: 130, width: 800, height: 1560, borderRadius: 56, background: '#16222E', boxShadow: '0 30px 70px rgba(22,34,46,0.35)'}}>
          <div style={{position: 'absolute', left: 22, top: 22, width: 756, height: 1516, borderRadius: 40, background: '#F7FAFC', overflow: 'hidden'}}>
            {/* map: light streets */}
            <svg width={756} height={1516} style={{position: 'absolute'}}>
              <rect width={756} height={1516} fill="#E8F1F5" />
              {[0, 1, 2, 3, 4].map((i) => (
                <g key={i}>
                  <rect x={0} y={220 + i * 260} width={756} height={34} fill="#FFFFFF" />
                  <rect x={110 + i * 140} y={0} width={30} height={1516} fill="#FFFFFF" />
                </g>
              ))}
              <circle cx={180} cy={420} r={90} fill="#D6E8EF" />
              <circle cx={600} cy={1150} r={110} fill="#D6E8EF" />
              <rect x={470} y={200} width={180} height={120} rx={10} fill="#CFE3EC" />
              <rect x={90} y={950} width={150} height={110} rx={10} fill="#CFE3EC" />
              {/* route, fully drawn at frame 0; dashes crawl one pattern per loop (seamless) */}
              <path d={d} fill="none" stroke="#0EA5A5" strokeWidth={12} strokeLinecap="round" strokeDasharray="26 18" strokeDashoffset={-44 * p} />
              <path d={d} fill="none" stroke="#FFFFFF" strokeWidth={4} strokeLinecap="round" strokeDasharray="26 18" strokeDashoffset={-44 * p} opacity={0.6} />
              {/* checkpoints */}
              {ROUTE.slice(0, 1).concat(ROUTE.slice(3, 4), ROUTE.slice(6, 7)).map((r, i) => (
                <g key={i}>
                  <circle cx={r.x} cy={r.y} r={26} fill={checks[i] ? '#0EA5A5' : '#FFFFFF'} stroke="#0EA5A5" strokeWidth={6} />
                  {checks[i] && <circle cx={r.x} cy={r.y} r={38} fill="#0EA5A5" opacity={0.2} />}
                </g>
              ))}
              {/* destination flag */}
              <g transform={`translate(${ROUTE[7].x} ${ROUTE[7].y})`}>
                <line x1={0} y1={0} x2={0} y2={-64} stroke="#33475B" strokeWidth={6} />
                <path d="M0,-64 L64,-48 L0,-30 Z" fill="#E53935" />
              </g>
              {/* moving parcel pin */}
              <g transform={`translate(${pin.x} ${pin.y - 34 - 8 * Math.abs(Math.sin(cyc * 2))})`}>
                <path d="M0,34 Q-34,-6 -30,-38 Q-28,-66 0,-66 Q28,-66 30,-38 Q34,-6 0,34 Z" fill="#F28C28" stroke="#FFFFFF" strokeWidth={5} />
                <rect x={-15} y={-52} width={30} height={22} rx={3} fill="#FFFFFF" />
                <rect x={-3} y={-52} width={6} height={22} fill="#F28C28" />
              </g>
            </svg>
            {/* bottom sheet: progress */}
            <div style={{position: 'absolute', left: 0, bottom: 0, width: '100%', height: 300, background: '#FFFFFF', borderTopLeftRadius: 32, borderTopRightRadius: 32, boxShadow: '0 -12px 30px rgba(22,34,46,0.12)'}}>
              <div style={{position: 'absolute', left: '50%', top: 18, width: 120, height: 10, marginLeft: -60, borderRadius: 5, background: '#DCE6EC'}} />
              <div style={{position: 'absolute', left: 48, top: 60, width: 660, height: 26, borderRadius: 13, background: '#E6EEF3'}} />
              <div style={{position: 'absolute', left: 48, top: 60, width: 660 * prog, height: 26, borderRadius: 13, background: '#0EA5A5'}} />
              <div style={{position: 'absolute', left: 48, top: 110, fontFamily: 'Arial, sans-serif', fontWeight: 800, fontSize: 54, color: '#16324A'}}>{Math.round(prog * 100)}%</div>
              <div style={{position: 'absolute', right: 48, top: 122, fontFamily: 'Arial, sans-serif', fontWeight: 700, fontSize: 40, color: '#0EA5A5'}}>{checks.filter(Boolean).length} / 3</div>
              <div style={{position: 'absolute', left: 48, top: 200, width: 90, height: 90, borderRadius: 18, background: '#FFF3E0', border: '3px solid #F28C28'}} />
              <div style={{position: 'absolute', left: 66, top: 218, width: 54, height: 54, borderRadius: 8, background: '#E8A33D'}} />
            </div>
          </div>
          <div style={{position: 'absolute', left: '50%', top: 34, width: 180, height: 26, marginLeft: -90, borderRadius: 13, background: '#16222E'}} />
        </div>
      </Grade>
      <Grain opacity={0.1} />
      <Vignette strength={0.14} rgb="30,70,90" />
    </AbsoluteFill>
  );
};
