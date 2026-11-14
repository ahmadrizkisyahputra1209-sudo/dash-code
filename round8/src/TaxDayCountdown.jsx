import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {clamp01, countProg, fadeIn, fadeOutEnd, uiSpring} from './smooth.js';
import {GrainNoise, Grade, Vignette} from './postfx.jsx';

// 7. TAX DAY COUNTDOWN — 1920x1080. Calendar flip / countdown: calendar
// pages turning to 15 April, Form 1040 card, countdown digits. Palette
// 60% #1B2A4A navy / 30% #FFFFFF white / 10% #C0392B red accent.
// Text EXACT per plan. Countdown digits are generic: days count 30 -> 0
// (f60-240), hold at 00, fade-out f285-300 — the fade makes the reset at
// the seam invisible. April 2027 grid is factual: 1 Apr 2027 is a Thursday,
// so 15 lands on Thursday. Frame 0: navy gradient + card shells visible.
const W = 1920;
const H = 1080;
// April 2027: 1st is Thursday (Sun-first grid). null = empty cell.
const CAL = [
  [null, null, null, null, 1, 2, 3],
  [4, 5, 6, 7, 8, 9, 10],
  [11, 12, 13, 14, 15, 16, 17],
  [18, 19, 20, 21, 22, 23, 24],
  [25, 26, 27, 28, 29, 30, null],
];

export const TaxDayCountdown = () => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();

  const titleOp = fadeIn(frame, 12) * fadeOutEnd(frame);
  const calOp = fadeIn(frame - 20, 12) * fadeOutEnd(frame);
  const formOp = fadeIn(frame - 35, 12) * fadeOutEnd(frame);
  const calScale = clamp01(uiSpring(frame, 20));
  const formScale = clamp01(uiSpring(frame, 35));
  const cdScale = clamp01(uiSpring(frame, 50));
  const cdOp = fadeIn(frame - 50, 12) * fadeOutEnd(frame);

  // Generic countdown: 30 -> 0 days, then hold at 00, fade out at the end.
  const days = Math.max(0, 30 - Math.round(30 * countProg(frame, 60, 240)));
  const daysStr = String(days).padStart(2, '0');

  return (
    <AbsoluteFill style={{backgroundColor: '#1B2A4A', overflow: 'hidden'}}>
      <Grade>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(135deg, #1B2A4A 0%, #16223C 55%, #101B33 100%)',
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
            color: '#FFFFFF',
            fontSize: 64,
            fontWeight: 800,
            letterSpacing: 8,
            opacity: titleOp,
          }}
        >
          TAX DAY 2027
        </div>
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 148,
            textAlign: 'center',
            color: '#FFFFFF',
            fontSize: 44,
            fontWeight: 700,
            opacity: titleOp,
          }}
        >
          15 APRIL 2027
        </div>
        <div
          style={{
            position: 'absolute',
            left: 860,
            top: 208,
            width: 200,
            height: 6,
            borderRadius: 3,
            background: '#C0392B',
            opacity: titleOp,
          }}
        />
        {/* calendar card */}
        <div
          style={{
            position: 'absolute',
            left: 140,
            top: 260,
            width: 760,
            height: 560,
            borderRadius: 28,
            background: '#FFFFFF',
            boxShadow: '0 18px 40px rgba(0,0,0,0.35)',
            padding: '28px 36px',
            transform: `scale(${calScale.toFixed(3)})`,
            opacity: calOp,
          }}
        >
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'baseline'}}>
            <div style={{color: '#1B2A4A', fontSize: 40, fontWeight: 800}}>APRIL</div>
            <div style={{color: '#1B2A4A', fontSize: 30, fontWeight: 600, opacity: 0.6}}>2027</div>
          </div>
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 8, marginTop: 20}}>
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
              <div key={i} style={{height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#C0392B', fontSize: 22, fontWeight: 700}}>
                {d}
              </div>
            ))}
            {CAL.flat().map((d, i) => {
              const cellOp = d === null ? 0 : fadeIn(frame - (30 + i * 1), 8);
              if (d === null) {
                return <div key={i} style={{height: 68}} />;
              }
              const is15 = d === 15;
              return (
                <div
                  key={i}
                  style={{
                    height: 68,
                    borderRadius: '50%',
                    background: is15 ? '#C0392B' : 'transparent',
                    color: is15 ? '#FFFFFF' : '#1B2A4A',
                    fontSize: 30,
                    fontWeight: is15 ? 800 : 600,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    opacity: cellOp * fadeOutEnd(frame),
                  }}
                >
                  {d}
                </div>
              );
            })}
          </div>
        </div>
        {/* Form 1040 card */}
        <div
          style={{
            position: 'absolute',
            left: 1020,
            top: 260,
            width: 760,
            height: 340,
            borderRadius: 28,
            background: '#FFFFFF',
            boxShadow: '0 18px 40px rgba(0,0,0,0.35)',
            padding: '30px 40px',
            transform: `scale(${formScale.toFixed(3)})`,
            opacity: formOp,
          }}
        >
          <div style={{color: '#1B2A4A', fontSize: 36, fontWeight: 700}}>
            Form 1040 • 2026 returns
          </div>
          {[0, 1, 2].map((r) => (
            <div key={r} style={{display: 'flex', alignItems: 'center', marginTop: 30, opacity: fadeIn(frame - (60 + r * 4), 10)}}>
              <div
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: 6,
                  border: '3px solid #1B2A4A',
                  marginRight: 20,
                  background: r < 2 ? '#1B2A4A' : 'transparent',
                }}
              />
              <div style={{flex: 1, height: 14, borderRadius: 7, background: 'rgba(27,42,74,0.22)'}} />
              <div style={{width: 100, height: 14, borderRadius: 7, background: 'rgba(27,42,74,0.14)', marginLeft: 20}} />
            </div>
          ))}
        </div>
        {/* countdown card */}
        <div
          style={{
            position: 'absolute',
            left: 1020,
            top: 640,
            width: 760,
            height: 180,
            borderRadius: 28,
            background: 'rgba(255,255,255,0.08)',
            border: '2px solid rgba(255,255,255,0.25)',
            display: 'flex',
            alignItems: 'center',
            padding: '0 44px',
            transform: `scale(${cdScale.toFixed(3)})`,
            opacity: cdOp,
          }}
        >
          <div style={{color: '#FFFFFF', fontSize: 28, fontWeight: 600, letterSpacing: 4, opacity: 0.8}}>
            DAYS LEFT
          </div>
          <div style={{marginLeft: 'auto', color: '#FFFFFF', fontSize: 96, fontWeight: 800}}>
            {daysStr}
          </div>
        </div>
      </Grade>
      <GrainNoise opacity={0.05} seed={87} />
      <Vignette strength={0.16} rgb="8,14,28" />
    </AbsoluteFill>
  );
};
