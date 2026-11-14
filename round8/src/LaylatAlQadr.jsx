import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {arcPath, clamp01, cyc, fadeIn, fadeOutEnd, mulberry32, uiSpring} from './smooth.js';
import {GrainNoise, Grade, Vignette} from './postfx.jsx';

// 3. LAYLAT AL-QADR — 1920x1080. Night tracker: 5 odd-night markers in a
// row, 27th highlighted, crescent progress arc sweeping. Palette 60%
// #0B1026 midnight blue / 30% #C9A227 gold / 10% #F8F3E8 soft white.
// Text EXACT per plan. Arc sweeps out and back (f0-150 fill, f150-300
// empty) so the loop is seamless. Frame 0: night gradient + stars + arc
// track + marker shells visible (not empty).
const W = 1920;
const H = 1080;
const NIGHTS = ['21', '23', '25', '27', '29'];
const MARK_X = [560, 760, 960, 1160, 1360];
const MARK_Y = 640;

export const LaylatAlQadr = () => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const p = frame / durationInFrames;

  // Crescent progress arc: upper semicircle, fills f0-150, empties f150-300.
  const arcD = arcPath(960, MARK_Y, 360, Math.PI, 2 * Math.PI);
  const arcLen = Math.PI * 360;
  const arcProg = interpolate(frame, [0, 150, 300], [0, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const markerSprings = NIGHTS.map((_, i) => uiSpring(frame, 30 + i * 3));
  const titleOp = fadeIn(frame, 12) * fadeOutEnd(frame);
  const subOp = fadeIn(frame - 90, 12) * fadeOutEnd(frame);
  const glowOp = 0.45 + 0.2 * cyc(p, 1);

  return (
    <AbsoluteFill style={{backgroundColor: '#0B1026', overflow: 'hidden'}}>
      <Grade>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(180deg, #0B1026 0%, #101736 55%, #0A0E22 100%)',
          }}
        />
        {/* twinkling stars (sin-based, seamless) */}
        <svg width={W} height={H} style={{position: 'absolute'}}>
          {Array.from({length: 26}, (_, i) => {
            const rand = mulberry32(83 + i);
            const x = rand() * W;
            const y = rand() * 500;
            const tw = 0.2 + 0.35 * (0.5 + 0.5 * cyc(p, 1, i * 0.9));
            return <circle key={i} cx={x} cy={y} r={2.5} fill="#F8F3E8" opacity={tw} />;
          })}
        </svg>
        {/* small crescent top-right */}
        <svg width={W} height={H} style={{position: 'absolute'}}>
          <defs>
            <mask id="qadr-crescent">
              <rect x={1560} y={60} width={200} height={200} fill="white" />
              <circle cx={1690} cy={130} r={52} fill="black" />
            </mask>
          </defs>
          <circle cx={1640} cy={150} r={58} fill="#C9A227" mask="url(#qadr-crescent)" />
        </svg>
        {/* progress arc */}
        <svg width={W} height={H} style={{position: 'absolute'}}>
          <path d={arcD} fill="none" stroke="#C9A227" strokeWidth={6} opacity={0.18} />
          <path
            d={arcD}
            fill="none"
            stroke="#C9A227"
            strokeWidth={8}
            strokeLinecap="round"
            strokeDasharray={`${arcLen}`}
            strokeDashoffset={arcLen * (1 - arcProg)}
            opacity={fadeIn(frame - 15, 12) * fadeOutEnd(frame)}
          />
          {/* connector line behind markers */}
          <line x1={480} y1={MARK_Y} x2={1440} y2={MARK_Y} stroke="#C9A227" strokeWidth={3} opacity={0.25} />
        </svg>
        {/* odd-night markers */}
        <svg width={W} height={H} style={{position: 'absolute'}}>
          {NIGHTS.map((n, i) => {
            const s = clamp01(markerSprings[i]);
            const is27 = n === '27';
            const r = is27 ? 78 : 62;
            return (
              <g
                key={n}
                transform={`translate(${MARK_X[i]} ${MARK_Y}) scale(${s.toFixed(3)})`}
                opacity={s * fadeOutEnd(frame)}
              >
                {is27 && (
                  <circle r={96} fill="none" stroke="#C9A227" strokeWidth={3} opacity={glowOp} />
                )}
                <circle
                  r={r}
                  fill={is27 ? '#C9A227' : '#131B3A'}
                  stroke="#C9A227"
                  strokeWidth={3}
                />
                <text
                  y={16}
                  textAnchor="middle"
                  fontSize={44}
                  fontWeight={800}
                  fill={is27 ? '#0B1026' : '#F8F3E8'}
                >
                  {n}
                </text>
              </g>
            );
          })}
        </svg>
        {/* title */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 64,
            textAlign: 'center',
            color: '#C9A227',
            fontSize: 54,
            fontWeight: 800,
            letterSpacing: 8,
            opacity: titleOp,
          }}
        >
          THE LAST 10 NIGHTS
        </div>
        {/* subtitles */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 800,
            textAlign: 'center',
            color: '#FFFFFF',
            fontSize: 42,
            fontWeight: 600,
            opacity: subOp,
          }}
        >
          Laylat al-Qadr • 27th night • 5 Mar 2027
        </div>
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 880,
            textAlign: 'center',
            color: '#F8F3E8',
            fontSize: 32,
            opacity: subOp * 0.8,
          }}
        >
          Odd nights: 27 Feb, 1, 3, 5, 7 Mar 2027
        </div>
      </Grade>
      <GrainNoise opacity={0.05} seed={83} />
      <Vignette strength={0.16} rgb="5,6,20" />
    </AbsoluteFill>
  );
};
