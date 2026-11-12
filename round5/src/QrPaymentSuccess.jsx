import React, {useMemo} from 'react';
import {AbsoluteFill, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {evolvePath} from '@remotion/paths';
import {cyc, mulberry32, triWave} from './smooth.js';
import {Grade, GrainNoise, Vignette} from './postfx.jsx';

// 8. QR PAYMENT SUCCESS (VERTICAL 1080x1920) — phone scanning a QR code,
// scan line sweeping twice per loop, then a checkmark badge drawing itself
// in (draw-on via evolvePath) with a spring pop, "Payment Successful" mask
// reveal, and confetti dots pulsing out and back. The check appears and
// disappears once per loop via a smooth envelope, so frame 0 = frame 299
// (phone + QR, no check yet). Frame 0: full phone scene, poster-ready.
const W = 1080;
const H = 1920;
const QR_X = 372;
const QR_Y = 640;
const QR_S = 336;
const CELL = QR_S / 21;

// Smooth 0->1->0 envelope for one-shot events inside the loop.
const eventEnv = (p, start, rise, hold, fall) => {
  if (p < start) return 0;
  if (p < start + rise) {
    const t = (p - start) / rise;
    return t * t * (3 - 2 * t);
  }
  if (p < start + rise + hold) return 1;
  if (p < start + rise + hold + fall) {
    const t = (p - start - rise - hold) / fall;
    return 1 - t * t * (3 - 2 * t);
  }
  return 0;
};

export const QrPaymentSuccess = () => {
  const frame = useCurrentFrame();
  const {durationInFrames, fps} = useVideoConfig();
  const p = frame / durationInFrames;

  const modules = useMemo(() => {
    const rand = mulberry32(42);
    const grid = [];
    const inFinder = (r, c) =>
      (r < 7 && c < 7) || (r < 7 && c >= 14) || (r >= 14 && c < 7);
    for (let r = 0; r < 21; r++) {
      for (let c = 0; c < 21; c++) {
        if (inFinder(r, c)) continue;
        if (rand() < 0.46) grid.push({r, c});
      }
    }
    return grid;
  }, []);

  const confetti = useMemo(() => {
    const rand = mulberry32(44);
    return Array.from({length: 24}, (_, i) => ({
      ang: (i / 24) * Math.PI * 2 + rand() * 0.5,
      dist: 110 + rand() * 130,
      phase: rand() * 6.28,
      color: ['#22C55E', '#FFC107', '#3B82F6', '#EC4899'][i % 4],
      s: 5 + rand() * 7,
    }));
  }, []);

  // Scan line: two sweeps per loop, opacity envelope hides the wrap.
  const sweepFrac = (p * 2) % 1;
  const sweepY = QR_Y + sweepFrac * QR_S;
  const sweepOp = Math.sin(Math.PI * sweepFrac);

  // Checkmark badge: appears p 0.30-0.50, holds, disappears 0.75-0.95.
  const checkEnv = eventEnv(p, 0.3, 0.2, 0.25, 0.2);
  const checkPop = 1 + 0.18 * spring({frame: triWave(frame, 150), fps, config: {damping: 8}}) * checkEnv;
  const checkPath = 'M-38,2 L-12,28 L42,-30';
  const checkEvolve = evolvePath(checkEnv, checkPath);
  const circleEvolve = evolvePath(checkEnv, 'M0,-72 A72,72 0 1,1 -0.1,-72');

  const cx = 540;
  const cy = 1420;

  return (
    <AbsoluteFill style={{backgroundColor: '#EAF2FF', overflow: 'hidden'}}>
      <Grade>
        <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, #EAF2FF 0%, #FFFFFF 55%, #DBEAFE 100%)'}} />
        {/* faint coins */}
        {[0, 1, 2, 3].map((i) => (
          <div key={i} style={{position: 'absolute', left: 90 + i * 250, top: 150 + (i % 2) * 1400, width: 120, height: 120, borderRadius: '50%', border: '8px solid rgba(59,130,246,0.12)'}} />
        ))}
        {/* phone */}
        <div style={{position: 'absolute', left: 260, top: 380, width: 560, height: 1060, borderRadius: 56, background: '#111827', boxShadow: '0 40px 90px rgba(15,23,42,0.35)'}} />
        <div style={{position: 'absolute', left: 278, top: 398, width: 524, height: 1024, borderRadius: 44, background: '#FFFFFF', overflow: 'hidden'}}>
          <div style={{position: 'absolute', left: 212, top: 18, width: 100, height: 26, borderRadius: 13, background: '#111827'}} />
          <div style={{position: 'absolute', left: 0, right: 0, top: 64, textAlign: 'center', fontFamily: 'sans-serif', fontSize: 30, fontWeight: 800, letterSpacing: 3, color: '#111827'}}>
            SCAN TO PAY
          </div>
          {/* QR code */}
          <svg x={QR_X - 278} y={QR_Y - 398} width={QR_S} height={QR_S} style={{position: 'absolute', left: QR_X - 278, top: QR_Y - 398}}>
            <rect width={QR_S} height={QR_S} fill="#FFFFFF" />
            {modules.map((m, i) => (
              <rect key={i} x={m.c * CELL} y={m.r * CELL} width={CELL} height={CELL} fill="#111827" />
            ))}
            {/* finder patterns */}
            {[[0, 0], [14, 0], [0, 14]].map(([c, r], i) => (
              <g key={i}>
                <rect x={c * CELL} y={r * CELL} width={7 * CELL} height={7 * CELL} fill="#111827" />
                <rect x={(c + 1) * CELL} y={(r + 1) * CELL} width={5 * CELL} height={5 * CELL} fill="#FFFFFF" />
                <rect x={(c + 2) * CELL} y={(r + 2) * CELL} width={3 * CELL} height={3 * CELL} fill="#111827" />
              </g>
            ))}
          </svg>
          {/* scan line */}
          <div style={{position: 'absolute', left: QR_X - 278 - 8, top: sweepY - 398 - 3, width: QR_S + 16, height: 6, borderRadius: 3, background: 'linear-gradient(to right, rgba(34,197,94,0) 0%, #22C55E 50%, rgba(34,197,94,0) 100%)', boxShadow: '0 0 18px rgba(34,197,94,0.8)', opacity: 0.9 * sweepOp}} />
          {/* amount */}
          <div style={{position: 'absolute', left: 0, right: 0, top: 640, textAlign: 'center', fontFamily: 'sans-serif', fontSize: 52, fontWeight: 800, color: '#111827'}}>
            Rp 24.500
          </div>
          <div style={{position: 'absolute', left: 0, right: 0, top: 712, textAlign: 'center', fontFamily: 'sans-serif', fontSize: 24, letterSpacing: 2, color: '#6B7280'}}>
            WARUNG KOPI SENJA
          </div>
          {/* success text reveal */}
          <div style={{position: 'absolute', left: 0, right: 0, top: 800, textAlign: 'center', fontFamily: 'sans-serif', fontSize: 34, fontWeight: 800, color: '#16A34A', opacity: checkEnv, transform: `translateY(${(1 - checkEnv) * 26}px)`}}>
            Payment Successful
          </div>
        </div>
        {/* checkmark badge + confetti */}
        <svg width={W} height={H} style={{position: 'absolute'}}>
          {confetti.map((c, i) => {
            const r = c.dist * (0.35 + 0.65 * (0.5 + 0.5 * cyc(p, 1, c.phase)));
            const x = cx + Math.cos(c.ang) * r;
            const y = cy + Math.sin(c.ang) * r;
            return <circle key={i} cx={x} cy={y} r={c.s} fill={c.color} opacity={checkEnv * 0.95} />;
          })}
          <g transform={`translate(${cx} ${cy}) scale(${checkPop.toFixed(3)})`} opacity={checkEnv}>
            <circle r={86} fill="#22C55E" />
            <circle r={86} fill="none" stroke="#16A34A" strokeWidth={4} strokeDasharray={circleEvolve.strokeDasharray} strokeDashoffset={circleEvolve.strokeDashoffset} />
            <path d={checkPath} fill="none" stroke="#FFFFFF" strokeWidth={13} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={checkEvolve.strokeDasharray} strokeDashoffset={checkEvolve.strokeDashoffset} />
          </g>
        </svg>
      </Grade>
      <GrainNoise opacity={0.05} seed={38} />
      <Vignette strength={0.14} rgb="30,60,120" />
    </AbsoluteFill>
  );
};
