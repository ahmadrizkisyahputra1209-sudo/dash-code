import React, {useMemo} from 'react';
import {AbsoluteFill, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {evolvePath, getLength, getPointAtLength} from '@remotion/paths';
import {clamp01, cyc, env, mulberry32, triWave} from './smooth.js';
import {Grade, GrainNoise, Vignette} from './postfx.jsx';

// 12. PHOTOSYNTHESIS DIAGRAM — sun rays rotating, light beams to a swaying
// leaf, CO2 molecules flowing in along curved paths, O2 flowing out,
// glucose hexagon forming, arrows drawing on and off (evolvePath envelope),
// labels revealing with a slide envelope. Molecules use getPointAtLength
// with an opacity envelope so the wrap is invisible. All motion periodic.
const smoothstep = (t) => {
  const x = clamp01(t);
  return x * x * (3 - 2 * x);
};

const eventEnv = (p, start, rise, hold, fall) => {
  if (p < start) return 0;
  if (p < start + rise) return smoothstep((p - start) / rise);
  if (p < start + rise + hold) return 1;
  if (p < start + rise + hold + fall) return 1 - smoothstep((p - start - rise - hold) / fall);
  return 0;
};

const CO2_PATHS = [
  'M180,980 C420,820 620,760 880,660',
  'M320,1020 C560,900 760,800 920,700',
  'M120,860 C380,740 600,700 860,640',
];
const O2_PATHS = [
  'M1420,420 C1560,320 1660,240 1760,160',
  'M1380,480 C1540,400 1640,320 1740,240',
];
const SUN_ARROW = 'M330,330 C560,420 820,480 1010,520';
const O2_ARROW = 'M1330,430 C1480,340 1600,280 1720,210';

function Molecule({pathD, off, p, color, label, sub}) {
  const total = useMemo(() => getLength(pathD), [pathD]);
  const frac = ((p + off) % 1 + 1) % 1;
  const pt = getPointAtLength(pathD, total * frac);
  const op = Math.sin(Math.PI * frac);
  return (
    <g transform={`translate(${pt.x.toFixed(1)} ${pt.y.toFixed(1)})`} opacity={op}>
      <circle r={30} fill={color} stroke="#FFFFFF" strokeWidth={3} />
      <text x={0} y={8} textAnchor="middle" fontFamily="sans-serif" fontSize={24} fontWeight={800} fill="#FFFFFF">{label}</text>
      {sub ? <text x={20} y={14} fontFamily="sans-serif" fontSize={16} fontWeight={700} fill="#FFFFFF">{sub}</text> : null}
    </g>
  );
}

function Label({x, y, text, p, start}) {
  const e = eventEnv(p, start, 0.1, 0.35, 0.15);
  return (
    <g transform={`translate(${x} ${y + (1 - e) * 24})`} opacity={e}>
      <rect x={-86} y={-26} width={172} height={44} rx={22} fill="#FFFFFF" stroke="#C8E6C9" strokeWidth={2} />
      <text x={0} y={8} textAnchor="middle" fontFamily="sans-serif" fontSize={24} fontWeight={700} letterSpacing={1} fill="#2E7D32">{text}</text>
    </g>
  );
}

export const PhotosynthesisDiagram = () => {
  const frame = useCurrentFrame();
  const {durationInFrames, fps} = useVideoConfig();
  const p = frame / durationInFrames;

  const sunRot = 360 * p;
  const leafSway = 1.5 * cyc(p, 1, 0);
  const veinProg = env(p, 0.3);
  const veinEvolve = evolvePath(clamp01(veinProg * 1.1), 'M0,200 L0,-200 M0,60 L-140,-40 M0,60 L140,-40 M0,-60 L-120,-140 M0,-60 L120,-140');
  const sunArrowEvolve = evolvePath(env(p, 0.1), SUN_ARROW);
  const o2ArrowEvolve = evolvePath(env(p, 0.6), O2_ARROW);
  const glucoseScale = 0.85 + 0.15 * spring({frame: triWave(frame, 150), fps, config: {damping: 10}});
  const glucoseOp = eventEnv(p, 0.4, 0.1, 0.35, 0.15);

  const rays = useMemo(() => Array.from({length: 12}, (_, i) => i * 30), []);

  return (
    <AbsoluteFill style={{backgroundColor: '#F1F8E9', overflow: 'hidden'}}>
      <Grade>
        <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, #FFFDE7 0%, #F1F8E9 55%, #DCEDC8 100%)'}} />
        <svg width={1920} height={1080} style={{position: 'absolute'}}>
          <defs>
            <linearGradient id="leafGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#81C784" />
              <stop offset="100%" stopColor="#2E7D32" />
            </linearGradient>
          </defs>
          {/* sun */}
          <g transform={`translate(200 210)`}>
            <circle r={120} fill="rgba(255,213,79,0.25)" />
            <g transform={`rotate(${sunRot.toFixed(1)})`}>
              {rays.map((a) => (
                <line key={a} x1={0} y1={-92} x2={0} y2={-128} stroke="#FFB300" strokeWidth={10} strokeLinecap="round" transform={`rotate(${a})`} />
              ))}
            </g>
            <circle r={72} fill="#FFD54F" stroke="#FFB300" strokeWidth={4} />
            <circle r={52} fill="#FFE082" />
          </g>
          {/* light beams */}
          <polygon points="270,260 1080,520 1080,580 270,300" fill="rgba(255,213,79,0.18)" />
          <polygon points="250,300 1060,580 1060,640 250,340" fill="rgba(255,213,79,0.12)" />
          {/* sun arrow */}
          <path d={SUN_ARROW} fill="none" stroke="#F9A825" strokeWidth={7} strokeLinecap="round" strokeDasharray={sunArrowEvolve.strokeDasharray} strokeDashoffset={sunArrowEvolve.strokeDashoffset} />
          {/* leaf */}
          <g transform={`translate(1150 580) rotate(${leafSway.toFixed(2)})`}>
            <path d="M0,-220 C180,-140 220,60 0,220 C-220,60 -180,-140 0,-220 Z" fill="url(#leafGrad)" stroke="#1B5E20" strokeWidth={4} />
            <path d="M0,200 L0,-200 M0,60 L-140,-40 M0,60 L140,-40 M0,-60 L-120,-140 M0,-60 L120,-140" fill="none" stroke="#A5D6A7" strokeWidth={5} strokeLinecap="round" strokeDasharray={veinEvolve.strokeDasharray} strokeDashoffset={veinEvolve.strokeDashoffset} />
          </g>
          {/* CO2 in */}
          {CO2_PATHS.map((d, i) => (
            <Molecule key={i} pathD={d} off={i * 0.33} p={p} color="#78909C" label="CO2" />
          ))}
          {/* O2 out */}
          {O2_PATHS.map((d, i) => (
            <Molecule key={i} pathD={d} off={i * 0.5} p={p} color="#29B6F6" label="O2" />
          ))}
          {/* O2 arrow */}
          <path d={O2_ARROW} fill="none" stroke="#29B6F6" strokeWidth={7} strokeLinecap="round" strokeDasharray={o2ArrowEvolve.strokeDasharray} strokeDashoffset={o2ArrowEvolve.strokeDashoffset} />
          {/* glucose */}
          <g transform={`translate(1150 880) scale(${glucoseScale.toFixed(3)})`} opacity={glucoseOp}>
            <polygon points="0,-52 45,-26 45,26 0,52 -45,26 -45,-26" fill="#FFD54F" stroke="#FF8F00" strokeWidth={4} />
            <text x={0} y={10} textAnchor="middle" fontFamily="sans-serif" fontSize={26} fontWeight={800} fill="#5D4037">C6H12O6</text>
          </g>
          {/* labels */}
          <Label x={200} y={380} text="SUNLIGHT" p={p} start={0.05} />
          <Label x={330} y={760} text="CO2 IN" p={p} start={0.2} />
          <Label x={1700} y={140} text="OXYGEN OUT" p={p} start={0.3} />
          <Label x={1150} y={990} text="GLUCOSE" p={p} start={0.38} />
        </svg>
      </Grade>
      <GrainNoise opacity={0.04} seed={42} />
      <Vignette strength={0.12} rgb="100,120,70" />
    </AbsoluteFill>
  );
};
