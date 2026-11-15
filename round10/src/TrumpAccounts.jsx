import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {noise2D} from '@remotion/noise';
import {clamp01, countProg, cyc, fadeIn, fadeOutEnd, revealScale, sparklePoints, uiSpring} from './smooth.js';
import {GrainNoise, Grade, Vignette} from './postfx.jsx';

// 3. TRUMP ACCOUNTS — 1920x1080. Explainer card: $1,000 coin count-up
// once, growth bars, 2 claim-step chips. Palette 60% #1B2A4A navy /
// 30% #2E7D32 money green / 10% #E8B84B gold. Text EXACT:
// "TRUMP ACCOUNTS" · "$1,000" · "BORN 2025–2028" ·
// "CLAIM ON FORM 4547". NEVER write "automatic" — the claim/election
// on Form 4547 is required. Frame 0: gradient + coin shell visible.
const W = 1920;
const H = 1080;
const BARS = [
  {left: 300, maxH: 150, delay: 90},
  {left: 760, maxH: 240, delay: 102},
  {left: 1220, maxH: 330, delay: 114},
];

export const TrumpAccounts = () => {
  const frame = useCurrentFrame();
  const p = frame / 300;
  const fade = fadeOutEnd(frame);

  const prog = countProg(frame, 60, 150);
  const val = Math.round(1000 * prog).toLocaleString('en-US');
  const coinBob = 8 * cyc(p, 1);

  return (
    <AbsoluteFill style={{backgroundColor: '#1B2A4A', overflow: 'hidden'}}>
      <Grade>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(135deg, #1B2A4A 0%, #16223C 55%, #101B33 100%)',
          }}
        />
        {/* faint coin-grid dots, visible from f0 */}
        <svg width={W} height={H} style={{position: 'absolute'}}>
          {Array.from({length: 24}, (_, i) => (
            <circle key={i} cx={90 + (i % 8) * 240} cy={70 + Math.floor(i / 8) * 340} r={4} fill="#2E7D32" opacity={0.14} />
          ))}
          {[
            {x: 300, y: 240, s: 22},
            {x: 760, y: 200, s: 18},
            {x: 1700, y: 300, s: 24},
            {x: 1640, y: 700, s: 18},
          ].map((s, i) => (
            <polygon
              key={`sp${i}`}
              points={sparklePoints(s.x, s.y, s.s)}
              fill="#E8B84B"
              opacity={0.3 + 0.5 * Math.abs(noise2D('sp', i * 7.3 + 0.11, frame * 1.3 + 0.23))}
            />
          ))}
        </svg>
        {/* header */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 80,
            width: W,
            textAlign: 'center',
            color: '#FFFFFF',
            fontSize: 96,
            fontWeight: 900,
            letterSpacing: 6,
            scale: revealScale(frame, 10, 18),
            opacity: fadeIn(frame - 10, 12) * fade,
          }}
        >
          TRUMP ACCOUNTS
        </div>
        {/* $1,000 coin */}
        <div
          style={{
            position: 'absolute',
            left: 520 - 190,
            top: 520 - 190 + coinBob,
            width: 380,
            height: 380,
            borderRadius: '50%',
            background: 'radial-gradient(circle at 35% 30%, #F5D67A 0%, #E8B84B 55%, #B98A1E 100%)',
            boxShadow: '0 24px 60px rgba(0,0,0,0.45)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#1B2A4A',
            fontSize: 104,
            fontWeight: 900,
            scale: revealScale(frame, 15, 20),
            opacity: fadeIn(frame - 15, 12) * fade,
          }}
        >
          ${val}
        </div>
        {/* claim-step chips */}
        <div
          style={{
            position: 'absolute',
            left: 820,
            top: 380,
            width: 1020,
            height: 110,
            borderRadius: 24,
            background: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#1B2A4A',
            fontSize: 52,
            fontWeight: 800,
            letterSpacing: 1,
            boxShadow: '0 18px 40px rgba(0,0,0,0.35)',
            scale: clamp01(uiSpring(frame, 120)),
            opacity: fadeIn(frame - 120, 12) * fade,
          }}
        >
          BORN 2025–2028
        </div>
        <div
          style={{
            position: 'absolute',
            left: 820,
            top: 530,
            width: 1020,
            height: 110,
            borderRadius: 24,
            background: '#2E7D32',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
            fontSize: 52,
            fontWeight: 800,
            letterSpacing: 1,
            boxShadow: '0 18px 40px rgba(0,0,0,0.35)',
            scale: clamp01(uiSpring(frame, 135)),
            opacity: fadeIn(frame - 135, 12) * fade,
          }}
        >
          CLAIM ON FORM 4547
        </div>
        {/* growth bars */}
        {BARS.map((b, i) => {
          const h = b.maxH * clamp01(uiSpring(frame, b.delay));
          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: b.left,
                top: 1000 - h,
                width: 300,
                height: h,
                borderRadius: '18px 18px 0 0',
                background: i === 2 ? '#E8B84B' : '#2E7D32',
                opacity: fadeIn(frame - b.delay, 12) * fade,
              }}
            />
          );
        })}
        <div
          style={{
            position: 'absolute',
            left: 300,
            top: 1000,
            width: 1220,
            height: 6,
            borderRadius: 3,
            background: '#FFFFFF',
            opacity: 0.35 * fade,
          }}
        />
      </Grade>
      <GrainNoise opacity={0.05} seed={103} />
      <Vignette strength={0.16} rgb="8,14,28" />
    </AbsoluteFill>
  );
};
