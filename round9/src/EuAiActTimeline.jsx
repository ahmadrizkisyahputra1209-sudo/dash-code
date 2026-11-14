import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {clamp01, countProg, fadeIn, fadeOutEnd, starPoints, uiSpring} from './smooth.js';
import {GrainNoise, Grade, Vignette} from './postfx.jsx';

// 3. EU AI ACT TIMELINE — 1920x1080. Horizontal timeline, milestones light
// up one by one, red flag at the deadline. Palette 60% #0B2A6B EU blue /
// 30% #FFCC00 gold / 10% #C0392B red flag. Text EXACT per plan:
// "2 FEB 2025 — Prohibitions"
// "2 AUG 2025 — GPAI rules"
// "2 AUG 2026 — Enforcement"
// "2 AUG 2027 — Legacy GPAI"
// "2 DEC 2027 — High-risk (Annex III)"
// 2 DEC 2027 is the high-risk Annex III date (Digital Omnibus Reg (EU)
// 2026/1744) — do NOT use the old "2 Aug 2026 high-risk" claim. Timeline
// draws f30-150; milestones alternate above/below. Frame 0: blue gradient
// + EU star circle visible (not empty).
const W = 1920;
const H = 1080;
const MILESTONES = [
  {date: '2 FEB 2025', label: 'Prohibitions'},
  {date: '2 AUG 2025', label: 'GPAI rules'},
  {date: '2 AUG 2026', label: 'Enforcement'},
  {date: '2 AUG 2027', label: 'Legacy GPAI'},
  {date: '2 DEC 2027', label: 'High-risk (Annex III)'},
];
const LINE_Y = 540;
const LINE_X0 = 180;
const LINE_X1 = 1740;

export const EuAiActTimeline = () => {
  const frame = useCurrentFrame();

  const lineProg = clamp01((frame - 30) / 120);

  return (
    <AbsoluteFill style={{backgroundColor: '#0B2A6B', overflow: 'hidden'}}>
      <Grade>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(135deg, #0B2A6B 0%, #0A2358 55%, #081C46 100%)',
          }}
        />
        {/* EU star circle (12 stars), faint, top-right, visible from f0 */}
        <svg width={W} height={H} style={{position: 'absolute'}}>
          <g opacity={0.22}>
            {Array.from({length: 12}, (_, k) => {
              const ang = (k * Math.PI) / 6 - Math.PI / 2;
              const cx = 1680 + 95 * Math.cos(ang);
              const cy = 190 + 95 * Math.sin(ang);
              return <polygon key={k} points={starPoints(cx, cy, 14, 6, 5)} fill="#FFCC00" />;
            })}
          </g>
        </svg>
        {/* timeline line */}
        <div
          style={{
            position: 'absolute',
            left: LINE_X0,
            top: LINE_Y - 3,
            width: LINE_X1 - LINE_X0,
            height: 6,
            borderRadius: 3,
            background: 'rgba(255,204,0,0.5)',
            transform: `scaleX(${lineProg.toFixed(3)})`,
            transformOrigin: 'left center',
            opacity: fadeOutEnd(frame),
          }}
        />
        {MILESTONES.map((m, i) => {
          const cx = LINE_X0 + (i * (LINE_X1 - LINE_X0)) / 4;
          const above = i % 2 === 0;
          const s = clamp01(uiSpring(frame, 40 + i * 14));
          const op = fadeIn(frame - (40 + i * 14), 12) * fadeOutEnd(frame);
          const isLast = i === MILESTONES.length - 1;
          return (
            <React.Fragment key={m.date}>
              {/* node */}
              <div
                style={{
                  position: 'absolute',
                  left: cx - 18,
                  top: LINE_Y - 18,
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  background: isLast ? '#C0392B' : '#FFCC00',
                  border: '4px solid #FFFFFF',
                  transform: `scale(${s.toFixed(3)})`,
                  opacity: s * fadeOutEnd(frame),
                }}
              />
              {/* red flag below the last node */}
              {isLast && (
                <svg
                  width={120}
                  height={110}
                  style={{position: 'absolute', left: cx + 8, top: LINE_Y + 26, opacity: op}}
                >
                  <line x1={6} y1={0} x2={6} y2={96} stroke="#FFFFFF" strokeWidth={5} />
                  <polygon points="6,4 78,18 6,34" fill="#C0392B" />
                </svg>
              )}
              {/* milestone card */}
              <div
                style={{
                  position: 'absolute',
                  left: cx - 170,
                  top: above ? LINE_Y - 210 : LINE_Y + 90,
                  width: 340,
                  textAlign: 'center',
                  transform: `scale(${s.toFixed(3)})`,
                  opacity: op,
                }}
              >
                <div style={{color: '#FFCC00', fontSize: 36, fontWeight: 800, letterSpacing: 1}}>
                  {m.date}
                </div>
                <div style={{color: '#FFFFFF', fontSize: 30, fontWeight: 600, marginTop: 10}}>
                  {m.label}
                </div>
              </div>
            </React.Fragment>
          );
        })}
      </Grade>
      <GrainNoise opacity={0.05} seed={93} />
      <Vignette strength={0.16} rgb="4,14,40" />
    </AbsoluteFill>
  );
};
