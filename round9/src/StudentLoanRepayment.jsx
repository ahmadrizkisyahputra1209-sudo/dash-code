import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {clamp01, countProg, fadeIn, fadeOutEnd, uiSpring} from './smooth.js';
import {GrainNoise, Grade, Vignette} from './postfx.jsx';

// 11. STUDENT LOAN REPAYMENT — 1920x1080. Balance bar falls month by
// month (12 steps); payoff date counts down. Palette 60% #1B2A4A
// graduation navy / 30% #E8B84B gold / 10% #FFFFFF white. Text EXACT per
// plan:
// "BALANCE" "MONTHLY PAYMENT" "INTEREST" "PAYOFF DATE"
// "CLASS OF 2027"
// Generic labels only — no invented rates. Balance falls in 12 monthly
// steps (f60-240); payoff countdown 24 -> 00 ONCE, hold, fade-out f285-300
// (NEVER reversed). Timed to graduation May–Jun. Frame 0: navy gradient +
// row shells visible (not empty).
const W = 1920;
const H = 1080;
const ROWS = [
  {label: 'BALANCE', kind: 'balance'},
  {label: 'MONTHLY PAYMENT', kind: 'bar', frac: 0.5},
  {label: 'INTEREST', kind: 'bar', frac: 0.3},
  {label: 'PAYOFF DATE', kind: 'countdown'},
];

export const StudentLoanRepayment = () => {
  const frame = useCurrentFrame();

  const headOp = fadeIn(frame, 12) * fadeOutEnd(frame);
  const lineProg = clamp01((frame - 20) / 40);

  // Balance: 12 monthly steps down, 1 -> 0.12.
  const balProg = countProg(frame, 60, 240);
  const balSteps = Math.floor(balProg * 12) / 12;
  const balScale = 1 - 0.88 * balSteps;
  // Payoff countdown: 24 -> 00 months, once.
  const months = Math.max(0, 24 - Math.round(24 * countProg(frame, 60, 240)));
  const monthsStr = String(months).padStart(2, '0');

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
        {/* header */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 64,
            textAlign: 'center',
            color: '#E8B84B',
            fontSize: 60,
            fontWeight: 800,
            letterSpacing: 6,
            opacity: headOp,
          }}
        >
          CLASS OF 2027
        </div>
        <div
          style={{
            position: 'absolute',
            left: 760,
            top: 158,
            width: 400,
            height: 6,
            borderRadius: 3,
            background: '#E8B84B',
            transform: `scaleX(${lineProg.toFixed(3)})`,
            opacity: fadeOutEnd(frame),
          }}
        />
        {ROWS.map((r, i) => {
          const y = 240 + i * 180;
          const scale = clamp01(uiSpring(frame, 30 + i * 10));
          const op = fadeIn(frame - (30 + i * 10), 12) * fadeOutEnd(frame);
          return (
            <div
              key={r.label}
              style={{
                position: 'absolute',
                left: 200,
                top: y,
                width: 1520,
                height: 140,
                display: 'flex',
                alignItems: 'center',
                transform: `scale(${scale.toFixed(3)})`,
                opacity: op,
              }}
            >
              <div style={{width: 380, color: '#FFFFFF', fontSize: 36, fontWeight: 800, letterSpacing: 2}}>
                {r.label}
              </div>
              {r.kind === 'balance' && (
                <div style={{position: 'relative', width: 1100, height: 56, borderRadius: 28, background: 'rgba(255,255,255,0.10)', overflow: 'hidden'}}>
                  <div
                    style={{
                      position: 'absolute',
                      left: 0,
                      top: 0,
                      width: 1100,
                      height: 56,
                      borderRadius: 28,
                      background: '#E8B84B',
                      transform: `scaleX(${balScale.toFixed(3)})`,
                      transformOrigin: 'left center',
                    }}
                  />
                </div>
              )}
              {r.kind === 'bar' && (
                <div style={{position: 'relative', width: 1100, height: 56, borderRadius: 28, background: 'rgba(255,255,255,0.10)', overflow: 'hidden'}}>
                  <div
                    style={{
                      position: 'absolute',
                      left: 0,
                      top: 0,
                      width: 1100,
                      height: 56,
                      borderRadius: 28,
                      background: '#E8B84B',
                      transform: `scaleX(${(r.frac * countProg(frame, 90 + i * 10, 170 + i * 10)).toFixed(3)})`,
                      transformOrigin: 'left center',
                    }}
                  />
                </div>
              )}
              {r.kind === 'countdown' && (
                <div style={{width: 1100, display: 'flex', alignItems: 'center'}}>
                  <div style={{color: '#E8B84B', fontSize: 88, fontWeight: 800}}>{monthsStr}</div>
                </div>
              )}
            </div>
          );
        })}
      </Grade>
      <GrainNoise opacity={0.05} seed={101} />
      <Vignette strength={0.16} rgb="8,14,28" />
    </AbsoluteFill>
  );
};
