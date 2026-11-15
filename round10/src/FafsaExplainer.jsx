import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {clamp01, fadeIn, fadeOutEnd, revealScale, uiSpring} from './smooth.js';
import {GrainNoise, Grade, Vignette} from './postfx.jsx';

// 8. FAFSA 2027–28 EXPLAINER — 1080x1920 VERTICAL. Caption-driven
// explainer (remotion-captions pattern): 3-step checklist with green
// ticks + word-by-word TikTok-style caption bar. Captions are stored
// as a Caption-type array (text/startMs/endMs/timestampMs/confidence)
// per the captions skill, rendered in pure code (no @remotion/captions
// dep in this project). Palette 60% #1B2A4A navy / 30% #3DDC84 green
// ticks / 10% #E8B84B gold. Text EXACT: "FAFSA 2027–28" ·
// "OPEN 1 OCT 2026" · "USE 2025 INCOME" ·
// "STATE DEADLINES JAN–MAR 2027". Text stays inside the 9:16 safe
// zone (15–75% height). Frame 0: gradient + checklist shells visible.
const W = 1080;
const H = 1920;
const STEPS = [
  {text: 'OPEN 1 OCT 2026', delay: 30},
  {text: 'USE 2025 INCOME', delay: 90},
  {text: 'STATE DEADLINES JAN–MAR 2027', delay: 150},
];
// Word-by-word captions, Caption-type shape (ms @ 30fps).
const CAPTIONS = [
  {text: 'FAFSA', startMs: 3333, endMs: 3733, timestampMs: 3533, confidence: null},
  {text: ' 2027–28', startMs: 3733, endMs: 4133, timestampMs: 3933, confidence: null},
  {text: ' OPEN', startMs: 4133, endMs: 4533, timestampMs: 4333, confidence: null},
  {text: ' 1', startMs: 4533, endMs: 4800, timestampMs: 4666, confidence: null},
  {text: ' OCT', startMs: 4800, endMs: 5200, timestampMs: 5000, confidence: null},
  {text: ' 2026', startMs: 5200, endMs: 5600, timestampMs: 5400, confidence: null},
  {text: ' USE', startMs: 5600, endMs: 6000, timestampMs: 5800, confidence: null},
  {text: ' 2025', startMs: 6000, endMs: 6400, timestampMs: 6200, confidence: null},
  {text: ' INCOME', startMs: 6400, endMs: 6800, timestampMs: 6600, confidence: null},
  {text: ' STATE', startMs: 6800, endMs: 7200, timestampMs: 7000, confidence: null},
  {text: ' DEADLINES', startMs: 7200, endMs: 7600, timestampMs: 7400, confidence: null},
  {text: ' JAN–MAR', startMs: 7600, endMs: 8000, timestampMs: 7800, confidence: null},
  {text: ' 2027', startMs: 8000, endMs: 8666, timestampMs: 8333, confidence: null},
];
const ROW_Y = [560, 780, 1000];

export const FafsaExplainer = () => {
  const frame = useCurrentFrame();
  const fade = fadeOutEnd(frame);
  const nowMs = (frame / 30) * 1000;

  const activeIdx = CAPTIONS.findIndex((c) => nowMs >= c.startMs && nowMs < c.endMs);

  return (
    <AbsoluteFill style={{backgroundColor: '#1B2A4A', overflow: 'hidden'}}>
      <Grade>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(180deg, #1B2A4A 0%, #16223C 55%, #101B33 100%)',
          }}
        />
        {/* faint grid dots, visible from f0 */}
        <svg width={W} height={H} style={{position: 'absolute'}}>
          {Array.from({length: 24}, (_, i) => (
            <circle key={i} cx={80 + (i % 4) * 300} cy={60 + Math.floor(i / 4) * 300} r={4} fill="#3DDC84" opacity={0.12} />
          ))}
        </svg>
        {/* header */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 300,
            width: W,
            textAlign: 'center',
            color: '#FFFFFF',
            fontSize: 110,
            fontWeight: 900,
            letterSpacing: 4,
            scale: revealScale(frame, 10, 18),
            opacity: fadeIn(frame - 10, 12) * fade,
          }}
        >
          FAFSA 2027–28
        </div>
        <div
          style={{
            position: 'absolute',
            left: 390,
            top: 450,
            width: 300,
            height: 6,
            borderRadius: 3,
            background: '#E8B84B',
            scale: clamp01(uiSpring(frame, 22)),
            opacity: fadeIn(frame - 22, 12) * fade,
          }}
        />
        {/* checklist rows */}
        {STEPS.map((s, i) => {
          const rowOp = fadeIn(frame - s.delay, 12) * fade;
          const checkProg = interpolate(frame, [s.delay, s.delay + 14], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          });
          const fs = i === 2 ? 44 : 52;
          return (
            <div
              key={s.text}
              style={{
                position: 'absolute',
                left: 80,
                top: ROW_Y[i],
                width: 920,
                height: 150,
                borderRadius: 24,
                background: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                padding: '0 36px',
                boxShadow: '0 18px 40px rgba(0,0,0,0.35)',
                scale: clamp01(uiSpring(frame, s.delay)),
                opacity: rowOp,
              }}
            >
              <svg width={76} height={76} style={{flexShrink: 0}}>
                <circle cx={38} cy={38} r={34} fill="#3DDC84" />
                <path
                  d="M 24 39 L 34 49 L 54 28"
                  fill="none"
                  stroke="#FFFFFF"
                  strokeWidth={7}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  pathLength={1}
                  strokeDasharray={1}
                  strokeDashoffset={1 - checkProg}
                />
              </svg>
              <div
                style={{
                  color: '#1B2A4A',
                  fontSize: fs,
                  fontWeight: 800,
                  letterSpacing: 1,
                  marginLeft: 28,
                }}
              >
                {s.text}
              </div>
            </div>
          );
        })}
        {/* word-by-word caption bar (TikTok style) */}
        <div
          style={{
            position: 'absolute',
            left: 80,
            top: 1240,
            width: 920,
            minHeight: 130,
            borderRadius: 24,
            background: 'rgba(0,0,0,0.35)',
            border: '3px solid rgba(232,184,75,0.6)',
            display: 'flex',
            flexWrap: 'wrap',
            alignContent: 'center',
            padding: '20px 28px',
            opacity: fadeIn(frame - 95, 12) * fade,
          }}
        >
          {CAPTIONS.map((c, i) => {
            const active = i === activeIdx;
            const past = nowMs >= c.endMs;
            return (
              <span
                key={i}
                style={{
                  color: active ? '#E8B84B' : '#FFFFFF',
                  fontSize: 46,
                  fontWeight: active ? 900 : 700,
                  opacity: active ? 1 : past ? 0.55 : 0.35,
                  scale: active ? 1.12 : 1,
                  display: 'inline-block',
                }}
              >
                {c.text}
              </span>
            );
          })}
        </div>
      </Grade>
      <GrainNoise opacity={0.05} seed={108} />
      <Vignette strength={0.16} rgb="8,14,28" />
    </AbsoluteFill>
  );
};
