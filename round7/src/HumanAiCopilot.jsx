import React, {useMemo} from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {evolvePath, getLength} from '@remotion/paths';
import {clamp01, cyc, eventEnv, fadeIn, fadeOutEnd, smoothstep} from './smooth.js';
import {GrainNoise, Grade, Vignette} from './postfx.jsx';

// 12. HUMAN AI COPILOT — human-in-the-loop: AI draft appears -> human
// hand/pointer reviews -> approval checkmark. Palette 60% #0D1117 dark /
// 30% #8B5CF6 violet / 10% #3DDC84 green. Only the human-approval motif —
// NOT a generic AI dashboard (those are flooded). Draft lines are generic
// UI strings (no invented facts). Cursor moves with a spring to the Approve
// button; button fills green + checkmark pops; everything fades out
// f285-300 so f300 == f0. Frame 0: bg + empty draft panel visible.
const W = 1920;
const H = 1080;

const LINES = [
  'Draft summary ready',
  'Key points highlighted',
  'Awaiting your review',
];

export const HumanAiCopilot = () => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const p = frame / durationInFrames;

  // Draft lines reveal staggered (f20-110), fade out at the end.
  const lineOps = LINES.map((_, i) => smoothstep((frame - (20 + i * 30)) / 20) * fadeOutEnd(frame));

  // Blinking cursor during typing (f20-140), integer sine cycles (seamless).
  const cursorBlink = 0.5 + 0.5 * cyc(p, 3);
  const cursorOp = eventEnv(p, 0.07, 0.02, 0.35, 0.05) * cursorBlink;

  // Human cursor: spring from (1100, 700) to the Approve button (1300, 560).
  const cursorSpring = spring({
    frame: frame - 150,
    fps: 30,
    config: {damping: 30, stiffness: 300, mass: 1},
  });
  const curX = interpolate(clamp01(cursorSpring), [0, 1], [1100, 1300]);
  const curY = interpolate(clamp01(cursorSpring), [0, 1], [700, 560]);
  const cursorVisible = fadeIn(frame - 150, 6) * fadeOutEnd(frame);

  // Approve button fills green + checkmark pops after the cursor arrives.
  const approveFill = smoothstep((frame - 190) / 15) * fadeOutEnd(frame);
  const checkEnv = eventEnv(p, 0.63, 0.05, 0.2, 0.1);
  const checkD = useMemo(() => 'M-26 2 L-8 20 L28 -20', []);
  const checkEvolve = evolvePath(smoothstep((frame - 195) / 25), checkD);
  const checkScale = spring({
    frame: frame - 190,
    fps: 30,
    config: {damping: 30, stiffness: 300, mass: 1},
  });

  const panelOp = fadeIn(frame, 12) * fadeOutEnd(frame);

  return (
    <AbsoluteFill style={{backgroundColor: '#0D1117', overflow: 'hidden'}}>
      <Grade>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(135deg, #0D1117 0%, #0B0F16 55%, #080B10 100%)',
          }}
        />
        {/* AI draft panel */}
        <div
          style={{
            position: 'absolute',
            left: 140,
            top: 260,
            width: 900,
            height: 560,
            background: '#1A1F2E',
            borderRadius: 28,
            boxShadow: '0 18px 40px rgba(0,0,0,0.4)',
            opacity: panelOp,
            padding: '40px 48px',
          }}
        >
          <div style={{color: '#8B5CF6', fontSize: 30, fontWeight: 700, letterSpacing: 3, marginBottom: 36}}>
            AI DRAFT
          </div>
          {LINES.map((line, i) => (
            <div
              key={line}
              style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: 34,
                opacity: lineOps[i],
              }}
            >
              <div style={{width: 14, height: 14, borderRadius: 7, background: '#8B5CF6', marginRight: 20, flexShrink: 0}} />
              <div style={{color: '#FFFFFF', fontSize: 38, fontWeight: 600}}>{line}</div>
            </div>
          ))}
          {/* typing cursor */}
          <div
            style={{
              width: 4,
              height: 44,
              background: '#8B5CF6',
              marginLeft: 34,
              opacity: cursorOp,
            }}
          />
        </div>
        {/* Approve button */}
        <div
          style={{
            position: 'absolute',
            left: 1200,
            top: 500,
            width: 420,
            height: 120,
            borderRadius: 60,
            background: '#8B5CF6',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
            fontSize: 44,
            fontWeight: 700,
            letterSpacing: 2,
            opacity: panelOp,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: '#3DDC84',
              opacity: approveFill,
            }}
          />
          <span style={{position: 'relative'}}>Approve</span>
        </div>
        <div
          style={{
            position: 'absolute',
            left: 1200,
            top: 650,
            width: 420,
            textAlign: 'center',
            color: '#FFFFFF',
            fontSize: 30,
            fontWeight: 500,
            opacity: fadeIn(frame - 60, 12) * fadeOutEnd(frame) * 0.75,
          }}
        >
          Human review required
        </div>
        {/* human cursor arrow + checkmark */}
        <svg width={W} height={H} style={{position: 'absolute'}}>
          <g transform={`translate(${curX.toFixed(1)} ${curY.toFixed(1)})`} opacity={cursorVisible}>
            <polygon points="0,0 0,44 11,33 17,48 23,45 17,30 30,30" fill="#FFFFFF" stroke="#0D1117" strokeWidth={2} />
          </g>
          <g
            transform={`translate(1410 380) scale(${clamp01(checkScale).toFixed(3)})`}
            opacity={checkEnv}
          >
            <circle r={54} fill="#3DDC84" />
            <path
              d={checkD}
              fill="none"
              stroke="#0D1117"
              strokeWidth={9}
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
            left: 0,
            right: 0,
            top: 130,
            textAlign: 'center',
            color: '#FFFFFF',
            fontSize: 52,
            fontWeight: 700,
            letterSpacing: 4,
            opacity: fadeIn(frame, 12) * fadeOutEnd(frame),
          }}
        >
          HUMAN + AI, TOGETHER
        </div>
      </Grade>
      <GrainNoise opacity={0.05} seed={82} />
      <Vignette strength={0.16} rgb="6,8,16" />
    </AbsoluteFill>
  );
};
