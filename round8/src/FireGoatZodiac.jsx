import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {cyc, fadeIn, fadeOutEnd, mulberry32, starPoints} from './smooth.js';
import {GrainNoise, Grade, Vignette} from './postfx.jsx';

// 4. YEAR OF THE FIRE GOAT — 1920x1080. 12-animal zodiac wheel rotating
// slowly, Goat highlighted in gold, lantern glow. Palette 60% #C0392B
// vermilion red / 30% #E8B84B gold / 10% #1A1A1A deep charcoal.
// Text EXACT per plan. Wheel rotation is LINEAR, one slow turn per loop
// (rot = frame/300*360, integer cycle) so f300 == f0 exactly.
// Frame 0: red gradient + wheel + lanterns visible (not empty).
const W = 1920;
const H = 1080;
const ANIMALS = ['Rat', 'Ox', 'Tiger', 'Rabbit', 'Dragon', 'Snake', 'Horse', 'Goat', 'Monkey', 'Rooster', 'Dog', 'Pig'];
const CX = 960;
const CY = 570;
const R_OUT = 310;
const R_IN = 130;

const polar = (r, deg) => {
  const a = ((deg - 90) * Math.PI) / 180;
  return [CX + r * Math.cos(a), CY + r * Math.sin(a)];
};

const wedgePath = (i) => {
  const a0 = i * 30;
  const a1 = (i + 1) * 30;
  const [x0, y0] = polar(R_OUT, a0);
  const [x1, y1] = polar(R_OUT, a1);
  const [x2, y2] = polar(R_IN, a1);
  const [x3, y3] = polar(R_IN, a0);
  return `M${x0.toFixed(1)} ${y0.toFixed(1)} A${R_OUT} ${R_OUT} 0 0 1 ${x1.toFixed(1)} ${y1.toFixed(1)} L${x2.toFixed(1)} ${y2.toFixed(1)} A${R_IN} ${R_IN} 0 0 0 ${x3.toFixed(1)} ${y3.toFixed(1)} Z`;
};

export const FireGoatZodiac = () => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const p = frame / durationInFrames;

  // One slow linear turn per loop — seamless (integer cycle).
  const rot = (frame / durationInFrames) * 360;

  const titleOp = fadeIn(frame, 12) * fadeOutEnd(frame);
  const wheelOp = fadeIn(frame - 15, 12) * fadeOutEnd(frame);
  const subOp = fadeIn(frame - 60, 12) * fadeOutEnd(frame);
  const swayL = 4 * cyc(p, 1, 0);
  const swayR = 4 * cyc(p, 1, 2.4);
  const glowOp = 0.22 + 0.06 * cyc(p, 1);

  return (
    <AbsoluteFill style={{backgroundColor: '#C0392B', overflow: 'hidden'}}>
      <Grade>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(135deg, #C0392B 0%, #A93226 55%, #8E2418 100%)',
          }}
        />
        {/* faint background dots */}
        <svg width={W} height={H} style={{position: 'absolute'}}>
          {Array.from({length: 20}, (_, i) => {
            const rand = mulberry32(84 + i);
            return (
              <circle key={i} cx={rand() * W} cy={rand() * H} r={3} fill="#E8B84B" opacity={0.12} />
            );
          })}
        </svg>
        {/* swaying lanterns */}
        <svg width={W} height={H} style={{position: 'absolute'}}>
          <ellipse cx={180} cy={560} rx={110} ry={150} fill="#E8B84B" opacity={glowOp} />
          <ellipse cx={1740} cy={560} rx={110} ry={150} fill="#E8B84B" opacity={glowOp} />
          <g transform={`translate(180 470) rotate(${swayL.toFixed(2)})`}>
            <rect x={-4} y={-110} width={8} height={110} fill="#E8B84B" opacity={0.6} />
            <path d="M-46 0 Q0 -46 46 0 L46 104 Q0 128 -46 104 Z" fill="#E8B84B" />
            <rect x={-34} y={18} width={68} height={66} fill="#C0392B" opacity={0.45} />
            <rect x={-10} y={128} width={20} height={44} fill="#F5A623" />
          </g>
          <g transform={`translate(1740 470) rotate(${swayR.toFixed(2)})`}>
            <rect x={-4} y={-110} width={8} height={110} fill="#E8B84B" opacity={0.6} />
            <path d="M-46 0 Q0 -46 46 0 L46 104 Q0 128 -46 104 Z" fill="#E8B84B" />
            <rect x={-34} y={18} width={68} height={66} fill="#C0392B" opacity={0.45} />
            <rect x={-10} y={128} width={20} height={44} fill="#F5A623" />
          </g>
        </svg>
        {/* zodiac wheel (rotating) */}
        <svg width={W} height={H} style={{position: 'absolute'}} opacity={wheelOp}>
          <g transform={`rotate(${rot.toFixed(2)} ${CX} ${CY})`}>
            {ANIMALS.map((a, i) => (
              <path
                key={a}
                d={wedgePath(i)}
                fill={a === 'Goat' ? '#E8B84B' : i % 2 === 0 ? '#A93226' : '#C0392B'}
                stroke="#E8B84B"
                strokeWidth={2}
              />
            ))}
            {ANIMALS.map((a, i) => {
              const mid = i * 30 + 15;
              const [x, y] = polar(220, mid);
              return (
                <text
                  key={a}
                  x={x}
                  y={y + 9}
                  textAnchor="middle"
                  fontSize={26}
                  fontWeight={a === 'Goat' ? 800 : 600}
                  fill={a === 'Goat' ? '#1A1A1A' : '#F8F3E8'}
                >
                  {a}
                </text>
              );
            })}
          </g>
          {/* static hub: gold disc + GOAT + star */}
          <circle cx={CX} cy={CY} r={110} fill="#E8B84B" stroke="#1A1A1A" strokeWidth={4} />
          <polygon points={starPoints(CX, CY - 52, 22, 9, 8)} fill="#C0392B" />
          <text x={CX} y={CY + 22} textAnchor="middle" fontSize={40} fontWeight={800} fill="#1A1A1A">
            GOAT
          </text>
        </svg>
        {/* title */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 64,
            textAlign: 'center',
            color: '#E8B84B',
            fontSize: 58,
            fontWeight: 800,
            letterSpacing: 6,
            opacity: titleOp,
          }}
        >
          YEAR OF THE FIRE GOAT
        </div>
        {/* dates */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 940,
            textAlign: 'center',
            color: '#F8F3E8',
            fontSize: 34,
            fontWeight: 600,
            opacity: subOp,
          }}
        >
          Lunar New Year • 6 February 2027
        </div>
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 995,
            textAlign: 'center',
            color: '#F8F3E8',
            fontSize: 32,
            opacity: subOp * 0.85,
          }}
        >
          Lantern Festival • 20 February 2027
        </div>
      </Grade>
      <GrainNoise opacity={0.05} seed={84} />
      <Vignette strength={0.16} rgb="60,10,5" />
    </AbsoluteFill>
  );
};
