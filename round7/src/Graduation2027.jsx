import React, {useMemo} from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {clamp01, env, fadeIn, fadeOutEnd, mulberry32, smoothstep} from './smooth.js';
import {GrainNoise, Grade, Vignette} from './postfx.jsx';

// 4. GRADUATION 2027 — kinetic type "Class of 2027", graduation cap tossing,
// confetti. Palette 60% #1B2A4A navy / 30% #E8B84B gold / 10% #FFFFFF white.
// Text EXACT: "Class of 2027". Kinetic type: max 2-3 words/sec, final line
// held 2s+ (visible f45-285, fade-out f285-300). Cap toss: one toss per loop
// via env(p) (0 -> 1 -> 0, seamless); tassel follows 2 frames later.
// Confetti falls with wrap modulo (uniform distribution — seamless, same
// pattern as round-4 clouds). Frame 0: bg + "Class of" already appearing.
const W = 1920;
const H = 1080;

export const Graduation2027 = () => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const p = frame / durationInFrames;

  // Kinetic type: "Class of" reveals f15-30, "2027" spring-pops at f45.
  const line1Op = fadeIn(frame - 15, 15) * fadeOutEnd(frame);
  const line1Y = interpolate(frame, [15, 30], [24, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const pop2027 = spring({
    frame: frame - 45,
    fps: 30,
    config: {damping: 30, stiffness: 300, mass: 1},
  });
  const line2Op = fadeIn(frame - 45, 10) * fadeOutEnd(frame);

  // Cap toss: rises and falls once per loop (env 0->1->0). Tassel lags 2f.
  const toss = env(p);
  const tossLag = env(((frame - 2) / durationInFrames + 1) % 1);
  const capY = 330 - 190 * toss;
  const capRot = 10 * toss;

  // Confetti: deterministic, falling with wrap modulo + integer-cycle spin.
  const confetti = useMemo(() => {
    const rand = mulberry32(74);
    return Array.from({length: 70}, (_, i) => ({
      x: rand() * W,
      startY: rand() * 1150,
      speed: 3 + rand() * 5,
      size: 8 + rand() * 10,
      rotK: 1 + Math.floor(rand() * 2),
      ph: rand() * Math.PI * 2,
      color: ['#E8B84B', '#FFFFFF', '#F5C542', '#C9A227'][i % 4],
    }));
  }, []);

  return (
    <AbsoluteFill style={{backgroundColor: '#1B2A4A', overflow: 'hidden'}}>
      <Grade>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(135deg, #1B2A4A 0%, #16223C 55%, #101A2E 100%)',
          }}
        />
        {/* confetti */}
        <svg width={W} height={H} style={{position: 'absolute'}}>
          {confetti.map((c, i) => {
            const y = (((c.startY + frame * c.speed) % 1150) + 1150) % 1150 - 35;
            const rot = p * 360 * c.rotK + (c.ph * 180) / Math.PI;
            return (
              <g
                key={i}
                transform={`translate(${c.x.toFixed(1)} ${y.toFixed(1)}) rotate(${rot.toFixed(1)})`}
                opacity={0.85}
              >
                <rect x={-c.size / 2} y={-c.size / 4} width={c.size} height={c.size / 2} rx={2} fill={c.color} />
              </g>
            );
          })}
        </svg>
        {/* graduation cap (tossing) */}
        <svg width={W} height={H} style={{position: 'absolute'}}>
          <g transform={`translate(1420 ${capY.toFixed(1)}) rotate(${capRot.toFixed(2)})`}>
            {/* contact shadow under cap */}
            <ellipse cx={0} cy={150} rx={110} ry={14} fill="#000000" opacity={0.3 * (1 - toss)} />
            {/* cap board (diamond) */}
            <polygon points="0,-70 120,0 0,70 -120,0" fill="#0F172A" stroke="#E8B84B" strokeWidth={4} />
            {/* head band */}
            <polygon points="-70,10 70,10 50,62 -50,62" fill="#1B2A4A" stroke="#E8B84B" strokeWidth={3} />
            {/* tassel (lags the cap by 2 frames) */}
            <g transform={`rotate(${(14 * tossLag).toFixed(2)} 100 -20)`}>
              <line x1={100} y1={-20} x2={128} y2={58} stroke="#E8B84B" strokeWidth={5} />
              <circle cx={128} cy={66} r={10} fill="#E8B84B" />
            </g>
          </g>
        </svg>
        {/* kinetic type */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 380,
            textAlign: 'center',
            color: '#FFFFFF',
            fontSize: 96,
            fontWeight: 600,
            letterSpacing: 8,
            opacity: line1Op,
            transform: `translateY(${line1Y.toFixed(1)}px)`,
          }}
        >
          Class of
        </div>
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 500,
            textAlign: 'center',
            color: '#E8B84B',
            fontSize: 210,
            fontWeight: 800,
            letterSpacing: 10,
            opacity: line2Op,
            transform: `scale(${clamp01(pop2027).toFixed(3)})`,
          }}
        >
          2027
        </div>
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 780,
            textAlign: 'center',
            color: '#FFFFFF',
            fontSize: 32,
            fontWeight: 500,
            letterSpacing: 6,
            opacity: fadeIn(frame - 60, 15) * fadeOutEnd(frame) * 0.85,
          }}
        >
          CONGRATULATIONS GRADUATES
        </div>
      </Grade>
      <GrainNoise opacity={0.05} seed={74} />
      <Vignette strength={0.16} rgb="8,14,28" />
    </AbsoluteFill>
  );
};
