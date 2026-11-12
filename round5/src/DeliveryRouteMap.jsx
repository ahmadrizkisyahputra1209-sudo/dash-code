import React, {useMemo} from 'react';
import {AbsoluteFill, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {evolvePath, getLength, getPointAtLength, getTangentAtLength} from '@remotion/paths';
import {clamp01, cyc, smearFromSpeed, triWave} from './smooth.js';
import {Grade, GrainNoise, Vignette} from './postfx.jsx';

// 11. DELIVERY ROUTE MAP — a city map where the delivery route draws itself
// (evolvePath, draw then erase once per loop), a courier dot travels along
// the route (positioned with getPointAtLength, smeared along its tangent),
// and a destination pin drops with a spring bounce. Dot opacity fades at
// both ends so the wrap is invisible. Frame 0: map + warehouse, route
// just starting to draw.
const ROUTE = 'M200,880 C500,720 640,920 920,640 S1380,320 1700,360';

const smoothstep = (t) => {
  const x = clamp01(t);
  return x * x * (3 - 2 * x);
};

// Same envelope as QrPaymentSuccess's eventEnv (appear, hold, disappear).
const eventEnv = (p, start, rise, hold, fall) => {
  if (p < start) return 0;
  if (p < start + rise) return smoothstep((p - start) / rise);
  if (p < start + rise + hold) return 1;
  if (p < start + rise + hold + fall) return 1 - smoothstep((p - start - rise - hold) / fall);
  return 0;
};

export const DeliveryRouteMap = () => {
  const frame = useCurrentFrame();
  const {durationInFrames, fps} = useVideoConfig();
  const p = frame / durationInFrames;

  const total = useMemo(() => getLength(ROUTE), []);
  const streetsV = [240, 560, 880, 1200, 1520];
  const streetsH = [240, 460, 680, 900];

  // Route draw envelope: draw 0->0.55, hold to 0.8, erase to 1.
  const drawProg = p < 0.55 ? smoothstep(p / 0.55) : p < 0.8 ? 1 : 1 - smoothstep((p - 0.8) / 0.2);
  const routeEvolve = evolvePath(drawProg, ROUTE);

  // Courier dot travels while the route is drawn.
  const dotProg = clamp01((p - 0.08) / 0.72);
  const dotDist = total * dotProg;
  const dotPt = getPointAtLength(ROUTE, dotDist);
  const dotTan = getTangentAtLength(ROUTE, dotDist);
  const dotAngle = (Math.atan2(dotTan.y, dotTan.x) * 180) / Math.PI;
  const dotSpeed = total / (0.72 * 300);
  const smear = smearFromSpeed(dotSpeed, 0.02, 1.25);
  const dotOp = Math.sin(Math.PI * clamp01(dotProg));
  const pulse = 16 + 10 * (0.5 + 0.5 * cyc(p, 2, 0));

  // Destination pin: drops at p 0.5-0.62, holds, lifts off 0.88-1.
  const pinEnv = eventEnv(p, 0.5, 0.12, 0.26, 0.12);
  const pinBounce = spring({frame: triWave(frame, 75), fps, config: {damping: 10}});
  const pinY = -90 * (1 - pinEnv) - 6 * pinBounce * pinEnv;

  return (
    <AbsoluteFill style={{backgroundColor: '#E8F0E4', overflow: 'hidden'}}>
      <Grade>
        <div style={{position: 'absolute', inset: 0, background: '#E8F0E4'}} />
        <svg width={1920} height={1080} style={{position: 'absolute'}}>
          {/* river */}
          <path d="M120,-20 C60,300 200,600 110,900 C80,1020 120,1080 120,1100 L0,1100 L0,-20 Z" fill="#A5D6E8" opacity={0.8} />
          {/* park */}
          <rect x={1420} y={760} width={380} height={220} rx={24} fill="#A5D6A7" />
          <circle cx={1520} cy={830} r={34} fill="#66BB6A" />
          <circle cx={1660} cy={900} r={44} fill="#66BB6A" />
          {/* streets */}
          {streetsV.map((x) => (
            <rect key={x} x={x - 8} y={0} width={16} height={1080} fill="#FFFFFF" />
          ))}
          {streetsH.map((y) => (
            <rect key={y} x={0} y={y - 8} width={1920} height={16} fill="#FFFFFF" />
          ))}
          {/* blocks */}
          {[
            [300, 300, 200, 120], [640, 520, 180, 120], [960, 300, 220, 130],
            [1240, 520, 200, 120], [300, 740, 220, 110], [960, 760, 200, 100],
          ].map(([x, y, w, h], i) => (
            <rect key={i} x={x} y={y} width={w} height={h} rx={10} fill="#DDE8D5" />
          ))}
          {/* route */}
          <path d={ROUTE} fill="none" stroke="#93C5FD" strokeWidth={16} strokeLinecap="round" opacity={0.55} strokeDasharray={routeEvolve.strokeDasharray} strokeDashoffset={routeEvolve.strokeDashoffset} />
          <path d={ROUTE} fill="none" stroke="#2563EB" strokeWidth={10} strokeLinecap="round" strokeDasharray={routeEvolve.strokeDasharray} strokeDashoffset={routeEvolve.strokeDashoffset} />
          {/* warehouse */}
          <g transform="translate(200 880)">
            <rect x={-70} y={-70} width={140} height={70} fill="#64748B" />
            <path d="M-84,-70 L0,-128 L84,-70 Z" fill="#475569" />
            <rect x={-22} y={-38} width={44} height={38} fill="#F8FAFC" />
            <text x={0} y={34} textAnchor="middle" fontFamily="sans-serif" fontSize={22} fontWeight={700} letterSpacing={2} fill="#334155">WAREHOUSE</text>
          </g>
          {/* destination pin */}
          <g transform={`translate(1700 ${360 + pinY})`} opacity={pinEnv}>
            <path d="M0,0 C-30,-34 -30,-70 0,-70 C30,-70 30,-34 0,0 Z" fill="#DC2626" />
            <circle cx={0} cy={-44} r={13} fill="#FFFFFF" />
          </g>
          <text x={1700} y={440} textAnchor="middle" fontFamily="sans-serif" fontSize={22} fontWeight={700} letterSpacing={2} fill="#334155" opacity={pinEnv}>DESTINATION</text>
          {/* courier dot */}
          <g transform={`translate(${dotPt.x.toFixed(1)} ${dotPt.y.toFixed(1)}) rotate(${dotAngle.toFixed(1)}) scale(${smear.scaleX.toFixed(3)} ${smear.scaleY.toFixed(3)})`} opacity={dotOp}>
            <circle r={pulse} fill="#DC2626" opacity={0.25} />
            <circle r={15} fill="#DC2626" stroke="#FFFFFF" strokeWidth={4} />
          </g>
        </svg>
        <div style={{position: 'absolute', left: 60, top: 50, fontFamily: 'sans-serif', fontSize: 34, fontWeight: 800, letterSpacing: 3, color: '#334155'}}>
          DELIVERY ROUTE — LIVE TRACKING
        </div>
      </Grade>
      <GrainNoise opacity={0.05} seed={41} />
      <Vignette strength={0.12} rgb="80,100,80" />
    </AbsoluteFill>
  );
};
