import React, {useMemo} from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {clamp01, easeOut, fadeIn, fadeOutEnd, mulberry32, revealScale, uiSpring} from './smooth.js';
import {GrainNoise, Grade, Vignette} from './postfx.jsx';

// 6. HARI KARTINI — 1080x1920 VERTICAL. Portrait explainer: kebaya
// silhouette + batik motif, timeline 1879 → 1904 → 21 Apr 2027.
// Palette 60% #5B2A4A deep plum / 30% #E8B84B gold / 10% #F5EFE6
// cream. Text EXACT: "HARI KARTINI" · "21 APRIL 2027" ·
// "1879–1904" · "HABIS GELAP TERBITLAH TERANG". Text stays inside
// the 9:16 safe zone (15–75% height). Frame 0: gradient + batik
// motif + silhouette visible.
const W = 1080;
const H = 1920;

export const KartiniDay = () => {
  const frame = useCurrentFrame();
  const fade = fadeOutEnd(frame);

  const diamonds = useMemo(() => {
    const rand = mulberry32(106);
    return Array.from({length: 60}, () => ({
      x: rand() * W,
      y: rand() * H,
      s: 14 + rand() * 22,
      o: 0.05 + rand() * 0.08,
    }));
  }, []);

  const lineProg = interpolate(frame, [90, 180], [0, 1], {
    easing: easeOut,
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{backgroundColor: '#5B2A4A', overflow: 'hidden'}}>
      <Grade>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(180deg, #5B2A4A 0%, #4A2139 55%, #341627 100%)',
          }}
        />
        {/* batik diamond motif, visible from f0 */}
        <svg width={W} height={H} style={{position: 'absolute'}}>
          {diamonds.map((d, i) => (
            <rect
              key={i}
              x={d.x - d.s / 2}
              y={d.y - d.s / 2}
              width={d.s}
              height={d.s}
              fill="none"
              stroke="#E8B84B"
              strokeWidth={2}
              opacity={d.o}
              transform={`rotate(45 ${d.x} ${d.y})`}
            />
          ))}
        </svg>
        {/* kebaya silhouette */}
        <svg
          width={W}
          height={H}
          style={{position: 'absolute', scale: revealScale(frame, 5, 22), opacity: fadeIn(frame - 5, 12) * fade}}
        >
          <g fill="#341627">
            <circle cx="540" cy="700" r="72" />
            <path d="M 540 628 A 72 72 0 0 1 612 700 L 612 660 A 72 72 0 0 0 468 660 Z" fill="#E8B84B" opacity={0.85} />
            <path d="M 470 790 L 610 790 L 660 940 L 700 1130 L 380 1130 L 420 940 Z" />
            <path d="M 470 790 L 430 990 L 380 1130 L 470 1130 L 500 960 Z" opacity={0.8} />
            <path d="M 610 790 L 650 990 L 700 1130 L 610 1130 L 580 960 Z" opacity={0.8} />
          </g>
          <path d="M 470 800 L 610 800" stroke="#E8B84B" strokeWidth={5} />
          <circle cx="540" cy="880" r="9" fill="#E8B84B" />
          <circle cx="540" cy="960" r="9" fill="#E8B84B" />
          <circle cx="540" cy="1040" r="9" fill="#E8B84B" />
        </svg>
        {/* title + date */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 300,
            width: W,
            textAlign: 'center',
            color: '#E8B84B',
            fontSize: 118,
            fontWeight: 900,
            letterSpacing: 6,
            scale: revealScale(frame, 15, 18),
            opacity: fadeIn(frame - 15, 12) * fade,
          }}
        >
          HARI KARTINI
        </div>
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 460,
            width: W,
            textAlign: 'center',
            color: '#FFFFFF',
            fontSize: 92,
            fontWeight: 900,
            letterSpacing: 2,
            scale: clamp01(uiSpring(frame, 25)),
            opacity: fadeIn(frame - 25, 12) * fade,
          }}
        >
          21 APRIL 2027
        </div>
        {/* timeline 1879 → 1904 */}
        <svg width={W} height={H} style={{position: 'absolute', opacity: fade}}>
          <line
            x1={240}
            y1={1260}
            x2={840}
            y2={1260}
            stroke="#E8B84B"
            strokeWidth={6}
            strokeLinecap="round"
            pathLength={1}
            strokeDasharray={1}
            strokeDashoffset={1 - lineProg}
          />
          <circle cx={240} cy={1260} r={16} fill="#E8B84B" />
          <circle cx={540} cy={1260} r={16} fill="#F5EFE6" />
          <circle cx={840} cy={1260} r={16} fill="#E8B84B" />
        </svg>
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 1310,
            width: W,
            textAlign: 'center',
            color: '#F5EFE6',
            fontSize: 64,
            fontWeight: 800,
            letterSpacing: 4,
            scale: clamp01(uiSpring(frame, 120)),
            opacity: fadeIn(frame - 120, 12) * fade,
          }}
        >
          1879–1904
        </div>
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 1420,
            width: W,
            textAlign: 'center',
            color: '#E8B84B',
            fontSize: 40,
            fontWeight: 700,
            letterSpacing: 3,
            scale: clamp01(uiSpring(frame, 140)),
            opacity: fadeIn(frame - 140, 12) * fade,
          }}
        >
          HABIS GELAP TERBITLAH TERANG
        </div>
      </Grade>
      <GrainNoise opacity={0.05} seed={106} />
      <Vignette strength={0.18} rgb="30,10,24" />
    </AbsoluteFill>
  );
};
