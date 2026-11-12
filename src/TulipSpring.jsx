import React, {useMemo} from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {mulberry32} from './smooth.js';
import {Grade, Grain, Vignette} from './postfx.jsx';

// 10. TULIP SPRING GARDEN — bright spring sky, green field rows, 7 tulips in
// mixed colours swaying periodically, cup petals opening slightly mid-loop,
// a butterfly drifting across (loop), drifting clouds. Frame 0: full garden.
// Niche: spring / Easter garden — seasonal for Easter (28 Mar 2027) and
// spring campaigns; distinct from existing easter eggs + cherry blossom.
// Pure code.
const TULIPS = [
  {x: 240, h: 300, color: '#E53935', phase: 0},
  {x: 500, h: 340, color: '#F9A825', phase: 0.9},
  {x: 760, h: 290, color: '#EC407A', phase: 1.8},
  {x: 1020, h: 350, color: '#AB47BC', phase: 2.7},
  {x: 1280, h: 310, color: '#FF7043', phase: 3.6},
  {x: 1540, h: 345, color: '#F06292', phase: 4.5},
  {x: 1740, h: 295, color: '#FFF176', phase: 5.4},
];
function Tulip({x, h, color, phase, p}) {
  const cyc = 2 * Math.PI * p;
  const sway = 5 * Math.sin(cyc + phase);
  const open = 1 + 0.12 * Math.sin(cyc + phase);
  const topY = 830 - h;
  return (
    <g transform={`rotate(${sway} ${x} 830)`}>
      <path d={`M${x},830 Q${x - 8},${topY + 120} ${x},${topY + 60}`} fill="none" stroke="#2E7D32" strokeWidth={12} strokeLinecap="round" />
      <path d={`M${x},760 Q${x - 70},730 ${x - 110},770 Q${x - 60},800 ${x},775 Z`} fill="#43A047" />
      <path d={`M${x},700 Q${x + 70},670 ${x + 110},710 Q${x + 60},740 ${x},715 Z`} fill="#388E3C" />
      <g transform={`translate(${x} ${topY}) scale(${open} 1)`}>
        <path d={`M-52,10 Q-56,-70 -28,-58 Q-14,-88 0,-62 Q14,-88 28,-58 Q56,-70 52,10 Q28,44 0,44 Q-28,44 -52,10 Z`} fill={color} />
        <path d="M-28,-58 Q-14,-88 0,-62 Q14,-88 28,-58" fill="none" stroke="#FFFFFF" strokeWidth={3} opacity={0.5} />
      </g>
    </g>
  );
}
export const TulipSpring = () => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const p = frame / durationInFrames;
  const cyc = 2 * Math.PI * p;
  const clouds = useMemo(() => {
    const rand = mulberry32(151);
    return Array.from({length: 4}, (_, i) => ({x: rand() * 1700, y: 90 + rand() * 200, w: 240 + rand() * 220, speed: 0.35 + rand() * 0.4}));
  }, []);
  const bfx = 300 + p * 1920 * 0.35;
  const bfy = 300 + 60 * Math.sin(cyc * 2);
  const flap = 0.5 + 0.5 * Math.sin(cyc * 10);
  return (
    <AbsoluteFill style={{backgroundColor: '#BFE3FF', overflow: 'hidden'}}>
      <Grade>
        <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, #7EC8F7 0%, #BFE3FF 40%, #EAF7FF 62%, #7CB342 62.2%, #55893A 100%)'}} />
        <div style={{position: 'absolute', left: 1500, top: 100, width: 340, height: 340, borderRadius: '50%', background: 'rgba(255,244,190,0.55)', filter: 'blur(50px)'}} />
        {clouds.map((c, i) => (
          <div key={i} style={{position: 'absolute', left: ((c.x + p * 1920 * 0.08 * c.speed) % 2100) - 130, top: c.y, width: c.w, height: 50, borderRadius: 25, background: 'rgba(255,255,255,0.9)', filter: 'blur(5px)'}} />
        ))}
        <svg width={1920} height={1080} style={{position: 'absolute'}}>
          <path d="M0,720 Q500,660 1000,700 T1920,690 L1920,1080 L0,1080 Z" fill="#6FA844" />
          <path d="M0,820 Q500,770 1000,810 T1920,800 L1920,1080 L0,1080 Z" fill="#55893A" />
          {/* soil rows */}
          {[0, 1, 2].map((r) => (
            <ellipse key={r} cx={960} cy={880 + r * 55} rx={900 - r * 120} ry={18} fill="#6D4C41" opacity={0.35} />
          ))}
          {TULIPS.map((t, i) => <Tulip key={i} {...t} p={p} />)}
          {/* small buds between tulips */}
          {[380, 640, 900, 1160, 1420, 1660].map((x, i) => (
            <g key={i}>
              <line x1={x} y1={880} x2={x} y2={800} stroke="#2E7D32" strokeWidth={8} strokeLinecap="round" />
              <circle cx={x} cy={790} r={16} fill={['#E53935', '#F9A825', '#EC407A'][i % 3]} />
            </g>
          ))}
          {/* butterfly */}
          <g transform={`translate(${bfx % 2000 - 40} ${bfy})`}>
            <ellipse cx={-16 * flap - 4} cy={0} rx={20} ry={26} fill="#FF7043" transform={`rotate(-24 ${-16} 0)`} />
            <ellipse cx={16 * flap + 4} cy={0} rx={20} ry={26} fill="#FF7043" transform={`rotate(24 ${16} 0)`} />
            <ellipse cx={0} cy={0} rx={6} ry={20} fill="#4E342E" />
          </g>
        </svg>
      </Grade>
      <Grain opacity={0.05} />
      <Vignette strength={0.16} rgb="40,90,40" />
    </AbsoluteFill>
  );
};
