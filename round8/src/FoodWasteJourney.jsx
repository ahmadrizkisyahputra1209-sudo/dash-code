import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {clamp01, countProg, easeStandard, fadeIn, fadeOutEnd, smoothstep, uiSpring} from './smooth.js';
import {GrainNoise, Grade, Vignette} from './postfx.jsx';

// 6. FOOD WASTE JOURNEY — 1920x1080. Food-flow journey: farm -> shop ->
// home -> bin -> compost, Sankey-style bands, stat cards. Palette 60%
// #2D6A4F leaf green / 30% #F5EFE6 cream / 10% #C65D3B terracotta.
// Text EXACT per plan (UNEP Food Waste Index Report 2024, 2022 data).
// Flow dots travel the full row with period exactly 300 (range 1560px,
// speed 5.2px/frame) and fade at both ends, so the wrap is invisible.
// Stat count-ups: up once, hold, fade f285-300. Frame 0: journey nodes +
// bands visible (not empty).
const W = 1920;
const H = 1080;
const NODES = [
  {label: 'Farm', glyph: 'leaf'},
  {label: 'Shop', glyph: 'bag'},
  {label: 'Home', glyph: 'house'},
  {label: 'Bin', glyph: 'bin'},
  {label: 'Compost', glyph: 'sprout'},
];
const NODE_X = [260, 620, 980, 1340, 1700];
const NODE_Y = 420;

const Glyph = ({kind, x, y}) => {
  if (kind === 'leaf') {
    return (
      <path
        d={`M${x} ${y - 34} Q${x + 34} ${y - 10} ${x} ${y + 30} Q${x - 34} ${y - 10} ${x} ${y - 34} Z`}
        fill="#2D6A4F"
      />
    );
  }
  if (kind === 'bag') {
    return (
      <g>
        <path d={`M${x - 28} ${y - 12} L${x + 28} ${y - 12} L${x + 22} ${y + 32} L${x - 22} ${y + 32} Z`} fill="#2D6A4F" />
        <path d={`M${x - 14} ${y - 12} Q${x - 14} ${y - 34} ${x} ${y - 34} Q${x + 14} ${y - 34} ${x + 14} ${y - 12}`} fill="none" stroke="#2D6A4F" strokeWidth={5} />
      </g>
    );
  }
  if (kind === 'house') {
    return (
      <g>
        <path d={`M${x - 32} ${y + 4} L${x} ${y - 32} L${x + 32} ${y + 4} Z`} fill="#2D6A4F" />
        <rect x={x - 24} y={y + 4} width={48} height={30} fill="#2D6A4F" />
      </g>
    );
  }
  if (kind === 'bin') {
    return (
      <g>
        <path d={`M${x - 26} ${y - 26} L${x + 26} ${y - 26} L${x + 20} ${y + 32} L${x - 20} ${y + 32} Z`} fill="#2D6A4F" />
        <rect x={x - 30} y={y - 34} width={60} height={8} rx={4} fill="#2D6A4F" />
      </g>
    );
  }
  return (
    <g>
      <path d={`M${x} ${y + 32} L${x} ${y - 6}`} stroke="#2D6A4F" strokeWidth={6} strokeLinecap="round" />
      <path d={`M${x} ${y - 6} Q${x - 26} ${y - 30} ${x - 30} ${y - 6} Q${x - 6} ${y + 2} ${x} ${y - 6} Z`} fill="#2D6A4F" />
      <path d={`M${x} ${y - 6} Q${x + 26} ${y - 30} ${x + 30} ${y - 6} Q${x + 6} ${y + 2} ${x} ${y - 6} Z`} fill="#2D6A4F" />
    </g>
  );
};

export const FoodWasteJourney = () => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();

  const nodeSprings = NODES.map((_, i) => uiSpring(frame, 30 + i * 4));
  const titleOp = fadeIn(frame, 12) * fadeOutEnd(frame);
  const bandOp = fadeIn(frame - 20, 12) * fadeOutEnd(frame);

  // Stat count-ups (corrected rule): up once f60-150, hold, fade f285-300.
  const prog1 = countProg(frame, 60, 150);
  const prog2 = countProg(frame, 75, 165);
  const tonnes = (1.05 * prog1).toFixed(2);
  const pct19 = Math.round(19 * prog2);
  const cardOp1 = fadeIn(frame - 45, 12) * fadeOutEnd(frame);
  const cardOp2 = fadeIn(frame - 60, 12) * fadeOutEnd(frame);
  const cardScale1 = clamp01(uiSpring(frame, 45));
  const cardScale2 = clamp01(uiSpring(frame, 60));

  // Share bar grows f90-180 with standard easing, then holds.
  const barGrow = interpolate(frame, [90, 180], [0, 1], {
    easing: easeStandard,
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const barOp = fadeIn(frame - 80, 12) * fadeOutEnd(frame);
  const barX = 140;
  const barW = 1640;
  const segW = [0.6 * barW, 0.28 * barW, 0.12 * barW];

  return (
    <AbsoluteFill style={{backgroundColor: '#2D6A4F', overflow: 'hidden'}}>
      <Grade>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(135deg, #2D6A4F 0%, #26593F 55%, #1E4A34 100%)',
          }}
        />
        {/* title */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 56,
            textAlign: 'center',
            color: '#F5EFE6',
            fontSize: 50,
            fontWeight: 800,
            letterSpacing: 4,
            opacity: titleOp,
          }}
        >
          EARTH DAY 2027 • FOOD FOR OUR PLANET
        </div>
        {/* journey bands + nodes */}
        <svg width={W} height={H} style={{position: 'absolute'}} opacity={bandOp}>
          {NODE_X.slice(0, -1).map((x, i) => (
            <g key={i}>
              <rect x={x + 78} y={NODE_Y - 13} width={NODE_X[i + 1] - x - 156} height={26} rx={13} fill="#C65D3B" opacity={0.55} />
              <path
                d={`M${NODE_X[i + 1] - 84} ${NODE_Y - 16} L${NODE_X[i + 1] - 60} ${NODE_Y} L${NODE_X[i + 1] - 84} ${NODE_Y + 16} Z`}
                fill="#C65D3B"
              />
            </g>
          ))}
          {/* flow dots: period exactly 300, faded at both ends */}
          {Array.from({length: 5}, (_, i) => {
            const x = 180 + ((i * 312 + frame * 5.2) % 1560);
            const op =
              smoothstep((x - 180) / 80) * (1 - smoothstep((x - 1660) / 80));
            return <circle key={i} cx={x} cy={NODE_Y} r={10} fill="#F5EFE6" stroke="#C65D3B" strokeWidth={3} opacity={op} />;
          })}
        </svg>
        <svg width={W} height={H} style={{position: 'absolute'}}>
          {NODES.map((n, i) => {
            const s = clamp01(nodeSprings[i]);
            return (
              <g
                key={n.label}
                transform={`translate(${NODE_X[i]} ${NODE_Y}) scale(${s.toFixed(3)})`}
                opacity={s * fadeOutEnd(frame)}
              >
                <circle r={78} fill="#F5EFE6" stroke="#C65D3B" strokeWidth={4} />
                <Glyph kind={n.glyph} x={0} y={-6} />
              </g>
            );
          })}
        </svg>
        {NODES.map((n, i) => (
          <div
            key={n.label}
            style={{
              position: 'absolute',
              left: NODE_X[i] - 100,
              top: 520,
              width: 200,
              textAlign: 'center',
              color: '#F5EFE6',
              fontSize: 30,
              fontWeight: 600,
              opacity: clamp01(nodeSprings[i]) * fadeOutEnd(frame),
            }}
          >
            {n.label}
          </div>
        ))}
        {/* stat card 1 */}
        <div
          style={{
            position: 'absolute',
            left: 140,
            top: 610,
            width: 790,
            height: 190,
            borderRadius: 24,
            background: '#F5EFE6',
            boxShadow: '0 18px 40px rgba(0,0,0,0.35)',
            padding: '26px 36px',
            transform: `scale(${cardScale1.toFixed(3)})`,
            opacity: cardOp1,
          }}
        >
          <div style={{color: '#2D6A4F', fontSize: 64, fontWeight: 800}}>{tonnes} BILLION</div>
          <div style={{color: '#1E4A34', fontSize: 28, marginTop: 6}}>
            tonnes of food wasted in 2022
          </div>
        </div>
        {/* stat card 2 */}
        <div
          style={{
            position: 'absolute',
            left: 990,
            top: 610,
            width: 790,
            height: 190,
            borderRadius: 24,
            background: '#F5EFE6',
            boxShadow: '0 18px 40px rgba(0,0,0,0.35)',
            padding: '26px 36px',
            transform: `scale(${cardScale2.toFixed(3)})`,
            opacity: cardOp2,
          }}
        >
          <div style={{color: '#2D6A4F', fontSize: 64, fontWeight: 800}}>{pct19}%</div>
          <div style={{color: '#1E4A34', fontSize: 28, marginTop: 6}}>
            of food available to consumers
          </div>
        </div>
        {/* share caption + segmented bar */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 856,
            textAlign: 'center',
            color: '#F5EFE6',
            fontSize: 30,
            fontWeight: 600,
            opacity: barOp,
          }}
        >
          Households 60% • Food service 28% • Retail 12%
        </div>
        <div style={{position: 'absolute', left: barX, top: 912, width: barW, height: 64, display: 'flex', opacity: barOp}}>
          <div style={{width: segW[0] * barGrow, height: 64, background: '#14532D', borderRadius: '16px 0 0 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFFFFF', fontSize: 30, fontWeight: 700, overflow: 'hidden', whiteSpace: 'nowrap'}}>
            {barGrow > 0.5 ? '60%' : ''}
          </div>
          <div style={{width: segW[1] * barGrow, height: 64, background: '#C65D3B', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFFFFF', fontSize: 30, fontWeight: 700, overflow: 'hidden', whiteSpace: 'nowrap'}}>
            {barGrow > 0.5 ? '28%' : ''}
          </div>
          <div style={{width: segW[2] * barGrow, height: 64, background: '#F5EFE6', borderRadius: '0 16px 16px 0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1E4A34', fontSize: 30, fontWeight: 700, overflow: 'hidden', whiteSpace: 'nowrap'}}>
            {barGrow > 0.5 ? '12%' : ''}
          </div>
        </div>
      </Grade>
      <GrainNoise opacity={0.05} seed={86} />
      <Vignette strength={0.16} rgb="10,32,20" />
    </AbsoluteFill>
  );
};
