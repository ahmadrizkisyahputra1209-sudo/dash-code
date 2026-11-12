import React from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {cyc, smoothstep} from './smooth.js';
import {Grade, GrainNoise, Vignette} from './postfx.jsx';

// 5. BREATHING PACER — medical breathing pacer.
// Palette 60% #0F2A43 deep navy / 30% #4ECDC4 soft teal / 10% #FFFFFF white.
// Circle scale there-and-back interpolate [0,120,180,300] -> [0.7,1.15,1.15,0.7]
// (inhale 0-4s, hold, exhale, return) so value(300) = value(0) = 0.7.
// Text "Breathe in" / "Breathe out" with mask reveal, max 2 words at a time.
// Ambient ring pulses +-3% (sine k=2). Frame 0: rings + circle visible.
export const BreathingPacer = () => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const p = frame / durationInFrames;

  const scale = interpolate(frame, [0, 120, 180, 300], [0.7, 1.15, 1.15, 0.7], {
    easing: Easing.bezier(0.65, 0, 0.35, 1),
  });
  const ringPulse = 1 + 0.03 * cyc(p, 2);

  // "Breathe in": fades in f0-10, holds, fades out f110-125.
  const inOp = smoothstep(frame / 10) * (1 - smoothstep((frame - 110) / 15));
  const inY = (1 - smoothstep(frame / 10)) * 24;
  // "Breathe out": fades in f180-190, holds, fades out f285-300.
  const outOp = smoothstep((frame - 180) / 10) * (1 - smoothstep((frame - 285) / 15));
  const outY = (1 - smoothstep((frame - 180) / 10)) * 24;

  const dots = [0, 1, 2, 3].map((i) => {
    const a = (p * 360 + i * 90) * (Math.PI / 180);
    return {x: 960 + Math.cos(a) * 300, y: 480 + Math.sin(a) * 300};
  });

  return (
    <AbsoluteFill style={{backgroundColor: '#0F2A43', overflow: 'hidden'}}>
      <Grade>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'radial-gradient(circle at 50% 45%, #14334F 0%, #0F2A43 55%, #0A1E33 100%)',
          }}
        />
        <svg width={1920} height={1080} style={{position: 'absolute'}}>
          {/* ambient pulsing ring */}
          <g transform={`translate(960 480) scale(${ringPulse.toFixed(3)}) translate(-960 -480)`}>
            <circle cx={960} cy={480} r={300} fill="none" stroke="#4ECDC4" strokeWidth={5} opacity={0.45} />
          </g>
          {/* outer faint ring */}
          <circle cx={960} cy={480} r={360} fill="none" stroke="#4ECDC4" strokeWidth={2} opacity={0.18} />
          {/* breathing circle (single light top-left: rim + shade) */}
          <g transform={`translate(960 480) scale(${scale.toFixed(3)}) translate(-960 -480)`}>
            <circle cx={960} cy={480} r={220} fill="#4ECDC4" opacity={0.28} />
            <circle cx={960} cy={480} r={200} fill="#4ECDC4" opacity={0.85} />
            <ellipse cx={890} cy={410} rx={70} ry={46} fill="#FFFFFF" opacity={0.22} />
          </g>
          {/* orbiting dots (one full turn per loop, seamless) */}
          {dots.map((d, i) => (
            <circle key={i} cx={d.x.toFixed(1)} cy={d.y.toFixed(1)} r={9} fill="#FFFFFF" opacity={0.85} />
          ))}
        </svg>
        {/* text with mask reveal */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 800,
            width: 1920,
            height: 120,
            overflow: 'hidden',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              fontFamily: 'sans-serif',
              fontSize: 84,
              fontWeight: 300,
              letterSpacing: 8,
              color: '#FFFFFF',
              opacity: inOp,
              transform: `translateY(${inY.toFixed(1)}px)`,
            }}
          >
            Breathe in
          </div>
        </div>
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 800,
            width: 1920,
            height: 120,
            overflow: 'hidden',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              fontFamily: 'sans-serif',
              fontSize: 84,
              fontWeight: 300,
              letterSpacing: 8,
              color: '#FFFFFF',
              opacity: outOp,
              transform: `translateY(${outY.toFixed(1)}px)`,
            }}
          >
            Breathe out
          </div>
        </div>
      </Grade>
      <GrainNoise opacity={0.05} seed={55} />
      <Vignette strength={0.16} rgb="6,18,30" />
    </AbsoluteFill>
  );
};
