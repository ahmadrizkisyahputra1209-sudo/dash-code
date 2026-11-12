import React, {useMemo} from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {countProg, fadeIn, fadeOutEnd, smoothstep} from './smooth.js';
import {Grade, GrainNoise, Vignette} from './postfx.jsx';

// 6. TELEMEDICINE CALL — doctor video call UI with live vitals.
// Palette 60% #F2F5F7 light grey / 30% #0E7C7B teal / 10% #FF6B5E coral.
// Data EXACT (from plan only): heart rate 72 bpm, SpO2 98%, temp 36.6 C.
// Vitals count up ONCE (f15-90), hold, fade out f285-300 (CORRECTED rule).
// Waveform scrolls LINEAR, exactly 1 wrap per loop (pattern period 960px).
// UI slides in f0-15. Text is fully legible at f150 (count-up done at f90).
const VITALS = [
  {label: 'HEART RATE', unit: 'bpm', target: 72, decimals: 0, accent: '#FF6B5E'},
  {label: 'SpO2', unit: '%', target: 98, decimals: 0, accent: '#0E7C7B'},
  {label: 'TEMPERATURE', unit: '°C', target: 36.6, decimals: 1, accent: '#0E7C7B'},
];

export const TelemedicineCall = () => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const p = frame / durationInFrames;

  // ECG waveform: one 960px period, duplicated for the wrap scroll.
  const waveD = useMemo(() => {
    const pts = [];
    for (let x = 0; x <= 960; x += 20) {
      const t = x % 240;
      let y = 870;
      if (t === 100) y = 822;
      else if (t === 140) y = 898;
      else if (t === 160) y = 802;
      else if (t === 180) y = 902;
      else if (t === 220) y = 846;
      pts.push(`${x},${y}`);
    }
    return `M${pts.join(' L')}`;
  }, []);

  const uiY = interpolate(frame, [0, 15], [40, 0], {
    easing: Easing.bezier(0.65, 0, 0.35, 1),
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const uiOp = fadeIn(frame, 12);
  const numOp = fadeIn(frame, 12) * fadeOutEnd(frame);
  const waveX = -p * 960;

  return (
    <AbsoluteFill style={{backgroundColor: '#F2F5F7', overflow: 'hidden'}}>
      <Grade>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(135deg, #F7FAFB 0%, #F2F5F7 55%, #E8EEF1 100%)',
          }}
        />
        <g style={{transform: `translateY(${uiY.toFixed(1)}px)`, opacity: uiOp}}>
          <svg width={1920} height={1080} style={{position: 'absolute'}}>
            {/* header */}
            <text x={80} y={78} fontFamily="sans-serif" fontSize={34} fontWeight={800} letterSpacing={4} fill="#334155">
              TELEMEDICINE
            </text>
            <circle cx={1620} cy={66} r={10} fill="#22C55E" />
            <text x={1640} y={78} fontFamily="sans-serif" fontSize={30} fontWeight={700} letterSpacing={3} fill="#334155">
              ONLINE
            </text>
            {/* video tile */}
            <rect x={80} y={130} width={760} height={560} rx={24} fill="#0E7C7B" />
            <rect x={80} y={130} width={760} height={560} rx={24} fill="none" stroke="#0A5E5D" strokeWidth={2} />
            {/* doctor silhouette (abstract, no real person) */}
            <circle cx={460} cy={330} r={92} fill="#0A5E5D" />
            <path d="M300,690 C300,520 380,470 460,470 C540,470 620,520 620,690 Z" fill="#0A5E5D" />
            <path d="M420,690 L460,540 L500,690 Z" fill="#FFFFFF" opacity={0.9} />
            <circle cx={460} cy={330} r={92} fill="none" stroke="#FFFFFF" strokeWidth={3} opacity={0.25} />
            {/* LIVE pill */}
            <rect x={110} y={160} width={110} height={44} rx={22} fill="#FF6B5E" />
            <text x={165} y={191} textAnchor="middle" fontFamily="sans-serif" fontSize={24} fontWeight={800} letterSpacing={2} fill="#FFFFFF">
              LIVE
            </text>
            {/* DOCTOR label */}
            <rect x={110} y={620} width={150} height={44} rx={22} fill="#0B1F3A" opacity={0.85} />
            <text x={185} y={651} textAnchor="middle" fontFamily="sans-serif" fontSize={24} fontWeight={700} letterSpacing={2} fill="#FFFFFF">
              DOCTOR
            </text>
            {/* vitals cards */}
            {VITALS.map((v, i) => {
              const y = 130 + i * 200;
              const slide = interpolate(frame, [10 + i * 2, 22 + i * 2], [30, 0], {
                easing: Easing.bezier(0.65, 0, 0.35, 1),
                extrapolateLeft: 'clamp',
                extrapolateRight: 'clamp',
              });
              const val = v.target * countProg(frame, 15, 90);
              const shown = v.decimals === 0 ? Math.round(val) : val.toFixed(1);
              return (
                <g key={i} transform={`translate(0 ${slide.toFixed(1)})`} opacity={fadeIn(frame, 12)}>
                  <rect x={900} y={y} width={940} height={170} rx={20} fill="#FFFFFF" />
                  <rect x={900} y={y} width={940} height={170} rx={20} fill="none" stroke="#DDE4E9" strokeWidth={2} />
                  <circle cx={960} cy={y + 85} r={14} fill={v.accent} />
                  <text x={1000} y={y + 66} fontFamily="sans-serif" fontSize={28} fontWeight={700} letterSpacing={3} fill="#64748B">
                    {v.label}
                  </text>
                  <text x={1000} y={y + 128} fontFamily="sans-serif" fontSize={64} fontWeight={800} fill="#0F172A" opacity={numOp}>
                    {shown}
                  </text>
                  <text x={1000 + String(shown).length * 38 + 24} y={y + 128} fontFamily="sans-serif" fontSize={34} fontWeight={600} fill="#64748B" opacity={numOp}>
                    {v.unit}
                  </text>
                </g>
              );
            })}
            {/* waveform strip */}
            <clipPath id="waveClip">
              <rect x={80} y={760} width={1760} height={220} rx={20} />
            </clipPath>
            <rect x={80} y={760} width={1760} height={220} rx={20} fill="#FFFFFF" />
            <rect x={80} y={760} width={1760} height={220} rx={20} fill="none" stroke="#DDE4E9" strokeWidth={2} />
            <g clipPath="url(#waveClip)">
              <g transform={`translate(${80 + waveX} 0)`}>
                <path d={waveD} fill="none" stroke="#0E7C7B" strokeWidth={5} strokeLinecap="round" />
                <path d={`M960,0 L960,220`} stroke="none" />
                <g transform="translate(960 0)">
                  <path d={waveD} fill="none" stroke="#0E7C7B" strokeWidth={5} strokeLinecap="round" />
                </g>
                <g transform="translate(1920 0)">
                  <path d={waveD} fill="none" stroke="#0E7C7B" strokeWidth={5} strokeLinecap="round" />
                </g>
              </g>
            </g>
            <text x={110} y={806} fontFamily="sans-serif" fontSize={24} fontWeight={700} letterSpacing={3} fill="#64748B">
              ECG
            </text>
          </svg>
        </g>
      </Grade>
      <GrainNoise opacity={0.04} seed={66} />
      <Vignette strength={0.08} rgb="100,120,130" />
    </AbsoluteFill>
  );
};
