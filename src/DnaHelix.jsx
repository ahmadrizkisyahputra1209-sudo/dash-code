import React, {useMemo} from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {mulberry32} from './smooth.js';
import {Grade, Grain, Vignette} from './postfx.jsx';

// 5. DNA HELIX BIOTECH — bright clean lab background, double helix rotating
// (one full turn per loop = seamless), glowing base-pair rungs, soft bubbles
// rising in a loop. Frame 0: full helix already formed.
// Niche: biotech / healthcare / genetics — low-supply medical niche with
// steady demand (healthcare B-roll). Pure code.
const N = 26;
export const DnaHelix = () => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const p = frame / durationInFrames;
  const cyc = 2 * Math.PI * p;
  const cx = 960, top = 130, bottom = 950, A = 260;
  const pts = [];
  for (let i = 0; i < N; i++) {
    const y = top + (i / (N - 1)) * (bottom - top);
    const ph = (i / (N - 1)) * Math.PI * 5 + cyc;
    const x1 = cx + A * Math.sin(ph);
    const x2 = cx - A * Math.sin(ph);
    const depth = Math.cos(ph); // front/back for size + opacity
    pts.push({y, x1, x2, depth, i});
  }
  const strand1 = pts.map((pt, i) => `${i === 0 ? 'M' : 'L'}${pt.x1.toFixed(1)},${pt.y.toFixed(1)}`).join(' ');
  const strand2 = pts.map((pt, i) => `${i === 0 ? 'M' : 'L'}${pt.x2.toFixed(1)},${pt.y.toFixed(1)}`).join(' ');
  const bubbles = useMemo(() => {
    const rand = mulberry32(55);
    return Array.from({length: 12}, (_, i) => ({x: 120 + rand() * 1680, r: 8 + rand() * 22, speed: 0.5 + rand() * 0.7, phase: rand()}));
  }, []);
  return (
    <AbsoluteFill style={{backgroundColor: '#EAF6F6', overflow: 'hidden'}}>
      <Grade>
        <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 40%, #FFFFFF 0%, #DFF2F2 55%, #BFE6E8 100%)'}} />
        {/* lab bench line + soft hex hints */}
        <svg width={1920} height={1080} style={{position: 'absolute'}}>
          {[0, 1, 2, 3].map((i) => (
            <circle key={i} cx={300 + i * 440} cy={180} r={46} fill="none" stroke="#9FD8D8" strokeWidth={3} opacity={0.5} />
          ))}
          {/* bubbles rising, loop by modulo */}
          {bubbles.map((b, i) => {
            const by = 1080 - ((b.phase * 1080 + p * 1080 * b.speed) % 1150);
            return <circle key={i} cx={b.x} cy={by} r={b.r} fill="none" stroke="#7FC8C8" strokeWidth={2.5} opacity={0.55} />;
          })}
          {/* rungs (behind strands) */}
          {pts.map((pt) => (
            <line key={`r${pt.i}`} x1={pt.x1} y1={pt.y} x2={pt.x2} y2={pt.y}
              stroke={pt.i % 2 === 0 ? '#0EA5A5' : '#2B6CB0'} strokeWidth={7} strokeLinecap="round"
              opacity={0.35 + 0.35 * Math.abs(pt.depth)} />
          ))}
          {/* strands: continuous backbones so the twist reads as a helix */}
          <path d={strand1} fill="none" stroke="#0EA5A5" strokeWidth={11} strokeLinecap="round" opacity={0.9} />
          <path d={strand2} fill="none" stroke="#2B6CB0" strokeWidth={11} strokeLinecap="round" opacity={0.9} />
          {/* strands */}
          {pts.map((pt) => (
            <g key={`s${pt.i}`}>
              <circle cx={pt.x1} cy={pt.y} r={13 + 7 * pt.depth} fill="#0EA5A5" stroke="#FFFFFF" strokeWidth={3} />
              <circle cx={pt.x2} cy={pt.y} r={13 - 7 * pt.depth} fill="#2B6CB0" stroke="#FFFFFF" strokeWidth={3} />
            </g>
          ))}
          {/* glow at center */}
          <ellipse cx={cx} cy={540} rx={330} ry={430} fill="#0EA5A5" opacity={0.05} />
        </svg>
      </Grade>
      <Grain opacity={0.04} />
      <Vignette strength={0.14} rgb="30,90,100" />
    </AbsoluteFill>
  );
};
