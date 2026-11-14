import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {clamp01, countProg, fadeIn, fadeOutEnd, mulberry32, uiSpring} from './smooth.js';
import {GrainNoise, Grade, Vignette} from './postfx.jsx';

// 4. HAJJ JOURNEY — 1920x1080. Route diagram: 7 rite stops along a winding
// path, drawn on in order, date chips for Arafah and Eid. Palette 60%
// #E8D5B5 sand gold / 30% #14532D deep green / 10% #FFFFFF white (light
// background). Text EXACT per plan:
// "HAJJ 2027 — 14–19 MAY"
// "DAY OF ARAFAH — 15 MAY"
// "EID AL-ADHA — 16 MAY"
// "IHRAM → TAWAF → SA'I → MINA → ARAFAH → MUZDALIFAH → JAMARAT"
// Dates are Umm al-Qura (±1 day moon sighting). Landscape ONLY (no
// vertical cut — similar-content rule). Path draws f60-200 via dashoffset;
// nodes light up staggered. Frame 0: sand gradient + dots visible.
const W = 1920;
const H = 1080;
const STOPS = [
  {name: 'IHRAM', x: 180, y: 760, above: false},
  {name: 'TAWAF', x: 430, y: 520, above: true},
  {name: "SA'I", x: 680, y: 740, above: false},
  {name: 'MINA', x: 950, y: 500, above: true},
  {name: 'ARAFAH', x: 1220, y: 730, above: false},
  {name: 'MUZDALIFAH', x: 1490, y: 510, above: true},
  {name: 'JAMARAT', x: 1740, y: 720, above: false},
];
const PATH_D = 'M180,760 Q305,400 430,520 T680,740 T950,500 T1220,730 T1490,510 T1740,720';
const PATH_LEN = 2600;

export const HajjJourney = () => {
  const frame = useCurrentFrame();

  const titleOp = fadeIn(frame, 12) * fadeOutEnd(frame);
  const chipOp = fadeIn(frame - 25, 12) * fadeOutEnd(frame);
  const drawProg = countProg(frame, 60, 200);
  const dashOffset = PATH_LEN * (1 - drawProg);

  return (
    <AbsoluteFill style={{backgroundColor: '#E8D5B5', overflow: 'hidden'}}>
      <Grade>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(180deg, #EFE0C0 0%, #E8D5B5 55%, #DCC49A 100%)',
          }}
        />
        {/* faint sand dots, visible from f0 */}
        <svg width={W} height={H} style={{position: 'absolute'}}>
          {Array.from({length: 26}, (_, i) => {
            const rand = mulberry32(94 + i);
            return (
              <circle key={i} cx={rand() * W} cy={rand() * H} r={3} fill="#14532D" opacity={0.08} />
            );
          })}
        </svg>
        {/* header */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 56,
            textAlign: 'center',
            color: '#14532D',
            fontSize: 64,
            fontWeight: 800,
            letterSpacing: 6,
            opacity: titleOp,
          }}
        >
          HAJJ 2027 — 14–19 MAY
        </div>
        {/* date chips */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 158,
            display: 'flex',
            justifyContent: 'center',
            gap: 36,
            opacity: chipOp,
          }}
        >
          <div
            style={{
              borderRadius: 32,
              background: '#14532D',
              color: '#FFFFFF',
              fontSize: 30,
              fontWeight: 700,
              padding: '14px 34px',
            }}
          >
            DAY OF ARAFAH — 15 MAY
          </div>
          <div
            style={{
              borderRadius: 32,
              background: '#FFFFFF',
              border: '2px solid #14532D',
              color: '#14532D',
              fontSize: 30,
              fontWeight: 700,
              padding: '14px 34px',
            }}
          >
            EID AL-ADHA — 16 MAY
          </div>
        </div>
        {/* route path (draw-on) */}
        <svg width={W} height={H} style={{position: 'absolute'}} opacity={fadeOutEnd(frame)}>
          <path
            d={PATH_D}
            fill="none"
            stroke="#14532D"
            strokeWidth={6}
            strokeLinecap="round"
            strokeDasharray={PATH_LEN}
            strokeDashoffset={dashOffset}
          />
        </svg>
        {/* stops */}
        {STOPS.map((s, i) => {
          const sc = clamp01(uiSpring(frame, 70 + i * 16));
          const op = fadeIn(frame - (80 + i * 16), 10) * fadeOutEnd(frame);
          return (
            <React.Fragment key={s.name}>
              <div
                style={{
                  position: 'absolute',
                  left: s.x - 26,
                  top: s.y - 26,
                  width: 52,
                  height: 52,
                  borderRadius: '50%',
                  background: '#FFFFFF',
                  border: '5px solid #14532D',
                  transform: `scale(${sc.toFixed(3)})`,
                  opacity: sc * fadeOutEnd(frame),
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  left: s.x - 130,
                  top: s.above ? s.y - 96 : s.y + 44,
                  width: 260,
                  textAlign: 'center',
                  color: '#14532D',
                  fontSize: 28,
                  fontWeight: 800,
                  letterSpacing: 1,
                  opacity: op,
                }}
              >
                {s.name}
              </div>
            </React.Fragment>
          );
        })}
        {/* arrows between stops (route direction) */}
        {[0, 1, 2, 3, 4, 5].map((i) => {
          const a = STOPS[i];
          const b = STOPS[i + 1];
          const mx = (a.x + b.x) / 2;
          const my = (a.y + b.y) / 2 - 30;
          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: mx - 18,
                top: my,
                color: '#14532D',
                fontSize: 34,
                fontWeight: 800,
                opacity: fadeIn(frame - (90 + i * 16), 10) * fadeOutEnd(frame),
              }}
            >
              →
            </div>
          );
        })}
      </Grade>
      <GrainNoise opacity={0.05} seed={94} />
      <Vignette strength={0.14} rgb="120,90,40" />
    </AbsoluteFill>
  );
};
