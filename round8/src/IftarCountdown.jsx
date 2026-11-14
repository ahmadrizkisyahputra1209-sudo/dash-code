import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {cyc, fadeIn, fadeOutEnd, mulberry32} from './smooth.js';
import {GrainNoise, Grade, Vignette} from './postfx.jsx';

// 2. IFTAR COUNTDOWN — VERTICAL 1080x1920. Dusk sky, crescent, countdown
// timer, warm glow. Palette 60% #1B1035 deep plum-indigo / 30% #E8B84B gold /
// 10% #F5A623 warm amber. Text EXACT per plan. Timer digits "00:42:18" are a
// generic countdown (not a real time) and stay static; the progress ring
// around them sweeps out and back (f0-150 fill, f150-300 empty) so the loop
// is seamless. Safe zones 9:16: text 15-75% height (288-1440).
// Frame 0: dusk gradient + crescent + stars visible (not empty).
const W = 1080;
const H = 1920;

export const IftarCountdown = () => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const p = frame / durationInFrames;

  // Progress ring: fills f0-150, empties f150-300 (there-and-back, seamless).
  const ringProg = interpolate(frame, [0, 150, 300], [0, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const ringCirc = 2 * Math.PI * 190;

  const titleOp = fadeIn(frame, 12) * fadeOutEnd(frame);
  const timerOp = fadeIn(frame - 30, 12) * fadeOutEnd(frame);
  const subOp = fadeIn(frame - 90, 12) * fadeOutEnd(frame);
  const glowOp = 0.5 + 0.1 * cyc(p, 1);
  const sunY = 1330 + 14 * cyc(p, 1);
  const swayL = 3 * cyc(p, 1, 0);
  const swayR = 3 * cyc(p, 1, 2.1);

  return (
    <AbsoluteFill style={{backgroundColor: '#1B1035', overflow: 'hidden'}}>
      <Grade>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(180deg, #1B1035 0%, #2A1650 45%, #4A2350 72%, #7A3B2E 100%)',
          }}
        />
        {/* horizon glow + setting sun */}
        <svg width={W} height={H} style={{position: 'absolute'}}>
          <ellipse cx={540} cy={1330} rx={520} ry={120} fill="#F5A623" opacity={glowOp * 0.35} />
          <circle cx={540} cy={sunY} r={72} fill="#F5A623" opacity={0.9} />
          <rect x={0} y={1400} width={W} height={520} fill="#1B1035" opacity={0.55} />
        </svg>
        {/* twinkling stars (sin-based, seamless) */}
        <svg width={W} height={H} style={{position: 'absolute'}}>
          {Array.from({length: 18}, (_, i) => {
            const rand = mulberry32(82 + i);
            const x = rand() * W;
            const y = rand() * 900;
            const tw = 0.25 + 0.35 * (0.5 + 0.5 * cyc(p, 1, i * 0.7));
            return <circle key={i} cx={x} cy={y} r={3} fill="#F8F3E8" opacity={tw} />;
          })}
        </svg>
        {/* crescent moon (mask-carved, so the gradient shows through) */}
        <svg width={W} height={H} style={{position: 'absolute'}}>
          <defs>
            <mask id="iftar-crescent">
              <rect x={380} y={380} width={320} height={320} fill="white" />
              <circle cx={600} cy={500} r={96} fill="black" />
            </mask>
          </defs>
          <ellipse cx={540} cy={540} rx={170} ry={170} fill="#E8B84B" opacity={glowOp * 0.3} />
          <circle cx={540} cy={540} r={110} fill="#E8B84B" mask="url(#iftar-crescent)" />
        </svg>
        {/* swaying lanterns */}
        <svg width={W} height={H} style={{position: 'absolute'}}>
          <g transform={`translate(180 620) rotate(${swayL.toFixed(2)})`}>
            <rect x={-4} y={-90} width={8} height={90} fill="#E8B84B" opacity={0.6} />
            <path d="M-34 0 Q0 -34 34 0 L34 78 Q0 96 -34 78 Z" fill="#E8B84B" />
            <rect x={-26} y={14} width={52} height={50} fill="#1B1035" opacity={0.35} />
            <rect x={-8} y={96} width={16} height={34} fill="#F5A623" />
          </g>
          <g transform={`translate(900 620) rotate(${swayR.toFixed(2)})`}>
            <rect x={-4} y={-90} width={8} height={90} fill="#E8B84B" opacity={0.6} />
            <path d="M-34 0 Q0 -34 34 0 L34 78 Q0 96 -34 78 Z" fill="#E8B84B" />
            <rect x={-26} y={14} width={52} height={50} fill="#1B1035" opacity={0.35} />
            <rect x={-8} y={96} width={16} height={34} fill="#F5A623" />
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
            color: '#E8B84B',
            fontSize: 54,
            fontWeight: 800,
            letterSpacing: 6,
            opacity: titleOp,
          }}
        >
          IFTAR COUNTDOWN
        </div>
        {/* timer ring + digits */}
        <svg width={W} height={H} style={{position: 'absolute'}} opacity={timerOp}>
          <g transform="translate(540 780)">
            <circle r={190} fill="rgba(255,255,255,0.07)" stroke="rgba(232,184,75,0.35)" strokeWidth={6} />
            <circle
              r={190}
              fill="none"
              stroke="#E8B84B"
              strokeWidth={8}
              strokeLinecap="round"
              strokeDasharray={`${ringCirc}`}
              strokeDashoffset={ringCirc * (1 - ringProg)}
              transform="rotate(-90)"
            />
            <text y={28} textAnchor="middle" fontSize={76} fontWeight={800} fill="#FFFFFF">
              00:42:18
            </text>
          </g>
        </svg>
        {/* subtitles */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 1060,
            textAlign: 'center',
            color: '#E8B84B',
            fontSize: 36,
            fontWeight: 600,
            opacity: subOp,
          }}
        >
          Ramadan 2027 · 8 Feb – 8 Mar 2027
        </div>
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 1140,
            textAlign: 'center',
            color: '#F8F3E8',
            fontSize: 34,
            opacity: subOp * 0.9,
          }}
        >
          Sunset • Break the fast
        </div>
      </Grade>
      <GrainNoise opacity={0.05} seed={82} />
      <Vignette strength={0.16} rgb="10,6,26" />
    </AbsoluteFill>
  );
};
