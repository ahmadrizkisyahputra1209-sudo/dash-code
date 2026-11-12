import React, {useMemo} from 'react';
import {AbsoluteFill, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {cyc, mulberry32, starPoints, triWave} from './smooth.js';
import {Grade, GrainNoise, Vignette} from './postfx.jsx';

// 5. GOLD INGOTS RAIN (VERTICAL 1080x1920) — gold sycee ingots and coins
// raining on red for Chinese New Year. Falling pieces wrap off-screen
// (spawn above, despawn below) so the rain never pops. Three hero ingots
// bounce on an invisible floor with squash & stretch that conserves volume
// (scaleX = 1/scaleY), plus a looping spring bounce (triWave -> spring,
// damping 8). Frame 0: rain already falling, poster-ready.
const W = 1080;
const H = 1920;

function Sycee({x, y, s, rot, sqX, sqY}) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot.toFixed(1)}) scale(${sqX.toFixed(3)} ${sqY.toFixed(3)}) scale(${s})`}>
      <path d="M-62,22 Q-62,-28 0,-28 Q62,-28 62,22 Q34,48 0,48 Q-34,48 -62,22 Z" fill="#FF8F00" stroke="#E65100" strokeWidth={3} />
      <path d="M-62,22 Q-62,-28 0,-28 Q62,-28 62,22 Q34,48 0,48 Q-34,48 -62,22 Z" fill="url(#goldIngot)" opacity={0.85} />
      <ellipse cx={0} cy={-8} rx={34} ry={12} fill="#FFE082" opacity={0.9} />
      <ellipse cx={-24} cy={6} rx={10} ry={5} fill="#FFF8E1" opacity={0.7} />
    </g>
  );
}

function Coin({x, y, s, rot}) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot.toFixed(1)}) scale(${s})`}>
      <circle r={34} fill="#FF8F00" stroke="#E65100" strokeWidth={3} />
      <circle r={34} fill="url(#goldIngot)" opacity={0.8} />
      <circle r={24} fill="none" stroke="#FFE082" strokeWidth={3} />
      <polygon points={starPoints(0, 0, 12, 5, 4)} fill="#FFE082" />
    </g>
  );
}

export const GoldIngotsRain = () => {
  const frame = useCurrentFrame();
  const {durationInFrames, fps} = useVideoConfig();
  const p = frame / durationInFrames;

  const rain = useMemo(() => {
    const rand = mulberry32(27);
    return Array.from({length: 22}, (_, i) => ({
      x: 40 + rand() * (W - 80),
      y0: rand() * (H + 240),
      speed: 5 + rand() * 6,
      s: 0.55 + rand() * 0.6,
      phase: rand() * 6.28,
      coin: i % 3 === 0,
    }));
  }, []);

  const sparkles = useMemo(() => {
    const rand = mulberry32(28);
    return Array.from({length: 20}, () => ({
      x: rand() * W, y: rand() * H, s: 8 + rand() * 12, phase: rand() * 6.28,
    }));
  }, []);

  // 3 hero ingots bouncing on a floor at y=1650.
  const heroes = [0, 1, 2].map((k) => {
    const bounce = Math.abs(cyc(p, 2, k * 2.1));
    const springBounce = spring({frame: triWave(frame + k * 20, 60), fps, config: {damping: 8}});
    const sqY = 0.88 + 0.12 * Math.max(bounce, springBounce * 0.6);
    return {
      x: 240 + k * 300,
      y: 1650 - bounce * 520,
      sqY,
      sqX: 1 / sqY,
      rot: 6 * cyc(p, 2, k * 2.1),
    };
  });

  return (
    <AbsoluteFill style={{backgroundColor: '#8E0000', overflow: 'hidden'}}>
      <Grade>
        <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(circle at 50% 30%, #C62828 0%, #8E0000 60%, #5F0000 100%)'}} />
        {/* faint giant coins in the background */}
        {[0, 1, 2].map((i) => (
          <div key={i} style={{position: 'absolute', left: 120 + i * 330, top: 300 + i * 420, width: 300, height: 300, borderRadius: '50%', border: '10px solid rgba(255,213,79,0.10)'}} />
        ))}
        <svg width={W} height={H} style={{position: 'absolute'}}>
          <defs>
            <radialGradient id="goldIngot" cx="0.35" cy="0.3" r="0.9">
              <stop offset="0%" stopColor="#FFE082" />
              <stop offset="55%" stopColor="#FFC107" />
              <stop offset="100%" stopColor="#FF8F00" />
            </radialGradient>
          </defs>
          {rain.map((r, i) => {
            const y = ((r.y0 + frame * r.speed) % (H + 240)) - 120;
            return r.coin ? (
              <Coin key={i} x={r.x} y={y} s={r.s} rot={10 * cyc(p, 1, r.phase)} />
            ) : (
              <Sycee key={i} x={r.x} y={y} s={r.s} rot={10 * cyc(p, 1, r.phase)} sqX={1} sqY={1} />
            );
          })}
          {heroes.map((h, i) => (
            <Sycee key={`h${i}`} x={h.x} y={h.y} s={1.15} rot={h.rot} sqX={h.sqX} sqY={h.sqY} />
          ))}
          {sparkles.map((s, i) => (
            <polygon
              key={i}
              points={starPoints(s.x, s.y, s.s * (0.6 + 0.4 * cyc(p, 2, s.phase)), s.s * 0.3, 4)}
              fill="#FFE082"
              opacity={0.35 + 0.55 * Math.abs(cyc(p, 2, s.phase))}
            />
          ))}
        </svg>
        <div style={{position: 'absolute', left: 0, right: 0, bottom: 120, textAlign: 'center', fontFamily: 'sans-serif', fontSize: 64, fontWeight: 800, letterSpacing: 8, color: '#FFE082', textShadow: '0 4px 24px rgba(0,0,0,0.45)'}}>
          GONG XI FA CAI
        </div>
      </Grade>
      <GrainNoise opacity={0.06} seed={35} />
      <Vignette strength={0.2} rgb="60,0,0" />
    </AbsoluteFill>
  );
};
