import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {clamp01, fadeIn, fadeOutEnd, uiSpring} from './smooth.js';
import {GrainNoise, Grade, Vignette} from './postfx.jsx';

// 8. QURBANI — THE THREE SHARES — 1920x1080. One whole circle dividing
// into three labeled shares, icons (home / people / hands). Palette 60%
// #E8D5B5 warm sand / 30% #14532D deep green / 10% #C65D3B terracotta.
// Text EXACT per plan, including "Traditionally divided in three"
// (thirds is recommended, not obligatory). Slices pop in staggered with
// the crisp UI spring; the full circle outline is visible from f0.
// Frame 0: sand background + circle outline + title shell visible.
const W = 1920;
const H = 1080;
const CX = 620;
const CY = 580;
const R = 270;

const polar = (r, deg) => {
  const a = ((deg - 90) * Math.PI) / 180;
  return [CX + r * Math.cos(a), CY + r * Math.sin(a)];
};

const wedgePath = (a0, a1) => {
  const [x0, y0] = polar(R, a0);
  const [x1, y1] = polar(R, a1);
  return `M${CX} ${CY} L${x0.toFixed(1)} ${y0.toFixed(1)} A${R} ${R} 0 0 1 ${x1.toFixed(1)} ${y1.toFixed(1)} Z`;
};

const SLICES = [
  {a0: 0, a1: 120, fill: '#14532D', label: '⅓ Family', icon: 'home'},
  {a0: 120, a1: 240, fill: '#C65D3B', label: '⅓ Relatives & friends', icon: 'people'},
  {a0: 240, a1: 360, fill: '#C9A227', label: '⅓ People in need', icon: 'hands'},
];

const Icon = ({kind, x, y}) => {
  if (kind === 'home') {
    return (
      <g stroke="#FFFFFF" strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" fill="none">
        <path d={`M${x - 40} ${y + 6} L${x} ${y - 36} L${x + 40} ${y + 6} Z`} />
        <path d={`M${x - 28} ${y + 6} L${x - 28} ${y + 40} L${x + 28} ${y + 40} L${x + 28} ${y + 6}`} />
      </g>
    );
  }
  if (kind === 'people') {
    return (
      <g stroke="#FFFFFF" strokeWidth={7} strokeLinecap="round" fill="none">
        <circle cx={x - 22} cy={y - 16} r={14} />
        <path d={`M${x - 44} ${y + 40} Q${x - 44} ${y + 6} ${x - 22} ${y + 6} Q${x} ${y + 6} ${x} ${y + 40}`} />
        <circle cx={x + 26} cy={y - 16} r={14} />
        <path d={`M${x + 4} ${y + 40} Q${x + 4} ${y + 6} ${x + 26} ${y + 6} Q${x + 48} ${y + 6} ${x + 48} ${y + 40}`} />
      </g>
    );
  }
  // hands: cupped hands holding a heart
  return (
    <g stroke="#FFFFFF" strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" fill="none">
      <path d={`M${x} ${y + 34} Q${x - 30} ${y + 6} ${x - 26} ${y - 16} Q${x - 14} ${y - 26} ${x} ${y - 12} Q${x + 14} ${y - 26} ${x + 26} ${y - 16} Q${x + 30} ${y + 6} ${x} ${y + 34} Z`} />
      <path d={`M${x - 46} ${y + 12} Q${x - 30} ${y + 34} ${x - 8} ${y + 40}`} />
      <path d={`M${x + 46} ${y + 12} Q${x + 30} ${y + 34} ${x + 8} ${y + 40}`} />
    </g>
  );
};

export const QurbaniThreeShares = () => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();

  const sliceSprings = SLICES.map((_, i) => uiSpring(frame, 30 + i * 20));
  const titleOp = fadeIn(frame, 12) * fadeOutEnd(frame);
  const bottomOp = fadeIn(frame - 120, 12) * fadeOutEnd(frame);
  const rowSprings = SLICES.map((_, i) => uiSpring(frame, 60 + i * 15));

  return (
    <AbsoluteFill style={{backgroundColor: '#E8D5B5', overflow: 'hidden'}}>
      <Grade>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(135deg, #E8D5B5 0%, #E2CBA8 55%, #DCC096 100%)',
          }}
        />
        {/* title */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 64,
            textAlign: 'center',
            color: '#14532D',
            fontSize: 54,
            fontWeight: 800,
            letterSpacing: 4,
            opacity: titleOp,
          }}
        >
          QURBANI — THE THREE SHARES
        </div>
        {/* pie: full outline visible from f0, slices pop in staggered */}
        <svg width={W} height={H} style={{position: 'absolute'}}>
          <circle cx={CX} cy={CY} r={R} fill="none" stroke="#14532D" strokeWidth={3} opacity={0.5} />
          {SLICES.map((s, i) => {
            const sc = clamp01(sliceSprings[i]);
            const mid = (s.a0 + s.a1) / 2;
            const [ix, iy] = polar(150, mid);
            return (
              <g
                key={s.label}
                transform={`translate(${CX} ${CY}) scale(${sc.toFixed(3)}) translate(${-CX} ${-CY})`}
                opacity={sc * fadeOutEnd(frame)}
              >
                <path d={wedgePath(s.a0, s.a1)} fill={s.fill} stroke="#E8D5B5" strokeWidth={4} />
                <Icon kind={s.icon} x={ix} y={iy} />
              </g>
            );
          })}
        </svg>
        {/* legend rows */}
        {SLICES.map((s, i) => (
          <div
            key={s.label}
            style={{
              position: 'absolute',
              left: 1080,
              top: 400 + i * 160,
              display: 'flex',
              alignItems: 'center',
              transform: `scale(${clamp01(rowSprings[i]).toFixed(3)})`,
              opacity: clamp01(rowSprings[i]) * fadeOutEnd(frame),
            }}
          >
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                background: s.fill,
                marginRight: 28,
                boxShadow: '0 8px 20px rgba(0,0,0,0.25)',
              }}
            />
            <div style={{color: '#14532D', fontSize: 46, fontWeight: 700}}>{s.label}</div>
          </div>
        ))}
        {/* bottom lines */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 920,
            textAlign: 'center',
            color: '#14532D',
            fontSize: 36,
            fontWeight: 600,
            opacity: bottomOp,
          }}
        >
          Traditionally divided in three
        </div>
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 980,
            textAlign: 'center',
            color: '#C65D3B',
            fontSize: 32,
            fontWeight: 600,
            opacity: bottomOp,
          }}
        >
          Eid al-Adha • 16 May 2027
        </div>
      </Grade>
      <GrainNoise opacity={0.05} seed={88} />
      <Vignette strength={0.14} rgb="90,60,20" />
    </AbsoluteFill>
  );
};
