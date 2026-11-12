import React, {useMemo} from 'react';
import {AbsoluteFill, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {evolvePath} from '@remotion/paths';
import {clamp01, cyc, env, triWave} from './smooth.js';
import {Grade, GrainNoise, Vignette} from './postfx.jsx';

// 10. SAVINGS GROWTH — piggy bank bouncing happily, coins dropping into its
// slot one by one, a coin stack growing and shrinking (0..1..0 envelope, so
// the loop is seamless), a savings ring oscillating around 68-72%, and a
// growth arrow drawing itself on and off via evolvePath. Frame 0: bank +
// base stack visible, poster-ready.
const W = 1920;

export const SavingsGrowth = () => {
  const frame = useCurrentFrame();
  const {durationInFrames, fps} = useVideoConfig();
  const p = frame / durationInFrames;

  const bankBounce = -10 * spring({frame: triWave(frame, 75), fps, config: {damping: 8}});
  const stackEnv = env(p, 0);
  const savedPct = Math.round(70 + 2 * cyc(p, 1, 0));
  const ringFrac = 0.7 + 0.02 * cyc(p, 1, 0);
  const ringC = 2 * Math.PI * 300;

  // One coin dropping into the slot, 3 drops per loop, opacity envelope
  // hides the wrap.
  const dropFrac = (p * 3) % 1;
  const dropY = 120 + dropFrac * 460;
  const dropOp = Math.sin(Math.PI * dropFrac);
  const dropRot = 360 * dropFrac;

  const arrowProg = env(p, 0.5);
  const arrowEvolve = evolvePath(clamp01(arrowProg * 1.05), 'M1060,820 C1180,700 1320,560 1460,440');
  const arrowHeadOp = clamp01((arrowProg - 0.75) * 4);

  const coins = useMemo(() => Array.from({length: 8}, (_, i) => i), []);

  return (
    <AbsoluteFill style={{backgroundColor: '#E8F5E9', overflow: 'hidden'}}>
      <Grade>
        <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, #F1F8E9 0%, #E8F5E9 55%, #C8E6C9 100%)'}} />
        {/* ground */}
        <div style={{position: 'absolute', left: 0, right: 0, top: 920, height: 160, background: '#A5D6A7', opacity: 0.6}} />
        <div style={{position: 'absolute', left: 0, right: 0, top: 920, height: 6, background: '#81C784'}} />
        <svg width={W} height={1080} style={{position: 'absolute'}}>
          <defs>
            <radialGradient id="coinGold" cx="0.35" cy="0.3" r="0.9">
              <stop offset="0%" stopColor="#FFE082" />
              <stop offset="55%" stopColor="#FFC107" />
              <stop offset="100%" stopColor="#FF8F00" />
            </radialGradient>
          </defs>
          {/* savings ring around the bank */}
          <circle cx={700} cy={620} r={300} fill="none" stroke="#C8E6C9" strokeWidth={18} />
          <circle cx={700} cy={620} r={300} fill="none" stroke="#43A047" strokeWidth={18} strokeLinecap="round" strokeDasharray={`${(ringFrac * ringC).toFixed(1)} ${ringC.toFixed(1)}`} transform="rotate(-90 700 620)" />
          {/* growth arrow */}
          <path d="M1060,820 C1180,700 1320,560 1460,440" fill="none" stroke="#2E7D32" strokeWidth={9} strokeLinecap="round" strokeDasharray={arrowEvolve.strokeDasharray} strokeDashoffset={arrowEvolve.strokeDashoffset} />
          <g transform="translate(1460 440) rotate(45)" opacity={arrowHeadOp}>
            <path d="M0,-16 L26,10 L-6,10 Z" fill="#2E7D32" />
          </g>
          {/* piggy bank */}
          <g transform={`translate(700 ${620 + bankBounce})`}>
            <ellipse cx={0} cy={0} rx={230} ry={165} fill="#F8BBD0" stroke="#E91E63" strokeWidth={4} />
            <path d="M-150,-110 L-190,-190 L-110,-140 Z" fill="#F8BBD0" stroke="#E91E63" strokeWidth={4} />
            <ellipse cx={-218} cy={-10} rx={26} ry={40} fill="#F48FB1" stroke="#E91E63" strokeWidth={3} />
            <circle cx={-218} cy={-18} r={4} fill="#880E4F" />
            <circle cx={-218} cy={-2} r={4} fill="#880E4F" />
            <circle cx={150} cy={-60} r={12} fill="#880E4F" />
            <path d="M228,-40 q40,-10 30,40" fill="none" stroke="#E91E63" strokeWidth={6} strokeLinecap="round" />
            <rect x={-90} y={140} width={34} height={60} rx={8} fill="#F48FB1" stroke="#E91E63" strokeWidth={3} />
            <rect x={60} y={140} width={34} height={60} rx={8} fill="#F48FB1" stroke="#E91E63" strokeWidth={3} />
            <rect x={-40} y={-172} width={80} height={14} rx={7} fill="#880E4F" />
          </g>
          {/* falling coin */}
          <g transform={`translate(700 ${dropY}) rotate(${dropRot.toFixed(1)})`} opacity={dropOp}>
            <ellipse rx={44} ry={44} fill="url(#coinGold)" stroke="#E65100" strokeWidth={3} />
            <ellipse rx={30} ry={30} fill="none" stroke="#FFE082" strokeWidth={3} />
            <text x={0} y={10} textAnchor="middle" fontFamily="sans-serif" fontSize={34} fontWeight={800} fill="#E65100">$</text>
          </g>
          {/* coin stack */}
          {coins.map((i) => {
            const vis = clamp01((3 + 5 * stackEnv - i) * 1.5);
            if (vis <= 0) return null;
            const y = 900 - i * 34;
            return (
              <g key={i} transform={`translate(1250 ${y}) scale(${vis.toFixed(2)})`} opacity={vis}>
                <ellipse rx={110} ry={26} fill="url(#coinGold)" stroke="#E65100" strokeWidth={3} />
                <ellipse rx={78} ry={16} fill="none" stroke="#FFE082" strokeWidth={3} />
              </g>
            );
          })}
          <text x={700} y={990} textAnchor="middle" fontFamily="sans-serif" fontSize={30} fontWeight={800} fill="#2E7D32">{`${savedPct}% SAVED`}</text>
          <text x={1250} y={990} textAnchor="middle" fontFamily="sans-serif" fontSize={30} fontWeight={800} fill="#2E7D32">SAVINGS JAR</text>
        </svg>
      </Grade>
      <GrainNoise opacity={0.05} seed={40} />
      <Vignette strength={0.14} rgb="60,100,60" />
    </AbsoluteFill>
  );
};
