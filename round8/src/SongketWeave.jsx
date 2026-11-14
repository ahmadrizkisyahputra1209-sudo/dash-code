import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {Trail} from '@remotion/motion-blur';
import {clamp01, fadeIn, fadeOutEnd, triWave, uiSpring} from './smooth.js';
import {GrainNoise, Grade, Vignette} from './postfx.jsx';

// 9. SONGKET — 1920x1080. Gold-thread pattern building up row by row on
// deep cloth, loom shuttle moving. Palette 60% #5C1A24 deep maroon /
// 30% #C9A227 metallic gold / 10% #F8F3E8 ivory. Text EXACT per plan.
// No UNESCO claim for songket on screen (status not verified). The shuttle
// is the ONLY fast-moving element, so it is the only <Trail> in Round 8
// (layers 6, lag 1 frame). Shuttle x is a there-and-back triangle wave
// (period 150 divides 300); y drifts down smoothly as rows are woven.
// Frame 0: maroon cloth + thread lines + title visible (not empty).
const W = 1920;
const H = 1080;
const ROWS = 8;
const COLS = 10;

export const SongketWeave = () => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();

  const titleOp = fadeIn(frame, 12) * fadeOutEnd(frame);
  const subOp = fadeIn(frame - 20, 12) * fadeOutEnd(frame);
  const starScale = clamp01(uiSpring(frame, 150));
  const starOp = fadeIn(frame - 150, 12) * fadeOutEnd(frame);

  // Shuttle: x there-and-back across the cloth (triWave period 150),
  // y drifts down as rows complete (f30-128), then holds.
  const shuttleX = 400 + triWave(frame, 150) * (1160 / 75);
  const shuttleY = 260 + Math.min(7, Math.max(0, (frame - 30) / 14)) * 80;

  return (
    <AbsoluteFill style={{backgroundColor: '#5C1A24', overflow: 'hidden'}}>
      <Grade>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(135deg, #5C1A24 0%, #4E1620 55%, #3E1119 100%)',
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
            color: '#F8F3E8',
            fontSize: 64,
            fontWeight: 800,
            letterSpacing: 10,
            opacity: titleOp,
          }}
        >
          SONGKET
        </div>
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 150,
            textAlign: 'center',
            color: '#C9A227',
            fontSize: 34,
            fontWeight: 600,
            opacity: subOp,
          }}
        >
          Handwoven gold thread
        </div>
        {/* cloth panel */}
        <div
          style={{
            position: 'absolute',
            left: 360,
            top: 220,
            width: 1200,
            height: 680,
            borderRadius: 12,
            background: '#4A1420',
            border: '2px solid rgba(201,162,39,0.4)',
          }}
        />
        {/* thread lines (static, visible from f0) */}
        <svg width={W} height={H} style={{position: 'absolute'}}>
          {Array.from({length: 17}, (_, i) => (
            <line key={i} x1={372} y1={240 + i * 40} x2={1548} y2={240 + i * 40} stroke="#C9A227" strokeWidth={1} opacity={0.08} />
          ))}
        </svg>
        {/* diamond lattice, row by row */}
        <svg width={W} height={H} style={{position: 'absolute'}} opacity={fadeOutEnd(frame)}>
          {Array.from({length: ROWS}, (_, r) => {
            const rowOp = interpolate(frame, [30 + r * 14, 30 + r * 14 + 18], [0, 1], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            });
            return (
              <g key={r} opacity={rowOp}>
                {Array.from({length: COLS}, (_, c) => {
                  const cx = 420 + c * 120;
                  const cy = 260 + r * 80;
                  return (
                    <polygon
                      key={c}
                      points={`${cx},${cy - 30} ${cx + 46},${cy} ${cx},${cy + 30} ${cx - 46},${cy}`}
                      fill="rgba(201,162,39,0.06)"
                      stroke="#C9A227"
                      strokeWidth={2}
                    />
                  );
                })}
              </g>
            );
          })}
          {/* centre star motif */}
          <g transform={`translate(960 580) scale(${starScale.toFixed(3)})`} opacity={starOp}>
            <polygon
              points="0,-64 15,-15 64,0 15,15 0,64 -15,15 -64,0 -15,-15"
              fill="#C9A227"
            />
            <polygon
              points="0,-40 9,-9 40,0 9,9 0,40 -9,9 -40,0 -9,-9"
              fill="#5C1A24"
            />
          </g>
        </svg>
        {/* loom shuttle with motion-blur trail (fast element only) */}
        <Trail layers={6} lagInFrames={1} trailOpacity={0.5}>
          <svg width={W} height={H} style={{position: 'absolute'}}>
            <g transform={`translate(${shuttleX.toFixed(1)} ${shuttleY.toFixed(1)})`}>
              <path
                d="M-70 0 Q0 -26 70 0 Q0 26 -70 0 Z"
                fill="#C9A227"
                stroke="#8C6D1F"
                strokeWidth={2}
              />
              <line x1={-70} y1={0} x2={-130} y2={0} stroke="#C9A227" strokeWidth={3} />
              <circle cx={0} cy={0} r={8} fill="#5C1A24" />
            </g>
          </svg>
        </Trail>
        {/* bottom label */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 950,
            textAlign: 'center',
            color: '#F8F3E8',
            fontSize: 30,
            opacity: subOp * 0.8,
          }}
        >
          Gold • Silk
        </div>
      </Grade>
      <GrainNoise opacity={0.05} seed={89} />
      <Vignette strength={0.16} rgb="40,8,12" />
    </AbsoluteFill>
  );
};
