import React, {useMemo} from 'react';
import {AbsoluteFill, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {cyc, mulberry32, triWave} from './smooth.js';
import {Grade, GrainNoise, Vignette} from './postfx.jsx';

// 6. PLUM BLOSSOM BLOOM — a plum branch swaying gently, blossoms breathing
// open (spring pop, staggered, looping via triWave), petals falling with
// wrap-around and flutter; petal rotation lags the fall = secondary motion.
// All motion periodic, frame 0 = frame 299. Frame 0: branch in full bloom.
function Blossom({x, y, s, phase, frame, fps}) {
  const pop = 0.95 + 0.05 * spring({frame: triWave(frame, 150), fps, config: {damping: 10}});
  const breathe = 0.91 + 0.09 * Math.sin(2 * Math.PI * (frame / 300) + phase);
  const scale = s * pop * breathe;
  return (
    <g transform={`translate(${x} ${y}) scale(${scale.toFixed(3)})`}>
      {[0, 72, 144, 216, 288].map((a) => (
        <ellipse key={a} cx={0} cy={-26} rx={15} ry={26} fill="#F8BBD0" stroke="#EC407A" strokeWidth={1.5} transform={`rotate(${a})`} />
      ))}
      <circle r={10} fill="#FFD54F" />
      {[0, 60, 120, 180, 240, 300].map((a) => (
        <circle key={a} cx={13 * Math.cos((a * Math.PI) / 180)} cy={13 * Math.sin((a * Math.PI) / 180)} r={2.5} fill="#FF8F00" />
      ))}
    </g>
  );
}

export const PlumBlossomBloom = () => {
  const frame = useCurrentFrame();
  const {durationInFrames, fps} = useVideoConfig();
  const p = frame / durationInFrames;

  const blossoms = useMemo(() => {
    const rand = mulberry32(41);
    return Array.from({length: 10}, (_, i) => ({
      x: 220 + i * 155 + rand() * 40,
      y: 430 - Math.sin((i / 9) * Math.PI) * 190 + (rand() - 0.5) * 70,
      s: 0.9 + rand() * 0.7,
      phase: rand() * 6.28,
    }));
  }, []);

  const petals = useMemo(() => {
    const rand = mulberry32(42);
    return Array.from({length: 16}, () => ({
      x: rand() * 1920,
      y0: rand() * 1080,
      speed: 1.6 + rand() * 2.2,
      s: 0.7 + rand() * 0.7,
      phase: rand() * 6.28,
      drift: 20 + rand() * 45,
    }));
  }, []);

  const bokeh = useMemo(() => {
    const rand = mulberry32(43);
    return Array.from({length: 7}, () => ({
      x: rand() * 1920, y: rand() * 1080, r: 60 + rand() * 130, phase: rand() * 6.28,
    }));
  }, []);

  const sway = 0.8 * cyc(p, 1, 0);

  return (
    <AbsoluteFill style={{backgroundColor: '#FCE4EC', overflow: 'hidden'}}>
      <Grade>
        <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, #FFF5F7 0%, #FCE4EC 55%, #F8BBD0 100%)'}} />
        {bokeh.map((b, i) => (
          <div key={i} style={{position: 'absolute', left: b.x + 40 * cyc(p, 1, b.phase), top: b.y, width: b.r, height: b.r, borderRadius: '50%', background: 'rgba(255,255,255,0.35)', filter: 'blur(24px)'}} />
        ))}
        <svg width={1920} height={1080} style={{position: 'absolute'}}>
          {/* branch */}
          <g transform={`rotate(${sway.toFixed(2)} 120 620)`}>
            <path d="M60,700 Q500,560 960,470 T1880,330" fill="none" stroke="#4E342E" strokeWidth={22} strokeLinecap="round" />
            <path d="M420,620 Q700,520 900,470" fill="none" stroke="#5D4037" strokeWidth={12} strokeLinecap="round" />
            <path d="M1100,450 Q1400,400 1620,370" fill="none" stroke="#5D4037" strokeWidth={12} strokeLinecap="round" />
            {blossoms.map((b, i) => (
              <Blossom key={i} {...b} frame={frame} fps={fps} />
            ))}
          </g>
          {/* falling petals: wrap off-screen, flutter lags the fall */}
          {petals.map((pt, i) => {
            const y = ((pt.y0 + frame * pt.speed) % 1200) - 60;
            const x = pt.x + pt.drift * cyc(p, 1, pt.phase);
            const rot = 25 * cyc(p, 3, pt.phase + 1.1);
            return (
              <ellipse
                key={i}
                cx={x}
                cy={y}
                rx={13 * pt.s}
                ry={8 * pt.s}
                fill="#F48FB1"
                opacity={0.9}
                transform={`rotate(${rot.toFixed(1)} ${x.toFixed(1)} ${y.toFixed(1)})`}
              />
            );
          })}
        </svg>
      </Grade>
      <GrainNoise opacity={0.05} seed={36} />
      <Vignette strength={0.14} rgb="120,60,80" />
    </AbsoluteFill>
  );
};
