import React, {useMemo} from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {mulberry32} from './smooth.js';
import {Grade, Grain, Vignette} from './postfx.jsx';

// 3. DRONE DELIVERY PARCEL — bright day sky, city rooftops below, quadcopter
// drone carrying a parcel on a swaying line, rotors spinning, gentle bob +
// slow drift (periodic = seamless loop). Frame 0: drone centered over city.
// Niche: logistics / e-commerce delivery + aerial drone (VoxBooster: aerial
// drone landscapes 18% of downloads). Pure code.
export const DroneDelivery = () => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const p = frame / durationInFrames;
  const cyc = 2 * Math.PI * p;
  const droneX = 960 + 220 * Math.sin(cyc);
  const droneY = 380 + 26 * Math.sin(cyc * 2 + 0.8);
  const sway = 7 * Math.sin(cyc * 2 + 1.5);
  const rotor = (frame * 55) % 360;
  const buildings = useMemo(() => {
    const rand = mulberry32(21);
    return Array.from({length: 14}, (_, i) => ({
      x: i * 140 - 20, w: 110 + rand() * 40, h: 180 + rand() * 220,
      tint: ['#7A8FA3', '#8FA5B8', '#6B8296', '#9AB0C2'][i % 4],
    }));
  }, []);
  const clouds = useMemo(() => {
    const rand = mulberry32(33);
    return Array.from({length: 4}, (_, i) => ({x: rand() * 1700, y: 80 + rand() * 180, w: 240 + rand() * 220, speed: 0.3 + rand() * 0.4}));
  }, []);
  return (
    <AbsoluteFill style={{backgroundColor: '#AEDCF7', overflow: 'hidden'}}>
      <Grade>
        <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, #6FB9EC 0%, #AEDCF7 45%, #E3F4FD 70%, #8FA5B8 70.2%, #5F7A8F 100%)'}} />
        <div style={{position: 'absolute', left: 150, top: 70, width: 380, height: 380, borderRadius: '50%', background: 'rgba(255,244,190,0.6)', filter: 'blur(55px)'}} />
        {clouds.map((c, i) => (
          <div key={i} style={{position: 'absolute', left: ((c.x + p * 1920 * 0.08 * c.speed) % 2100) - 120, top: c.y, width: c.w, height: 48, borderRadius: 24, background: 'rgba(255,255,255,0.9)', filter: 'blur(5px)'}} />
        ))}
        <svg width={1920} height={1080} style={{position: 'absolute'}}>
          {/* city rooftops */}
          {buildings.map((b, i) => (
            <g key={i}>
              <rect x={b.x} y={1080 - b.h} width={b.w} height={b.h} fill={b.tint} />
              <rect x={b.x} y={1080 - b.h} width={b.w} height={14} fill="#4A5F73" />
              {[0, 1, 2].map((r) => [0, 1].map((cc) => (
                <rect key={`${r}-${cc}`} x={b.x + 18 + cc * 52} y={1080 - b.h + 44 + r * 58} width={30} height={36} rx={3} fill="#FFE9A8" opacity={0.9} />
              )))}
            </g>
          ))}
          {/* drone shadow on rooftops */}
          <ellipse cx={droneX} cy={1010} rx={150} ry={16} fill="#2E4256" opacity={0.22} />
          {/* parcel line + parcel */}
          <line x1={droneX} y1={droneY + 26} x2={droneX + sway} y2={droneY + 118} stroke="#33475B" strokeWidth={4} />
          <g transform={`translate(${droneX + sway} ${droneY + 118}) rotate(${(sway * 0.5).toFixed(1)})`}>
            <rect x={-52} y={0} width={104} height={78} rx={8} fill="#E8A33D" stroke="#B97E22" strokeWidth={3} />
            <rect x={-6} y={0} width={12} height={78} fill="#B97E22" opacity={0.6} />
          </g>
          {/* drone body */}
          <g>
            <line x1={droneX - 95} y1={droneY - 8} x2={droneX + 95} y2={droneY - 8} stroke="#33475B" strokeWidth={10} strokeLinecap="round" />
            <line x1={droneX - 95} y1={droneY + 22} x2={droneX - 55} y2={droneY + 2} stroke="#33475B" strokeWidth={8} strokeLinecap="round" />
            <line x1={droneX + 95} y1={droneY + 22} x2={droneX + 55} y2={droneY + 2} stroke="#33475B" strokeWidth={8} strokeLinecap="round" />
            <rect x={droneX - 62} y={droneY - 22} width={124} height={46} rx={20} fill="#2F4A63" />
            <rect x={droneX - 62} y={droneY - 22} width={124} height={20} rx={10} fill="#4A6B87" />
            <circle cx={droneX} cy={droneY + 1} r={14} fill="#37C978" />
            <circle cx={droneX} cy={droneY + 1} r={22} fill="#37C978" opacity={0.25 + 0.2 * Math.sin(cyc * 3)} />
            {/* rotors: spinning blur discs */}
            {[-95, 95].map((dx) => (
              <g key={dx}>
                <ellipse cx={droneX + dx} cy={droneY - 14} rx={72} ry={9} fill="#1E2E3E" opacity={0.35} transform={`rotate(${rotor} ${droneX + dx} ${droneY - 14})`} />
                <ellipse cx={droneX + dx} cy={droneY - 14} rx={72} ry={9} fill="#1E2E3E" opacity={0.25} transform={`rotate(${-rotor + 45} ${droneX + dx} ${droneY - 14})`} />
                <circle cx={droneX + dx} cy={droneY - 14} r={8} fill="#1E2E3E" />
              </g>
            ))}
          </g>
        </svg>
      </Grade>
      <Grain opacity={0.05} />
      <Vignette strength={0.16} rgb="40,80,120" />
    </AbsoluteFill>
  );
};
