import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {Grade, Grain, Vignette} from './postfx.jsx';

// 4. DONUT CHART DASHBOARD — bright white/cyan dashboard panel: big donut
// with 4 segments + center number, side bars pulsing periodically, rotating
// highlight arc. Frame 0: donut FULLY drawn (no build-up from empty).
// Niche: business data-visualisation dashboard overlay — the exact pattern
// of Adobe's top sellers (donut rings + bar charts, bright white/cyan).
// Numbers only, no words. Pure code.
const SEGS = [
  {color: '#0EA5A5', frac: 0.38, label: '38%'},
  {color: '#F28C28', frac: 0.27, label: '27%'},
  {color: '#2B6CB0', frac: 0.21, label: '21%'},
  {color: '#7C5CFF', frac: 0.14, label: '14%'},
];
const R = 250, C = 2 * Math.PI * R;

export const DonutChart = () => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const p = frame / durationInFrames;
  const cyc = 2 * Math.PI * p;
  const hiAngle = 360 * p; // highlight marker orbits once per loop
  let offset = 0;
  const bars = [0.72, 0.55, 0.88, 0.64, 0.79];
  return (
    <AbsoluteFill style={{backgroundColor: '#F4F8FB', overflow: 'hidden'}}>
      <Grade>
        <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(135deg, #FFFFFF 0%, #EAF4F8 60%, #DDF0F7 100%)'}} />
        {/* faint grid dots — drifting slowly, one full drift per loop */}
        <svg width={1920} height={1080} style={{position: 'absolute'}}>
          {Array.from({length: 24}, (_, r) => Array.from({length: 16}, (_, c) => (
            <circle key={`${r}-${c}`} cx={60 + c * 120 + 60 * Math.sin(cyc + r * 0.4)} cy={60 + r * 66} r={3} fill="#B9D6E2" opacity={0.5} />
          )))}
          {/* rotating dashed ring around the donut */}
          <circle cx={560} cy={620} r={296} fill="none" stroke="#0EA5A5" strokeWidth={5} strokeDasharray="30 22" opacity={0.55} transform={`rotate(${360 * p} 560 620)`} />
          <circle cx={560} cy={620} r={316} fill="none" stroke="#F28C28" strokeWidth={3} strokeDasharray="10 26" opacity={0.4} transform={`rotate(${-360 * p} 560 620)`} />
        </svg>
        {/* sweeping sheen across the panel, one pass per loop */}
        <div style={{position: 'absolute', left: -400 + p * 2600, top: -200, width: 260, height: 1400, background: 'rgba(255,255,255,0.20)', filter: 'blur(6px)', transform: 'rotate(18deg)'}} />
        {/* slow light wash drifting across the whole frame (seamless) */}
        <div style={{position: 'absolute', inset: 0, background: `radial-gradient(ellipse at ${50 + 28 * Math.sin(cyc)}% ${42 + 18 * Math.cos(cyc)}%, rgba(14,165,165,0.12) 0%, rgba(255,255,255,0) 62%)`}} />
        {/* main panel */}
        <div style={{position: 'absolute', left: 110, top: 90, width: 1700, height: 900, borderRadius: 28, background: '#FFFFFF', boxShadow: '0 24px 60px rgba(43,108,176,0.16)', border: '2px solid #DCEBF2'}} />
        <div style={{position: 'absolute', left: 110, top: 90, width: 1700, height: 90, borderTopLeftRadius: 28, borderTopRightRadius: 28, background: '#0EA5A5'}} />
        <div style={{position: 'absolute', left: 170, top: 112, width: 340, height: 44, borderRadius: 22, background: 'rgba(255,255,255,0.35)'}} />
        {/* donut */}
        <svg width={1920} height={1080} style={{position: 'absolute'}}>
          <circle cx={560} cy={620} r={R} fill="none" stroke="#E6EEF3" strokeWidth={64} />
          {SEGS.map((s, i) => {
            const len = s.frac * C;
            const el = (
              <circle key={i} cx={560} cy={620} r={R} fill="none" stroke={s.color} strokeWidth={64}
                strokeDasharray={`${len - 14} ${C - len + 14}`} strokeDashoffset={-offset}
                transform="rotate(-90 560 620)" strokeLinecap="butt" />
            );
            offset += len;
            return el;
          })}
          {/* orbiting highlight dot */}
          <circle cx={560 + (R + 2) * Math.cos((hiAngle - 90) * Math.PI / 180)} cy={620 + (R + 2) * Math.sin((hiAngle - 90) * Math.PI / 180)} r={16} fill="#FFFFFF" stroke="#0EA5A5" strokeWidth={6} />
          <circle cx={560 + (R + 2) * Math.cos((hiAngle - 90) * Math.PI / 180)} cy={620 + (R + 2) * Math.sin((hiAngle - 90) * Math.PI / 180)} r={30} fill="#0EA5A5" opacity={0.18} />
        </svg>
        <div style={{position: 'absolute', left: 410, top: 545, width: 300, textAlign: 'center', fontFamily: 'Arial, sans-serif', fontWeight: 800, fontSize: 92, color: '#16324A'}}>100%</div>
        <div style={{position: 'absolute', left: 410, top: 660, width: 300, textAlign: 'center', fontFamily: 'Arial, sans-serif', fontWeight: 600, fontSize: 34, color: '#5B7A94'}}>+24%</div>
        {/* legend + bars */}
        {SEGS.map((s, i) => {
          const h = bars[i] * 300 * (0.92 + 0.08 * Math.sin(cyc + i * 1.4));
          return (
            <div key={i}>
              <div style={{position: 'absolute', left: 1010, top: 300 + i * 150, width: 34, height: 34, borderRadius: 9, background: s.color}} />
              <div style={{position: 'absolute', left: 1065, top: 296 + i * 150, fontFamily: 'Arial, sans-serif', fontWeight: 800, fontSize: 44, color: '#16324A'}}>{s.label}</div>
              <div style={{position: 'absolute', left: 1230, top: 306 + i * 150, width: 420, height: 26, borderRadius: 13, background: '#E6EEF3'}} />
              <div style={{position: 'absolute', left: 1230, top: 306 + i * 150, width: 420 * (0.35 + s.frac) * (0.94 + 0.06 * Math.sin(cyc + i)), height: 26, borderRadius: 13, background: s.color}} />
            </div>
          );
        })}
        {/* bottom mini bars */}
        <svg width={1920} height={1080} style={{position: 'absolute'}}>
          {bars.map((b, i) => {
            const h = 60 + b * 120 * (0.9 + 0.1 * Math.sin(cyc + i * 1.1));
            return <rect key={i} x={1010 + i * 130} y={920 - h} width={84} height={h} rx={10} fill={SEGS[i % 4].color} opacity={0.85} />;
          })}
        </svg>
      </Grade>
      <Grain opacity={0.1} />
      <Vignette strength={0.12} rgb="40,90,120" />
    </AbsoluteFill>
  );
};
