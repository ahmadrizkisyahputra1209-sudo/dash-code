import React, {useMemo} from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {evolvePath} from '@remotion/paths';
import {cyc, fadeIn, fadeOutEnd, mulberry32, smoothstep} from './smooth.js';
import {Grade, GrainNoise, Vignette} from './postfx.jsx';

// 3. VALENTINE WAX SEAL — cream envelope, heart wax seal stamping.
// Palette 60% #F5EFE6 cream / 30% #A4133C deep rose / 10% #C9A227 gold.
// Beats: envelope slides in (move 350ms) -> seal stamps (anticipation dip
// 60-120ms at scale 0.95, then squash & stretch volume-preserving) -> heart
// glow fades in -> ribbon draws (evolvePath) -> settle -> fade out f285-300.
// Frame 0: cream background + envelope already faintly visible (not empty).
const HEART_D =
  'M50,88 C50,88 10,60 10,30 C10,15 22,5 35,5 C43,5 50,12 50,20 C50,12 57,5 65,5 C78,5 90,15 90,30 C90,60 50,88 50,88 Z';
const RIBBON_D = 'M510,820 L1410,260';

export const ValentineWaxSeal = () => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const p = frame / durationInFrames;

  const dots = useMemo(() => {
    const rand = mulberry32(33);
    return Array.from({length: 60}, () => ({
      x: rand() * 1920,
      y: rand() * 1080,
      r: 2 + rand() * 4,
    }));
  }, []);

  // Envelope: slides in f12-24 (move easing), fades in f0-12, out f285-300.
  const envY = interpolate(frame, [12, 24], [80, 0], {
    easing: Easing.bezier(0.65, 0, 0.35, 1),
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const envOp = fadeIn(frame, 12) * fadeOutEnd(frame);

  // Seal stamp: invisible until f55, anticipation dip (0.95) f55-58,
  // squash on impact (0.82) f64, overshoot 1.06 f72, settle 1.0 f85.
  // scaleX = 1/scaleY keeps volume (squash & stretch).
  const sealY = interpolate(
    frame,
    [0, 55, 58, 64, 72, 85, 300],
    [0, 0, 0.95, 0.82, 1.06, 1, 1],
    {
      easing: Easing.bezier(0.4, 0, 0.2, 1),
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    },
  );
  const sealX = sealY > 0 ? 1 / sealY : 0;
  const sealOp = smoothstep((frame - 55) / 5) * fadeOutEnd(frame);

  // Heart glow: fades in f75-100, breathes +-3% (sine k=2), out f285-300.
  const glowOp =
    smoothstep((frame - 75) / 25) * (0.45 + 0.03 * cyc(p, 2)) * fadeOutEnd(frame);

  // Ribbon: draws f90-150, holds, erases f240-300 (there-and-back).
  const ribbonProg =
    p < 0.3
      ? 0
      : p < 0.5
        ? smoothstep((p - 0.3) / 0.2)
        : p < 0.8
          ? 1
          : 1 - smoothstep((p - 0.8) / 0.2);
  const ribbonEvolve = evolvePath(ribbonProg, RIBBON_D);

  return (
    <AbsoluteFill style={{backgroundColor: '#F5EFE6', overflow: 'hidden'}}>
      <Grade>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(135deg, #FBF7EF 0%, #F5EFE6 55%, #EDE3D3 100%)',
          }}
        />
        <svg width={1920} height={1080} style={{position: 'absolute'}}>
          {/* faint dot pattern */}
          {dots.map((d, i) => (
            <circle key={i} cx={d.x} cy={d.y} r={d.r} fill="#A4133C" opacity={0.07} />
          ))}
          {/* envelope */}
          <g transform={`translate(0 ${envY.toFixed(1)})`} opacity={envOp}>
            {/* contact shadow */}
            <ellipse cx={960} cy={856} rx={470} ry={22} fill="#000000" opacity={0.14} />
            <rect x={510} y={260} width={900} height={560} rx={12} fill="#FFFDF8" stroke="#E5D9C5" strokeWidth={2} />
            {/* flap */}
            <polygon points="510,260 1410,260 960,560" fill="#EDE3D3" />
            <polygon points="510,260 1410,260 960,560" fill="none" stroke="#D9C9AE" strokeWidth={2} />
            {/* ribbon (drawn on top of the envelope) */}
            <path
              d={RIBBON_D}
              fill="none"
              stroke="#C9A227"
              strokeWidth={8}
              strokeDasharray={ribbonEvolve.strokeDasharray}
              strokeDashoffset={ribbonEvolve.strokeDashoffset}
            />
            {/* heart glow behind the seal */}
            <ellipse cx={960} cy={545} rx={190} ry={150} fill="#C9A227" opacity={glowOp} />
            {/* wax seal: heart with gold ring, squash & stretch */}
            <g
              transform={`translate(960 545) scale(${(sealX * 1.6).toFixed(3)} ${(sealY * 1.6).toFixed(3)}) translate(-50 -46)`}
              opacity={sealOp}
            >
              <circle cx={50} cy={46} r={62} fill="none" stroke="#C9A227" strokeWidth={4} />
              <path d={HEART_D} fill="#A4133C" stroke="#7A0E2C" strokeWidth={4} strokeLinejoin="round" />
              <path
                d="M50,72 C50,72 26,54 26,36 C26,27 33,21 40,21 C45,21 50,26 50,31 C50,26 55,21 60,21 C67,21 74,27 74,36 C74,54 50,72 50,72 Z"
                fill="#C1274F"
              />
            </g>
          </g>
        </svg>
      </Grade>
      <GrainNoise opacity={0.05} seed={33} />
      <Vignette strength={0.1} rgb="120,90,60" />
    </AbsoluteFill>
  );
};
