import React, {useMemo} from 'react';
import {AbsoluteFill, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {cyc, mulberry32, starPoints, triWave} from './smooth.js';
import {Grade, GrainNoise, Vignette} from './postfx.jsx';

// 1. GIRIH GEOMETRIC STAR — eight-pointed Islamic star pattern, gold on
// deep teal. Central star rotates one full turn per loop (seamless), inner
// star counter-rotates and morphs, 8 orbiting sparkles, outer diamond ring
// pulsing. Breathing scale via a looping spring (triWave -> spring,
// damping 200 = smooth, no bounce). Frame 0: full pattern, poster-ready.
export const GirihGeometricStar = () => {
  const frame = useCurrentFrame();
  const {durationInFrames, fps} = useVideoConfig();
  const p = frame / durationInFrames;

  const breathe = 1 + 0.012 * spring({frame: triWave(frame, 150), fps, config: {damping: 200}});
  const morph = 0.62 + 0.07 * cyc(p, 1, 0);

  const orbiters = useMemo(() => {
    const rand = mulberry32(21);
    return Array.from({length: 8}, (_, i) => ({
      phase: rand() * 6.28,
      size: 14 + rand() * 14,
    }));
  }, []);

  const ring = useMemo(() => Array.from({length: 16}, (_, i) => i), []);

  return (
    <AbsoluteFill style={{backgroundColor: '#0B3D3A', overflow: 'hidden'}}>
      <Grade>
        <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(circle at 50% 46%, #14655E 0%, #0B3D3A 55%, #072825 100%)'}} />
        <div style={{position: 'absolute', left: 660, top: 240, width: 600, height: 600, borderRadius: '50%', background: 'rgba(212,175,55,0.10)', filter: 'blur(70px)'}} />
        <svg width={1920} height={1080} style={{position: 'absolute'}}>
          <defs>
            <linearGradient id="goldGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#F5D67A" />
              <stop offset="50%" stopColor="#D4AF37" />
              <stop offset="100%" stopColor="#9C7C1E" />
            </linearGradient>
          </defs>
          {/* outer diamond ring */}
          {ring.map((i) => {
            const ang = (i / 16) * Math.PI * 2;
            const x = 960 + 640 * Math.cos(ang);
            const y = 540 + 400 * Math.sin(ang);
            const op = 0.25 + 0.25 * cyc(p, 2, i * 0.8);
            return (
              <g key={i} transform={`translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${(i * 22.5).toFixed(1)})`} opacity={op}>
                <rect x={-14} y={-14} width={28} height={28} fill="none" stroke="#D4AF37" strokeWidth={2.5} />
                <rect x={-5} y={-5} width={10} height={10} fill="#D4AF37" />
              </g>
            );
          })}
          {/* central motif */}
          <g transform={`translate(960 540) scale(${breathe.toFixed(4)})`}>
            <g transform={`rotate(${(360 * p).toFixed(2)})`}>
              <polygon points={starPoints(0, 0, 300, 300 * morph, 8)} fill="url(#goldGrad)" stroke="#8C6D1F" strokeWidth={3} />
              <polygon points={starPoints(0, 0, 210, 210 * morph, 8)} fill="#0B3D3A" stroke="#D4AF37" strokeWidth={2} />
            </g>
            <g transform={`rotate(${(-360 * p).toFixed(2)})`}>
              <polygon points={starPoints(0, 0, 150, 92, 8)} fill="#14655E" stroke="#F5D67A" strokeWidth={2.5} />
              <circle cx={0} cy={0} r={34} fill="#D4AF37" />
              <circle cx={0} cy={0} r={20} fill="#0B3D3A" />
            </g>
            {/* orbiting sparkles */}
            {orbiters.map((o, i) => {
              const ang = (i / 8) * Math.PI * 2 + 2 * Math.PI * p;
              const x = 480 * Math.cos(ang);
              const y = 480 * Math.sin(ang);
              const s = o.size * (0.75 + 0.35 * cyc(p, 1, o.phase));
              return (
                <polygon
                  key={i}
                  points={starPoints(x, y, s, s * 0.45, 4)}
                  fill="#F5D67A"
                  opacity={0.55 + 0.4 * cyc(p, 2, o.phase)}
                />
              );
            })}
          </g>
        </svg>
      </Grade>
      <GrainNoise opacity={0.06} seed={31} />
      <Vignette strength={0.2} rgb="4,32,28" />
    </AbsoluteFill>
  );
};
