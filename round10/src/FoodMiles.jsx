import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {Trail} from '@remotion/motion-blur';
import {clamp01, easeMove, easeOut, fadeIn, fadeOutEnd, revealScale, uiSpring} from './smooth.js';
import {GrainNoise, Grade, Vignette} from './postfx.jsx';

// 11. FOOD MILES — 1920x1080. Schematic farm → ship → plate route
// (remotion-maps pattern, code-drawn — no tiles): dashed route
// draw-on + moving ship marker (Trail). Palette 60% #2D6A4F leaf
// green / 30% #E8D5B5 sand / 10% #C65D3B terracotta.
// Text EXACT: "FOOD MILES" · "FARM → SHIP → PLATE" ·
// "~0.8 Gt CO₂ / YEAR (EST.)" · "EARTH DAY — 22 APR 2027".
// The 0.8 Gt figure is a preprint estimate — "(EST.)" is on screen.
// Frame 0: gradient + route shell visible.
const W = 1920;
const H = 1080;
const STOPS = [
  {x: 300, y: 560},
  {x: 960, y: 560},
  {x: 1620, y: 560},
];

const pointOnRoute = (t) => {
  if (t < 0.5) {
    const u = t / 0.5;
    return {x: STOPS[0].x + (STOPS[1].x - STOPS[0].x) * u, y: STOPS[0].y};
  }
  const u = (t - 0.5) / 0.5;
  return {x: STOPS[1].x + (STOPS[2].x - STOPS[1].x) * u, y: STOPS[1].y};
};

export const FoodMiles = () => {
  const frame = useCurrentFrame();
  const fade = fadeOutEnd(frame);

  const routeProg = interpolate(frame, [30, 150], [0, 1], {
    easing: easeOut,
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const shipT = interpolate(frame, [60, 240], [0, 1], {
    easing: easeMove,
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const ship = pointOnRoute(shipT);
  const shipOp = fadeIn(frame - 60, 12) * fade;

  return (
    <AbsoluteFill style={{backgroundColor: '#2D6A4F', overflow: 'hidden'}}>
      <Grade>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(135deg, #2D6A4F 0%, #245741 60%, #1B4232 100%)',
          }}
        />
        {/* header */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 90,
            width: W,
            textAlign: 'center',
            color: '#FFFFFF',
            fontSize: 110,
            fontWeight: 900,
            letterSpacing: 8,
            scale: revealScale(frame, 10, 18),
            opacity: fadeIn(frame - 10, 12) * fade,
          }}
        >
          FOOD MILES
        </div>
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 230,
            width: W,
            textAlign: 'center',
            color: '#E8D5B5',
            fontSize: 64,
            fontWeight: 800,
            letterSpacing: 4,
            scale: clamp01(uiSpring(frame, 22)),
            opacity: fadeIn(frame - 22, 12) * fade,
          }}
        >
          FARM → SHIP → PLATE
        </div>
        {/* route + stations */}
        <svg width={W} height={H} style={{position: 'absolute'}}>
          <line
            x1={300}
            y1={560}
            x2={1620}
            y2={560}
            stroke="#E8D5B5"
            strokeWidth={8}
            strokeLinecap="round"
            pathLength={1}
            strokeDasharray={1}
            strokeDashoffset={1 - routeProg}
            opacity={0.7 * fade}
          />
          {/* farm barn */}
          <g opacity={fade}>
            <rect x={250} y={600} width={100} height={80} fill="#E8D5B5" />
            <path d="M 235 605 L 300 550 L 365 605 Z" fill="#C65D3B" />
            <rect x={288} y={640} width={24} height={40} fill="#2D6A4F" />
          </g>
          {/* plate */}
          <g opacity={fade}>
            <circle cx={1620} cy={640} r={52} fill="#F5EFE6" />
            <circle cx={1620} cy={640} r={34} fill="none" stroke="#C65D3B" strokeWidth={4} />
            <circle cx={1620} cy={640} r={12} fill="#C65D3B" />
          </g>
        </svg>
        {/* moving ship marker (fast element — Trail) */}
        <div
          style={{
            position: 'absolute',
            left: ship.x - 60,
            top: ship.y - 100,
            opacity: shipOp,
          }}
        >
          <Trail layers={6} lagInFrames={1} trailOpacity={0.5}>
            <svg width={120} height={80}>
              <path d="M 10 55 L 110 55 L 95 78 L 25 78 Z" fill="#E8D5B5" />
              <rect x={52} y={18} width={8} height={38} fill="#E8D5B5" />
              <path d="M 60 18 L 60 48 L 92 48 Z" fill="#C65D3B" />
            </svg>
          </Trail>
        </div>
        {/* station labels */}
        <div
          style={{
            position: 'absolute',
            left: 220,
            top: 720,
            width: 160,
            textAlign: 'center',
            color: '#E8D5B5',
            fontSize: 40,
            fontWeight: 800,
            letterSpacing: 2,
            opacity: fadeIn(frame - 80, 12) * fade,
          }}
        >
          FARM
        </div>
        <div
          style={{
            position: 'absolute',
            left: 880,
            top: 720,
            width: 160,
            textAlign: 'center',
            color: '#E8D5B5',
            fontSize: 40,
            fontWeight: 800,
            letterSpacing: 2,
            opacity: fadeIn(frame - 120, 12) * fade,
          }}
        >
          SHIP
        </div>
        <div
          style={{
            position: 'absolute',
            left: 1540,
            top: 720,
            width: 160,
            textAlign: 'center',
            color: '#E8B84B',
            fontSize: 40,
            fontWeight: 800,
            letterSpacing: 2,
            opacity: fadeIn(frame - 160, 12) * fade,
          }}
        >
          PLATE
        </div>
        {/* stat card */}
        <div
          style={{
            position: 'absolute',
            left: 560,
            top: 830,
            width: 800,
            height: 120,
            borderRadius: 24,
            background: '#C65D3B',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
            fontSize: 52,
            fontWeight: 800,
            letterSpacing: 1,
            boxShadow: '0 18px 40px rgba(0,0,0,0.35)',
            scale: clamp01(uiSpring(frame, 170)),
            opacity: fadeIn(frame - 170, 12) * fade,
          }}
        >
          ~0.8 Gt CO₂ / YEAR (EST.)
        </div>
        {/* Earth Day footer */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 990,
            width: W,
            textAlign: 'center',
            color: '#F5EFE6',
            fontSize: 40,
            fontWeight: 700,
            letterSpacing: 5,
            scale: clamp01(uiSpring(frame, 190)),
            opacity: fadeIn(frame - 190, 12) * fade,
          }}
        >
          EARTH DAY — 22 APR 2027
        </div>
      </Grade>
      <GrainNoise opacity={0.05} seed={111} />
      <Vignette strength={0.16} rgb="16,40,28" />
    </AbsoluteFill>
  );
};
