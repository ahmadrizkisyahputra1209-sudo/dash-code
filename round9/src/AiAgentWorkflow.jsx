import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {Trail} from '@remotion/motion-blur';
import {clamp01, env, fadeIn, fadeOutEnd, mulberry32, playfulSpring, uiSpring} from './smooth.js';
import {GrainNoise, Grade, Vignette} from './postfx.jsx';

// 1. AI AGENT WORKFLOW — 1920x1080. Dashboard: task enters, agent plans,
// acts, waits for human approval, done. Palette 60% #0B1F3A deep navy /
// 30% #22D3EE electric cyan / 10% #F5A623 amber (approval state).
// Text EXACT per plan:
// "TASK RECEIVED → PLAN → ACT → AWAITING APPROVAL → DONE"
// "AGENT: Book flights"
// "STATUS: Awaiting approval"
// Pipeline dot travels there-and-back (env, seamless) — the ONLY fast
// element, so the only <Trail> in Round 9 (layers 6, lag 1). Nodes light up
// staggered; DONE checkmark pops at f210. Frame 0: navy gradient + dot
// grid + card shells visible (not empty).
const W = 1920;
const H = 1080;
const NODES = ['TASK RECEIVED', 'PLAN', 'ACT', 'AWAITING APPROVAL', 'DONE'];
const NODE_W = 300;
const NODE_H = 110;
const NODE_Y = 520;
const LINE_X0 = 240;
const LINE_X1 = 1680;
const LINE_Y = 575;

export const AiAgentWorkflow = () => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const p = frame / durationInFrames;

  // Pipeline dot: there-and-back over the loop (env 0..1..0), seamless.
  const dotX = LINE_X0 + (LINE_X1 - LINE_X0) * env(p);
  const dotY = LINE_Y;

  const cardOp = fadeIn(frame, 12) * fadeOutEnd(frame);
  const cardScale = clamp01(uiSpring(frame, 15));
  const statusOp = fadeIn(frame - 180, 12) * fadeOutEnd(frame);
  const statusScale = clamp01(uiSpring(frame, 180));
  const lineProg = clamp01((frame - 50) / 120);
  const checkScale = clamp01(playfulSpring(frame, 210));

  return (
    <AbsoluteFill style={{backgroundColor: '#0B1F3A', overflow: 'hidden'}}>
      <Grade>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(135deg, #0B1F3A 0%, #0A1B33 55%, #081426 100%)',
          }}
        />
        {/* faint dot grid, static, visible from f0 */}
        <svg width={W} height={H} style={{position: 'absolute'}}>
          {Array.from({length: 40}, (_, i) => {
            const rand = mulberry32(91 + i);
            return (
              <circle key={i} cx={rand() * W} cy={rand() * H} r={3} fill="#22D3EE" opacity={0.08} />
            );
          })}
        </svg>
        {/* task card */}
        <div
          style={{
            position: 'absolute',
            left: 640,
            top: 170,
            width: 640,
            height: 150,
            borderRadius: 24,
            background: 'rgba(34,211,238,0.10)',
            border: '2px solid rgba(34,211,238,0.55)',
            boxShadow: '0 18px 40px rgba(0,0,0,0.35)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
            fontSize: 46,
            fontWeight: 700,
            transform: `scale(${cardScale.toFixed(3)})`,
            opacity: cardOp,
          }}
        >
          AGENT: Book flights
        </div>
        {/* connector line */}
        <div
          style={{
            position: 'absolute',
            left: LINE_X0,
            top: LINE_Y - 3,
            width: LINE_X1 - LINE_X0,
            height: 6,
            borderRadius: 3,
            background: 'rgba(34,211,238,0.35)',
            transform: `scaleX(${lineProg.toFixed(3)})`,
            transformOrigin: 'left center',
            opacity: fadeOutEnd(frame),
          }}
        />
        {/* pipeline nodes */}
        {NODES.map((n, i) => {
          const x = 90 + i * (NODE_W + 60);
          const isApproval = n === 'AWAITING APPROVAL';
          const s = clamp01(uiSpring(frame, 30 + i * 6));
          return (
            <div
              key={n}
              style={{
                position: 'absolute',
                left: x,
                top: NODE_Y,
                width: NODE_W,
                height: NODE_H,
                borderRadius: 20,
                background: isApproval ? 'rgba(245,166,35,0.16)' : 'rgba(34,211,238,0.10)',
                border: `2px solid ${isApproval ? '#F5A623' : 'rgba(34,211,238,0.7)'}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: isApproval ? '#F5A623' : '#FFFFFF',
                fontSize: isApproval ? 26 : 28,
                fontWeight: 800,
                letterSpacing: 1,
                textAlign: 'center',
                padding: '0 12px',
                transform: `scale(${s.toFixed(3)})`,
                opacity: s * fadeOutEnd(frame),
              }}
            >
              {n}
            </div>
          );
        })}
        {/* arrows between nodes */}
        {[0, 1, 2, 3].map((i) => {
          const x = 90 + (i + 1) * NODE_W + i * 60 + 12;
          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: x,
                top: NODE_Y + 34,
                color: '#22D3EE',
                fontSize: 36,
                fontWeight: 800,
                opacity: fadeIn(frame - (50 + i * 6), 10) * fadeOutEnd(frame),
              }}
            >
              →
            </div>
          );
        })}
        {/* travelling dot with motion-blur trail (fast element only) */}
        <Trail layers={6} lagInFrames={1} trailOpacity={0.5}>
          <svg width={W} height={H} style={{position: 'absolute'}} opacity={fadeOutEnd(frame)}>
            <circle cx={dotX} cy={dotY} r={16} fill="#F5A623" />
            <circle cx={dotX} cy={dotY} r={16} fill="none" stroke="#FFFFFF" strokeWidth={3} />
          </svg>
        </Trail>
        {/* DONE checkmark badge */}
        <div
          style={{
            position: 'absolute',
            left: 1800,
            top: 496,
            width: 64,
            height: 64,
            borderRadius: '50%',
            background: '#22D3EE',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transform: `scale(${checkScale.toFixed(3)})`,
            opacity: checkScale * fadeOutEnd(frame),
          }}
        >
          <svg width={40} height={40} viewBox="0 0 40 40">
            <polyline points="8,21 17,30 33,11" fill="none" stroke="#0B1F3A" strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        {/* status pill */}
        <div
          style={{
            position: 'absolute',
            left: 660,
            top: 830,
            width: 600,
            height: 110,
            borderRadius: 55,
            background: 'rgba(245,166,35,0.16)',
            border: '2px solid #F5A623',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#F5A623',
            fontSize: 38,
            fontWeight: 700,
            transform: `scale(${statusScale.toFixed(3)})`,
            opacity: statusOp,
          }}
        >
          STATUS: Awaiting approval
        </div>
      </Grade>
      <GrainNoise opacity={0.05} seed={91} />
      <Vignette strength={0.16} rgb="4,12,26" />
    </AbsoluteFill>
  );
};
