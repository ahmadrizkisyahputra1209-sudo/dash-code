import React, {useMemo} from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {getPointAtLength} from '@remotion/paths';
import {circlePath, clamp01, cyc, fadeIn, fadeOutEnd, mulberry32, smoothstep} from './smooth.js';
import {GrainNoise, Grade, Vignette} from './postfx.jsx';

// 2. EARTH DAY FOOD CYCLE — seed -> plant -> harvest -> plate -> compost,
// one full cycle per loop. Palette 60% #2D6A4F earth green / 30% #8B5E3C
// warm brown / 10% #F5C542 sun yellow. Earth Day text only (theme wordmark
// NOT on screen). A dot travels the ring LINEAR (1 rev/loop); nodes highlight
// as the dot passes (angular distance, periodic in p — seamless).
// Frame 0: ring + nodes faintly visible (not empty).
const W = 1920;
const H = 1080;
const CX = 960;
const CY = 540;
const R = 330;

const NODES = [
  {label: 'Seed', angle: -Math.PI / 2},
  {label: 'Plant', angle: -Math.PI / 2 + (2 * Math.PI) / 5},
  {label: 'Harvest', angle: -Math.PI / 2 + (4 * Math.PI) / 5},
  {label: 'Plate', angle: -Math.PI / 2 + (6 * Math.PI) / 5},
  {label: 'Compost', angle: -Math.PI / 2 + (8 * Math.PI) / 5},
];

export const EarthDayFoodCycle = () => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const p = frame / durationInFrames;

  const ringD = useMemo(() => circlePath(CX, CY, R), []);
  const ringLen = useMemo(() => {
    // circlePath length = 2*PI*R
    return 2 * Math.PI * R;
  }, []);

  // Traveling dot: LINEAR t over the loop (1 rev). getPointAtLength wraps
  // cleanly because the path is closed (end point == start point).
  const dotT = p;
  const dotPt = getPointAtLength(ringD, dotT * ringLen);
  const dotAngle = -Math.PI / 2 + p * 2 * Math.PI;

  // Background leaf dots drifting on a circle (seamless).
  const driftX = Math.cos(2 * Math.PI * p) * 10;
  const driftY = Math.sin(2 * Math.PI * p) * 10;

  const ringOp = fadeIn(frame, 12) * fadeOutEnd(frame);
  const centerOp = fadeIn(frame - 30, 12) * fadeOutEnd(frame);

  const angDist = (a, b) => {
    let d = Math.abs(a - b) % (2 * Math.PI);
    return d > Math.PI ? 2 * Math.PI - d : d;
  };

  return (
    <AbsoluteFill style={{backgroundColor: '#2D6A4F', overflow: 'hidden'}}>
      <Grade>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(135deg, #2D6A4F 0%, #245741 55%, #1B4232 100%)',
          }}
        />
        <svg width={W} height={H} style={{position: 'absolute'}}>
          <g transform={`translate(${driftX.toFixed(1)} ${driftY.toFixed(1)})`}>
            {Array.from({length: 20}, (_, i) => {
              const rand = mulberry32(72 + i);
              return (
                <circle
                  key={i}
                  cx={rand() * W}
                  cy={rand() * H}
                  r={3 + rand() * 4}
                  fill="#F5C542"
                  opacity={0.1}
                />
              );
            })}
          </g>
          {/* cycle ring */}
          <g opacity={ringOp}>
            <circle cx={CX} cy={CY} r={R} fill="none" stroke="#F5C542" strokeWidth={5} opacity={0.85} />
            {/* chevron arrows between nodes, pulsing as the dot passes */}
            {NODES.map((n, i) => {
              const mid = n.angle + Math.PI / 5;
              const ax = CX + Math.cos(mid) * R;
              const ay = CY + Math.sin(mid) * R;
              const near = 1 - clamp01(angDist(dotAngle, mid) / 0.6);
              return (
                <g
                  key={i}
                  transform={`translate(${ax.toFixed(1)} ${ay.toFixed(1)}) rotate(${((mid * 180) / Math.PI + 90).toFixed(1)})`}
                  opacity={0.35 + 0.6 * near}
                >
                  <polygon points="0,-14 12,10 -12,10" fill="#F5C542" />
                </g>
              );
            })}
          </g>
          {/* center emblem: leaf + Earth Day */}
          <g opacity={centerOp}>
            <circle cx={CX} cy={CY} r={120} fill="#1B4232" opacity={0.85} />
            <circle cx={CX} cy={CY} r={120} fill="none" stroke="#F5C542" strokeWidth={3} opacity={0.7} />
            <ellipse cx={CX} cy={CY - 18} rx={52} ry={30} fill="#3DDC97" transform={`rotate(-30 ${CX} ${CY - 18})`} />
            <ellipse cx={CX} cy={CY - 18} rx={52} ry={30} fill="none" stroke="#2D6A4F" strokeWidth={3} transform={`rotate(-30 ${CX} ${CY - 18})`} />
            <text x={CX} y={CY + 52} textAnchor="middle" fontSize={34} fontWeight={700} fill="#F8F3E8">
              Earth Day
            </text>
          </g>
          {/* nodes */}
          {NODES.map((n, i) => {
            const x = CX + Math.cos(n.angle) * R;
            const y = CY + Math.sin(n.angle) * R;
            const rise = smoothstep((frame - (15 + i * 2)) / 12);
            const near = 1 - clamp01(angDist(dotAngle, n.angle) / 0.5);
            const scale = rise * (1 + 0.12 * near) * (1 - smoothstep((frame - 285) / 15));
            const op = rise * fadeOutEnd(frame);
            return (
              <g key={n.label} transform={`translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(${scale.toFixed(3)})`} opacity={op}>
                <circle r={64} fill="#F8F3E8" />
                <circle r={64} fill="none" stroke="#8B5E3C" strokeWidth={4} />
                {n.label === 'Seed' && <ellipse rx={16} ry={24} fill="#8B5E3C" />}
                {n.label === 'Plant' && (
                  <>
                    <path d="M0 26 C-4 6 -22 -6 -30 -22 C-10 -20 0 -8 0 26 Z" fill="#3DDC97" />
                    <path d="M0 26 C4 6 22 -6 30 -22 C10 -20 0 -8 0 26 Z" fill="#2D6A4F" />
                  </>
                )}
                {n.label === 'Harvest' && (
                  <>
                    <line x1={0} y1={28} x2={0} y2={-28} stroke="#E8B84B" strokeWidth={5} strokeLinecap="round" />
                    <line x1={0} y1={-8} x2={-18} y2={-22} stroke="#E8B84B" strokeWidth={5} strokeLinecap="round" />
                    <line x1={0} y1={-8} x2={18} y2={-22} stroke="#E8B84B" strokeWidth={5} strokeLinecap="round" />
                    <line x1={0} y1={8} x2={-18} y2={-6} stroke="#E8B84B" strokeWidth={5} strokeLinecap="round" />
                    <line x1={0} y1={8} x2={18} y2={-6} stroke="#E8B84B" strokeWidth={5} strokeLinecap="round" />
                  </>
                )}
                {n.label === 'Plate' && (
                  <>
                    <circle r={26} fill="none" stroke="#1B3A5C" strokeWidth={5} />
                    <circle r={12} fill="#1B3A5C" opacity={0.8} />
                  </>
                )}
                {n.label === 'Compost' && (
                  <>
                    <ellipse rx={24} ry={14} fill="#8B5E3C" transform="rotate(-25)" />
                    <circle cx={-12} cy={-12} r={5} fill="#3DDC97" />
                    <circle cx={10} cy={-14} r={5} fill="#F5C542" />
                    <circle cx={14} cy={8} r={5} fill="#3DDC97" />
                  </>
                )}
                <text y={92} textAnchor="middle" fontSize={30} fontWeight={700} fill="#FFFFFF">
                  {n.label}
                </text>
              </g>
            );
          })}
          {/* traveling dot + trail (closed path: wrap is continuous) */}
          {[0, 0.02, 0.04].map((off, i) => {
            const t = ((dotT - off) % 1 + 1) % 1;
            const pt = getPointAtLength(ringD, t * ringLen);
            return (
              <circle key={i} cx={pt.x} cy={pt.y} r={16 - i * 4} fill="#F5C542" opacity={(0.95 - i * 0.3) * ringOp} />
            );
          })}
        </svg>
      </Grade>
      <GrainNoise opacity={0.05} seed={72} />
      <Vignette strength={0.16} rgb="10,40,26" />
    </AbsoluteFill>
  );
};
