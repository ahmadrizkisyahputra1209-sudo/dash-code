import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {countProg, cyc, fadeIn, fadeOutEnd, smoothstep} from './smooth.js';
import {Grade, GrainNoise, Vignette} from './postfx.jsx';

// 7. EV CHARGING DASHBOARD — battery gauge filling, kWh counter.
// Palette 60% #0D1B2A dark navy / 30% #3DDC84 electric green / 10% #FFFFFF.
// Data EXACT (from plan only): 42.6 kWh, 78% charged, 32 min remaining.
// Count-up ONCE (f15-90), hold, fade out f285-300 (CORRECTED rule).
// Gauge fill via stroke-dashoffset on a 270-degree arc (C = 1225).
// Bolt pulses +-30% opacity (sine k=2). Frame 0: gauge track + cards visible.
const ARC_C = 1225;

export const EvChargingDashboard = () => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const p = frame / durationInFrames;

  const prog = countProg(frame, 15, 90);
  const pct = Math.round(78 * prog);
  const kwh = (42.6 * prog).toFixed(1);
  const groupOp = fadeIn(frame, 12) * fadeOutEnd(frame);
  const boltOp = 0.7 + 0.3 * cyc(p, 2);

  return (
    <AbsoluteFill style={{backgroundColor: '#0D1B2A', overflow: 'hidden'}}>
      <Grade>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'radial-gradient(circle at 50% 42%, #12263A 0%, #0D1B2A 60%, #081120 100%)',
          }}
        />
        <svg width={1920} height={1080} style={{position: 'absolute'}}>
          {/* gauge track + fill (270-degree arc, r=260) */}
          <g opacity={groupOp}>
            <path
              d="M776.2,653.8 A260,260 0 1 1 1143.8,653.8"
              fill="none"
              stroke="#1B2A3A"
              strokeWidth={28}
              strokeLinecap="round"
            />
            <path
              d="M776.2,653.8 A260,260 0 1 1 1143.8,653.8"
              fill="none"
              stroke="#3DDC84"
              strokeWidth={28}
              strokeLinecap="round"
              strokeDasharray={ARC_C}
              strokeDashoffset={ARC_C * (1 - 0.78 * prog)}
            />
            {/* contact shadow under the gauge */}
            <ellipse cx={960} cy={780} rx={280} ry={18} fill="#000000" opacity={0.3} />
            {/* centre numbers */}
            <text x={960} y={500} textAnchor="middle" fontFamily="sans-serif" fontSize={120} fontWeight={800} fill="#FFFFFF">
              {pct}%
            </text>
            <text x={960} y={570} textAnchor="middle" fontFamily="sans-serif" fontSize={34} fontWeight={700} letterSpacing={8} fill="#8B9BB4">
              CHARGED
            </text>
          </g>
          {/* plug icon (left) */}
          <g transform="translate(300 470)" opacity={groupOp}>
            <rect x={-34} y={-70} width={68} height={120} rx={18} fill="none" stroke="#FFFFFF" strokeWidth={8} />
            <line x1={-18} y1={-70} x2={-18} y2={-108} stroke="#FFFFFF" strokeWidth={10} strokeLinecap="round" />
            <line x1={18} y1={-70} x2={18} y2={-108} stroke="#FFFFFF" strokeWidth={10} strokeLinecap="round" />
            <line x1={0} y1={50} x2={0} y2={108} stroke="#3DDC84" strokeWidth={10} strokeLinecap="round" />
          </g>
          {/* bolt icon (right), pulsing */}
          <g transform="translate(1620 470)" opacity={boltOp * groupOp}>
            <polygon
              points="20,-110 -50,20 -6,20 -24,110 56,-24 8,-24"
              fill="#3DDC84"
            />
          </g>
          {/* bottom cards */}
          <g opacity={groupOp}>
            <rect x={480} y={830} width={420} height={170} rx={20} fill="#12263A" />
            <rect x={480} y={830} width={420} height={170} rx={20} fill="none" stroke="#1E3A52" strokeWidth={2} />
            <text x={690} y={912} textAnchor="middle" fontFamily="sans-serif" fontSize={64} fontWeight={800} fill="#FFFFFF">
              {kwh} kWh
            </text>
            <text x={690} y={962} textAnchor="middle" fontFamily="sans-serif" fontSize={26} fontWeight={600} letterSpacing={3} fill="#8B9BB4">
              ENERGY DELIVERED
            </text>
            <rect x={1020} y={830} width={420} height={170} rx={20} fill="#12263A" />
            <rect x={1020} y={830} width={420} height={170} rx={20} fill="none" stroke="#1E3A52" strokeWidth={2} />
            <text x={1230} y={912} textAnchor="middle" fontFamily="sans-serif" fontSize={64} fontWeight={800} fill="#FFFFFF">
              32 min
            </text>
            <text x={1230} y={962} textAnchor="middle" fontFamily="sans-serif" fontSize={26} fontWeight={600} letterSpacing={3} fill="#8B9BB4">
              REMAINING
            </text>
          </g>
        </svg>
      </Grade>
      <GrainNoise opacity={0.05} seed={77} />
      <Vignette strength={0.16} rgb="4,12,22" />
    </AbsoluteFill>
  );
};
