import React from 'react';
import {AbsoluteFill, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {cyc, triWave} from './smooth.js';
import {Grade, GrainNoise, Vignette} from './postfx.jsx';

// 12. WAYANG SHADOW — wayang kulit shadow puppet theatre.
// Palette 60% #2B1D12 warm dark / 30% #E8A33D amber glow / 10% #F5E9D0 cream.
// Parallax 3 layers driven by one camera t: screen 0.3x / gunungan 0.7x /
// puppet 1.0x. Puppet arm sways on a pendulum spring (damping 10, period
// 150 frames — divides 300, seamless). Screen glow flickers +-3%
// (sine k=3). Grain 0.07 for the shadow-play feel.
// Frame 0: screen, gunungan and puppet already visible (not empty).
export const WayangShadow = () => {
  const frame = useCurrentFrame();
  const {durationInFrames, fps} = useVideoConfig();
  const p = frame / durationInFrames;

  // One camera t drives all parallax layers.
  const camX = 12 * cyc(p, 1);
  const screenX = 0.3 * camX;
  const gununganX = 0.7 * camX;
  const puppetX = 1.0 * camX;

  // Glow flicker +-3% (sine k=3, seamless).
  const glowOp = 0.5 + 0.03 * cyc(p, 3);

  // Puppet arm: pendulum spring over a 150-frame triangle wave
  // (period divides 300, so the motion is seamless). Damping 10 = playful.
  const armSpring = spring({
    frame: triWave(frame, 150),
    fps,
    config: {damping: 10, stiffness: 120, mass: 1},
  });
  const armRot = (armSpring - 0.5) * 0.3;
  // Whole puppet sways gently.
  const puppetRot = 0.03 * cyc(p, 1);

  return (
    <AbsoluteFill style={{backgroundColor: '#2B1D12', overflow: 'hidden'}}>
      <Grade>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'radial-gradient(circle at 50% 50%, #3A2A1A 0%, #2B1D12 60%, #1E130A 100%)',
          }}
        />
        <svg width={1920} height={1080} style={{position: 'absolute'}}>
          {/* screen glow (0.3x layer) */}
          <g transform={`translate(${screenX.toFixed(1)} 0)`}>
            <ellipse cx={960} cy={540} rx={820} ry={520} fill="#E8A33D" opacity={glowOp} />
            {/* screen */}
            <rect x={260} y={140} width={1400} height={800} rx={8} fill="#F5E9D0" />
            <rect x={260} y={140} width={1400} height={800} rx={8} fill="none" stroke="#1A120B" strokeWidth={16} />
            {/* screen texture: faint vertical weave lines */}
            {Array.from({length: 14}, (_, i) => (
              <line
                key={i}
                x1={340 + i * 100}
                y1={150}
                x2={340 + i * 100}
                y2={930}
                stroke="#E8A33D"
                strokeWidth={2}
                opacity={0.08}
              />
            ))}
          </g>
          {/* gunungan (0.7x layer): mountain centrepiece */}
          <g transform={`translate(${gununganX.toFixed(1)} 0)`}>
            <path d="M760,860 L960,300 L1160,860 Z" fill="#1A120B" />
            <path d="M830,860 L960,470 L1090,860 Z" fill="#2B1D12" />
            <circle cx={960} cy={420} r={26} fill="#F5E9D0" opacity={0.85} />
            <circle cx={900} cy={560} r={14} fill="#F5E9D0" opacity={0.7} />
            <circle cx={1020} cy={560} r={14} fill="#F5E9D0" opacity={0.7} />
            <circle cx={960} cy={660} r={18} fill="#F5E9D0" opacity={0.7} />
            <path d="M860,760 Q960,700 1060,760" fill="none" stroke="#F5E9D0" strokeWidth={4} opacity={0.6} />
          </g>
          {/* puppet (1.0x layer): wayang silhouette, right side */}
          <g transform={`translate(${(1250 + puppetX).toFixed(1)} 300) rotate(${puppetRot.toFixed(3)} 0 300)`}>
            {/* rim light on the right edge */}
            <path d="M26,60 C34,180 32,300 22,420" fill="none" stroke="#E8A33D" strokeWidth={3} opacity={0.4} />
            {/* crown + head (profile, nose pointing left) */}
            <path d="M-14,-4 L-4,-110 L6,-140 L14,-100 L22,-20 Z" fill="#1A120B" />
            <ellipse cx={0} cy={40} rx={26} ry={44} fill="#1A120B" />
            <path d="M-20,30 L-58,44 L-20,56 Z" fill="#1A120B" />
            {/* body: long slim robe */}
            <path d="M-24,80 C-30,200 -20,320 -8,420 L24,420 C30,300 28,180 20,80 Z" fill="#1A120B" />
            {/* swaying arm + rod (pendulum spring) */}
            <g transform={`rotate(${(armRot * 180) / Math.PI} -16 110)`}>
              <path d="M-16,110 L-150,170 L-158,184 L-10,128 Z" fill="#1A120B" />
              <line x1={-152} y1={176} x2={-176} y2={330} stroke="#1A120B" strokeWidth={5} strokeLinecap="round" />
            </g>
            {/* resting arm */}
            <path d="M16,120 L60,260 L52,272 L8,138 Z" fill="#1A120B" />
          </g>
        </svg>
      </Grade>
      <GrainNoise opacity={0.07} seed={121} />
      <Vignette strength={0.22} rgb="20,12,6" />
    </AbsoluteFill>
  );
};
