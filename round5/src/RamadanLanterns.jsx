import React, {useMemo} from 'react';
import {AbsoluteFill, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {cyc, mulberry32, triWave} from './smooth.js';
import {Grade, GrainNoise, Vignette} from './postfx.jsx';

// 2. RAMADAN LANTERNS — ornate fanous lanterns swaying on chains across a
// night sky, warm glow pulsing. 3 depth planes (back/mid/front) with
// different sway phase, size and blur = parallax. Pendulum sway is periodic
// (sin), glow pulse is a looping spring (triWave -> spring, damping 10 =
// playful overshoot). Frame 0: all lanterns lit, poster-ready.
function Lantern({x, y, s, phase, p, frame, fps, blur}) {
  const sway = 3.5 * cyc(p, 1, phase);
  const glow = 0.55 + 0.35 * cyc(p, 1, phase + 1.2);
  const springGlow = spring({frame: triWave(frame, 100), fps, config: {damping: 10}});
  const glowScale = 0.92 + 0.18 * springGlow;
  return (
    <g transform={`translate(${x} ${y})`} style={{filter: blur ? `blur(${blur}px)` : undefined}}>
      <g transform={`rotate(${sway.toFixed(2)})`} style={{transformOrigin: '0px 0px'}}>
        <line x1={0} y1={-150} x2={0} y2={-118} stroke="#8C6D1F" strokeWidth={3 * s} />
        <g transform={`scale(${s})`}>
          {/* glow */}
          <circle cx={0} cy={0} r={150 * glowScale} fill="rgba(255,183,77,0.35)" opacity={glow} />
          {/* finial + dome */}
          <circle cx={0} cy={-138} r={7} fill="#D4AF37" />
          <line x1={0} y1={-160} x2={0} y2={-138} stroke="#D4AF37" strokeWidth={4} />
          <path d="M-52,-116 Q0,-168 52,-116 L52,-104 L-52,-104 Z" fill="#B8860B" stroke="#8C6D1F" strokeWidth={2} />
          {/* body */}
          <path d="M-58,-104 L-72,40 L-52,96 L52,96 L72,40 L58,-104 Z" fill="#7A5A12" stroke="#D4AF37" strokeWidth={3} />
          <path d="M-46,-88 L-58,34 L-42,80 L42,80 L58,34 L46,-88 Z" fill="#FFB74D" opacity={0.95} />
          <path d="M-46,-88 L-58,34 L-42,80 L42,80 L58,34 L46,-88 Z" fill="url(#glassGrad)" opacity={0.55} />
          {/* vertical bars */}
          {[-30, -10, 10, 30].map((bx) => (
            <line key={bx} x1={bx} y1={-88} x2={bx * 0.82} y2={80} stroke="#7A5A12" strokeWidth={4} />
          ))}
          <line x1={-58} y1={-20} x2={58} y2={-20} stroke="#7A5A12" strokeWidth={4} />
          {/* base + tassel */}
          <rect x={-52} y={96} width={104} height={14} rx={5} fill="#B8860B" stroke="#8C6D1F" strokeWidth={2} />
          <line x1={0} y1={110} x2={0} y2={150} stroke="#D4AF37" strokeWidth={3} />
          <circle cx={0} cy={158} r={9} fill="#D4AF37" />
        </g>
      </g>
    </g>
  );
}

export const RamadanLanterns = () => {
  const frame = useCurrentFrame();
  const {durationInFrames, fps} = useVideoConfig();
  const p = frame / durationInFrames;

  const stars = useMemo(() => {
    const rand = mulberry32(5);
    return Array.from({length: 60}, () => ({
      x: rand() * 1920, y: rand() * 620, r: 1 + rand() * 2.2, phase: rand() * 6.28,
    }));
  }, []);

  const lanterns = [
    {x: 240, y: 300, s: 0.62, phase: 0.0, blur: 2},
    {x: 1680, y: 320, s: 0.62, phase: 1.4, blur: 2},
    {x: 620, y: 430, s: 0.88, phase: 0.7, blur: 0},
    {x: 1300, y: 450, s: 0.88, phase: 2.1, blur: 0},
    {x: 960, y: 560, s: 1.18, phase: 1.1, blur: 0},
  ];

  return (
    <AbsoluteFill style={{backgroundColor: '#141433', overflow: 'hidden'}}>
      <Grade>
        <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, #141433 0%, #2D1B4E 55%, #3B2A5A 100%)'}} />
        <div style={{position: 'absolute', left: 1500, top: 90, width: 320, height: 320, borderRadius: '50%', background: 'rgba(246,232,200,0.14)', filter: 'blur(50px)'}} />
        {stars.map((st, i) => (
          <div key={i} style={{position: 'absolute', left: st.x, top: st.y, width: st.r * 2, height: st.r * 2, borderRadius: '50%', background: '#FFF8E1', opacity: 0.25 + 0.65 * Math.abs(cyc(p, 2, st.phase))}} />
        ))}
        <svg width={1920} height={1080} style={{position: 'absolute'}}>
          <defs>
            <linearGradient id="glassGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FFE082" />
              <stop offset="100%" stopColor="#FF8F00" />
            </linearGradient>
          </defs>
          {/* mosque silhouette */}
          <g fill="#0D0D24">
            <rect x={0} y={980} width={1920} height={100} />
            <path d="M180,980 Q180,880 300,880 Q420,880 420,980 Z" />
            <rect x={288} y={800} width={24} height={180} />
            <circle cx={300} cy={792} r={18} />
            <path d="M760,980 Q760,900 880,900 Q1000,900 1000,980 Z" />
            <path d="M1180,980 Q1180,860 1340,860 Q1500,860 1500,980 Z" />
            <rect x={1328} y={780} width={24} height={200} />
            <circle cx={1340} cy={772} r={18} />
            <rect x={1560} y={820} width={20} height={160} />
            <circle cx={1570} cy={812} r={15} />
          </g>
          {lanterns.map((L, i) => (
            <Lantern key={i} {...L} p={p} frame={frame} fps={fps} />
          ))}
        </svg>
      </Grade>
      <GrainNoise opacity={0.06} seed={32} />
      <Vignette strength={0.22} rgb="10,10,40" />
    </AbsoluteFill>
  );
};
