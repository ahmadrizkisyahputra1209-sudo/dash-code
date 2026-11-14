import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {cyc, env, eventEnv, fadeIn, fadeOutEnd, mulberry32, uiSpring} from './smooth.js';
import {GrainNoise, Grade, Vignette} from './postfx.jsx';

// 5. SUHOOR IFTAR TIMETABLE — 1080x1920 VERTICAL. Phone-style timetable:
// night -> dawn -> sunset, Suhoor and Iftar rows light up in turn. Palette
// 60% #1B1035 pre-dawn indigo / 30% #F5A623 amber sunset / 10% #E8B84B
// gold. Text EXACT per plan:
// "RAMADAN — 8 FEB–8 MAR 2027"
// "SUHOOR — before dawn"
// "IFTAR — at sunset"
// "EID AL-FITR — 9 MAR 2027"
// Generic labels only — NO invented times (they vary by city). Sun disc
// traces a closed loop (rises then sets), seamless. Safe zones 9:16: text
// 15-75% height (288-1440). Frame 0: indigo gradient + stars + row shells
// visible (not empty).
const W = 1080;
const H = 1920;

export const SuhoorIftarTimetable = () => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const p = frame / durationInFrames;

  // Sun disc: closed loop — x swings with sin, y rises then falls with env.
  const discX = 540 + 220 * cyc(p, 1, 0);
  const discY = 1150 - 430 * env(p);

  const headOp = fadeIn(frame, 12) * fadeOutEnd(frame);
  const footOp = fadeIn(frame - 200, 12) * fadeOutEnd(frame);
  const lineProg = Math.max(0, Math.min(1, (frame - 30) / 90));
  const suhoorGlow = eventEnv(p, 0, 0.05, 0.4, 0.05);
  const iftarGlow = eventEnv(p, 0.5, 0.05, 0.4, 0.05);

  return (
    <AbsoluteFill style={{backgroundColor: '#1B1035', overflow: 'hidden'}}>
      <Grade>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(180deg, #1B1035 0%, #241640 55%, #160D2C 100%)',
          }}
        />
        {/* twinkling stars, visible from f0 */}
        <svg width={W} height={H} style={{position: 'absolute'}}>
          {Array.from({length: 26}, (_, i) => {
            const rand = mulberry32(95 + i);
            const x = rand() * W;
            const y = rand() * H;
            const tw = 0.25 + 0.55 * env(p + rand());
            return <circle key={i} cx={x} cy={y} r={2.5} fill="#E8B84B" opacity={tw} />;
          })}
        </svg>
        {/* header */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 320,
            textAlign: 'center',
            color: '#E8B84B',
            fontSize: 44,
            fontWeight: 800,
            letterSpacing: 3,
            opacity: headOp,
          }}
        >
          RAMADAN — 8 FEB–8 MAR 2027
        </div>
        {/* vertical timeline line */}
        <div
          style={{
            position: 'absolute',
            left: 537,
            top: 560,
            width: 6,
            height: 740,
            borderRadius: 3,
            background: 'rgba(232,184,75,0.4)',
            transform: `scaleY(${lineProg.toFixed(3)})`,
            transformOrigin: 'top center',
            opacity: fadeOutEnd(frame),
          }}
        />
        {/* sun disc on its loop */}
        <div
          style={{
            position: 'absolute',
            left: discX - 70,
            top: discY - 70,
            width: 140,
            height: 140,
            borderRadius: '50%',
            background: '#F5A623',
            boxShadow: '0 0 60px 18px rgba(245,166,35,0.45)',
            opacity: fadeOutEnd(frame),
          }}
        />
        {/* SUHOOR row */}
        <div
          style={{
            position: 'absolute',
            left: 160,
            top: 660,
            width: 760,
            height: 180,
            borderRadius: 28,
            background: 'rgba(232,184,75,0.08)',
            border: `3px solid rgba(232,184,75,${(0.3 + 0.7 * suhoorGlow).toFixed(2)})`,
            boxShadow: `0 0 ${Math.round(30 * suhoorGlow)}px rgba(232,184,75,0.35)`,
            display: 'flex',
            alignItems: 'center',
            padding: '0 40px',
            transform: `scale(${Math.max(0, Math.min(1, uiSpring(frame, 50))).toFixed(3)})`,
            opacity: fadeIn(frame - 50, 12) * fadeOutEnd(frame),
          }}
        >
          <svg width={64} height={64} viewBox="0 0 64 64">
            <circle cx={32} cy={32} r={26} fill="#E8B84B" />
            <circle cx={44} cy={24} r={22} fill="#1B1035" />
          </svg>
          <div style={{marginLeft: 32}}>
            <div style={{color: '#E8B84B', fontSize: 44, fontWeight: 800, letterSpacing: 2}}>SUHOOR</div>
            <div style={{color: '#FFFFFF', fontSize: 32, fontWeight: 600, marginTop: 6, opacity: 0.85}}>
              before dawn
            </div>
          </div>
        </div>
        {/* IFTAR row */}
        <div
          style={{
            position: 'absolute',
            left: 160,
            top: 1020,
            width: 760,
            height: 180,
            borderRadius: 28,
            background: 'rgba(245,166,35,0.10)',
            border: `3px solid rgba(245,166,35,${(0.3 + 0.7 * iftarGlow).toFixed(2)})`,
            boxShadow: `0 0 ${Math.round(30 * iftarGlow)}px rgba(245,166,35,0.4)`,
            display: 'flex',
            alignItems: 'center',
            padding: '0 40px',
            transform: `scale(${Math.max(0, Math.min(1, uiSpring(frame, 90))).toFixed(3)})`,
            opacity: fadeIn(frame - 90, 12) * fadeOutEnd(frame),
          }}
        >
          <svg width={64} height={64} viewBox="0 0 64 64">
            <circle cx={32} cy={32} r={20} fill="#F5A623" />
            {Array.from({length: 8}, (_, k) => {
              const a = (k * Math.PI) / 4;
              return (
                <line
                  key={k}
                  x1={32 + 26 * Math.cos(a)}
                  y1={32 + 26 * Math.sin(a)}
                  x2={32 + 32 * Math.cos(a)}
                  y2={32 + 32 * Math.sin(a)}
                  stroke="#F5A623"
                  strokeWidth={4}
                  strokeLinecap="round"
                />
              );
            })}
          </svg>
          <div style={{marginLeft: 32}}>
            <div style={{color: '#F5A623', fontSize: 44, fontWeight: 800, letterSpacing: 2}}>IFTAR</div>
            <div style={{color: '#FFFFFF', fontSize: 32, fontWeight: 600, marginTop: 6, opacity: 0.85}}>
              at sunset
            </div>
          </div>
        </div>
        {/* footer */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 1380,
            textAlign: 'center',
            color: '#E8B84B',
            fontSize: 40,
            fontWeight: 700,
            letterSpacing: 2,
            opacity: footOp,
          }}
        >
          EID AL-FITR — 9 MAR 2027
        </div>
      </Grade>
      <GrainNoise opacity={0.05} seed={95} />
      <Vignette strength={0.16} rgb="10,4,26" />
    </AbsoluteFill>
  );
};
