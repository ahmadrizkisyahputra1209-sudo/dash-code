import React, {useMemo} from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {evolvePath, getLength} from '@remotion/paths';
import {cyc, fadeIn, fadeOutEnd, mulberry32, smoothstep, starPath, triWave} from './smooth.js';
import {GrainNoise, Grade, Vignette} from './postfx.jsx';

// 3. EID AL-ADHA — crescent + geometric star pattern + lanterns, warm glow.
// Palette 60% #0B2E2B deep teal / 30% #C9A227 gold / 10% #F8F3E8 warm white.
// Text EXACT (Latin only): "Eid al-Adha". NO date on screen (moon-sighting
// +/-1 day). Rotation 45 deg on 8-fold symmetry (same rule as
// GirihRosetteMorph round 6). Effects: bokeh background (lensBlur removed, fallback)
// (fallback: no HtmlInCanvas) + GrainNoise (replaces FxGrain). Frame 0: bg glow + faint pattern
// already visible (not empty).
const W = 1920;
const H = 1080;
const CX = 960;
const CY = 560;

export const EidAlAdha = () => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const p = frame / durationInFrames;

  const starD = useMemo(() => starPath(CX, CY, 260, 130, 8), []);
  const starLen = useMemo(() => getLength(starD), [starD]);

  // Background tiling: faint small 8-point stars, drifting on a circle.
  const bgStars = useMemo(() => {
    const rand = mulberry32(73);
    const pts = [];
    for (let gx = 0; gx < 8; gx++) {
      for (let gy = 0; gy < 4; gy++) {
        pts.push({
          x: 120 + gx * 240 + (rand() - 0.5) * 60,
          y: 135 + gy * 270 + (rand() - 0.5) * 60,
          r: 22 + rand() * 18,
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
  const rot = p * 45;
  const groupOp = fadeIn(frame, 12) * fadeOutEnd(frame);

  // Lanterns: sway +/-2 deg (integer sine cycles, seamless), glow breathe.
  const lanterns = [
    {x: 420, y: 700, s: 0.9, ph: 0},
    {x: 960, y: 760, s: 1.1, ph: 2.1},
    {x: 1500, y: 700, s: 0.9, ph: 4.2},
  ];

  // Bokeh background (CSS radial gradients) blurred by lensBlur — the blur
  // layer is an HtmlInCanvas so the effect has a real raster source.
  const bokehBg = useMemo(() => {
    const rand = mulberry32(731);
    const glows = [];
    for (let i = 0; i < 10; i++) {
      const x = Math.round(rand() * 100);
      const y = Math.round(rand() * 100);
      const r = 120 + Math.round(rand() * 220);
      glows.push(
        `radial-gradient(circle ${r}px at ${x}% ${y}%, rgba(201,162,39,0.55) 0%, rgba(201,162,39,0) 70%)`,
      );
    }
    return glows.join(', ');
  }, []);

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
      {/* bokeh background (lensBlur removed, fallback) */}
          <div style={{position: 'absolute', inset: 0, background: bokehBg}} />
        <svg width={W} height={H} style={{position: 'absolute'}}>
          {/* faint star tiling */}
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
          {/* warm glow behind the rosette */}
          <ellipse cx={CX} cy={CY} rx={480} ry={380} fill="#C9A227" opacity={glowOp} />
          {/* crescent moon (mask-cut, so it reads on any background) */}
          <defs>
            <mask id="eid-crescent">
              <rect x={0} y={0} width={W} height={H} fill="white" />
              <circle cx={1000} cy={300} r={96} fill="black" />
            </mask>
          </defs>
          <g opacity={fadeIn(frame, 12) * fadeOutEnd(frame)}>
            <circle cx={960} cy={315} r={108} fill="#C9A227" mask="url(#eid-crescent)" />
            <polygon
              points="1090,180 1096,198 1115,198 1100,209 1105,227 1090,216 1075,227 1080,209 1065,198 1084,198"
              fill="#F8F3E8"
            />
          </g>
          {/* rosette group: rotates 45 deg per loop (8-fold symmetry) */}
          <g transform={`rotate(${rot.toFixed(2)} ${CX} ${CY})`} opacity={groupOp}>
            <path
              d={starD}
              fill="none"
              stroke="#C9A227"
              strokeWidth={6}
              strokeLinejoin="round"
              strokeDasharray={starEvolve.strokeDasharray}
              strokeDashoffset={starEvolve.strokeDashoffset}
            />
            <circle cx={CX} cy={CY} r={14} fill="#F8F3E8" />
          </g>
          {/* lanterns */}
          {lanterns.map((L, i) => {
            const sway = 2 * cyc(p, 2, L.ph);
            const lGlow = 0.85 + 0.15 * cyc(p, 2, L.ph + 1.3);
            return (
              <g
                key={i}
                transform={`translate(${L.x} ${L.y}) rotate(${sway.toFixed(2)}) scale(${L.s})`}
                opacity={fadeIn(frame - (40 + i * 2), 10) * fadeOutEnd(frame)}
              >
                <line x1={0} y1={-110} x2={0} y2={-58} stroke="#C9A227" strokeWidth={4} />
                <rect x={-34} y={-58} width={68} height={96} rx={10} fill="#C9A227" opacity={lGlow} />
                <rect x={-34} y={-58} width={68} height={96} rx={10} fill="none" stroke="#8A6D1F" strokeWidth={3} />
                <line x1={-34} y1={-30} x2={34} y2={-30} stroke="#8A6D1F" strokeWidth={2} />
                <line x1={-34} y1={0} x2={34} y2={0} stroke="#8A6D1F" strokeWidth={2} />
                <rect x={-14} y={38} width={28} height={10} rx={4} fill="#C9A227" />
                <line x1={0} y1={48} x2={0} y2={78} stroke="#C9A227" strokeWidth={3} />
                <circle cx={0} cy={84} r={6} fill="#F8F3E8" />
              </g>
            );
          })}
        </svg>
        {/* text: Eid al-Adha (Latin only) */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 920,
            textAlign: 'center',
            color: '#F8F3E8',
            fontSize: 64,
            fontWeight: 700,
            letterSpacing: 4,
            opacity: fadeIn(frame - 30, 15) * fadeOutEnd(frame),
            transform: `translateY(${interpolate(frame, [30, 45], [24, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}).toFixed(1)}px)`,
          }}
        >
          Eid al-Adha
        </div>
      </Grade>
      <GrainNoise opacity={0.05} seed={73} />
      <Vignette strength={0.16} rgb="4,20,18" />
    </AbsoluteFill>
  );
};
