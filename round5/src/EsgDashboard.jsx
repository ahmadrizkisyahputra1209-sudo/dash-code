import React, {useMemo} from 'react';
import {AbsoluteFill, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {cyc, mulberry32, triWave} from './smooth.js';
import {Grade, GrainNoise, Vignette} from './postfx.jsx';

// 7. ESG DASHBOARD — a live sustainability dashboard: carbon gauge ring
// oscillating around its target (live-data feel), CO2 bars swaying, ESG
// score ticking through a deterministic value cycle with a soft scale pop,
// glint sweep across the card. Values never leave their baseline, so the
// loop is seamless and frame 0 shows the full dashboard (poster-ready).
const W = 1920;
const H = 1080;

function Gauge({cx, cy, r, frac, color, label, value, unit}) {
  const C = 2 * Math.PI * r;
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#1E3A34" strokeWidth={26} />
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={26}
        strokeLinecap="round"
        strokeDasharray={`${(frac * C).toFixed(1)} ${C.toFixed(1)}`}
        transform={`rotate(-90 ${cx} ${cy})`}
      />
      <text x={cx} y={cy - 6} textAnchor="middle" fontFamily="sans-serif" fontSize={64} fontWeight={800} fill="#FFFFFF">{value}</text>
      <text x={cx} y={cy + 42} textAnchor="middle" fontFamily="sans-serif" fontSize={26} fill="#9DB8B0">{unit}</text>
      <text x={cx} y={cy + 96} textAnchor="middle" fontFamily="sans-serif" fontSize={22} letterSpacing={3} fill="#6E8F86">{label}</text>
    </g>
  );
}

export const EsgDashboard = () => {
  const frame = useCurrentFrame();
  const {durationInFrames, fps} = useVideoConfig();
  const p = frame / durationInFrames;

  const bars = useMemo(() => {
    const rand = mulberry32(51);
    return Array.from({length: 6}, (_, i) => ({base: 90 + rand() * 90, phase: i * 0.6}));
  }, []);

  const carbon = 82.4 + 0.6 * cyc(p, 1, 0);
  const gaugeFrac = 0.78 + 0.04 * cyc(p, 1, 0);
  const scoreCycle = [92, 92, 93, 92, 91, 92];
  const score = scoreCycle[Math.floor(frame / 50) % 6];
  const scorePop = 1 + 0.05 * spring({frame: triWave(frame, 50), fps, config: {damping: 200}});
  const glintFrac = (p * 1.2) % 1;
  const glintX = glintFrac * (W + 200) - 100;
  const glintOp = Math.sin(Math.PI * glintFrac);

  return (
    <AbsoluteFill style={{backgroundColor: '#0A1F1C', overflow: 'hidden'}}>
      <Grade>
        <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(circle at 50% 40%, #123B32 0%, #0A1F1C 70%)'}} />
        {/* dashboard card */}
        <div style={{position: 'absolute', left: 130, top: 110, width: 1660, height: 860, borderRadius: 28, background: '#102E28', border: '2px solid #1E4A40', boxShadow: '0 30px 80px rgba(0,0,0,0.45)'}} />
        <div style={{position: 'absolute', left: 190, top: 150, fontFamily: 'sans-serif', fontSize: 34, fontWeight: 800, letterSpacing: 4, color: '#FFFFFF'}}>
          ESG SUSTAINABILITY DASHBOARD
        </div>
        <div style={{position: 'absolute', left: 190, top: 200, fontFamily: 'sans-serif', fontSize: 22, letterSpacing: 2, color: '#6E8F86'}}>
          LIVE ENVIRONMENTAL METRICS — 2027
        </div>
        <svg width={W} height={H} style={{position: 'absolute'}}>
          <Gauge cx={430} cy={620} r={150} frac={gaugeFrac} color="#4CAF50" label="CARBON FOOTPRINT" value={carbon.toFixed(1)} unit="tCO2e" />
          {/* CO2 bars */}
          {bars.map((b, i) => {
            const h = b.base + 26 * cyc(p, 1, b.phase);
            const x = 700 + i * 110;
            return (
              <g key={i}>
                <rect x={x} y={830 - h} width={64} height={h} rx={8} fill={i === 5 ? '#66BB6A' : '#2E7D32'} />
                <text x={x + 32} y={868} textAnchor="middle" fontFamily="sans-serif" fontSize={20} fill="#6E8F86">{['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN'][i]}</text>
              </g>
            );
          })}
          <text x={700} y={330} fontFamily="sans-serif" fontSize={22} letterSpacing={3} fill="#6E8F86">CO2 EMISSIONS / MONTH</text>
          {/* leaf + net zero */}
          <g transform="translate(1470 480)">
            <path d="M0,90 Q-70,0 0,-110 Q70,0 0,90 Z" fill="#4CAF50" />
            <path d="M0,80 L0,-100" stroke="#1B5E20" strokeWidth={5} />
            <path d="M0,-20 L-38,-52 M0,10 L38,-24 M0,40 L-34,12" stroke="#1B5E20" strokeWidth={4} />
          </g>
          <g transform={`translate(1540 700) scale(${scorePop.toFixed(3)})`}>
            <text x={0} y={0} textAnchor="middle" fontFamily="sans-serif" fontSize={110} fontWeight={800} fill="#FFFFFF">{score}</text>
            <text x={0} y={46} textAnchor="middle" fontFamily="sans-serif" fontSize={24} letterSpacing={3} fill="#6E8F86">ESG SCORE</text>
          </g>
          <text x={1470} y={880} textAnchor="middle" fontFamily="sans-serif" fontSize={26} fontWeight={700} letterSpacing={2} fill="#A5D6A7">NET ZERO 2030</text>
        </svg>
        {/* glint sweep */}
        <div style={{position: 'absolute', left: glintX - 90, top: 110, width: 90, height: 860, background: 'linear-gradient(to right, rgba(255,255,255,0) 0%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0) 100%)', transform: 'skewX(-12deg)', opacity: glintOp}} />
      </Grade>
      <GrainNoise opacity={0.05} seed={37} />
      <Vignette strength={0.2} rgb="4,20,16" />
    </AbsoluteFill>
  );
};
