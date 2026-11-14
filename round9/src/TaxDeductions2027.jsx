import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {clamp01, countProg, fadeIn, fadeOutEnd, uiSpring} from './smooth.js';
import {GrainNoise, Grade, Vignette} from './postfx.jsx';

// 2. TAX DEDUCTIONS 2027 — 1920x1080. Five deduction cards + Tax Day
// banner. Palette 60% #1B2A4A IRS navy / 30% #2E7D32 money green /
// 10% #FFFFFF white. Text EXACT per plan:
// "TIPS — up to $25,000"
// "OVERTIME — up to $12,500"
// "AUTO LOAN INTEREST — up to $10,000"
// "AGE 65+ BONUS — $6,000"
// "SALT CAP — $40,400 (2026)"
// "TAX DAY — 15 APR 2027"
// Amounts count up ONCE (f60-150 staggered), hold, fade-out f285-300
// (never reversed). SALT uses "$40,400 (2026)" with the year (per plan
// data warning — do not mix with the $40,000 figure). Frame 0: navy
// gradient + card shells visible (not empty).
const W = 1920;
const H = 1080;
const CARDS = [
  {label: 'TIPS', prefix: 'up to ', amount: 25000, suffix: ''},
  {label: 'OVERTIME', prefix: 'up to ', amount: 12500, suffix: ''},
  {label: 'AUTO LOAN INTEREST', prefix: 'up to ', amount: 10000, suffix: ''},
  {label: 'AGE 65+ BONUS', prefix: '', amount: 6000, suffix: ''},
  {label: 'SALT CAP', prefix: '', amount: 40400, suffix: ' (2026)'},
];
const POS = [
  {left: 80, top: 90},
  {left: 680, top: 90},
  {left: 1280, top: 90},
  {left: 380, top: 430},
  {left: 980, top: 430},
];

export const TaxDeductions2027 = () => {
  const frame = useCurrentFrame();

  const bannerOp = fadeIn(frame - 160, 12) * fadeOutEnd(frame);
  const bannerScale = clamp01(uiSpring(frame, 160));

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
        {/* faint dollar-grid dots, visible from f0 */}
        <svg width={W} height={H} style={{position: 'absolute'}}>
          {Array.from({length: 24}, (_, i) => (
            <circle key={i} cx={80 + (i % 8) * 240} cy={60 + Math.floor(i / 8) * 340} r={4} fill="#2E7D32" opacity={0.12} />
          ))}
        </svg>
        {CARDS.map((c, i) => {
          const pos = POS[i];
          const scale = clamp01(uiSpring(frame, 20 + i * 8));
          const op = fadeIn(frame - (20 + i * 8), 12) * fadeOutEnd(frame);
          const prog = countProg(frame, 60 + i * 10, 150 + i * 10);
          const val = Math.round(c.amount * prog).toLocaleString('en-US');
          return (
            <div
              key={c.label}
              style={{
                position: 'absolute',
                left: pos.left,
                top: pos.top,
                width: 560,
                height: 300,
                borderRadius: 28,
                background: '#FFFFFF',
                boxShadow: '0 18px 40px rgba(0,0,0,0.35)',
                padding: '30px 40px',
                transform: `scale(${scale.toFixed(3)})`,
                opacity: op,
              }}
            >
              <div style={{height: 10, borderRadius: 5, background: '#2E7D32', width: 120}} />
              <div style={{color: '#1B2A4A', fontSize: 34, fontWeight: 800, marginTop: 26, letterSpacing: 1}}>
                {c.label}
              </div>
              <div style={{color: '#2E7D32', fontSize: 78, fontWeight: 800, marginTop: 24}}>
                {c.prefix}${val}
                {c.suffix && <span style={{fontSize: 34}}>{c.suffix}</span>}
              </div>
            </div>
          );
        })}
        {/* Tax Day banner */}
        <div
          style={{
            position: 'absolute',
            left: 80,
            top: 780,
            width: 1760,
            height: 120,
            borderRadius: 24,
            background: '#2E7D32',
            boxShadow: '0 18px 40px rgba(0,0,0,0.35)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
            fontSize: 56,
            fontWeight: 800,
            letterSpacing: 4,
            transform: `scale(${bannerScale.toFixed(3)})`,
            opacity: bannerOp,
          }}
        >
          TAX DAY — 15 APR 2027
        </div>
      </Grade>
      <GrainNoise opacity={0.05} seed={92} />
      <Vignette strength={0.16} rgb="8,14,28" />
    </AbsoluteFill>
  );
};
