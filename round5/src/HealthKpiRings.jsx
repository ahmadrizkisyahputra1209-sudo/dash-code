import React, {useMemo} from 'react';
import {AbsoluteFill, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {cyc, mulberry32, triWave} from './smooth.js';
import {Grade, GrainNoise, Vignette} from './postfx.jsx';

// 9. HEALTH KPI RINGS — three fitness-tracker cards (steps / sleep / heart).
// Rings breathe around their targets (live-data feel, never leaving the
// baseline, so the loop is seamless and frame 0 shows full cards). Values
// tick with a soft scale pop every 60 frames. The heart card has a scrolling
// ECG pulse line whose phase advances by whole cycles per loop (seamless).
function Ring({cx, cy, r, frac, color, value, unit, label}) {
  const C = 2 * Math.PI * r;
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#E5E7EB" strokeWidth={24} />
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={24}
        strokeLinecap="round"
        strokeDasharray={`${(frac * C).toFixed(1)} ${C.toFixed(1)}`}
        transform={`rotate(-90 ${cx} ${cy})`}
      />
      <text x={cx} y={cy + 4} textAnchor="middle" fontFamily="sans-serif" fontSize={56} fontWeight={800} fill="#111827">{value}</text>
      <text x={cx} y={cy + 44} textAnchor="middle" fontFamily="sans-serif" fontSize={24} fill="#6B7280">{unit}</text>
      <text x={cx} y={cy + 92} textAnchor="middle" fontFamily="sans-serif" fontSize={21} letterSpacing={3} fill="#9CA3AF">{label}</text>
    </g>
  );
}

function ecgPoints(w, phase) {
  const g = (t, c, amp) => amp * Math.exp(-((t - c) * (t - c)) / 0.0012);
  const pts = [];
  for (let i = 0; i <= 120; i++) {
    const x = (i / 120) * w;
    const t = ((x / w + phase) % 1 + 1) % 1;
    const y = 46 - (g(t, 0.2, 7) + g(t, 0.5, 34) + g(t, 0.72, 11));
    pts.push(`${x.toFixed(1)},${y.toFixed(1)}`);
  }
  return pts.join(' ');
}

export const HealthKpiRings = () => {
  const frame = useCurrentFrame();
  const {durationInFrames, fps} = useVideoConfig();
  const p = frame / durationInFrames;

  const pop = 1 + 0.05 * spring({frame: triWave(frame, 60), fps, config: {damping: 200}});

  const steps = 12480 + Math.round(40 * cyc(p, 1, 0) / 10) * 10;
  const sleepMin = 444 + Math.round(2 * cyc(p, 1, 1.2));
  const heart = 72 + Math.round(2 * cyc(p, 1, 2.4));
  const sleepText = `${Math.floor(sleepMin / 60)}h ${String(sleepMin % 60).padStart(2, '0')}m`;

  const cards = [
    {x: 120, frac: 0.78 + 0.03 * cyc(p, 1, 0), color: '#22C55E', value: steps.toLocaleString('en-US'), unit: 'steps', label: 'STEPS TODAY'},
    {x: 680, frac: 0.62 + 0.03 * cyc(p, 1, 1.2), color: '#6366F1', value: sleepText, unit: 'last night', label: 'SLEEP'},
    {x: 1240, frac: 0.72 + 0.03 * cyc(p, 1, 2.4), color: '#EF4444', value: String(heart), unit: 'bpm resting', label: 'HEART RATE'},
  ];

  return (
    <AbsoluteFill style={{backgroundColor: '#F4F7FA', overflow: 'hidden'}}>
      <Grade cssOnly>
        <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, #F8FAFC 0%, #F4F7FA 60%, #E8EEF4 100%)'}} />
        <div style={{position: 'absolute', left: 120, top: 90, fontFamily: 'sans-serif', fontSize: 40, fontWeight: 800, letterSpacing: 3, color: '#111827'}}>
          TODAY'S HEALTH
        </div>
        <div style={{position: 'absolute', left: 120, top: 150, fontFamily: 'sans-serif', fontSize: 22, letterSpacing: 2, color: '#6B7280'}}>
          SYNCED 2 MIN AGO — APPLE WATCH
        </div>
        {cards.map((c, i) => (
          <div key={i} style={{position: 'absolute', left: c.x, top: 220, width: 560, height: 700, borderRadius: 28, background: '#FFFFFF', boxShadow: '0 18px 50px rgba(15,23,42,0.10)'}} />
        ))}
        <svg width={1920} height={1080} style={{position: 'absolute'}}>
          {/* icons */}
          <g transform="translate(400 330)">
            {[0, 1, 2].map((b) => (
              <rect key={b} x={-48 + b * 36} y={30 - b * 18} width={24} height={30 + b * 18} rx={6} fill="#22C55E" opacity={0.85} />
            ))}
          </g>
          <g transform="translate(960 330)">
            <defs>
              <mask id="sleepCut">
                <rect x={-60} y={-60} width={120} height={120} fill="white" />
                <circle cx={18} cy={-14} r={42} fill="black" />
              </mask>
            </defs>
            <circle r={42} fill="#6366F1" mask="url(#sleepCut)" />
          </g>
          <g transform="translate(1520 330)">
            <path d="M0,26 C0,6 18,-10 34,6 C50,-10 68,6 68,26 C68,52 34,72 34,72 C34,72 0,52 0,26 Z" fill="#EF4444" />
          </g>
          {/* rings + values (with tick pop) */}
          {cards.map((c, i) => (
            <g key={i} transform={`translate(${c.x + 280} 620) scale(${pop.toFixed(3)}) translate(${-(c.x + 280)} -620)`}>
              <Ring cx={c.x + 280} cy={620} r={140} frac={c.frac} color={c.color} value={c.value} unit={c.unit} label={c.label} />
            </g>
          ))}
          {/* ECG line on the heart card */}
          <polyline points={ecgPoints(440, p * 2)} fill="none" stroke="#EF4444" strokeWidth={4} strokeLinejoin="round" strokeLinecap="round" transform="translate(1300 830)" />
          <text x={1300} y={810} fontFamily="sans-serif" fontSize={20} letterSpacing={2} fill="#9CA3AF">LIVE ECG</text>
        </svg>
      </Grade>
      <GrainNoise opacity={0.04} seed={39} />
      <Vignette strength={0.12} rgb="100,110,130" />
    </AbsoluteFill>
  );
};
