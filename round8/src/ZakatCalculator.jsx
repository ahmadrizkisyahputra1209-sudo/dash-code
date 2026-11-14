import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {clamp01, countProg, fadeIn, fadeOutEnd, mulberry32, starPoints, uiSpring} from './smooth.js';
import {GrainNoise, Grade, Vignette} from './postfx.jsx';

// 1. ZAKAT CALCULATOR — VERTICAL 1080x1920. Calculator UI: coin stack grows,
// "Wealth x 2.5%" formula, result card. Palette 60% #0B3D2E deep emerald /
// 30% #C9A227 gold / 10% #F8F3E8 ivory. Text EXACT per plan. 2.5% count-up:
// 0 -> 2.5 (f60-150), hold, fade-out f285-300 (never reversed).
// Safe zones 9:16: text 15-75% height (288-1440). Frame 0: gradient + stars
// + chip shells visible (not empty).
const W = 1080;
const H = 1920;
const CATS = ['Cash', 'Gold', 'Silver', 'Business'];

export const ZakatCalculator = () => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const p = frame / durationInFrames;

  // Parallax drift (circular, seamless): bg 0.3x, chips 0.7x, coins 1.0x.
  const bgX = Math.cos(2 * Math.PI * p) * 8;
  const bgY = Math.sin(2 * Math.PI * p) * 8;
  const chipX = Math.cos(2 * Math.PI * p) * 5;
  const chipY = Math.sin(2 * Math.PI * p) * 5;
  const coinX = Math.cos(2 * Math.PI * p) * 10;
  const coinY = Math.sin(2 * Math.PI * p) * 10;

  const chipSprings = CATS.map((_, i) => uiSpring(frame, 30 + i * 2));
  const coinSprings = [0, 1, 2, 3, 4].map((_, i) => uiSpring(frame, 60 + i * 6));

  const prog = countProg(frame, 60, 150);
  const pct = (2.5 * prog).toFixed(1);
  const titleOp = fadeIn(frame, 12) * fadeOutEnd(frame);
  const heroOp = fadeIn(frame - 45, 12) * fadeOutEnd(frame);
  const cardOp = fadeIn(frame - 110, 12) * fadeOutEnd(frame);
  const cardScale = clamp01(uiSpring(frame, 110));

  return (
    <AbsoluteFill style={{backgroundColor: '#0B3D2E', overflow: 'hidden'}}>
      <Grade>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(180deg, #0B3D2E 0%, #0A3327 55%, #072420 100%)',
          }}
        />
        {/* faint gold stars, drifting on a circle (seamless) */}
        <svg width={W} height={H} style={{position: 'absolute'}}>
          <g transform={`translate(${bgX.toFixed(1)} ${bgY.toFixed(1)})`}>
            {Array.from({length: 12}, (_, i) => {
              const rand = mulberry32(81 + i);
              return (
                <polygon
                  key={i}
                  points={starPoints(rand() * W, rand() * H, 16, 6, 8)}
                  fill="#C9A227"
                  opacity={0.14}
                />
              );
            })}
          </g>
        </svg>
        {/* title */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 310,
            textAlign: 'center',
            color: '#C9A227',
            fontSize: 56,
            fontWeight: 800,
            letterSpacing: 6,
            opacity: titleOp,
          }}
        >
          ZAKAT CALCULATOR
        </div>
        {/* category chips 2x2 */}
        <div
          style={{
            position: 'absolute',
            left: 90 + chipX,
            top: 440 + chipY,
            width: 900,
            display: 'flex',
            flexWrap: 'wrap',
            gap: 24,
          }}
        >
          {CATS.map((c, i) => (
            <div
              key={c}
              style={{
                width: 438,
                height: 92,
                borderRadius: 46,
                border: '2px solid rgba(201,162,39,0.7)',
                background: 'rgba(201,162,39,0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#F8F3E8',
                fontSize: 36,
                fontWeight: 600,
                transform: `scale(${clamp01(chipSprings[i]).toFixed(3)})`,
                opacity: clamp01(chipSprings[i]) * fadeOutEnd(frame),
              }}
            >
              {c}
            </div>
          ))}
        </div>
        {/* coin stack growing */}
        <svg width={W} height={H} style={{position: 'absolute'}}>
          <g transform={`translate(${coinX.toFixed(1)} ${coinY.toFixed(1)})`}>
            {[0, 1, 2, 3, 4].map((i) => {
              const cy = 940 - i * 46;
              const s = clamp01(coinSprings[i]);
              return (
                <g
                  key={i}
                  transform={`translate(540 ${cy}) scale(${s.toFixed(3)})`}
                  opacity={s * fadeOutEnd(frame)}
                >
                  <ellipse rx={150} ry={36} fill="#C9A227" />
                  <ellipse rx={150} ry={36} fill="none" stroke="#8C6D1F" strokeWidth={3} />
                  <ellipse rx={118} ry={24} fill="none" stroke="#F8F3E8" strokeWidth={2} opacity={0.55} />
                </g>
              );
            })}
          </g>
        </svg>
        {/* hero 2.5% count-up */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 1010,
            textAlign: 'center',
            color: '#C9A227',
            fontSize: 150,
            fontWeight: 800,
            opacity: heroOp,
          }}
        >
          {pct}%
        </div>
        {/* result card */}
        <div
          style={{
            position: 'absolute',
            left: 90,
            top: 1240,
            width: 900,
            height: 150,
            borderRadius: 24,
            background: '#F8F3E8',
            boxShadow: '0 18px 40px rgba(0,0,0,0.35)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#0B3D2E',
            fontSize: 42,
            fontWeight: 700,
            transform: `scale(${cardScale.toFixed(3)})`,
            opacity: cardOp,
          }}
        >
          Wealth × 2.5% = Zakat due
        </div>
      </Grade>
      <GrainNoise opacity={0.05} seed={81} />
      <Vignette strength={0.16} rgb="4,24,16" />
    </AbsoluteFill>
  );
};
