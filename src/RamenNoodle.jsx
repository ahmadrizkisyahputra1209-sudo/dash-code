import React, {useMemo} from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {mulberry32} from './smooth.js';
import {Grade, Grain, Vignette} from './postfx.jsx';

// 6. RAMEN NOODLE STEAM — warm bright kitchen, red bowl of ramen, chopsticks
// lifting a noodle bundle (periodic lift = seamless loop), curling steam,
// soft-boiled egg, spring-onion dots, sesame. Frame 0: noodles already
// lifted mid-air, bowl fully composed.
// Niche: Asian food / noodle bowl — specific food (street-food photo was
// accepted on this account; generic food was not the winner, specific is).
// Pure code.
export const RamenNoodle = () => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const p = frame / durationInFrames;
  const cyc = 2 * Math.PI * p;
  const lift = 46 * (0.5 - 0.5 * Math.cos(cyc)); // 0..46 up and back
  const sway = 10 * Math.sin(cyc);
  const steam = useMemo(() => {
    const rand = mulberry32(77);
    return Array.from({length: 7}, (_, i) => ({x: 700 + rand() * 520, phase: rand(), w: 26 + rand() * 26, speed: 0.6 + rand() * 0.5}));
  }, []);
  const noodles = [];
  for (let i = 0; i < 7; i++) {
    const x0 = 880 + i * 26;
    noodles.push(`M${x0},${560 - lift} Q${x0 + 14 + sway},${640 - lift * 0.7} ${x0 - 8},${720 - lift * 0.35} Q${x0 + 10},${790} ${x0 - 4},${830}`);
  }
  return (
    <AbsoluteFill style={{backgroundColor: '#FFF3E0', overflow: 'hidden'}}>
      <Grade>
        <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, #FFE8C2 0%, #FFF3E0 45%, #F7D9A8 45.2%, #E8B96F 100%)'}} />
        {/* table mat */}
        <div style={{position: 'absolute', left: 360, top: 830, width: 1200, height: 180, borderRadius: 24, background: '#B5541E', opacity: 0.9}} />
        <div style={{position: 'absolute', left: 400, top: 850, width: 1120, height: 140, borderRadius: 18, background: '#8E3B12', opacity: 0.55}} />
        {/* steam: curls rising, loop by modulo */}
        <svg width={1920} height={1080} style={{position: 'absolute'}}>
          {steam.map((s, i) => {
            const sy = 620 - ((s.phase * 420 + p * 420 * s.speed) % 460);
            const op = 0.5 * (1 - (620 - sy) / 460);
            return (
              <path key={i} d={`M${s.x},${sy} Q${s.x + s.w},${sy - 34} ${s.x - 6},${sy - 68} Q${s.x - s.w},${sy - 102} ${s.x + 4},${sy - 136}`}
                fill="none" stroke="#FFFFFF" strokeWidth={13} strokeLinecap="round" opacity={Math.max(0, op)} />
            );
          })}
          {/* bowl */}
          <ellipse cx={960} cy={860} rx={420} ry={52} fill="#7A2E0E" opacity={0.35} />
          <path d="M560,620 L600,880 Q620,960 960,960 Q1300,960 1320,880 L1360,620 Z" fill="#C62828" />
          <path d="M560,620 L600,880 Q620,960 960,960 Q1300,960 1320,880 L1360,620 Z" fill="none" stroke="#8E1B1B" strokeWidth={6} />
          <ellipse cx={960} cy={620} rx={400} ry={86} fill="#F5E6C8" />
          <ellipse cx={960} cy={620} rx={360} ry={66} fill="#E8A33D" />
          {/* broth swirls */}
          <ellipse cx={880} cy={615} rx={150} ry={26} fill="none" stroke="#D98A2B" strokeWidth={8} opacity={0.7} />
          <ellipse cx={1060} cy={632} rx={110} ry={20} fill="none" stroke="#D98A2B" strokeWidth={7} opacity={0.6} />
          {/* egg half */}
          <ellipse cx={1230} cy={610} rx={72} ry={46} fill="#FFF8E7" stroke="#E8D9B0" strokeWidth={3} />
          <circle cx={1230} cy={610} r={26} fill="#F5B81D" />
          <circle cx={1222} cy={602} r={9} fill="#FFE082" />
          {/* spring onion + sesame */}
          {Array.from({length: 14}, (_, i) => {
            const a = i * 2.4;
            return <circle key={i} cx={960 + 240 * Math.cos(a)} cy={620 + 44 * Math.sin(a)} r={9} fill="#43A047" stroke="#2E7D32" strokeWidth={2} />;
          })}
          {/* lifted noodles */}
          {noodles.map((d, i) => (
            <path key={i} d={d} fill="none" stroke="#F7D774" strokeWidth={13} strokeLinecap="round" />
          ))}
          {/* chopsticks: short, clearly diagonal, gripping the noodle bundle */}
          <g transform={`translate(0 ${-lift}) rotate(${-38 + 2 * Math.sin(cyc)} 1000 560)`}>
            <line x1={992} y1={560} x2={992} y2={230} stroke="#6D4C41" strokeWidth={14} strokeLinecap="round" />
            <line x1={1024} y1={560} x2={1024} y2={250} stroke="#8D6E63" strokeWidth={14} strokeLinecap="round" />
            <rect x={978} y={300} width={62} height={30} rx={10} fill="#C62828" />
          </g>
          {/* nori sheet */}
          <rect x={660} y={520} width={90} height={130} rx={10} fill="#1B5E20" transform="rotate(-8 705 585)" />
        </svg>
      </Grade>
      <Grain opacity={0.05} />
      <Vignette strength={0.16} rgb="120,60,10" />
    </AbsoluteFill>
  );
};
