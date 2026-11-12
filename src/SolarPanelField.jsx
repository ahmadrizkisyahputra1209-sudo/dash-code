import React, {useMemo} from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {mulberry32} from './smooth.js';
import {Grade, Grain, Vignette} from './postfx.jsx';

// 1. SOLAR PANEL FIELD — bright blue sky, sun + glow, 3 panel rows tilting
// gently to track the sun (periodic tilt = seamless loop), glint sweep,
// drifting clouds, green field. Frame 0: full scene, panels already tilted.
// Niche: renewable energy / solar (specific, utilitarian; solar-panel photo
// accepted on this account). Pure code.
const PANELS = [
  {x: 180, y: 640, w: 480, h: 210, tilt: 0},
  {x: 720, y: 600, w: 520, h: 230, tilt: 1},
  {x: 1300, y: 650, w: 460, h: 200, tilt: 2},
];

function Panel({x, y, w, h, tilt, p}) {
  const skew = -6 + 5 * Math.sin(2 * Math.PI * p + tilt * 2.1);
  const glintX = ((p * 2 + tilt * 0.33) % 1) * (w + 160) - 80;
  const cells = [];
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 6; c++) {
      cells.push(
        <rect key={`${r}-${c}`} x={14 + c * ((w - 28) / 6)} y={14 + r * ((h - 28) / 3)}
          width={(w - 28) / 6 - 6} height={(h - 28) / 3 - 6} rx={4}
          fill="#1B4F8A" stroke="#7FB8E8" strokeWidth={2} />
      );
    }
  }
  return (
    <g transform={`translate(${x} ${y}) skewX(${skew.toFixed(2)})`}>
      <rect x={-8} y={h - 6} width={w + 16} height={14} rx={4} fill="#5B6B7A" />
      <rect x={w / 2 - 10} y={h + 8} width={20} height={90} fill="#46586A" />
      <rect x={0} y={0} width={w} height={h} rx={10} fill="#0F2F57" stroke="#D7E9F7" strokeWidth={4} />
      {cells}
      <rect x={glintX} y={-10} width={46} height={h + 20} fill="#FFFFFF" opacity={0.14}
        transform={`skewX(-18)`} clipPath="url(#panelClip)" />
    </g>
  );
}

export const SolarPanelField = () => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const p = frame / durationInFrames;
  const clouds = useMemo(() => {
    const rand = mulberry32(7);
    return Array.from({length: 5}, (_, i) => ({
      x: rand() * 1700, y: 90 + rand() * 260, w: 260 + rand() * 260, speed: 0.4 + rand() * 0.5, phase: rand() * 6,
    }));
  }, []);
  return (
    <AbsoluteFill style={{backgroundColor: '#BFE3FF', overflow: 'hidden'}}>
      <Grade>
        <svg width={0} height={0}><defs><clipPath id="panelClip"><rect x={0} y={0} width={1920} height={1080} /></clipPath></defs></svg>
        <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, #8EC9F5 0%, #BFE3FF 42%, #EAF7FF 68%, #7CB342 68.2%, #5A9E3A 100%)'}} />
        <div style={{position: 'absolute', left: 1420, top: 90, width: 460, height: 460, borderRadius: '50%', background: 'rgba(255,240,170,0.55)', filter: 'blur(60px)'}} />
        <div style={{position: 'absolute', left: 1520, top: 190, width: 260, height: 260, borderRadius: '50%', background: 'radial-gradient(circle, #FFFBE0 0%, #FFE082 60%, rgba(255,224,130,0) 78%)'}} />
        {clouds.map((c, i) => (
          <div key={i} style={{position: 'absolute', left: ((c.x + p * 1920 * 0.1 * c.speed) % 2100) - 140, top: c.y + 14 * Math.sin(2 * Math.PI * p + c.phase), width: c.w, height: 54, borderRadius: 27, background: 'rgba(255,255,255,0.85)', filter: 'blur(6px)'}} />
        ))}
        <svg width={1920} height={1080} style={{position: 'absolute'}}>
          <path d="M0,760 Q480,700 960,745 T1920,730 L1920,1080 L0,1080 Z" fill="#6FA844" />
          <path d="M0,830 Q500,780 1000,820 T1920,810 L1920,1080 L0,1080 Z" fill="#55893A" />
          {PANELS.map((t, i) => <Panel key={i} {...t} p={p} />)}
          <g fill="#3E7A2E">{Array.from({length: 26}, (_, i) => (<ellipse key={i} cx={60 + i * 74} cy={1010 + ((i * 37) % 40)} rx={26} ry={10} />))}</g>
        </svg>
      </Grade>
      <Grain opacity={0.05} />
      <Vignette strength={0.18} rgb="30,80,120" />
    </AbsoluteFill>
  );
};
