import React from 'react';
import {AbsoluteFill, HtmlInCanvas, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {bevelAlpha} from '@remotion/effects/bevel-alpha';
import {countProg, fadeIn, fadeOutEnd, mulberry32, smoothstep} from './smooth.js';
import {GrainNoise, Grade, Vignette} from './postfx.jsx';

// 10. INSURANCE CLAIM TRACKER — claim progress tracker: 3 steps
// (Filed -> Review -> Approved), progress bar filling, checkmarks.
// Palette 60% #F2F5F7 light grey / 30% #0E7C7B teal / 10% #3DDC84 green.
// Data EXACT: claim #2847, $2,350 approved. Progress bar fills via scaleX
// (ease-out) there-and-back; steps pop staggered 60ms. Effects: bevelAlpha
// on the steps container (HtmlInCanvas) + GrainNoise. Frame 0: header +
// track visible (not empty).
const W = 1920;
const H = 1080;

const STEPS = [
  {label: 'Filed', sub: 'Claim submitted', startF: 60},
  {label: 'Review', sub: 'Documents checked', startF: 100},
  {label: 'Approved', sub: 'Payout ready', startF: 140},
];

export const InsuranceClaimTracker = () => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const p = frame / durationInFrames;

  // Progress fill: 0 -> 1 (f30-150), hold, back to 0 by f300 (loop-safe).
  const fill =
    frame < 30
      ? 0
      : frame < 150
        ? smoothstep((frame - 30) / 120)
        : frame < 240
          ? 1
          : 1 - smoothstep((frame - 240) / 60);

  // Approved amount count-up (corrected rule): up once, hold, fade out.
  const prog = countProg(frame, 120, 210);
  const amount = Math.round(2350 * prog);
  const amountOp = fadeIn(frame - 105, 12) * fadeOutEnd(frame);

  const driftX = Math.cos(2 * Math.PI * p) * 6;
  const driftY = Math.sin(2 * Math.PI * p) * 6;

  return (
    <AbsoluteFill style={{backgroundColor: '#F2F5F7', overflow: 'hidden'}}>
      <Grade cssOnly>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(135deg, #F2F5F7 0%, #E8EEF0 55%, #DDE6E9 100%)',
          }}
        />
        <svg width={W} height={H} style={{position: 'absolute'}}>
          <g transform={`translate(${driftX.toFixed(1)} ${driftY.toFixed(1)})`}>
            {Array.from({length: 14}, (_, i) => {
              const rand = mulberry32(80 + i);
              return (
                <circle key={i} cx={rand() * W} cy={rand() * H} r={3} fill="#0E7C7B" opacity={0.1} />
              );
            })}
          </g>
        </svg>
        {/* header */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 120,
            textAlign: 'center',
            color: '#1B2A2A',
            fontSize: 56,
            fontWeight: 800,
            opacity: fadeIn(frame, 12),
          }}
        >
          Claim #2847
        </div>
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 200,
            textAlign: 'center',
            color: '#0E7C7B',
            fontSize: 32,
            fontWeight: 600,
            letterSpacing: 4,
            opacity: fadeIn(frame - 12, 12) * fadeOutEnd(frame),
          }}
        >
          TRACK YOUR CLAIM
        </div>
        {/* progress bar */}
        <div
          style={{
            position: 'absolute',
            left: 260,
            top: 400,
            width: 1400,
            height: 22,
            borderRadius: 11,
            background: 'rgba(14,124,123,0.18)',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: '100%',
              height: '100%',
              borderRadius: 11,
              background: '#0E7C7B',
              transform: `scaleX(${fill.toFixed(3)})`,
              transformOrigin: 'left center',
            }}
          />
        </div>
        {/* steps container with bevelAlpha depth (HtmlInCanvas) */}
        <HtmlInCanvas
          width={1500}
          height={320}
          effects={[bevelAlpha({edgeThickness: 2, lightAngle: -60, lightColor: '#FFFFFF', lightIntensity: 0.4})]}
          effectsOutputSize={{width: 1500, height: 320}}
          style={{position: 'absolute', left: 210, top: 500}}
        >
          <div style={{width: 1500, height: 320, display: 'flex', gap: 36, padding: 8}}>
            {STEPS.map((s, i) => {
              const checkOp = smoothstep((frame - s.startF) / 20) * fadeOutEnd(frame);
              const cardOp = fadeIn(frame - (30 + i * 2), 10) * fadeOutEnd(frame);
              return (
                <div
                  key={s.label}
                  style={{
                    flex: 1,
                    background: '#FFFFFF',
                    borderRadius: 24,
                    boxShadow: '0 12px 30px rgba(14,124,123,0.15)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    opacity: cardOp,
                  }}
                >
                  <div
                    style={{
                      width: 88,
                      height: 88,
                      borderRadius: 44,
                      background: '#0E7C7B',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#FFFFFF',
                      fontSize: 44,
                      fontWeight: 800,
                      marginBottom: 18,
                      opacity: checkOp,
                    }}
                  >
                    &#10003;
                  </div>
                  <div style={{color: '#1B2A2A', fontSize: 40, fontWeight: 700}}>{s.label}</div>
                  <div style={{color: '#5A6B6B', fontSize: 26, marginTop: 8}}>{s.sub}</div>
                </div>
              );
            })}
          </div>
        </HtmlInCanvas>
        {/* approved amount */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 880,
            textAlign: 'center',
            color: '#0E7C7B',
            fontSize: 96,
            fontWeight: 800,
            opacity: amountOp,
          }}
        >
          ${amount.toLocaleString('en-US')}
        </div>
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 1000,
            textAlign: 'center',
            color: '#1B2A2A',
            fontSize: 32,
            fontWeight: 600,
            letterSpacing: 4,
            opacity: amountOp,
          }}
        >
          APPROVED
        </div>
      </Grade>
      <GrainNoise opacity={0.05} seed={80} />
      <Vignette strength={0.14} rgb="120,140,140" />
    </AbsoluteFill>
  );
};
