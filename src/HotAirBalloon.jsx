import React, {useMemo} from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {mulberry32} from './smooth.js';
import {Grade, Grain, Vignette} from './postfx.jsx';

// 11. HOT AIR BALLOON SUNRISE — bright sunrise sky, green rolling hills,
// 3 striped balloons drifting up/down + slowly sideways (periodic = loop),
// sun glow, birds. Frame 0: all balloons in frame, full scene.
// Niche: travel / tourism / adventure — seasonal travel spikes each quarter
// (biztoolkit: travel refreshes yearly, strong seasonal spikes). Pure code.
const BALLOONS = [
  {x: 420, y: 330, s: 1.0, colors: ['#E53935', '#FFF176', '#E53935', '#FFF176'], phase: 0},
  {x: 980, y: 240, s: 1.25, colors: ['#2B6CB0', '#FFFFFF', '#2B6CB0', '#FFFFFF'], phase: 2.1},
  {x: 1520, y: 360, s: 0.85, colors: ['#7C5CFF', '#FFB74D', '#7C5CFF', '#FFB74D'], phase: 4.2},
];
function Balloon({x, y, s, colors, phase, p}) {
  const cyc = 2 * Math.PI * p;
  const bx = x + 60 * Math.sin(cyc * 0.7 + phase);
  const by = y + 34 * Math.sin(cyc + phase);
  const tilt = 2.5 * Math.sin(cyc * 0.9 + phase);
  const R = 110 * s;
  return (
    <g transform={`translate(${bx} ${by}) rotate(${tilt})`}>
      <path d={`M${-R},0 Q${-R},${-R * 1.05} 0,${-R * 1.15} Q${R},${-R * 1.05} ${R},0 Q${R * 0.55},${R * 0.55} 0,${R * 0.55} Q${-R * 0.55},${R * 0.55} ${-R},0 Z`} fill={colors[0]} />
      <path d={`M${-R * 0.5},${-R * 1.12} Q${-R * 0.28},${-R * 0.4} ${-R * 0.32},${R * 0.5} L${R * 0.32},${R * 0.5} Q${R * 0.28},${-R * 0.4} ${R * 0.5},${-R * 1.12} Q0,${-R * 1.28} ${-R * 0.5},${-R * 1.12} Z`} fill={colors[1]} />
      <path d={`M${-R * 0.16},${-R * 1.14} Q${-R * 0.1},${-R * 0.3} ${-R * 0.12},${R * 0.52} L${R * 0.12},${R * 0.52} Q${R * 0.1},${-R * 0.3} ${R * 0.16},${-R * 1.14} Q0,${-R * 1.22} ${-R * 0.16},${-R * 1.14} Z`} fill={colors[2]} />
      <line x1={-R * 0.55} y1={R * 0.35} x2={-R * 0.22} y2={R * 0.95} stroke="#4E342E" strokeWidth={4} />
      <line x1={R * 0.55} y1={R * 0.35} x2={R * 0.22} y2={R * 0.95} stroke="#4E342E" strokeWidth={4} />
      <rect x={-R * 0.26} y={R * 0.92} width={R * 0.52} height={R * 0.42} rx={8} fill="#8D6E63" stroke="#5D4037" strokeWidth={3} />
    </g>
  );
}
export const HotAirBalloon = () => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const p = frame / durationInFrames;
  const cyc = 2 * Math.PI * p;
  const birds = useMemo(() => {
    const rand = mulberry32(171);
    return Array.from({length: 6}, (_, i) => ({x: 200 + rand() * 1500, y: 160 + rand() * 220, s: 0.7 + rand() * 0.6, phase: rand(), speed: 0.4 + rand() * 0.5}));
  }, []);
  return (
    <AbsoluteFill style={{backgroundColor: '#BFE3FF', overflow: 'hidden'}}>
      <Grade>
        <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, #6FB9EC 0%, #AEDCF7 38%, #FFE3C2 62%, #FFC98F 74%, #7CB342 74.2%, #55893A 100%)'}} />
        <div style={{position: 'absolute', left: 820, top: 480, width: 460, height: 460, borderRadius: '50%', background: 'rgba(255,220,140,0.55)', filter: 'blur(60px)'}} />
        <div style={{position: 'absolute', left: 920, top: 580, width: 240, height: 240, borderRadius: '50%', background: 'radial-gradient(circle, #FFF6D8 0%, #FFD66B 60%, rgba(255,214,107,0) 78%)'}} />
        <svg width={1920} height={1080} style={{position: 'absolute'}}>
          {[0, 1].map((i) => (
            <ellipse key={i} cx={((300 + i * 700 + p * 260) % 2200) - 150} cy={180 + i * 90} rx={170} ry={28} fill="#FFFFFF" opacity={0.8} />
          ))}
          {birds.map((b, i) => {
            const bx = ((b.x + p * 1920 * 0.1 * b.speed) % 2100) - 90;
            const flap = 0.6 + 0.4 * Math.sin(cyc * 5 + b.phase * 6);
            return (
              <path key={i} d={`M${bx - 14 * b.s},${b.y} Q${bx - 7 * b.s},${b.y - 9 * b.s * flap} ${bx},${b.y} Q${bx + 7 * b.s},${b.y - 9 * b.s * flap} ${bx + 14 * b.s},${b.y}`}
                fill="none" stroke="#33475B" strokeWidth={3.5} strokeLinecap="round" />
            );
          })}
          <path d="M0,820 Q480,730 960,790 T1920,780 L1920,1080 L0,1080 Z" fill="#6FA844" />
          <path d="M0,920 Q520,850 1020,900 T1920,890 L1920,1080 L0,1080 Z" fill="#55893A" />
          {BALLOONS.map((b, i) => <Balloon key={i} {...b} p={p} />)}
        </svg>
      </Grade>
      <Grain opacity={0.05} />
      <Vignette strength={0.16} rgb="40,80,110" />
    </AbsoluteFill>
  );
};
