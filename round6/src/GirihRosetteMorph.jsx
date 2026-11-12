import React, {useMemo} from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {evolvePath, getLength} from '@remotion/paths';
import {clamp01, cyc, fadeIn, fadeOutEnd, mulberry32, smoothstep, starPath} from './smooth.js';
import {Grade, GrainNoise, Vignette} from './postfx.jsx';

// 1. GIRIH ROSETTE MORPH — Kaplan polygons-in-contact 4.6.12 rosette.
// Palette 60% #0B2E2B deep teal / 30% #C9A227 gold / 10% #F8F3E8 warm white.
// Loop: slow 45 deg rotation (LINEAR t) on an 8-fold-symmetric rosette, so
// f300 is visually identical to f0. Draw is there-and-back (draw f15-51,
// hold, erase f264-300) so value(300) = value(0) for every property.
// Frame 0: faint background stars + glow are already visible (not empty).
const CX = 960;
const CY = 540;

export const GirihRosetteMorph = () => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const p = frame / durationInFrames;

  const starD = useMemo(() => starPath(CX, CY, 300, 150, 8), []);
  const starLen = useMemo(() => getLength(starD), [starD]);

  // Background tiling: faint small 8-point stars, drifting on a circle
  // through noise space (circular sampling, radius ~8px, k=1, seamless).
  const bgStars = useMemo(() => {
    const rand = mulberry32(61);
    const pts = [];
    for (let gx = 0; gx < 8; gx++) {
      for (let gy = 0; gy < 4; gy++) {
        pts.push({
          x: 120 + gx * 240 + (rand() - 0.5) * 60,
          y: 135 + gy * 270 + (rand() - 0.5) * 60,
          r: 26 + rand() * 22,
          ph: rand() * Math.PI * 2,
        });
      }
    }
    return pts;
  }, []);

  const driftX = Math.cos(2 * Math.PI * p) * 8;
  const driftY = Math.sin(2 * Math.PI * p) * 8;
  const glowOp = 0.22 + 0.03 * cyc(p, 2);

  // Draw progress: draw f15-51, hold to f264, erase to f300.
  const drawProg =
    p < 0.05
      ? 0
      : p < 0.17
        ? smoothstep((p - 0.05) / 0.12)
        : p < 0.88
          ? 1
          : 1 - smoothstep((p - 0.88) / 0.12);
  const starEvolve = evolvePath(drawProg, starD);

  // Rosette rotation: 45 deg over the loop, LINEAR so velocity matches at
  // the seam. 8-fold symmetry makes f300 look identical to f0.
  const rot = p * 45;
  // Inner star morphs (scale breathes with a full sine cycle, k=1).
  const morph = 1 + 0.1 * (0.5 + 0.5 * cyc(p, 1));
  const groupOp = fadeIn(frame, 12) * fadeOutEnd(frame);

  // 8 petals around the rosette, staggered pop-in (2 frames apart).
  const petals = Array.from({length: 8}, (_, i) => {
    const ang = (i * Math.PI) / 4;
    const x = CX + Math.cos(ang) * 205;
    const y = CY + Math.sin(ang) * 205;
    const rise = smoothstep((frame - (15 + i * 2)) / 12);
    const scale = rise * (1 - smoothstep((frame - 285) / 15));
    return {x, y, rot: (ang * 180) / Math.PI + 90, scale};
  });

  return (
    <AbsoluteFill style={{backgroundColor: '#0B2E2B', overflow: 'hidden'}}>
      <Grade>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(135deg, #0B2E2B 0%, #0A2623 55%, #07201D 100%)',
          }}
        />
        {/* background tiling, faint, drifting */}
        <svg width={1920} height={1080} style={{position: 'absolute'}}>
          <g transform={`translate(${driftX.toFixed(1)} ${driftY.toFixed(1)})`}>
            {bgStars.map((s, i) => (
              <polygon
                key={i}
                points={(() => {
                  const pts = [];
                  for (let k = 0; k < 16; k++) {
                    const a = -Math.PI / 2 + (k * Math.PI) / 8;
                    const r = k % 2 === 0 ? s.r : s.r * 0.5;
                    pts.push(
                      `${(s.x + r * Math.cos(a)).toFixed(1)},${(s.y + r * Math.sin(a)).toFixed(1)}`,
                    );
                  }
                  return pts.join(' ');
                })()}
                fill="none"
                stroke="#C9A227"
                strokeWidth={1.5}
                opacity={0.12}
              />
            ))}
          </g>
          {/* warm glow behind the rosette (single light, top-centre) */}
          <ellipse
            cx={CX}
            cy={CY}
            rx={520}
            ry={420}
            fill="#C9A227"
            opacity={glowOp}
          />
          {/* contact shadow under the rosette */}
          <ellipse cx={CX} cy={CY + 330} rx={330} ry={26} fill="#000000" opacity={0.28} />
          {/* rosette group: rotates 45 deg per loop */}
          <g transform={`rotate(${rot.toFixed(2)} ${CX} ${CY})`} opacity={groupOp}>
            {/* outer star, drawn centre-out */}
            <path
              d={starD}
              fill="none"
              stroke="#C9A227"
              strokeWidth={6}
              strokeLinejoin="round"
              strokeDasharray={starEvolve.strokeDasharray}
              strokeDashoffset={starEvolve.strokeDashoffset}
            />
            {/* inner star, morphing scale, rim light */}
            <g transform={`translate(${CX} ${CY}) scale(${morph.toFixed(3)}) translate(${-CX} ${-CY})`}>
              <polygon
                points={(() => {
                  const pts = [];
                  for (let k = 0; k < 16; k++) {
                    const a = -Math.PI / 2 + (k * Math.PI) / 8;
                    const r = k % 2 === 0 ? 190 : 95;
                    pts.push(
                      `${(CX + r * Math.cos(a)).toFixed(1)},${(CY + r * Math.sin(a)).toFixed(1)}`,
                    );
                  }
                  return pts.join(' ');
                })()}
                fill="none"
                stroke="#F8F3E8"
                strokeWidth={3}
                opacity={0.9}
              />
            </g>
            {/* petals */}
            {petals.map((pt, i) => (
              <g
                key={i}
                transform={`translate(${pt.x.toFixed(1)} ${pt.y.toFixed(1)}) rotate(${pt.rot.toFixed(1)}) scale(${pt.scale.toFixed(3)})`}
              >
                <ellipse rx={16} ry={34} fill="#C9A227" opacity={0.85} />
                <ellipse rx={7} ry={18} fill="#F8F3E8" opacity={0.9} />
              </g>
            ))}
            {/* centre dot */}
            <circle cx={CX} cy={CY} r={14} fill="#F8F3E8" />
          </g>
        </svg>
      </Grade>
      <GrainNoise opacity={0.05} seed={61} />
      <Vignette strength={0.16} rgb="4,20,18" />
    </AbsoluteFill>
  );
};
