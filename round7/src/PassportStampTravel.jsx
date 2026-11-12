import React, {useMemo} from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {clamp01, fadeIn, fadeOutEnd, mulberry32, smoothstep, triWave} from './smooth.js';
import {GrainNoise, Grade, Vignette} from './postfx.jsx';

// 5. PASSPORT STAMP TRAVEL — passport pages flipping, travel stamps appearing.
// Palette 60% #F5EFE6 cream / 30% #1B3A5C navy / 10% #C0392B stamp red.
// Stamps (place names only, no brands): PARIS / TOKYO / BALI, pop staggered
// 60ms apart (Premium, no overshoot). Page flip: 2D scaleX there-and-back
// (triWave period 150 -> 2 flips per loop, seamless). Plane flies across
// the top LINEAR, off-screen at both ends so the seam is invisible.
// Frame 0: passport + bg already visible (not empty).
const W = 1920;
const H = 1080;

export const PassportStampTravel = () => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const p = frame / durationInFrames;

  // Page flip: scaleX 1 -> 0.15 -> 1, twice per loop (triWave period 150).
  const flip = triWave(frame, 150) / 75; // 0..1..0, twice per loop
  const pageScaleX = 1 - 0.85 * flip;

  // Plane: flies left -> right LINEAR, y bobs on a sine cycle (seamless).
  const planeX = -120 + p * (W + 240);
  const planeY = 170 + 40 * Math.sin(2 * Math.PI * p);

  const stamps = [
    {text: 'PARIS', x: 560, y: 560, rot: -8, startF: 90},
    {text: 'TOKYO', x: 1080, y: 640, rot: 5, startF: 92},
    {text: 'BALI', x: 1330, y: 480, rot: -4, startF: 94},
  ];
  const stampSprings = stamps.map((s) =>
    spring({
      frame: frame - s.startF,
      fps: 30,
      config: {damping: 30, stiffness: 300, mass: 1},
    }),
  );

  // Background travel dots drifting on a circle (seamless).
  const driftX = Math.cos(2 * Math.PI * p) * 8;
  const driftY = Math.sin(2 * Math.PI * p) * 8;

  return (
    <AbsoluteFill style={{backgroundColor: '#F5EFE6', overflow: 'hidden'}}>
      <Grade cssOnly>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(135deg, #F5EFE6 0%, #EFE7D8 55%, #E5DCC8 100%)',
          }}
        />
        <svg width={W} height={H} style={{position: 'absolute'}}>
          <g transform={`translate(${driftX.toFixed(1)} ${driftY.toFixed(1)})`}>
            {Array.from({length: 18}, (_, i) => {
              const rand = mulberry32(75 + i);
              return (
                <circle key={i} cx={rand() * W} cy={rand() * H} r={3} fill="#1B3A5C" opacity={0.1} />
              );
            })}
          </g>
          {/* plane flying across the top */}
          <g transform={`translate(${planeX.toFixed(1)} ${planeY.toFixed(1)})`}>
            <polygon points="0,0 46,10 0,20 8,10" fill="#1B3A5C" />
            <polygon points="14,8 30,26 34,10" fill="#1B3A5C" />
            <polygon points="14,12 30,-6 34,10" fill="#1B3A5C" />
          </g>
        </svg>
        {/* passport book */}
        <div
          style={{
            position: 'absolute',
            left: 480,
            top: 300,
            width: 960,
            height: 560,
            background: '#1B3A5C',
            borderRadius: 24,
            boxShadow: '0 24px 50px rgba(27,58,92,0.35)',
            opacity: fadeIn(frame, 12),
          }}
        >
          <div style={{position: 'absolute', left: 40, top: 40, color: '#F5EFE6', fontSize: 30, fontWeight: 700, letterSpacing: 4}}>
            PASSPORT
          </div>
          <div style={{position: 'absolute', left: 40, top: 84, color: '#F5EFE6', fontSize: 22, opacity: 0.7}}>
            Travel Document
          </div>
          {/* left page (static) */}
          <div
            style={{
              position: 'absolute',
              left: 60,
              top: 150,
              width: 400,
              height: 360,
              background: '#FDFBF6',
              borderRadius: 12,
              padding: '28px 32px',
            }}
          >
            <div style={{width: 110, height: 140, background: '#D8CDB8', borderRadius: 8, marginBottom: 22}} />
            {[0, 1, 2].map((r) => (
              <div key={r} style={{height: 12, borderRadius: 6, background: 'rgba(27,58,92,0.25)', marginBottom: 16, width: `${92 - r * 14}%`}} />
            ))}
          </div>
          {/* right page (flipping via scaleX) */}
          <div
            style={{
              position: 'absolute',
              left: 500,
              top: 150,
              width: 400,
              height: 360,
              background: '#FDFBF6',
              borderRadius: 12,
              padding: '28px 32px',
              transform: `scaleX(${pageScaleX.toFixed(3)})`,
              transformOrigin: 'left center',
            }}
          >
            {[0, 1, 2, 3].map((r) => (
              <div key={r} style={{height: 12, borderRadius: 6, background: 'rgba(27,58,92,0.25)', marginBottom: 18, width: `${95 - r * 12}%`}} />
            ))}
            <div style={{marginTop: 26, height: 60, borderRadius: 10, background: 'rgba(192,57,43,0.12)', border: '2px dashed rgba(192,57,43,0.5)'}} />
          </div>
        </div>
        {/* stamps */}
        {stamps.map((s, i) => (
          <div
            key={s.text}
            style={{
              position: 'absolute',
              left: s.x,
              top: s.y,
              padding: '14px 26px',
              border: '5px solid #C0392B',
              borderRadius: 12,
              color: '#C0392B',
              fontSize: 44,
              fontWeight: 800,
              letterSpacing: 4,
              transform: `rotate(${s.rot}deg) scale(${clamp01(stampSprings[i]).toFixed(3)})`,
              opacity: clamp01(stampSprings[i]) * fadeOutEnd(frame),
              background: 'rgba(245,239,230,0.35)',
            }}
          >
            {s.text}
          </div>
        ))}
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 920,
            textAlign: 'center',
            color: '#1B3A5C',
            fontSize: 36,
            fontWeight: 600,
            letterSpacing: 5,
            opacity: fadeIn(frame - 60, 15) * fadeOutEnd(frame),
          }}
        >
          SUMMER HOLIDAY
        </div>
      </Grade>
      <GrainNoise opacity={0.05} seed={75} />
      <Vignette strength={0.14} rgb="90,70,40" />
    </AbsoluteFill>
  );
};
