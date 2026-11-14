import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {clamp01, countProg, cyc, fadeIn, fadeOutEnd, mulberry32, smoothstep, triWave, uiSpring} from './smooth.js';
import {GrainNoise, Grade, Vignette} from './postfx.jsx';

// 5. GROUNDWATER AQUIFER — 1920x1080. Cross-section diagram: sky, soil
// layers, aquifer, water table line, well with pump, animated water flow.
// Palette 60% #0F4C5C deep teal / 30% #C68B4E ochre / 10% #87CEEB sky blue.
// Text EXACT per plan (2024 data attributed "in 2024" on screen; do NOT
// present as 2027 figures; NO theme name). Droplets fall with period 300
// (range 300px, speed 1px/frame) and fade at both ends, so the wrap is
// invisible and f300 == f0. Stat count-ups: up once, hold, fade f285-300.
// Frame 0: cross-section + stat card shells visible (not empty).
const W = 1920;
const H = 1080;

export const GroundwaterAquifer = () => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const p = frame / durationInFrames;

  // Stat count-ups (corrected rule): up once f60-150, hold, fade f285-300.
  const prog1 = countProg(frame, 60, 150);
  const prog2 = countProg(frame, 75, 165);
  const stat1 = (2.2 * prog1).toFixed(1);
  const stat2 = (3.4 * prog2).toFixed(1);
  const titleOp = fadeIn(frame, 12) * fadeOutEnd(frame);
  const cardOp1 = fadeIn(frame - 30, 12) * fadeOutEnd(frame);
  const cardOp2 = fadeIn(frame - 45, 12) * fadeOutEnd(frame);
  const cardScale1 = clamp01(uiSpring(frame, 30));
  const cardScale2 = clamp01(uiSpring(frame, 45));

  // Pump handle: there-and-back bob (triWave period 100 divides 300).
  const handleRot = (triWave(frame, 100) / 50) * 12;

  // Clouds drift on a circle (seamless).
  const cloudX = Math.cos(2 * Math.PI * p) * 12;

  return (
    <AbsoluteFill style={{backgroundColor: '#0F4C5C', overflow: 'hidden'}}>
      <Grade>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(180deg, #0F4C5C 0%, #0D4250 100%)',
          }}
        />
        {/* title + date */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 56,
            textAlign: 'center',
            color: '#FFFFFF',
            fontSize: 46,
            fontWeight: 800,
            letterSpacing: 3,
            opacity: titleOp,
          }}
        >
          GROUNDWATER — THE INVISIBLE RESOURCE
        </div>
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 118,
            textAlign: 'center',
            color: '#87CEEB',
            fontSize: 30,
            fontWeight: 600,
            opacity: titleOp,
          }}
        >
          World Water Day • 22 March 2027
        </div>
        {/* cross-section diagram */}
        <svg width={W} height={H} style={{position: 'absolute'}}>
          {/* sky band */}
          <rect x={120} y={180} width={1680} height={120} fill="#87CEEB" />
          <circle cx={240} cy={232} r={34} fill="#F5A623" opacity={0.9} />
          <g transform={`translate(${cloudX.toFixed(1)} 0)`}>
            <ellipse cx={520} cy={232} rx={70} ry={20} fill="#FFFFFF" opacity={0.85} />
            <ellipse cx={560} cy={220} rx={48} ry={16} fill="#FFFFFF" opacity={0.85} />
            <ellipse cx={1240} cy={252} rx={80} ry={20} fill="#FFFFFF" opacity={0.7} />
          </g>
          {/* grass strip */}
          <rect x={120} y={292} width={1680} height={14} fill="#3E7C4F" />
          {/* soil layers */}
          <rect x={120} y={306} width={1680} height={154} fill="#C68B4E" />
          <rect x={120} y={460} width={1680} height={140} fill="#B07A3E" />
          {/* aquifer band */}
          <rect x={120} y={600} width={1680} height={180} fill="#146B7A" />
          <path
            d="M120 650 Q 300 630 480 650 T 840 650 T 1200 650 T 1560 650 T 1800 650"
            fill="none"
            stroke="#87CEEB"
            strokeWidth={4}
            opacity={0.5}
          />
          <path
            d="M120 710 Q 300 690 480 710 T 840 710 T 1200 710 T 1560 710 T 1800 710"
            fill="none"
            stroke="#87CEEB"
            strokeWidth={4}
            opacity={0.35}
          />
          {/* water table line (dashed) */}
          <line x1={120} y1={600} x2={1800} y2={600} stroke="#FFFFFF" strokeWidth={3} strokeDasharray="14 10" opacity={0.7} />
          {/* falling droplets: period exactly 300 frames, faded at both ends */}
          {Array.from({length: 8}, (_, i) => {
            const rand = mulberry32(85 + i);
            const x = 300 + rand() * 1100;
            const y = 310 + ((i * 37 + frame) % 300);
            const op =
              smoothstep((y - 310) / 40) * (1 - smoothstep((y - 560) / 40)) * 0.9;
            return (
              <g key={i} opacity={op}>
                <circle cx={x} cy={y} r={6} fill="#87CEEB" />
                <circle cx={x} cy={y - 10} r={3.5} fill="#87CEEB" opacity={0.6} />
              </g>
            );
          })}
          {/* aquifer flow chevrons: period exactly 300 (range 600, speed 2) */}
          {Array.from({length: 4}, (_, i) => {
            const x = 200 + ((i * 150 + frame * 2) % 600);
            const op =
              smoothstep((x - 200) / 60) * (1 - smoothstep((x - 740) / 60)) * 0.9;
            return (
              <path
                key={i}
                d={`M${x} 690 l18 -14 v28 Z`}
                fill="#87CEEB"
                opacity={op}
              />
            );
          })}
          {/* well: shaft + pump (handle bobs there-and-back) */}
          <rect x={1560} y={306} width={64} height={400} fill="#0B3A44" />
          <rect x={1560} y={306} width={64} height={400} fill="none" stroke="#87CEEB" strokeWidth={2} opacity={0.5} />
          <rect x={1520} y={240} width={144} height={66} rx={10} fill="#F5EFE6" />
          <circle cx={1592} cy={240} r={26} fill="#C68B4E" stroke="#6B4226" strokeWidth={3} />
          <g transform={`translate(1592 240) rotate(${handleRot.toFixed(2)})`}>
            <rect x={0} y={-6} width={86} height={12} rx={6} fill="#6B4226" />
          </g>
          <rect x={1580} y={180} width={24} height={60} fill="#6B4226" />
        </svg>
        {/* stat card 1 */}
        <div
          style={{
            position: 'absolute',
            left: 140,
            top: 810,
            width: 790,
            height: 200,
            borderRadius: 24,
            background: '#0B3A44',
            boxShadow: '0 18px 40px rgba(0,0,0,0.35)',
            padding: '28px 36px',
            transform: `scale(${cardScale1.toFixed(3)})`,
            opacity: cardOp1,
          }}
        >
          <div style={{color: '#FFFFFF', fontSize: 68, fontWeight: 800}}>{stat1} BILLION</div>
          <div style={{color: '#F5EFE6', fontSize: 28, marginTop: 8}}>
            people lacked safely managed drinking water in 2024
          </div>
        </div>
        {/* stat card 2 */}
        <div
          style={{
            position: 'absolute',
            left: 990,
            top: 810,
            width: 790,
            height: 200,
            borderRadius: 24,
            background: '#0B3A44',
            boxShadow: '0 18px 40px rgba(0,0,0,0.35)',
            padding: '28px 36px',
            transform: `scale(${cardScale2.toFixed(3)})`,
            opacity: cardOp2,
          }}
        >
          <div style={{color: '#FFFFFF', fontSize: 68, fontWeight: 800}}>{stat2} BILLION</div>
          <div style={{color: '#F5EFE6', fontSize: 28, marginTop: 8}}>
            people lacked safely managed sanitation in 2024
          </div>
        </div>
      </Grade>
      <GrainNoise opacity={0.05} seed={85} />
      <Vignette strength={0.16} rgb="6,32,40" />
    </AbsoluteFill>
  );
};
