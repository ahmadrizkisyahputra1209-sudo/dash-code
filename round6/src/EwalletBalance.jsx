import React from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {countProg, fadeIn, fadeOutEnd, smoothstep} from './smooth.js';
import {Grade, GrainNoise, Vignette} from './postfx.jsx';

// 8. E-WALLET BALANCE — 1080x1920 VERTICAL.
// Palette 60% #1B1F3B deep indigo / 30% #7C5CFF violet / 10% #3DDC97 mint.
// Data EXACT (from plan only): balance Rp 1.250.000, +Rp 500.000, -Rp 125.000.
// Balance counts up ONCE (f15-90), holds, fades out f285-300 (CORRECTED).
// Transactions stagger 2 frames apart (60ms). All text sits inside the
// 9:16 safe zone (15-75% height = y 288-1440). Frame 0: phone + card visible.
const fmt = (n) =>
  'Rp ' + Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');

const ROWS = [
  {label: 'Top Up', amount: '+Rp 500.000', positive: true},
  {label: 'Shopping', amount: '-Rp 125.000', positive: false},
];

export const EwalletBalance = () => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const p = frame / durationInFrames;

  const balance = 1250000 * countProg(frame, 15, 90);
  const numOp = fadeIn(frame, 12) * fadeOutEnd(frame);
  const cardY = interpolate(frame, [0, 15], [30, 0], {
    easing: Easing.bezier(0.65, 0, 0.35, 1),
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{backgroundColor: '#1B1F3B', overflow: 'hidden'}}>
      <Grade>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(135deg, #232850 0%, #1B1F3B 55%, #14172E 100%)',
          }}
        />
        <svg width={1080} height={1920} style={{position: 'absolute'}}>
          {/* phone frame */}
          <rect x={160} y={210} width={760} height={1500} rx={56} fill="#12142A" stroke="#2A2F55" strokeWidth={2} />
          <rect x={470} y={232} width={140} height={26} rx={13} fill="#2A2F55" />
          {/* card, slides in f0-15 */}
          <g transform={`translate(0 ${cardY.toFixed(1)})`}>
            <rect x={200} y={300} width={680} height={300} rx={28} fill="#7C5CFF" />
            <rect x={200} y={300} width={680} height={300} rx={28} fill="none" stroke="#9B82FF" strokeWidth={2} />
            <rect x={240} y={350} width={72} height={52} rx={10} fill="#E8B84B" />
            <text x={240} y={480} fontFamily="sans-serif" fontSize={28} fontWeight={700} letterSpacing={4} fill="#FFFFFF" opacity={0.9}>
              E-WALLET
            </text>
            <text x={840} y={560} textAnchor="end" fontFamily="sans-serif" fontSize={30} fontWeight={700} letterSpacing={3} fill="#FFFFFF" opacity={0.9}>
              •••• 4821
            </text>
          </g>
          {/* balance */}
          <text x={540} y={700} textAnchor="middle" fontFamily="sans-serif" fontSize={28} fontWeight={600} letterSpacing={4} fill="#8B9BB4">
            TOTAL BALANCE
          </text>
          <text x={540} y={790} textAnchor="middle" fontFamily="sans-serif" fontSize={62} fontWeight={800} fill="#FFFFFF" opacity={numOp}>
            {fmt(balance)}
          </text>
          {/* divider */}
          <line x1={220} y1={860} x2={860} y2={860} stroke="#2A2F55" strokeWidth={2} />
          <text x={220} y={930} fontFamily="sans-serif" fontSize={26} fontWeight={700} letterSpacing={4} fill="#8B9BB4">
            TRANSACTIONS
          </text>
          {/* transaction rows, staggered 2 frames apart */}
          {ROWS.map((r, i) => {
            const startF = 60 + i * 2;
            const slide = interpolate(frame, [startF, startF + 12], [40, 0], {
              easing: Easing.bezier(0.65, 0, 0.35, 1),
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            });
            const op = smoothstep((frame - startF) / 12) * fadeOutEnd(frame);
            const y = 1000 + i * 150;
            return (
              <g key={i} transform={`translate(${slide.toFixed(1)} 0)`} opacity={op}>
                <rect x={220} y={y} width={640} height={120} rx={18} fill="#1B1F3B" stroke="#2A2F55" strokeWidth={2} />
                <circle cx={280} cy={y + 60} r={26} fill={r.positive ? '#3DDC97' : '#FFFFFF'} opacity={r.positive ? 1 : 0.85} />
                <text x={280} y={y + 70} textAnchor="middle" fontFamily="sans-serif" fontSize={30} fontWeight={800} fill={r.positive ? '#0B1F3A' : '#1B1F3B'}>
                  {r.positive ? '+' : '−'}
                </text>
                <text x={330} y={y + 72} fontFamily="sans-serif" fontSize={32} fontWeight={700} fill="#FFFFFF">
                  {r.label}
                </text>
                <text x={840} y={y + 72} textAnchor="end" fontFamily="sans-serif" fontSize={32} fontWeight={800} fill={r.positive ? '#3DDC97' : '#FFFFFF'}>
                  {r.amount}
                </text>
              </g>
            );
          })}
        </svg>
      </Grade>
      <GrainNoise opacity={0.05} seed={88} />
      <Vignette strength={0.16} rgb="10,10,30" />
    </AbsoluteFill>
  );
};
