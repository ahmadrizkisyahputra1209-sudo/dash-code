import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {clamp01, easeOut, fadeIn, fadeOutEnd, revealScale, uiSpring} from './smooth.js';
import {GrainNoise, Grade, Vignette} from './postfx.jsx';

// 5. HOLY WEEK 2027 TIMELINE — 1920x1080. Horizontal timeline, 3
// milestones light up one by one (Ash Wednesday → Good Friday →
// Easter). Palette 60% #3B2F5B lent violet / 30% #E8B84B gold /
// 10% #FFFFFF white. Text EXACT: "HOLY WEEK 2027" ·
// "ASH WEDNESDAY — 10 FEB" · "GOOD FRIDAY — 26 MAR" ·
// "EASTER — 28 MAR 2027". Frame 0: gradient + timeline shell visible.
const W = 1920;
const H = 1080;
const NODES = [
  {x: 420, delay: 40, label: 'ASH WEDNESDAY — 10 FEB', icon: 'cross-small'},
  {x: 960, delay: 100, label: 'GOOD FRIDAY — 26 MAR', icon: 'cross-large'},
  {x: 1500, delay: 160, label: 'EASTER — 28 MAR 2027', icon: 'sun'},
];

export const HolyWeekTimeline = () => {
  const frame = useCurrentFrame();
  const fade = fadeOutEnd(frame);

  const lineProg = interpolate(frame, [20, 100], [0, 1], {
    easing: easeOut,
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{backgroundColor: '#3B2F5B', overflow: 'hidden'}}>
      <Grade>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(180deg, #3B2F5B 0%, #2E2347 60%, #221A36 100%)',
          }}
        />
        {/* faint candle dots, visible from f0 */}
        <svg width={W} height={H} style={{position: 'absolute'}}>
          {Array.from({length: 20}, (_, i) => (
            <circle key={i} cx={110 + (i % 10) * 190} cy={90 + Math.floor(i / 10) * 120} r={3.5} fill="#E8B84B" opacity={0.16} />
          ))}
        </svg>
        {/* header */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 110,
            width: W,
            textAlign: 'center',
            color: '#FFFFFF',
            fontSize: 96,
            fontWeight: 900,
            letterSpacing: 6,
            scale: revealScale(frame, 10, 18),
            opacity: fadeIn(frame - 10, 12) * fade,
          }}
        >
          HOLY WEEK 2027
        </div>
        {/* timeline line draw-on */}
        <svg width={W} height={H} style={{position: 'absolute'}}>
          <line
            x1={200}
            y1={520}
            x2={1720}
            y2={520}
            stroke="#E8B84B"
            strokeWidth={8}
            strokeLinecap="round"
            pathLength={1}
            strokeDasharray={1}
            strokeDashoffset={1 - lineProg}
            opacity={fade}
          />
        </svg>
        {NODES.map((n) => {
          const lit = clamp01(uiSpring(frame, n.delay));
          const op = fadeIn(frame - n.delay, 12) * fade;
          return (
            <div key={n.label}>
              <div
                style={{
                  position: 'absolute',
                  left: n.x - 70,
                  top: 520 - 70,
                  width: 140,
                  height: 140,
                  borderRadius: '50%',
                  background: lit > 0.5 ? '#E8B84B' : '#3B2F5B',
                  border: '6px solid #E8B84B',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  scale: revealScale(frame, n.delay, 16),
                  opacity: op,
                }}
              >
                {n.icon === 'sun' ? (
                  <svg width={70} height={70}>
                    <circle cx={35} cy={35} r={16} fill={lit > 0.5 ? '#3B2F5B' : '#E8B84B'} />
                    {Array.from({length: 8}, (_, i) => {
                      const ang = (i * Math.PI) / 4;
                      return (
                        <line
                          key={i}
                          x1={35 + 22 * Math.cos(ang)}
                          y1={35 + 22 * Math.sin(ang)}
                          x2={35 + 31 * Math.cos(ang)}
                          y2={35 + 31 * Math.sin(ang)}
                          stroke={lit > 0.5 ? '#3B2F5B' : '#E8B84B'}
                          strokeWidth={5}
                          strokeLinecap="round"
                        />
                      );
                    })}
                  </svg>
                ) : (
                  <svg
                    width={70}
                    height={70}
                    style={{scale: n.icon === 'cross-large' ? 1.3 : 1}}
                  >                    <rect
                      x={31}
                      y={8}
                      width={8}
                      height={54}
                      fill={lit > 0.5 ? '#3B2F5B' : '#E8B84B'}
                    />
                    <rect
                      x={14}
                      y={20}
                      width={42}
                      height={8}
                      fill={lit > 0.5 ? '#3B2F5B' : '#E8B84B'}
                    />
                  </svg>
                )}
              </div>
              <div
                style={{
                  position: 'absolute',
                  left: n.x - 330,
                  top: 660,
                  width: 660,
                  textAlign: 'center',
                  color: '#FFFFFF',
                  fontSize: 44,
                  fontWeight: 800,
                  letterSpacing: 1,
                  scale: clamp01(uiSpring(frame, n.delay + 12)),
                  opacity: fadeIn(frame - (n.delay + 12), 12) * fade,
                }}
              >
                {n.label}
              </div>
            </div>
          );
        })}
        {/* gold divider under header */}
        <div
          style={{
            position: 'absolute',
            left: 810,
            top: 250,
            width: 300,
            height: 6,
            borderRadius: 3,
            background: '#E8B84B',
            scale: clamp01(uiSpring(frame, 30)),
            opacity: fadeIn(frame - 30, 12) * fade,
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 900,
            width: W,
            textAlign: 'center',
            color: '#E8B84B',
            fontSize: 40,
            fontWeight: 600,
            letterSpacing: 8,
            opacity: fadeIn(frame - 180, 12) * fade,
          }}
        >
          LENT · PALM SUNDAY · EASTER
        </div>
      </Grade>
      <GrainNoise opacity={0.05} seed={105} />
      <Vignette strength={0.16} rgb="24,14,40" />
    </AbsoluteFill>
  );
};
