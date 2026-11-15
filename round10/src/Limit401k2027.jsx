import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {clamp01, countProg, fadeIn, fadeOutEnd, revealScale, uiSpring} from './smooth.js';
import {GrainNoise, Grade, Vignette} from './postfx.jsx';

// 9. 401(k) LIMIT 2027 — 1920x1080. $25,500 count-up once (f60-150),
// hold, fade-out f285-300 (never reversed); 2026 vs 2027 bars.
// Palette 60% #1B2A4A navy / 30% #2E7D32 money green / 10% #FFFFFF
// white. Text EXACT: "401(k) 2027" · "$25,500" · "UP FROM $24,500" ·
// "IRA $7,500 UNCHANGED". Source: IRS IR-2026-136, 12 Nov 2026.
// Frame 0: gradient + bar shells visible.
const W = 1920;
const H = 1080;

export const Limit401k2027 = () => {
  const frame = useCurrentFrame();
  const fade = fadeOutEnd(frame);

  const prog = countProg(frame, 60, 150);
  const val = Math.round(25500 * prog).toLocaleString('en-US');
  const bar2026 = 320 * clamp01(uiSpring(frame, 90));
  const bar2027 = 333 * clamp01(uiSpring(frame, 120));

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
        {/* faint grid dots, visible from f0 */}
        <svg width={W} height={H} style={{position: 'absolute'}}>
          {Array.from({length: 24}, (_, i) => (
            <circle key={i} cx={90 + (i % 8) * 240} cy={70 + Math.floor(i / 8) * 340} r={4} fill="#2E7D32" opacity={0.14} />
          ))}
        </svg>
        {/* header */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 70,
            width: W,
            textAlign: 'center',
            color: '#FFFFFF',
            fontSize: 100,
            fontWeight: 900,
            letterSpacing: 4,
            scale: revealScale(frame, 10, 18),
            opacity: fadeIn(frame - 10, 12) * fade,
          }}
        >
          401(k) 2027
        </div>
        {/* big count-up */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 200,
            width: W,
            textAlign: 'center',
            color: '#2E7D32',
            fontSize: 220,
            fontWeight: 900,
            letterSpacing: 2,
            scale: revealScale(frame, 45, 20),
            opacity: fadeIn(frame - 45, 12) * fade,
            textShadow: '0 8px 0 rgba(255,255,255,0.9)',
          }}
        >
          ${val}
        </div>
        {/* bars: 2026 vs 2027 */}
        <div
          style={{
            position: 'absolute',
            left: 480,
            top: 900 - bar2026,
            width: 380,
            height: bar2026,
            borderRadius: '20px 20px 0 0',
            background: '#5A6B7C',
            opacity: fadeIn(frame - 90, 12) * fade,
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: 1060,
            top: 900 - bar2027,
            width: 380,
            height: bar2027,
            borderRadius: '20px 20px 0 0',
            background: '#2E7D32',
            opacity: fadeIn(frame - 120, 12) * fade,
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: 480,
            top: 920,
            width: 380,
            textAlign: 'center',
            color: '#FFFFFF',
            fontSize: 44,
            fontWeight: 800,
            opacity: fadeIn(frame - 110, 12) * fade,
          }}
        >
          2026 — $24,500
        </div>
        <div
          style={{
            position: 'absolute',
            left: 1060,
            top: 920,
            width: 380,
            textAlign: 'center',
            color: '#FFFFFF',
            fontSize: 44,
            fontWeight: 800,
            opacity: fadeIn(frame - 140, 12) * fade,
          }}
        >
          2027 — $25,500
        </div>
        {/* chips */}
        <div
          style={{
            position: 'absolute',
            left: 240,
            top: 560,
            width: 560,
            height: 100,
            borderRadius: 50,
            background: '#E8B84B',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#1B2A4A',
            fontSize: 44,
            fontWeight: 800,
            scale: clamp01(uiSpring(frame, 160)),
            opacity: fadeIn(frame - 160, 12) * fade,
          }}
        >
          UP FROM $24,500
        </div>
        <div
          style={{
            position: 'absolute',
            left: 1120,
            top: 560,
            width: 560,
            height: 100,
            borderRadius: 50,
            background: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#1B2A4A',
            fontSize: 44,
            fontWeight: 800,
            scale: clamp01(uiSpring(frame, 175)),
            opacity: fadeIn(frame - 175, 12) * fade,
          }}
        >
          IRA $7,500 UNCHANGED
        </div>
      </Grade>
      <GrainNoise opacity={0.05} seed={109} />
      <Vignette strength={0.16} rgb="8,14,28" />
    </AbsoluteFill>
  );
};
