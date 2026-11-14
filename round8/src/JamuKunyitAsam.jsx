import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {clamp01, countProg, cyc, eventEnv, fadeIn, fadeOutEnd, uiSpring} from './smooth.js';
import {GrainNoise, Grade, Vignette} from './postfx.jsx';

// 10. JAMU KUNYIT ASAM — 1920x1080. Ingredient-to-glass process diagram:
// turmeric -> tamarind -> palm sugar -> glass, pouring animation.
// Palette 60% #E8A020 turmeric gold / 30% #6B4226 tamarind brown /
// 10% #3E7C4F leaf green, on cream canvas #FBF6EC. Text EXACT per plan.
// NO health claims on screen. Liquid rises once (f90-210), holds, fades
// f285-300 (never reversed). Steam drifts on a sine (seamless).
// Frame 0: cream canvas + glass outline + card shells visible (not empty).
const W = 1920;
const H = 1080;
const INGREDIENTS = [
  {label: 'Turmeric', x: 420, glyph: 'turmeric'},
  {label: 'Tamarind', x: 760, glyph: 'tamarind'},
  {label: 'Palm sugar', x: 1100, glyph: 'sugar'},
];

const Glyph = ({kind, x, y}) => {
  if (kind === 'turmeric') {
    return (
      <g fill="#E8A020" stroke="#B97A10" strokeWidth={3}>
        <ellipse cx={x} cy={y} rx={46} ry={20} transform={`rotate(-18 ${x} ${y})`} />
        <ellipse cx={x - 30} cy={y + 22} rx={24} ry={12} transform={`rotate(24 ${x - 30} ${y + 22})`} />
        <ellipse cx={x + 32} cy={y + 20} rx={22} ry={11} transform={`rotate(-30 ${x + 32} ${y + 20})`} />
      </g>
    );
  }
  if (kind === 'tamarind') {
    return (
      <g fill="#6B4226" stroke="#4E2F1A" strokeWidth={3}>
        <path d={`M${x - 44} ${y - 14} Q${x} ${y - 30} ${x + 44} ${y - 8} Q${x + 20} ${y + 22} ${x - 20} ${y + 18} Q${x - 52} ${y + 6} ${x - 44} ${y - 14} Z`} />
      </g>
    );
  }
  return (
    <g fill="#D98E2B" stroke="#A8660F" strokeWidth={3}>
      <rect x={x - 34} y={y - 26} width={68} height={52} rx={10} />
      <rect x={x - 20} y={y - 40} width={40} height={18} rx={8} />
    </g>
  );
};

export const JamuKunyitAsam = () => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const p = frame / durationInFrames;

  const titleOp = fadeIn(frame, 12) * fadeOutEnd(frame);
  const bottomOp = fadeIn(frame - 120, 12) * fadeOutEnd(frame);
  const cardSprings = INGREDIENTS.map((_, i) => uiSpring(frame, 30 + i * 15));
  const arrowOp = fadeIn(frame - 90, 12) * fadeOutEnd(frame);

  // Liquid rises once f90-210, holds, fades f285-300 (never reversed).
  const fillProg = countProg(frame, 90, 210);
  const liquidH = 380 * fillProg;
  const liquidOp = fadeIn(frame - 80, 12) * fadeOutEnd(frame);
  const pourOp = eventEnv(p, 0.3, 0.05, 0.35, 0.1);
  const steamOp = 0.35 + 0.15 * cyc(p, 1);
  const steamY = -8 * cyc(p, 1);

  return (
    <AbsoluteFill style={{backgroundColor: '#FBF6EC', overflow: 'hidden'}}>
      <Grade>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(180deg, #FBF6EC 0%, #F5EBD3 100%)',
          }}
        />
        {/* title */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 64,
            textAlign: 'center',
            color: '#6B4226',
            fontSize: 64,
            fontWeight: 800,
            letterSpacing: 8,
            opacity: titleOp,
          }}
        >
          KUNYIT ASAM
        </div>
        {/* ingredient cards */}
        <svg width={W} height={H} style={{position: 'absolute'}}>
          {INGREDIENTS.map((ing, i) => {
            const s = clamp01(cardSprings[i]);
            return (
              <g
                key={ing.label}
                transform={`translate(${ing.x} 380) scale(${s.toFixed(3)})`}
                opacity={s * fadeOutEnd(frame)}
              >
                <circle r={110} fill="#FFFFFF" stroke="#E8A020" strokeWidth={4} />
                <Glyph kind={ing.glyph} x={0} y={0} />
              </g>
            );
          })}
          {/* chevron arrows between cards */}
          <g opacity={arrowOp} stroke="#3E7C4F" strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" fill="none">
            <path d="M566 362 L596 380 L566 398" />
            <path d="M906 362 L936 380 L906 398" />
            <path d="M1246 362 L1276 380 L1246 398" />
          </g>
          {/* leaf accents */}
          <path d="M300 560 Q330 520 360 560 Q330 580 300 560 Z" fill="#3E7C4F" opacity={0.7} />
          <path d="M1620 560 Q1650 520 1680 560 Q1650 580 1620 560 Z" fill="#3E7C4F" opacity={0.7} />
        </svg>
        {INGREDIENTS.map((ing, i) => (
          <div
            key={ing.label}
            style={{
              position: 'absolute',
              left: ing.x - 140,
              top: 520,
              width: 280,
              textAlign: 'center',
              color: '#6B4226',
              fontSize: 34,
              fontWeight: 700,
              opacity: clamp01(cardSprings[i]) * fadeOutEnd(frame),
            }}
          >
            {ing.label}
          </div>
        ))}
        {/* glass with pouring liquid */}
        <svg width={W} height={H} style={{position: 'absolute'}}>
          <defs>
            <clipPath id="jamu-glass">
              <path d="M1470 340 L1650 340 L1620 760 L1500 760 Z" />
            </clipPath>
          </defs>
          {/* steam wisps */}
          <g opacity={steamOp} stroke="#6B4226" strokeWidth={5} strokeLinecap="round" fill="none">
            <path d={`M1530 ${300 + steamY} Q1545 ${270 + steamY} 1530 ${240 + steamY}`} />
            <path d={`M1590 ${300 - steamY} Q1575 ${270 - steamY} 1590 ${240 - steamY}`} />
          </g>
          {/* pour stream */}
          <rect x={1554} y={180} width={12} height={160} fill="#E8A020" opacity={pourOp} />
          {/* liquid (rises once, holds, fades at the end) */}
          <g clipPath="url(#jamu-glass)" opacity={liquidOp}>
            <rect x={1470} y={760 - liquidH} width={180} height={liquidH} fill="#E8A020" />
            <ellipse cx={1560} cy={760 - liquidH} rx={82} ry={14} fill="#F5B83D" />
          </g>
          {/* glass outline (visible from f0) */}
          <path
            d="M1470 340 L1650 340 L1620 760 L1500 760 Z"
            fill="rgba(255,255,255,0.35)"
            stroke="#6B4226"
            strokeWidth={4}
          />
          <ellipse cx={1560} cy={340} rx={90} ry={12} fill="none" stroke="#6B4226" strokeWidth={4} />
        </svg>
        {/* bottom line */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 940,
            textAlign: 'center',
            color: '#6B4226',
            fontSize: 32,
            fontWeight: 600,
            opacity: bottomOp,
          }}
        >
          Jamu wellness culture • UNESCO Intangible Cultural Heritage 2023
        </div>
      </Grade>
      <GrainNoise opacity={0.05} seed={90} />
      <Vignette strength={0.12} rgb="120,90,40" />
    </AbsoluteFill>
  );
};
