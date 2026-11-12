import React, {useMemo} from 'react';
import {AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {evolvePath, getLength} from '@remotion/paths';
import {clamp01, countProg, cyc, fadeIn, fadeOutEnd, mulberry32, smoothstep} from './smooth.js';
import {GrainNoise, Grade, Vignette} from './postfx.jsx';

// 1. TAX REFUND — tax form + calculator + refund count-up + checkmark.
// Palette 60% #0B3D2E deep green / 30% #3DDC97 mint / 10% #E8B84B gold.
// Data EXACT: refund $1,248. Text: "Tax Day Thu 15 Apr 2027" (factual date).
// Count-up: $0 -> $1,248 (f60-150), hold, fade-out f285-300 (NEVER reverse).
// Effects (fallback, WebGL slow in Codespace): GrainNoise replaces FxGrain (fractalNoise). Frame 0: bg + form outlines
// already visible (not empty).
const W = 1920;
const H = 1080;

export const TaxRefund = () => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const p = frame / durationInFrames;

  // Parallax from one camera t (circular, seamless): bg 0.3x, cards 0.7x, amount 1.0x.
  const bgX = Math.cos(2 * Math.PI * p) * 8;
  const bgY = Math.sin(2 * Math.PI * p) * 8;
  const cardX = Math.cos(2 * Math.PI * p) * 5;
  const cardY = Math.sin(2 * Math.PI * p) * 5;
  const amtX = Math.cos(2 * Math.PI * p) * 12;
  const amtY = Math.sin(2 * Math.PI * p) * 12;

  // Form rows fade in staggered (2f apart), calculator keys pop with spring.
  const rows = [0, 1, 2, 3, 4];
  const keys = ['7', '8', '9', '4', '5', '6', '1', '2', '3'];
  const keySprings = keys.map((_, i) =>
    spring({
      frame: frame - (30 + i * 2),
      fps: 30,
      config: {damping: 30, stiffness: 300, mass: 1},
    }),
  );

  // Refund count-up (corrected rule): up once, hold, fade out at the end.
  const prog = countProg(frame, 60, 150);
  const amount = Math.round(1248 * prog);
  const amountOp = fadeIn(frame - 45, 12) * fadeOutEnd(frame);

  // Checkmark: draw f150-180, spring pop, fade out at the end.
  const checkD = useMemo(() => 'M-26 2 L-8 20 L28 -20', []);
  const checkLen = useMemo(() => getLength(checkD), [checkD]);
  const checkProg = smoothstep((frame - 150) / 30);
  const checkEvolve = evolvePath(checkProg, checkD);
  const checkScale = spring({
    frame: frame - 150,
    fps: 30,
    config: {damping: 30, stiffness: 300, mass: 1},
  });
  const checkOp = fadeIn(frame - 150, 6) * fadeOutEnd(frame);

  const glowOp = 0.18 + 0.03 * cyc(p, 2);
  const cardOp = fadeIn(frame, 12) * fadeOutEnd(frame);

  return (
    <AbsoluteFill style={{backgroundColor: '#0B3D2E', overflow: 'hidden'}}>
      <Grade>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(135deg, #0B3D2E 0%, #0A3327 55%, #072420 100%)',
          }}
        />
        {/* faint background dots, drifting on a circle (seamless) */}
        <svg width={W} height={H} style={{position: 'absolute'}}>
          <g transform={`translate(${bgX.toFixed(1)} ${bgY.toFixed(1)})`}>
            {Array.from({length: 24}, (_, i) => {
              const rand = mulberry32(71 + i);
              const x = rand() * W;
              const y = rand() * H;
              return <circle key={i} cx={x} cy={y} r={2.5} fill="#3DDC97" opacity={0.14} />;
            })}
          </g>
        </svg>
        {/* top bar: Tax Day */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 72,
            textAlign: 'center',
            color: '#E8B84B',
            fontSize: 34,
            fontWeight: 600,
            letterSpacing: 6,
            opacity: fadeIn(frame, 12),
          }}
        >
          TAX DAY&nbsp;&nbsp;THU 15 APR 2027
        </div>
        {/* left card: tax form */}
        <div
          style={{
            position: 'absolute',
            left: 140 + cardX,
            top: 220 + cardY,
            width: 620,
            height: 560,
            background: '#0F4A38',
            borderRadius: 28,
            boxShadow: '0 18px 40px rgba(0,0,0,0.35)',
            opacity: cardOp,
            padding: '36px 44px',
          }}
        >
          <div style={{color: '#FFFFFF', fontSize: 40, fontWeight: 700, marginBottom: 28}}>
            TAX RETURN
          </div>
          {rows.map((r) => (
            <div key={r} style={{display: 'flex', alignItems: 'center', marginBottom: 34, opacity: fadeIn(frame - (20 + r * 2), 10)}}>
              <div
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: 6,
                  border: '3px solid #3DDC97',
                  marginRight: 20,
                  background: r < 3 ? '#3DDC97' : 'transparent',
                }}
              />
              <div style={{flex: 1, height: 14, borderRadius: 7, background: 'rgba(255,255,255,0.28)'}} />
              <div style={{width: 90, height: 14, borderRadius: 7, background: 'rgba(255,255,255,0.18)', marginLeft: 20}} />
            </div>
          ))}
          <div style={{marginTop: 8, color: '#3DDC97', fontSize: 28, fontWeight: 600}}>
            Federal + State filed
          </div>
        </div>
        {/* right card: calculator */}
        <div
          style={{
            position: 'absolute',
            left: 1160 + cardX,
            top: 220 + cardY,
            width: 620,
            height: 560,
            background: '#0F4A38',
            borderRadius: 28,
            boxShadow: '0 18px 40px rgba(0,0,0,0.35)',
            opacity: cardOp,
            padding: '36px 44px',
          }}
        >
          <div
            style={{
              height: 96,
              borderRadius: 16,
              background: '#072420',
              color: '#3DDC97',
              fontSize: 52,
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              paddingRight: 28,
              marginBottom: 28,
            }}
          >
            ${amount.toLocaleString('en-US')}
          </div>
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18}}>
            {keys.map((k, i) => (
              <div
                key={k}
                style={{
                  height: 96,
                  borderRadius: 16,
                  background: 'rgba(255,255,255,0.10)',
                  color: '#FFFFFF',
                  fontSize: 44,
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transform: `scale(${clamp01(keySprings[i]).toFixed(3)})`,
                  opacity: clamp01(keySprings[i]),
                }}
              >
                {k}
              </div>
            ))}
          </div>
        </div>
        {/* bottom: checkmark + refund amount */}
        <svg width={W} height={H} style={{position: 'absolute'}}>
          <ellipse cx={960} cy={920} rx={430} ry={70} fill="#E8B84B" opacity={glowOp} />
          <g
            transform={`translate(${660 + amtX} ${905 + amtY}) scale(${checkScale.toFixed(3)})`}
            opacity={checkOp}
          >
            <circle r={46} fill="#3DDC97" />
            <path
              d={checkD}
              fill="none"
              stroke="#0B3D2E"
              strokeWidth={8}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray={checkEvolve.strokeDasharray}
              strokeDashoffset={checkEvolve.strokeDashoffset}
            />
          </g>
        </svg>
        <div
          style={{
            position: 'absolute',
            left: 730 + amtX,
            top: 845 + amtY,
            color: '#FFFFFF',
            fontSize: 104,
            fontWeight: 800,
            opacity: amountOp,
          }}
        >
          ${amount.toLocaleString('en-US')}
        </div>
        <div
          style={{
            position: 'absolute',
            left: 734 + amtX,
            top: 968 + amtY,
            color: '#E8B84B',
            fontSize: 32,
            fontWeight: 600,
            letterSpacing: 4,
            opacity: amountOp,
          }}
        >
          REFUND
        </div>
      </Grade>
      <GrainNoise opacity={0.05} seed={71} />
      <Vignette strength={0.16} rgb="4,24,16" />
    </AbsoluteFill>
  );
};
