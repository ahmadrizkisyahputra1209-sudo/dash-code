import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {Trail} from '@remotion/motion-blur';
import {clamp01, cyc, easeMove, fadeIn, fadeOutEnd, revealScale, uiSpring} from './smooth.js';
import {GrainNoise, Grade, Vignette} from './postfx.jsx';

// 4. TOTAL SOLAR ECLIPSE 2027 — 1920x1080. Moon disc sweeps across the
// sun (Trail), corona glows at totality, schematic totality-path strip
// below (Spain → Morocco → Egypt, Luxor pulsing). Palette 60% #0B1F3A
// deep navy / 30% #F5A623 amber (corona) / 10% #FFFFFF white.
// Text EXACT: "TOTAL SOLAR ECLIPSE" · "2 AUGUST 2027" ·
// "LUXOR — 6 MIN 20 SEC" · "LONGEST UNTIL 2114".
// Luxor ~6 min 20 sec, longest until 2114 (NASA). Frame 0: gradient +
// sun + path strip visible.
const W = 1920;
const H = 1080;

export const SolarEclipse2027 = () => {
  const frame = useCurrentFrame();
  const p = frame / 300;
  const fade = fadeOutEnd(frame);

  const moonX = interpolate(frame, [60, 210], [220, 1020], {
    easing: easeMove,
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const moonOp = fadeIn(frame - 60, 12) * fade;
  const totality = clamp01(1 - Math.abs(moonX - 620) / 240);
  const coronaOp = (0.15 + 0.85 * totality) * fade;
  const rayRotate = 6 * cyc(p, 1);
  const stripX = interpolate(frame, [60, 210], [150, 1770], {
    easing: easeMove,
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const luxorPulse = 1 + 0.28 * cyc(p, 2);

  const rays = Array.from({length: 12}, (_, i) => {
    const ang = (i * Math.PI) / 6;
    const x1 = 620 + 215 * Math.cos(ang);
    const y1 = 460 + 215 * Math.sin(ang);
    const x2 = 620 + 300 * Math.cos(ang);
    const y2 = 460 + 300 * Math.sin(ang);
    const x3 = 620 + 232 * Math.cos(ang + 0.09);
    const y3 = 460 + 232 * Math.sin(ang + 0.09);
    return `${x1.toFixed(1)},${y1.toFixed(1)} ${x2.toFixed(1)},${y2.toFixed(1)} ${x3.toFixed(1)},${y3.toFixed(1)}`;
  });

  return (
    <AbsoluteFill style={{backgroundColor: '#0B1F3A', overflow: 'hidden'}}>
      <Grade>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(180deg, #0B1F3A 0%, #0A1A30 55%, #060F1D 100%)',
          }}
        />
        {/* faint star dots, visible from f0 */}
        <svg width={W} height={H} style={{position: 'absolute'}}>
          {Array.from({length: 30}, (_, i) => (
            <circle key={i} cx={120 + ((i * 317) % 1700)} cy={80 + ((i * 211) % 700)} r={3} fill="#FFFFFF" opacity={0.18} />
          ))}
        </svg>
        {/* corona rays + glow */}
        <svg
          width={W}
          height={H}
          style={{position: 'absolute', rotate: `${rayRotate.toFixed(2)}deg`, opacity: coronaOp}}
        >
          {rays.map((pts, i) => (
            <polygon key={i} points={pts} fill="#F5A623" />
          ))}
          <circle cx={620} cy={460} r={310} fill="#F5A623" opacity={0.16} />
        </svg>
        {/* sun disc */}
        <div
          style={{
            position: 'absolute',
            left: 620 - 200,
            top: 460 - 200,
            width: 400,
            height: 400,
            borderRadius: '50%',
            background: 'radial-gradient(circle at 40% 35%, #FFE9A8 0%, #F5A623 60%, #D98A12 100%)',
            boxShadow: '0 0 120px rgba(245,166,35,0.55)',
            opacity: fade,
          }}
        />
        {/* moon disc sweeping across (fast element — Trail) */}
        <div
          style={{
            position: 'absolute',
            left: moonX - 200,
            top: 460 - 200,
            opacity: moonOp,
          }}
        >
          <Trail layers={6} lagInFrames={1} trailOpacity={0.5}>
            <div
              style={{
                width: 400,
                height: 400,
                borderRadius: '50%',
                background: 'radial-gradient(circle at 38% 32%, #2A3547 0%, #0B1220 70%)',
                boxShadow: '0 0 60px rgba(0,0,0,0.6)',
              }}
            />
          </Trail>
        </div>
        {/* header */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 80,
            width: W,
            textAlign: 'center',
            color: '#FFFFFF',
            fontSize: 92,
            fontWeight: 900,
            letterSpacing: 4,
            scale: revealScale(frame, 10, 18),
            opacity: fadeIn(frame - 10, 12) * fade,
          }}
        >
          TOTAL SOLAR ECLIPSE
        </div>
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 200,
            width: W,
            textAlign: 'center',
            color: '#F5A623',
            fontSize: 64,
            fontWeight: 800,
            letterSpacing: 6,
            scale: clamp01(uiSpring(frame, 22)),
            opacity: fadeIn(frame - 22, 12) * fade,
          }}
        >
          2 AUGUST 2027
        </div>
        {/* Luxor duration card */}
        <div
          style={{
            position: 'absolute',
            left: 1250,
            top: 90,
            width: 590,
            height: 110,
            borderRadius: 24,
            background: '#F5A623',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#0B1F3A',
            fontSize: 44,
            fontWeight: 800,
            letterSpacing: 1,
            boxShadow: '0 18px 40px rgba(0,0,0,0.35)',
            scale: clamp01(uiSpring(frame, 150)),
            opacity: fadeIn(frame - 150, 12) * fade,
          }}
        >
          LUXOR — 6 MIN 20 SEC
        </div>
        {/* totality path strip */}
        <svg width={W} height={H} style={{position: 'absolute', opacity: fade}}>
          <line x1={150} y1={860} x2={1770} y2={860} stroke="#FFFFFF" strokeWidth={4} strokeDasharray="14 12" opacity={0.35} />
          <circle cx={350} cy={860} r={12} fill="#FFFFFF" />
          <circle cx={800} cy={860} r={12} fill="#FFFFFF" />
          <circle cx={1500} cy={860} r={22 * luxorPulse} fill="#F5A623" stroke="#FFFFFF" strokeWidth={4} />
          <circle cx={stripX} cy={860} r={16} fill="#0B1220" stroke="#F5A623" strokeWidth={4} opacity={moonOp} />
        </svg>
        <div
          style={{
            position: 'absolute',
            left: 80,
            top: 950,
            color: '#FFFFFF',
            fontSize: 48,
            fontWeight: 800,
            letterSpacing: 3,
            scale: clamp01(uiSpring(frame, 165)),
            opacity: fadeIn(frame - 165, 12) * fade,
          }}
        >
          LONGEST UNTIL 2114
        </div>
      </Grade>
      <GrainNoise opacity={0.05} seed={104} />
      <Vignette strength={0.18} rgb="4,10,20" />
    </AbsoluteFill>
  );
};
