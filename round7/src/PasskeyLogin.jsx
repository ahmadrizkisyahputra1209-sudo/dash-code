import React, {useMemo} from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {evolvePath, getLength} from '@remotion/paths';
import {arcPath, clamp01, eventEnv, fadeIn, fadeOutEnd, smoothstep} from './smooth.js';
import {GrainNoise, Grade, Vignette} from './postfx.jsx';

// 6. PASSKEY LOGIN — fingerprint scan -> passkey key morphing -> checkmark.
// Palette 60% #0D1117 dark navy / 30% #58A6FF electric blue / 10% #3DDC84
// green. Standout niche: only 355 Adobe video results.
// Beats: scan line moves LINEAR (f30-120) -> key draws (f150-210) ->
// checkmark pops (f210-240) -> settle. Every envelope returns to 0 by f300,
// and the base fingerprint is constant, so value(300) = value(0).
// Effects: GrainNoise (replaces FxGrain, fallback). Frame 0: fingerprint base visible.
const W = 1920;
const H = 1080;
const CX = 960;
const CY = 470;

export const PasskeyLogin = () => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const p = frame / durationInFrames;

  // Scan window envelope (f30-135): scan line + fingerprint highlight.
  const scanEnv = eventEnv(p, 0.1, 0.03, 0.27, 0.07);
  const scanY = interpolate(frame, [30, 120], [330, 620], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Key envelope (f141-270) and checkmark envelope (f210-285).
  const keyEnv = eventEnv(p, 0.47, 0.03, 0.3, 0.1);
  const checkEnv = eventEnv(p, 0.7, 0.05, 0.15, 0.1);

  // Fingerprint base: constant 0.35, boosted during scan, hidden while the
  // key is shown; keyEnv returns to 0 by f300 so f300 == f0.
  const fpOp = (0.35 + 0.55 * scanEnv) * (1 - keyEnv);

  // Fingerprint arcs (concentric partial circles).
  const arcs = useMemo(() => {
    const list = [];
    [60, 95, 130, 165].forEach((r, i) => {
      list.push({d: arcPath(CX, CY, r, -2.4 + i * 0.15, 0.7 - i * 0.1), w: 7});
    });
    list.push({d: arcPath(CX, CY, 42, -1.2, 1.8), w: 7});
    return list;
  }, []);

  // Key path: ring + stem + teeth (one path, drawn progressively).
  const keyD = useMemo(
    () =>
      `M${CX + 50} ${CY} A50 50 0 1 1 ${CX - 50} ${CY} A50 50 0 1 1 ${CX + 50} ${CY} ` +
      `M${CX + 48} ${CY} L${CX + 160} ${CY} ` +
      `M${CX + 110} ${CY} L${CX + 110} ${CY + 32} ` +
      `M${CX + 140} ${CY} L${CX + 140} ${CY + 32}`,
    [],
  );
  const keyEvolve = evolvePath(clamp01(keyEnv * 1.4), keyD);

  // Checkmark: circle + check, spring pop at f210.
  const checkD = useMemo(() => 'M-30 2 L-10 22 L32 -22', []);
  const checkEvolve = evolvePath(smoothstep((frame - 215) / 25), checkD);
  const checkScale = spring({
    frame: frame - 210,
    fps: 30,
    config: {damping: 30, stiffness: 300, mass: 1},
  });

  return (
    <AbsoluteFill style={{backgroundColor: '#0D1117', overflow: 'hidden'}}>
      <Grade>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(135deg, #0D1117 0%, #0B0F16 55%, #080B10 100%)',
          }}
        />
        <svg width={W} height={H} style={{position: 'absolute'}}>
          {/* glow behind the fingerprint */}
          <ellipse cx={CX} cy={CY} rx={330} ry={280} fill="#58A6FF" opacity={0.12 + 0.04 * scanEnv} />
          {/* fingerprint arcs */}
          <g opacity={fpOp}>
            {arcs.map((a, i) => (
              <path key={i} d={a.d} fill="none" stroke="#58A6FF" strokeWidth={a.w} strokeLinecap="round" />
            ))}
            <circle cx={CX} cy={CY} r={12} fill="#58A6FF" />
          </g>
          {/* scan line */}
          <g opacity={scanEnv}>
            <line x1={CX - 190} y1={scanY} x2={CX + 190} y2={scanY} stroke="#3DDC84" strokeWidth={5} strokeLinecap="round" />
            <line x1={CX - 190} y1={scanY} x2={CX + 190} y2={scanY} stroke="#3DDC84" strokeWidth={16} strokeLinecap="round" opacity={0.25} />
          </g>
          {/* key */}
          <g opacity={keyEnv}>
            <path
              d={keyD}
              fill="none"
              stroke="#58A6FF"
              strokeWidth={9}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray={keyEvolve.strokeDasharray}
              strokeDashoffset={keyEvolve.strokeDashoffset}
            />
          </g>
          {/* checkmark */}
          <g
            transform={`translate(${CX} ${CY + 260}) scale(${clamp01(checkScale).toFixed(3)})`}
            opacity={checkEnv}
          >
            <circle r={54} fill="#3DDC84" />
            <path
              d={checkD}
              fill="none"
              stroke="#0D1117"
              strokeWidth={9}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray={checkEvolve.strokeDasharray}
              strokeDashoffset={checkEvolve.strokeDashoffset}
            />
          </g>
        </svg>
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 800,
            textAlign: 'center',
            color: '#FFFFFF',
            fontSize: 56,
            fontWeight: 700,
            letterSpacing: 3,
            opacity: fadeIn(frame - 30, 12) * fadeOutEnd(frame),
          }}
        >
          Passkey
        </div>
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 880,
            textAlign: 'center',
            color: '#58A6FF',
            fontSize: 32,
            fontWeight: 500,
            letterSpacing: 4,
            opacity: fadeIn(frame - 45, 12) * fadeOutEnd(frame),
          }}
        >
          PASSWORDLESS SIGN-IN
        </div>
      </Grade>
      <GrainNoise opacity={0.05} seed={76} />
      <Vignette strength={0.18} rgb="4,8,16" />
    </AbsoluteFill>
  );
};
