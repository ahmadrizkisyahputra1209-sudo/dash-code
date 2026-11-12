import React, {useMemo} from 'react';
import {AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {evolvePath, getLength, getPointAtLength, getTangentAtLength} from '@remotion/paths';
import {clamp01, smearFromSpeed, smoothstep} from './smooth.js';
import {Grade, GrainNoise, Vignette} from './postfx.jsx';

// 10. FLIGHT TRACKER MAP — flight path arc, travelling plane, radar sweep.
// Palette 60% #0B1F3A deep navy / 30% #4FA3E3 sky blue / 10% #F5A623 amber.
// Camera: HOLD (map stays stable, spatial continuity).
// Path draws f15-90, holds, erases f240-300 (there-and-back). Plane travels
// exactly 1 traversal per loop (LINEAR), opacity fades at both ends.
// Pins pop staggered 2 frames apart. Radar sweep rotates 1 full turn/loop.
// Frame 0: map + graticule already visible (not empty).
const ARC_D = 'M200,850 Q960,180 1720,700';
const PINS = [
  {x: 200, y: 850, label: 'ORIGIN'},
  {x: 960, y: 478, label: ''},
  {x: 1720, y: 700, label: 'DESTINATION'},
];

export const FlightTrackerMap = () => {
  const frame = useCurrentFrame();
  const {durationInFrames, fps} = useVideoConfig();
  const p = frame / durationInFrames;

  const total = useMemo(() => getLength(ARC_D), []);

  // Path draw: draw f15-90, hold to f240, erase f240-300.
  const drawProg =
    p < 0.05
      ? 0
      : p < 0.3
        ? smoothstep((p - 0.05) / 0.25)
        : p < 0.8
          ? 1
          : 1 - smoothstep((p - 0.8) / 0.2);
  const arcEvolve = evolvePath(drawProg, ARC_D);

  // Plane: 1 traversal per loop, LINEAR.
  const planeProg = clamp01((p - 0.05) / 0.8);
  const planeDist = total * planeProg;
  const planePt = getPointAtLength(ARC_D, planeDist);
  const planeTan = getTangentAtLength(ARC_D, planeDist);
  const planeAngle = (Math.atan2(planeTan.y, planeTan.x) * 180) / Math.PI + 90;
  const planeSpeed = total / (0.8 * 300);
  const smear = smearFromSpeed(planeSpeed, 0.02, 1.25);
  const planeOp = Math.sin(Math.PI * planeProg);

  // Radar sweep at destination: 1 full turn per loop (seamless).
  const sweepDeg = p * 360;
  const sweepLines = [0, -12, -24, -36].map((off, i) => {
    const a = ((sweepDeg + off) * Math.PI) / 180;
    return {
      x2: 1720 + Math.cos(a) * 90,
      y2: 700 + Math.sin(a) * 90,
      op: [0.55, 0.35, 0.2, 0.1][i],
    };
  });

  return (
    <AbsoluteFill style={{backgroundColor: '#0B1F3A', overflow: 'hidden'}}>
      <Grade>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(135deg, #0E2547 0%, #0B1F3A 55%, #081426 100%)',
          }}
        />
        <svg width={1920} height={1080} style={{position: 'absolute'}}>
          {/* graticule */}
          {[320, 640, 960, 1280, 1600].map((x) => (
            <line key={x} x1={x} y1={0} x2={x} y2={1080} stroke="#16345C" strokeWidth={2} />
          ))}
          {[270, 540, 810].map((y) => (
            <line key={y} x1={0} y1={y} x2={1920} y2={y} stroke="#16345C" strokeWidth={2} />
          ))}
          {/* landmass blobs */}
          <ellipse cx={420} cy={300} rx={260} ry={150} fill="#12294A" />
          <ellipse cx={1420} cy={880} rx={320} ry={170} fill="#12294A" />
          <ellipse cx={1560} cy={260} rx={200} ry={120} fill="#12294A" />
          {/* city dots */}
          {[
            [300, 200], [640, 420], [900, 160], [1180, 340], [1500, 520], [700, 900], [1100, 880], [1760, 420],
          ].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r={5} fill="#4FA3E3" opacity={0.7} />
          ))}
          {/* flight path */}
          <path
            d={ARC_D}
            fill="none"
            stroke="#4FA3E3"
            strokeWidth={10}
            strokeLinecap="round"
            strokeDasharray={arcEvolve.strokeDasharray}
            strokeDashoffset={arcEvolve.strokeDashoffset}
            opacity={0.9}
          />
          {/* radar sweep at destination */}
          <circle cx={1720} cy={700} r={90} fill="none" stroke="#F5A623" strokeWidth={2} opacity={0.35} />
          {sweepLines.map((s, i) => (
            <line key={i} x1={1720} y1={700} x2={s.x2.toFixed(1)} y2={s.y2.toFixed(1)} stroke="#F5A623" strokeWidth={3} opacity={s.op} strokeLinecap="round" />
          ))}
          {/* airport pins, staggered pop-in */}
          {PINS.map((pin, i) => {
            const startF = 30 + i * 2;
            const pop = interpolate(frame, [startF, startF + 12], [0, 1], {
              easing: Easing.bezier(0.4, 0, 0.2, 1),
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            });
            const scale = pop * (1 - smoothstep((frame - 285) / 15));
            return (
              <g key={i} transform={`translate(${pin.x} ${pin.y}) scale(${scale.toFixed(3)})`}>
                <path d="M0,0 C-26,-30 -26,-62 0,-62 C26,-62 26,-30 0,0 Z" fill="#F5A623" />
                <circle cx={0} cy={-38} r={11} fill="#FFFFFF" />
                {pin.label && (
                  <text x={0} y={34} textAnchor="middle" fontFamily="sans-serif" fontSize={22} fontWeight={700} letterSpacing={2} fill="#FFFFFF">
                    {pin.label}
                  </text>
                )}
              </g>
            );
          })}
          {/* plane, travelling along the arc */}
          <g
            transform={`translate(${planePt.x.toFixed(1)} ${planePt.y.toFixed(1)}) rotate(${planeAngle.toFixed(1)}) scale(${smear.scaleX.toFixed(3)} ${smear.scaleY.toFixed(3)})`}
            opacity={planeOp}
          >
            <path d="M0,-26 L8,-6 L30,8 L8,4 L6,22 L0,16 L-6,22 L-8,4 L-30,8 L-8,-6 Z" fill="#F5A623" stroke="#FFFFFF" strokeWidth={2} />
          </g>
          {/* header */}
          <text x={80} y={86} fontFamily="sans-serif" fontSize={34} fontWeight={800} letterSpacing={4} fill="#FFFFFF">
            FLIGHT TRACKER
          </text>
          <text x={80} y={126} fontFamily="sans-serif" fontSize={24} fontWeight={600} letterSpacing={3} fill="#4FA3E3">
            LIVE ROUTE — ORIGIN TO DESTINATION
          </text>
        </svg>
      </Grade>
      <GrainNoise opacity={0.05} seed={101} />
      <Vignette strength={0.14} rgb="4,12,26" />
    </AbsoluteFill>
  );
};
