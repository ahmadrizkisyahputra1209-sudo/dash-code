import React, {useMemo} from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {cyc, mulberry32} from './smooth.js';
import {Grade, GrainNoise, Vignette} from './postfx.jsx';

// 2. CHINESE LANTERNS RISE — 1080x1920 VERTICAL.
// Palette 60% #8E1B1B deep red / 30% #E8B84B gold / 10% #FFF3D6 warm white.
// Lanterns rise with wrap modulo: speed = wrap/300 (exactly 1 wrap per
// loop, so the distribution is identical at f0 and f300). 3 parallax
// layers (0.3x / 0.7x / 1.0x) driven by one camera t. Tassel follow-through
// lags the lantern body by 2 frames (60ms). Glow breathes +-3% (sine k=2).
// Frame 0: lanterns already distributed across the frame (not empty).
const W = 1080;
const H = 1920;
const WRAP = H + 500;
const V = WRAP / 300;

const Lantern = ({x, y, s, sway, tasselSway, glowOp}) => (
  <g transform={`translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${sway.toFixed(2)}) scale(${s})`}>
    {/* glow (single light, behind the lantern) */}
    <ellipse rx={135} ry={165} fill="#E8B84B" opacity={glowOp} />
    {/* body */}
    <ellipse rx={78} ry={105} fill="#D9382B" />
    <ellipse rx={78} ry={105} fill="none" stroke="#8E1B1B" strokeWidth={3} opacity={0.5} />
    {/* ribs */}
    <path d="M-52,-70 Q-62,0 -52,70" fill="none" stroke="#B02A20" strokeWidth={4} opacity={0.7} />
    <path d="M-26,-92 Q-32,0 -26,92" fill="none" stroke="#B02A20" strokeWidth={4} opacity={0.7} />
    <path d="M26,-92 Q32,0 26,92" fill="none" stroke="#B02A20" strokeWidth={4} opacity={0.7} />
    <path d="M52,-70 Q62,0 52,70" fill="none" stroke="#B02A20" strokeWidth={4} opacity={0.7} />
    {/* rim light on the right edge */}
    <path d="M62,-60 Q74,0 62,60" fill="none" stroke="#FFF3D6" strokeWidth={4} opacity={0.55} />
    {/* gold caps */}
    <rect x={-30} y={-112} width={60} height={18} rx={6} fill="#E8B84B" />
    <rect x={-30} y={94} width={60} height={18} rx={6} fill="#E8B84B" />
    {/* tassel (follow-through: lags the body by 2 frames) */}
    <g transform={`rotate(${tasselSway.toFixed(2)})`}>
      <line x1={-14} y1={112} x2={-18} y2={152} stroke="#E8B84B" strokeWidth={5} strokeLinecap="round" />
      <line x1={0} y1={112} x2={0} y2={158} stroke="#E8B84B" strokeWidth={5} strokeLinecap="round" />
      <line x1={14} y1={112} x2={18} y2={152} stroke="#E8B84B" strokeWidth={5} strokeLinecap="round" />
      <circle cx={0} cy={166} r={8} fill="#E8B84B" />
    </g>
  </g>
);

export const ChineseLanternsRise = () => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const p = frame / durationInFrames;

  const lanterns = useMemo(() => {
    const rand = mulberry32(22);
    const defs = [];
    // 3 layers x 3 lanterns: back (small, dim), mid, front (large).
    const layers = [
      {count: 3, s: 0.62, ratio: 0.3, op: 0.75},
      {count: 3, s: 0.88, ratio: 0.7, op: 0.9},
      {count: 3, s: 1.15, ratio: 1.0, op: 1},
    ];
    layers.forEach((L) => {
      for (let i = 0; i < L.count; i++) {
        defs.push({
          x: 140 + rand() * (W - 280),
          startY: rand() * WRAP,
          s: L.s,
          ratio: L.ratio,
          op: L.op,
          ph: rand() * Math.PI * 2,
        });
      }
    });
    return defs;
  }, []);

  const bokeh = useMemo(() => {
    const rand = mulberry32(23);
    return Array.from({length: 26}, () => ({
      x: rand() * W,
      y: rand() * H,
      r: 3 + rand() * 9,
      ph: rand() * Math.PI * 2,
    }));
  }, []);

  return (
    <AbsoluteFill style={{backgroundColor: '#8E1B1B', overflow: 'hidden'}}>
      <Grade>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(135deg, #A01F1F 0%, #8E1B1B 55%, #6E1212 100%)',
          }}
        />
        <svg width={W} height={H} style={{position: 'absolute'}}>
          {/* gold bokeh, breathing */}
          {bokeh.map((b, i) => (
            <circle
              key={i}
              cx={b.x}
              cy={b.y}
              r={b.r}
              fill="#E8B84B"
              opacity={0.14 + 0.1 * (0.5 + 0.5 * cyc(p, 2, b.ph))}
            />
          ))}
          {lanterns.map((L, i) => {
            const y = (((L.startY - frame * V) % WRAP) + WRAP) % WRAP - 250;
            const drift = L.ratio * 18 * cyc(p, 1, L.ph);
            const sway = 3 * cyc(p, 1, L.ph);
            const tasselSway = 3 * cyc((frame - 2) / 300, 1, L.ph);
            const glowOp = (0.3 + 0.03 * cyc(p, 2, L.ph)) * L.op;
            return (
              <g key={i} opacity={L.op}>
                <Lantern
                  x={L.x + drift}
                  y={y}
                  s={L.s}
                  sway={sway}
                  tasselSway={tasselSway}
                  glowOp={glowOp}
                />
              </g>
            );
          })}
        </svg>
      </Grade>
      <GrainNoise opacity={0.05} seed={22} />
      <Vignette strength={0.18} rgb="60,8,8" />
    </AbsoluteFill>
  );
};
