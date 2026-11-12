import React, {useMemo} from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {cyc, mulberry32} from './smooth.js';
import {Grade, GrainNoise, Vignette} from './postfx.jsx';

// 3. CRESCENT MOON NIGHT (VERTICAL 1080x1920) — big crescent moon with glow,
// twinkling stars in 3 parallax layers drifting at different speeds, slow
// clouds, and a shooting star whose opacity envelope hides the wrap. All
// motion is periodic, so frame 0 = frame 299. Frame 0: full night scene.
const W = 1080;
const H = 1920;

export const CrescentMoonNight = () => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const p = frame / durationInFrames;

  const layers = useMemo(() => {
    const rand = mulberry32(9);
    return [0, 1, 2].map((layer) => ({
      speed: 0.02 + layer * 0.03,
      stars: Array.from({length: 26 + layer * 10}, () => ({
        x: rand() * W, y: rand() * (H - 300), r: 1 + layer * 0.9 + rand() * 1.6, phase: rand() * 6.28,
      })),
    }));
  }, []);

  const clouds = useMemo(() => {
    const rand = mulberry32(14);
    return Array.from({length: 4}, (_, i) => ({
      x: rand() * W, y: 300 + i * 330 + rand() * 120, w: 420 + rand() * 260, speed: 0.015 + rand() * 0.02,
    }));
  }, []);

  const moonBob = 12 * cyc(p, 1, 0);
  // Shooting star: two streaks offset by half a loop, opacity envelope
  // sin(pi*frac) is 0 at both ends so the wrap is invisible.
  const streaks = [0, 0.5].map((off) => {
    const frac = ((p * 1.5 + off) % 1);
    return {x: -160 + frac * (W + 420), y: 240 + frac * 420, op: Math.sin(Math.PI * frac)};
  });

  return (
    <AbsoluteFill style={{backgroundColor: '#0B1026', overflow: 'hidden'}}>
      <Grade>
        <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, #0B1026 0%, #1B2A52 48%, #3B2A5A 100%)'}} />
        {/* drifting clouds (back layer) */}
        {clouds.map((c, i) => (
          <div key={i} style={{position: 'absolute', left: ((c.x + p * W * c.speed * 8) % (W + 500)) - 250, top: c.y, width: c.w, height: 64, borderRadius: 32, background: 'rgba(180,190,255,0.10)', filter: 'blur(14px)'}} />
        ))}
        {/* parallax star layers */}
        {layers.map((layer, li) => (
          <React.Fragment key={li}>
            {layer.stars.map((st, i) => {
              const x = ((st.x + p * W * layer.speed * 10) % (W + 40)) - 20;
              return (
                <div key={i} style={{position: 'absolute', left: x, top: st.y, width: st.r * 2, height: st.r * 2, borderRadius: '50%', background: '#FFFFFF', opacity: 0.25 + 0.7 * Math.abs(cyc(p, 2, st.phase))}} />
              );
            })}
          </React.Fragment>
        ))}
        {/* shooting stars */}
        {streaks.map((s, i) => (
          <div key={i} style={{position: 'absolute', left: s.x, top: s.y, width: 180, height: 3, borderRadius: 2, background: 'linear-gradient(to right, rgba(255,255,255,0) 0%, rgba(255,255,255,0.9) 100%)', transform: 'rotate(24deg)', transformOrigin: 'left center', opacity: 0.85 * s.op}} />
        ))}
        {/* crescent moon */}
        <div style={{position: 'absolute', left: 540, top: 560 + moonBob, transform: 'translate(-50%, -50%)'}}>
          <div style={{width: 520, height: 520, borderRadius: '50%', background: 'rgba(246,232,200,0.16)', filter: 'blur(46px)', position: 'absolute', left: -60, top: -60}} />
          <svg width={400} height={400} viewBox="0 0 400 400">
            <defs>
              <mask id="moonCut">
                <rect width={400} height={400} fill="white" />
                <circle cx={248} cy={168} r={168} fill="black" />
              </mask>
            </defs>
            <circle cx={200} cy={200} r={170} fill="#F6E8C8" mask="url(#moonCut)" />
            <circle cx={200} cy={200} r={170} fill="none" stroke="#FFF8E1" strokeWidth={3} opacity={0.5} mask="url(#moonCut)" />
          </svg>
        </div>
        {/* foreground hill silhouette */}
        <svg width={W} height={H} style={{position: 'absolute'}}>
          <path d="M0,1740 Q300,1640 540,1700 T1080,1680 L1080,1920 L0,1920 Z" fill="#0A0E22" />
          <path d="M0,1830 Q360,1760 720,1810 T1080,1790 L1080,1920 L0,1920 Z" fill="#070A18" />
        </svg>
      </Grade>
      <GrainNoise opacity={0.06} seed={33} />
      <Vignette strength={0.2} rgb="6,8,30" />
    </AbsoluteFill>
  );
};
