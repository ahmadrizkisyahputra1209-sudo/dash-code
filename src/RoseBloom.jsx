import React, {useMemo} from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {mulberry32} from './smooth.js';
import {Grade, Grain, Vignette} from './postfx.jsx';

// 9. ROSE BLOOM VALENTINE — soft bright pink background, red rose opening
// (periodic bloom: 70% open at frame 0 so the poster is a full rose, widest
// mid-loop), swaying stem/leaves, falling petals in a loop, dew sparkles.
// Frame 0: rose already 70% open, fully composed.
// Niche: Valentine's Day / romance flower — seasonal, upload ~3 months
// before 14 Feb 2027. Distinct from existing valentine hearts. Pure code.
export const RoseBloom = () => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const p = frame / durationInFrames;
  const cyc = 2 * Math.PI * p;
  const open = 0.72 + 0.28 * (0.5 - 0.5 * Math.cos(cyc)); // 0.72..1.0
  const petals = useMemo(() => {
    const rand = mulberry32(131);
    return Array.from({length: 8}, (_, i) => ({x: 150 + rand() * 1620, speed: 0.4 + rand() * 0.5, phase: rand(), s: 0.7 + rand() * 0.6, rot: rand() * 360}));
  }, []);
  const layers = [
    {n: 5, r: 150, color: '#B71C1C', scale: 1.0},
    {n: 5, r: 118, color: '#C62828', scale: 0.92},
    {n: 5, r: 88, color: '#E53935', scale: 0.84},
    {n: 4, r: 58, color: '#EF5350', scale: 0.76},
  ];
  return (
    <AbsoluteFill style={{backgroundColor: '#FDEEF2', overflow: 'hidden'}}>
      <Grade>
        <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 42%, #FFF7F0 0%, #FDEEF2 50%, #F8D7E3 100%)'}} />
        <div style={{position: 'absolute', left: 700, top: 80, width: 520, height: 520, borderRadius: '50%', background: 'rgba(255,255,255,0.7)', filter: 'blur(40px)'}} />
        <svg width={1920} height={1080} style={{position: 'absolute'}}>
          {/* falling petals, loop by modulo */}
          {petals.map((pt, i) => {
            const py = ((pt.phase * 1150 + p * 1150 * pt.speed) % 1250) - 80;
            const px = pt.x + 70 * Math.sin(cyc * 2 + pt.phase * 6);
            return (
              <ellipse key={i} cx={px} cy={py} rx={22 * pt.s} ry={14 * pt.s} fill="#EF9A9A" opacity={0.75}
                transform={`rotate(${pt.rot + frame * 0.4 * pt.speed} ${px} ${py})`} />
            );
          })}
          {/* stem + leaves, gentle sway */}
          <g transform={`rotate(${2.2 * Math.sin(cyc)} 960 1010)`}>
            <path d="M960,1010 Q950,820 960,620" fill="none" stroke="#2E7D32" strokeWidth={18} strokeLinecap="round" />
            <path d="M955,880 Q820,830 760,880 Q840,950 955,900 Z" fill="#43A047" />
            <path d="M962,780 Q1090,720 1160,780 Q1080,850 962,800 Z" fill="#388E3C" />
            <path d="M958,950 Q830,920 790,970 Q880,1010 958,965 Z" fill="#43A047" />
          </g>
          {/* rose head — larger, with spiral inner petals so it reads as a rose */}
          <g transform={`translate(960 490) scale(1.5) rotate(${3 * Math.sin(cyc * 0.5)})`}>
            {layers.map((L, li) => L && Array.from({length: L.n}, (_, k) => {
              const ang = (k / L.n) * 360 + li * 36;
              const rr = L.r * open * L.scale;
              return (
                <ellipse key={`${li}-${k}`} cx={rr * 0.62 * Math.cos((ang * Math.PI) / 180)} cy={rr * 0.62 * Math.sin((ang * Math.PI) / 180)}
                  rx={rr * 0.52} ry={rr * 0.34} fill={L.color}
                  transform={`rotate(${ang} ${rr * 0.62 * Math.cos((ang * Math.PI) / 180)} ${rr * 0.62 * Math.sin((ang * Math.PI) / 180)})`} />
              );
            }))}
            <ellipse cx={0} cy={0} rx={34 * open} ry={26 * open} fill="#FF8A80" />
            <ellipse cx={-12} cy={-10} rx={12} ry={8} fill="#FFCDD2" opacity={0.9} />
            {/* spiral inner petals */}
            {[0, 1, 2, 3, 4].map((k) => {
              const a = (k / 5) * 360 + 20;
              const rr = 16 + k * 5;
              return (
                <ellipse key={k} cx={rr * 0.5 * Math.cos((a * Math.PI) / 180)} cy={rr * 0.5 * Math.sin((a * Math.PI) / 180)}
                  rx={15} ry={8} fill={k % 2 === 0 ? '#FF5252' : '#FF8A80'}
                  transform={`rotate(${a + 40} ${rr * 0.5 * Math.cos((a * Math.PI) / 180)} ${rr * 0.5 * Math.sin((a * Math.PI) / 180)})`} />
              );
            })}
          </g>
          {/* dew sparkles */}
          {[0, 1, 2].map((i) => {
            const tw = 0.35 + 0.65 * Math.abs(Math.sin(cyc * 2 + i * 2.1));
            return <circle key={i} cx={820 + i * 150} cy={330 + i * 40} r={7} fill="#FFFFFF" opacity={tw} />;
          })}
        </svg>
      </Grade>
      <Grain opacity={0.04} />
      <Vignette strength={0.14} rgb="120,40,70" />
    </AbsoluteFill>
  );
};
