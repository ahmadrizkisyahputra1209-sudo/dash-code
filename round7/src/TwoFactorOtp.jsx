import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {evolvePath, getLength} from '@remotion/paths';
import {clamp01, eventEnv, fadeIn, fadeOutEnd, mulberry32, smoothstep} from './smooth.js';
import {GrainNoise, Grade, Vignette} from './postfx.jsx';

// 8. TWO FACTOR OTP — VERTICAL 1080x1920. Phone OTP: 6-digit code filling
// one by one, timer ring counting down, checkmark. Palette 60% #0F172A dark
// / 30% #7C5CFF violet / 10% #3DDC84 green. Digits EXACT: 4 8 2 9 1 6.
// Timer ring: one full circle per loop (there-and-back fill so f300 == f0).
// Digits pop staggered 60ms. Safe zones: text 15-75% height (288-1440),
// bottom 20% + right 10% clear. Frame 0: phone + empty boxes visible.
const W = 1080;
const H = 1920;
const DIGITS = ['4', '8', '2', '9', '1', '6'];

export const TwoFactorOtp = () => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const p = frame / durationInFrames;

  // Digits pop with spring, staggered 2f apart from f30.
  const digitSprings = DIGITS.map((_, i) =>
    spring({
      frame: frame - (30 + i * 2),
      fps: 30,
      config: {damping: 30, stiffness: 300, mass: 1},
    }),
  );

  // Timer ring: fills f0-150, empties f150-300 (there-and-back, seamless).
  const ringProg = interpolate(frame, [0, 150, 300], [0, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const ringCirc = 2 * Math.PI * 90;

  // Checkmark: pops after the last digit (f120), fades out f285-300.
  const checkEnv = eventEnv(p, 0.4, 0.05, 0.4, 0.1);
  const checkD = 'M-30 2 L-10 22 L32 -22';
  const checkLen = getLength(checkD);
  const checkEvolve = evolvePath(smoothstep((frame - 125) / 25), checkD);
  const checkScale = spring({
    frame: frame - 120,
    fps: 30,
    config: {damping: 30, stiffness: 300, mass: 1},
  });

  const driftX = Math.cos(2 * Math.PI * p) * 6;
  const driftY = Math.sin(2 * Math.PI * p) * 6;

  return (
    <AbsoluteFill style={{backgroundColor: '#0F172A', overflow: 'hidden'}}>
      <Grade>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(180deg, #0F172A 0%, #131B31 55%, #0B1120 100%)',
          }}
        />
        <svg width={W} height={H} style={{position: 'absolute'}}>
          <g transform={`translate(${driftX.toFixed(1)} ${driftY.toFixed(1)})`}>
            {Array.from({length: 14}, (_, i) => {
              const rand = mulberry32(78 + i);
              return (
                <circle key={i} cx={rand() * W} cy={rand() * H} r={2.5} fill="#7C5CFF" opacity={0.14} />
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
            top: 380,
            textAlign: 'center',
            color: '#FFFFFF',
            fontSize: 54,
            fontWeight: 700,
            opacity: fadeIn(frame, 12) * fadeOutEnd(frame),
          }}
        >
          Verification code
        </div>
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 460,
            textAlign: 'center',
            color: '#FFFFFF',
            fontSize: 32,
            opacity: fadeIn(frame - 10, 12) * fadeOutEnd(frame) * 0.7,
          }}
        >
          Enter the 6-digit code
        </div>
        {/* digit boxes */}
        <div
          style={{
            position: 'absolute',
            left: 80,
            top: 620,
            width: 920,
            display: 'flex',
            gap: 16,
          }}
        >
          {DIGITS.map((d, i) => (
            <div
              key={i}
              style={{
                width: 140,
                height: 160,
                borderRadius: 20,
                background: '#1A2338',
                border: '3px solid rgba(124,92,255,0.55)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
                fontSize: 72,
                fontWeight: 700,
                transform: `scale(${clamp01(digitSprings[i]).toFixed(3)})`,
                opacity: clamp01(digitSprings[i]) * fadeOutEnd(frame),
              }}
            >
              {d}
            </div>
          ))}
        </div>
        {/* timer ring */}
        <svg width={W} height={H} style={{position: 'absolute'}}>
          <g transform="translate(540 950)" opacity={fadeIn(frame - 60, 12) * fadeOutEnd(frame)}>
            <circle r={90} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth={10} />
            <circle
              r={90}
              fill="none"
              stroke="#7C5CFF"
              strokeWidth={10}
              strokeLinecap="round"
              strokeDasharray={`${ringCirc}`}
              strokeDashoffset={ringCirc * (1 - ringProg)}
              transform="rotate(-90)"
            />
            <text y={14} textAnchor="middle" fontSize={44} fontWeight={700} fill="#FFFFFF">
              0:30
            </text>
          </g>
        </svg>
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 1080,
            textAlign: 'center',
            color: '#FFFFFF',
            fontSize: 30,
            opacity: fadeIn(frame - 60, 12) * fadeOutEnd(frame) * 0.7,
          }}
        >
          Code expires soon
        </div>
        {/* checkmark */}
        <svg width={W} height={H} style={{position: 'absolute'}}>
          <g
            transform={`translate(540 1290) scale(${clamp01(checkScale).toFixed(3)})`}
            opacity={checkEnv}
          >
            <circle r={70} fill="#3DDC84" />
            <path
              d={checkD}
              fill="none"
              stroke="#0F172A"
              strokeWidth={10}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray={checkEvolve.strokeDasharray}
              strokeDashoffset={checkEvolve.strokeDashoffset}
            />
          </g>
        </svg>
      </Grade>
      <GrainNoise opacity={0.05} seed={78} />
      <Vignette strength={0.16} rgb="6,8,20" />
    </AbsoluteFill>
  );
};
