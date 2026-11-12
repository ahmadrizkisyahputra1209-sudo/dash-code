import React, {useMemo} from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {mulberry32} from './smooth.js';
import {Grade, Grain, Vignette} from './postfx.jsx';

// 7. MOSQUE CRESCENT DAWN — Ramadan seasonal. DAWN sky (peach → soft blue),
// deliberately NOT black night: bright gradient, glowing sun low on horizon,
// teal mosque silhouette (domes + 2 minarets), gold crescent, drifting birds
// and clouds. Frame 0: full scene.
// Niche: Ramadan / Islamic architecture — seasonal, upload ~3 months before
// Ramadan (~8 Feb 2027). Distinct from existing Ramadan star + ketupat.
// Pure code.
export const MosqueCrescentDawn = () => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const p = frame / durationInFrames;
  const cyc = 2 * Math.PI * p;
  const birds = useMemo(() => {
    const rand = mulberry32(91);
    return Array.from({length: 7}, (_, i) => ({x: 150 + rand() * 1600, y: 150 + rand() * 200, s: 0.7 + rand() * 0.6, phase: rand(), speed: 0.4 + rand() * 0.5}));
  }, []);
  const glow = 0.5 + 0.12 * Math.sin(cyc);
  return (
    <AbsoluteFill style={{backgroundColor: '#FFE3C2', overflow: 'hidden'}}>
      <Grade>
        <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, #8EC9EE 0%, #C9E4F7 30%, #FFE3C2 55%, #FFC98F 72%, #7FB069 72.2%, #4E7A45 100%)'}} />
        <div style={{position: 'absolute', left: 830, top: 480, width: 420, height: 420, borderRadius: '50%', background: `rgba(255,214,130,${glow})`, filter: 'blur(60px)'}} />
        <div style={{position: 'absolute', left: 920, top: 570, width: 220, height: 220, borderRadius: '50%', background: 'radial-gradient(circle, #FFF6D8 0%, #FFD66B 55%, rgba(255,214,107,0) 76%)'}} />
        {/* crescent moon: two overlapping circles */}
        <svg width={1920} height={1080} style={{position: 'absolute'}}>
          <circle cx={330} cy={210} r={86} fill="#FFD66B" />
          <circle cx={368} cy={186} r={76} fill="#A8D2EF" opacity={0.95} />
          <circle cx={330} cy={210} r={86} fill="none" stroke="#FFF3C4" strokeWidth={4} opacity={0.7} />
          {/* clouds */}
          {[0, 1, 2].map((i) => (
            <ellipse key={i} cx={((420 + i * 560 + p * 300) % 2200) - 150} cy={300 + i * 60} rx={150} ry={26} fill="#FFFFFF" opacity={0.75} />
          ))}
          {/* birds */}
          {birds.map((b, i) => {
            const bx = ((b.x + p * 1920 * 0.1 * b.speed) % 2100) - 90;
            const flap = 0.6 + 0.4 * Math.sin(cyc * 5 + b.phase * 6);
            return (
              <path key={i} d={`M${bx - 14 * b.s},${b.y} Q${bx - 7 * b.s},${b.y - 9 * b.s * flap} ${bx},${b.y} Q${bx + 7 * b.s},${b.y - 9 * b.s * flap} ${bx + 14 * b.s},${b.y}`}
                fill="none" stroke="#2E5F6B" strokeWidth={3.5} strokeLinecap="round" />
            );
          })}
          {/* mosque silhouette — deep teal, not black */}
          <g fill="#1F4E5F">
            <rect x={330} y={700} width={1260} height={180} />
            <rect x={300} y={660} width={1320} height={50} rx={8} />
            {/* main dome */}
            <path d="M810,660 Q810,470 960,430 Q1110,470 1110,660 Z" />
            <rect x={948} y={380} width={24} height={60} />
            <circle cx={960} cy={372} r={14} />
            {/* side domes */}
            <path d="M560,660 Q560,540 680,505 Q800,540 800,660 Z" />
            <path d="M1120,660 Q1120,540 1240,505 Q1360,540 1360,660 Z" />
            {/* minarets */}
            <rect x={380} y={330} width={52} height={380} />
            <path d="M372,330 L406,250 L440,330 Z" />
            <rect x={364} y={420} width={84} height={18} rx={6} />
            <rect x={1488} y={330} width={52} height={380} />
            <path d="M1480,330 L1514,250 L1548,330 Z" />
            <rect x={1472} y={420} width={84} height={18} rx={6} />
            {/* arched windows, warm lit */}
            {[0, 1, 2, 3, 4].map((i) => (
              <path key={i} d={`M${560 + i * 200},880 L${560 + i * 200},780 Q${590 + i * 200},730 ${620 + i * 200},780 L${620 + i * 200},880 Z`} fill="#FFD66B" opacity={0.9} />
            ))}
          </g>
          {/* ground + reflection of light */}
          <ellipse cx={960} cy={930} rx={700} ry={26} fill="#FFD66B" opacity={0.18} />
        </svg>
      </Grade>
      <Grain opacity={0.09} />
      <Vignette strength={0.18} rgb="40,70,90" />
    </AbsoluteFill>
  );
};
