import React, {useMemo} from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {mulberry32} from './smooth.js';
import {Grade, Grain, Vignette} from './postfx.jsx';

// 8. ANGPAO RED ENVELOPE — VERTICAL 1080x1920, Lunar New Year seasonal.
// Bright red/gold (no black), 3 red envelopes bobbing/swaying, gold coins
// spinning and falling in a loop, sparkles. Frame 0: envelopes fully formed.
// Niche: Lunar New Year / hongbao — specific cultural celebration, upload
// ~3 months before Imlek (6 Feb 2027). Distinct from existing CNY lantern.
// Pure code, no text/characters.
const ENVS = [
  {x: 190, y: 560, s: 1.0, phase: 0},
  {x: 400, y: 480, s: 1.18, phase: 2.1},
  {x: 640, y: 600, s: 0.92, phase: 4.2},
];
export const AngpaoVertical = () => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const p = frame / durationInFrames;
  const cyc = 2 * Math.PI * p;
  const coins = useMemo(() => {
    const rand = mulberry32(113);
    return Array.from({length: 10}, (_, i) => ({x: 60 + rand() * 960, r: 26 + rand() * 22, speed: 0.5 + rand() * 0.7, phase: rand()}));
  }, []);
  const sparks = useMemo(() => {
    const rand = mulberry32(117);
    return Array.from({length: 14}, (_, i) => ({x: 60 + rand() * 960, y: 120 + rand() * 1500, s: 10 + rand() * 14, phase: rand() * 6}));
  }, []);
  return (
    <AbsoluteFill style={{backgroundColor: '#D32F2F', overflow: 'hidden'}}>
      <Grade>
        <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 30%, #FF6B4A 0%, #E53935 45%, #B71C1C 100%)'}} />
        {/* gold pattern circles */}
        <svg width={1080} height={1920} style={{position: 'absolute'}}>
          {Array.from({length: 5}, (_, r) => Array.from({length: 4}, (_, c) => (
            <circle key={`${r}-${c}`} cx={110 + c * 290} cy={130 + r * 380} r={54} fill="none" stroke="#FFD54F" strokeWidth={3} opacity={0.28} />
          )))}
          {/* falling gold coins, loop by modulo */}
          {coins.map((c, i) => {
            const cy = ((c.phase * 2000 + p * 2000 * c.speed) % 2150) - 100;
            const spin = Math.abs(Math.cos(cyc * 2 + c.phase * 6));
            return (
              <g key={i} transform={`translate(${c.x} ${cy})`}>
                <ellipse rx={c.r} ry={c.r} fill="#FFC107" stroke="#FF8F00" strokeWidth={4} />
                <ellipse rx={c.r * spin} ry={c.r} fill="#FFD54F" stroke="#FF8F00" strokeWidth={3} />
                <circle r={c.r * 0.45} fill="none" stroke="#FF8F00" strokeWidth={3} />
              </g>
            );
          })}
          {/* sparkles */}
          {sparks.map((s, i) => {
            const tw = 0.4 + 0.6 * Math.abs(Math.sin(cyc * 2 + s.phase));
            return (
              <polygon key={i} points={`${s.x},${s.y - s.s} ${s.x + s.s * 0.25},${s.y - s.s * 0.25} ${s.x + s.s},${s.y} ${s.x + s.s * 0.25},${s.y + s.s * 0.25} ${s.x},${s.y + s.s} ${s.x - s.s * 0.25},${s.y + s.s * 0.25} ${s.x - s.s},${s.y} ${s.x - s.s * 0.25},${s.y - s.s * 0.25}`}
                fill="#FFF176" opacity={tw} />
            );
          })}
        </svg>
        {/* envelopes */}
        {ENVS.map((e, i) => {
          const bob = 26 * Math.sin(cyc + e.phase);
          const tilt = 4 * Math.sin(cyc * 0.8 + e.phase);
          const w = 300 * e.s, h = 420 * e.s;
          return (
            <div key={i} style={{position: 'absolute', left: e.x, top: e.y + bob, width: w, height: h, transform: `rotate(${tilt}deg)`, background: 'linear-gradient(160deg, #EF5350 0%, #C62828 100%)', borderRadius: 18, border: '5px solid #FFD54F', boxShadow: '0 18px 40px rgba(60,0,0,0.45)'}}>
              <div style={{position: 'absolute', left: 0, top: 0, width: '100%', height: '38%', background: '#B71C1C', borderTopLeftRadius: 13, borderTopRightRadius: 13, clipPath: 'polygon(0 0, 100% 0, 100% 55%, 50% 100%, 0 55%)'}} />
              <div style={{position: 'absolute', left: '50%', top: '52%', width: 150 * e.s, height: 150 * e.s, transform: 'translate(-50%,-50%)', borderRadius: '50%', background: 'radial-gradient(circle, #FFE082 0%, #FFC107 60%, #FF8F00 100%)', border: '4px solid #FF8F00'}} />
              <div style={{position: 'absolute', left: '50%', top: '52%', width: 84 * e.s, height: 84 * e.s, transform: 'translate(-50%,-50%)', borderRadius: '50%', border: '4px solid #FF8F00'}} />
              <div style={{position: 'absolute', left: 0, bottom: 18, width: '100%', textAlign: 'center', fontFamily: 'Arial, sans-serif', fontWeight: 800, fontSize: 30 * e.s, color: '#FFE082'}}>✦ ✦ ✦</div>
            </div>
          );
        })}
        {/* glow top */}
        <div style={{position: 'absolute', left: 290, top: 60, width: 500, height: 200, borderRadius: '50%', background: 'rgba(255,213,79,0.35)', filter: 'blur(50px)'}} />
      </Grade>
      <Grain opacity={0.05} />
      <Vignette strength={0.18} rgb="80,0,0" />
    </AbsoluteFill>
  );
};
