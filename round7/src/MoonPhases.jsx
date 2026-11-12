import React, {useMemo} from 'react';
import {AbsoluteFill, HtmlInCanvas, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {lensBlur} from '@remotion/effects/lens-blur';
import {clamp01, cyc, fadeIn, fadeOutEnd, mulberry32, smoothstep} from './smooth.js';
import {FxGrain, Grade, Vignette} from './postfx.jsx';

// 11. MOON PHASES — lunar cycle: 8 moon phases morphing in a row, stars
// twinkling, slow drift. Palette 60% #0B1026 deep navy / 30% #C0C8D8 silver
// / 10% #F5C542 gold. Phases appear staggered 60ms, then a gold highlight
// sweeps across (there-and-back, one sweep per loop). Stars twinkle via
// circular noise (integer cycles — seamless). Effects: lensBlur on the
// bokeh starfield background (HtmlInCanvas) + FxGrain (fractalNoise).
// Phase rendering: silver disc + dark disc offset (classic terminator trick);
// waxing lit on the right, waning on the left. Frame 0: bg + stars visible.
const W = 1920;
const H = 1080;
const CY = 520;
const R = 80;

// lit fraction + side per phase (0 = new, 1 = full)
const PHASES = [
  {f: 0, waxing: true, label: 'New'},
  {f: 0.25, waxing: true, label: 'Crescent'},
  {f: 0.5, waxing: true, label: 'Quarter'},
  {f: 0.75, waxing: true, label: 'Gibbous'},
  {f: 1, waxing: true, label: 'Full'},
  {f: 0.75, waxing: false, label: 'Gibbous'},
  {f: 0.5, waxing: false, label: 'Quarter'},
  {f: 0.25, waxing: false, label: 'Crescent'},
];

export const MoonPhases = () => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const p = frame / durationInFrames;

  // Bokeh starfield (CSS radial gradients) softened by lensBlur.
  const bokehBg = useMemo(() => {
    const rand = mulberry32(81);
    const glows = [];
    for (let i = 0; i < 14; i++) {
      const x = Math.round(rand() * 100);
      const y = Math.round(rand() * 100);
      const r = 60 + Math.round(rand() * 160);
      const col = rand() > 0.7 ? '245,197,66' : '192,200,216';
      glows.push(
        `radial-gradient(circle ${r}px at ${x}% ${y}%, rgba(${col},0.5) 0%, rgba(${col},0) 70%)`,
      );
    }
    return glows.join(', ');
  }, []);

  // Sharp twinkling stars (SVG), opacity via integer-cycle sine (seamless).
  const stars = useMemo(() => {
    const rand = mulberry32(811);
    return Array.from({length: 60}, (_, i) => ({
      x: rand() * W,
      y: rand() * H,
      r: 1 + rand() * 2.4,
      k: 1 + Math.floor(rand() * 3),
      ph: rand() * Math.PI * 2,
    }));
  }, []);

  const driftX = Math.cos(2 * Math.PI * p) * 10;
  const driftY = Math.sin(2 * Math.PI * p) * 10;

  // Highlight sweep: gold underline travelling across the 8 phases,
  // there-and-back (one sweep per loop, seamless).
  const sweepX = interpolate(frame, [0, 150, 300], [200, 1740, 200], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{backgroundColor: '#0B1026', overflow: 'hidden'}}>
      <Grade>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(180deg, #0B1026 0%, #0D1430 55%, #080C1E 100%)',
          }}
        />
        {/* bokeh starfield, softened by lensBlur (depth-of-field) */}
        <HtmlInCanvas
          width={W}
          height={H}
          effects={[lensBlur({radius: 6, irisShape: 'hexagon', irisRoundness: 0.5})]}
          effectsOutputSize={{width: W, height: H}}
          style={{position: 'absolute', inset: 0}}
        >
          <div style={{position: 'absolute', inset: 0, background: bokehBg}} />
        </HtmlInCanvas>
        <svg width={W} height={H} style={{position: 'absolute'}}>
          {/* sharp twinkling stars */}
          <g transform={`translate(${driftX.toFixed(1)} ${driftY.toFixed(1)})`}>
            {stars.map((s, i) => (
              <circle
                key={i}
                cx={s.x}
                cy={s.y}
                r={s.r}
                fill="#FFFFFF"
                opacity={0.25 + 0.65 * Math.abs(cyc(p, s.k, s.ph))}
              />
            ))}
          </g>
          {/* 8 moon phases */}
          {PHASES.map((ph, i) => {
            const x = 200 + i * 220;
            const rise = smoothstep((frame - (15 + i * 2)) / 12);
            const op = rise * fadeOutEnd(frame);
            const scale = rise;
            // dark disc offset: (1-f)*2R to the lit side; f=1 -> offset 2R (covers nothing)
            const dx = (ph.waxing ? 1 : -1) * (1 - ph.f) * 2 * R;
            return (
              <g key={i} transform={`translate(${x} ${CY}) scale(${scale.toFixed(3)})`} opacity={op}>
                <circle r={R} fill="#C0C8D8" />
                <circle r={R} fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth={2} />
                {/* terminator: dark disc */}
                <circle cx={dx} cy={0} r={R} fill="#0B1026" />
                {/* re-draw the lit rim on the dark side edge for definition */}
                <circle r={R} fill="none" stroke="rgba(245,197,66,0.25)" strokeWidth={2} />
                <text y={R + 52} textAnchor="middle" fontSize={28} fontWeight={600} fill="#C0C8D8">
                  {ph.label}
                </text>
              </g>
            );
          })}
          {/* highlight sweep underline */}
          <g opacity={fadeIn(frame - 30, 12) * fadeOutEnd(frame) * 0.9}>
            <rect
              x={sweepX - 80}
              y={CY + R + 96}
              width={160}
              height={8}
              rx={4}
              fill="#F5C542"
            />
          </g>
        </svg>
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 130,
            textAlign: 'center',
            color: '#FFFFFF',
            fontSize: 56,
            fontWeight: 700,
            letterSpacing: 6,
            opacity: fadeIn(frame, 12) * fadeOutEnd(frame),
          }}
        >
          MOON PHASES
        </div>
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 210,
            textAlign: 'center',
            color: '#C0C8D8',
            fontSize: 30,
            fontWeight: 500,
            letterSpacing: 4,
            opacity: fadeIn(frame - 12, 12) * fadeOutEnd(frame) * 0.85,
          }}
        >
          THE LUNAR CYCLE
        </div>
      </Grade>
      <FxGrain seed={81} />
      <Vignette strength={0.18} rgb="4,6,16" />
    </AbsoluteFill>
  );
};
