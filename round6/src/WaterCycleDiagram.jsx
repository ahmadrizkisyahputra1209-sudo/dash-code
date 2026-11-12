import React, {useMemo} from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {evolvePath} from '@remotion/paths';
import {cyc, fadeOutEnd, mulberry32, smoothstep} from './smooth.js';
import {Grade, GrainNoise, Vignette} from './postfx.jsx';

// 11. WATER CYCLE DIAGRAM — evaporation, condensation, precipitation,
// collection. Palette 60% #7EC8E3 sky blue / 30% #1B4F72 deep blue /
// 10% #F5C542 sun yellow (+ white neutral).
// Labels EXACT (from plan only): "Evaporation", "Condensation",
// "Precipitation", "Collection" — mask-reveal, staggered 15 frames apart,
// fade out f285-300. Arrows draw-on (evolvePath). Rain falls with wrap
// modulo (speed = wrap/300, 1 wrap per loop). Sun rays rotate 1 full turn.
// Frame 0: sky, sun, land and lake already visible (not empty).
const ARROWS = ['M420,900 L420,640', 'M560,900 L560,640', 'M700,900 L700,640'];
const LABELS = [
  {text: 'Evaporation', x: 560, y: 980},
  {text: 'Condensation', x: 1230, y: 300},
  {text: 'Precipitation', x: 1230, y: 560},
  {text: 'Collection', x: 1420, y: 950},
];

export const WaterCycleDiagram = () => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const p = frame / durationInFrames;

  const rain = useMemo(() => {
    const rand = mulberry32(111);
    return Array.from({length: 24}, () => ({
      x: 700 + rand() * 520,
      startY: rand() * 500,
    }));
  }, []);

  // Arrows: draw f30-90, hold, erase f240-300 (there-and-back).
  const arrowProg =
    p < 0.1
      ? 0
      : p < 0.3
        ? smoothstep((p - 0.1) / 0.2)
        : p < 0.8
          ? 1
          : 1 - smoothstep((p - 0.8) / 0.2);

  // Cloud: forms f15-60, holds, fades out f285-300.
  const cloudScale = smoothstep((frame - 15) / 45) * fadeOutEnd(frame);
  const cloudX = 960 + 20 * cyc(p, 1);

  // Sun rays rotate 1 full turn per loop (seamless).
  const sunRot = p * 360;

  // Rain: wrap modulo, 1 wrap per loop.
  const wrap = 500;
  const v = wrap / 300;

  return (
    <AbsoluteFill style={{backgroundColor: '#7EC8E3', overflow: 'hidden'}}>
      <Grade>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(135deg, #A8D8EA 0%, #7EC8E3 55%, #5FB2D6 100%)',
          }}
        />
        <svg width={1920} height={1080} style={{position: 'absolute'}}>
          {/* sun (top-left) with rotating rays */}
          <g transform={`translate(240 200)`}>
            <circle r={110} fill="#F5C542" opacity={0.25} />
            <g transform={`rotate(${sunRot.toFixed(1)})`}>
              {Array.from({length: 8}, (_, i) => {
                const a = (i * Math.PI) / 4;
                return (
                  <line
                    key={i}
                    x1={Math.cos(a) * 86}
                    y1={Math.sin(a) * 86}
                    x2={Math.cos(a) * 118}
                    y2={Math.sin(a) * 118}
                    stroke="#F5C542"
                    strokeWidth={10}
                    strokeLinecap="round"
                  />
                );
              })}
            </g>
            <circle r={70} fill="#F5C542" />
            <circle r={70} fill="none" stroke="#FFFFFF" strokeWidth={4} opacity={0.5} />
          </g>
          {/* land + lake */}
          <path d="M0,1080 L0,940 Q480,860 960,920 Q1440,980 1920,900 L1920,1080 Z" fill="#1B4F72" />
          <ellipse cx={1380} cy={1010} rx={420} ry={70} fill="#4FA3E3" opacity={0.9} />
          <ellipse cx={1380} cy={1000} rx={380} ry={46} fill="#7EC8E3" opacity={0.7} />
          {/* evaporation arrows (draw-on) */}
          {ARROWS.map((d, i) => {
            const ev = evolvePath(arrowProg, d);
            return (
              <g key={i}>
                <path d={d} fill="none" stroke="#FFFFFF" strokeWidth={8} strokeLinecap="round" strokeDasharray={ev.strokeDasharray} strokeDashoffset={ev.strokeDashoffset} />
                <polygon
                  points="0,-14 12,6 -12,6"
                  fill="#FFFFFF"
                  opacity={arrowProg}
                  transform={`translate(${[420, 560, 700][i]} 626)`}
                />
              </g>
            );
          })}
          {/* cloud (forming) */}
          <g transform={`translate(${cloudX.toFixed(1)} 380) scale(${cloudScale.toFixed(3)})`}>
            <circle cx={-90} cy={20} r={70} fill="#FFFFFF" />
            <circle cx={0} cy={-20} r={88} fill="#FFFFFF" />
            <circle cx={90} cy={20} r={70} fill="#FFFFFF" />
            <ellipse cx={0} cy={44} rx={170} ry={54} fill="#FFFFFF" />
          </g>
          {/* rain (wrap modulo, 1 wrap per loop) */}
          {rain.map((r, i) => {
            const y = 480 + ((r.startY + frame * v) % wrap);
            return (
              <line
                key={i}
                x1={r.x}
                y1={y}
                x2={r.x}
                y2={y + 22}
                stroke="#D6EAF8"
                strokeWidth={5}
                strokeLinecap="round"
                opacity={0.85}
              />
            );
          })}
          {/* labels, mask-reveal, staggered 15 frames apart */}
          {LABELS.map((lb, i) => {
            const startF = 60 + i * 15;
            const rise = smoothstep((frame - startF) / 12);
            const op = rise * fadeOutEnd(frame);
            const yOff = (1 - rise) * 12;
            const w = lb.text.length * 19 + 44;
            return (
              <g key={i} transform={`translate(${lb.x} ${(lb.y + yOff).toFixed(1)})`} opacity={op}>
                <rect x={-w / 2} y={-26} width={w} height={52} rx={26} fill="#FFFFFF" opacity={0.92} />
                <text
                  x={0}
                  y={9}
                  textAnchor="middle"
                  fontFamily="sans-serif"
                  fontSize={30}
                  fontWeight={700}
                  fill="#1B4F72"
                >
                  {lb.text}
                </text>
              </g>
            );
          })}
        </svg>
      </Grade>
      <GrainNoise opacity={0.05} seed={111} />
      <Vignette strength={0.1} rgb="40,90,120" />
    </AbsoluteFill>
  );
};
