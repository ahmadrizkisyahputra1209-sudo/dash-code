import React, {useMemo} from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {evolvePath, getLength, getPointAtLength} from '@remotion/paths';
import {countProg, fadeIn, fadeOutEnd, mulberry32, smoothstep} from './smooth.js';
import {GrainNoise, Grade, Vignette} from './postfx.jsx';

// 9. CRYPTO WALLET TRANSFER — crypto wallet: coins moving wallet-to-wallet,
// QR, balance. Palette 60% #0D1117 dark / 30% #8B5CF6 purple / 10% #F5C542
// gold. Data EXACT: 0.42 coins, no ticker letters (generic coin icon only).
// Coins travel along the arc there-and-back (t = 0.5 - 0.5*cos(2*PI*p),
// velocity 0 at both ends — seamless). Balance count-up once, hold,
// fade-out f285-300 (NEVER reverse). QR is a deterministic mulberry32 grid
// (static, loop-safe). Frame 0: bg + wallet cards appearing (not empty).
const W = 1920;
const H = 1080;

export const CryptoWalletTransfer = () => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const p = frame / durationInFrames;

  // Arc route between the two wallets (quadratic bezier, drawn there-and-back).
  const arcD = 'M760 540 Q960 300 1160 540';
  const arcLen = useMemo(() => getLength(arcD), [arcD]);
  const drawProg =
    p < 0.1
      ? 0
      : p < 0.3
        ? smoothstep((p - 0.1) / 0.2)
        : p < 0.8
          ? 1
          : 1 - smoothstep((p - 0.8) / 0.2);
  const arcEvolve = evolvePath(drawProg, arcD);
  const arcOp = fadeIn(frame, 12) * fadeOutEnd(frame);

  // Coins: there-and-back along the arc (cosine, seamless), two coins in
  // opposite phase so they cross mid-loop.
  const coinT = (ph) => 0.5 - 0.5 * Math.cos(2 * Math.PI * p + ph);
  const coinA = getPointAtLength(arcD, coinT(0) * arcLen);
  const coinB = getPointAtLength(arcD, coinT(Math.PI) * arcLen);

  // Balance count-up (corrected rule): 0 -> 0.42, hold, fade out.
  const prog = countProg(frame, 60, 150);
  const balance = (0.42 * prog).toFixed(2);
  const balanceOp = fadeIn(frame - 45, 12) * fadeOutEnd(frame);

  // Deterministic QR grid (21x21, mulberry32 seed, static).
  const qr = useMemo(() => {
    const rand = mulberry32(79);
    const cells = [];
    for (let y = 0; y < 21; y++) {
      for (let x = 0; x < 21; x++) {
        // finder patterns in three corners (7x7)
        const inFinder =
          (x < 7 && y < 7) || (x >= 14 && y < 7) || (x < 7 && y >= 14);
        if (inFinder) {
          const fx = x < 7 ? x : x - 14;
          const fy = y < 7 ? y : y - 14;
          const ring = fx === 0 || fx === 6 || fy === 0 || fy === 6;
          const core = fx >= 2 && fx <= 4 && fy >= 2 && fy <= 4;
          cells.push({x, y, on: ring || core});
        } else {
          cells.push({x, y, on: rand() > 0.52});
        }
      }
    }
    return cells;
  }, []);

  const cardOp = fadeIn(frame, 12) * fadeOutEnd(frame);
  const driftX = Math.cos(2 * Math.PI * p) * 6;
  const driftY = Math.sin(2 * Math.PI * p) * 6;

  return (
    <AbsoluteFill style={{backgroundColor: '#0D1117', overflow: 'hidden'}}>
      <Grade>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(135deg, #0D1117 0%, #0B0F16 55%, #080B10 100%)',
          }}
        />
        <svg width={W} height={H} style={{position: 'absolute'}}>
          <g transform={`translate(${driftX.toFixed(1)} ${driftY.toFixed(1)})`}>
            {Array.from({length: 16}, (_, i) => {
              const rand = mulberry32(791 + i);
              return (
                <circle key={i} cx={rand() * W} cy={rand() * H} r={2.5} fill="#8B5CF6" opacity={0.14} />
              );
            })}
          </g>
          {/* transfer arc */}
          <g opacity={arcOp}>
            <path
              d={arcD}
              fill="none"
              stroke="#8B5CF6"
              strokeWidth={4}
              strokeDasharray={arcEvolve.strokeDasharray}
              strokeDashoffset={arcEvolve.strokeDashoffset}
              opacity={0.9}
            />
          </g>
          {/* coins on the arc */}
          {[
            {pt: coinA, s: 1},
            {pt: coinB, s: 0.85},
          ].map((c, i) => (
            <g key={i} transform={`translate(${c.pt.x.toFixed(1)} ${c.pt.y.toFixed(1)})`} opacity={arcOp}>
              <circle r={26 * c.s} fill="#F5C542" />
              <circle r={26 * c.s} fill="none" stroke="#8A6D1F" strokeWidth={3} />
              <polygon
                points="0,-12 4,-4 12,-4 6,2 8,10 0,5 -8,10 -6,2 -12,-4 -4,-4"
                fill="#8A6D1F"
                transform={`scale(${c.s})`}
              />
            </g>
          ))}
        </svg>
        {/* left wallet card */}
        <div
          style={{
            position: 'absolute',
            left: 140,
            top: 300,
            width: 620,
            height: 480,
            background: '#1A1F2E',
            borderRadius: 28,
            boxShadow: '0 18px 40px rgba(0,0,0,0.4)',
            opacity: cardOp,
            padding: '40px 48px',
          }}
        >
          <div style={{color: '#FFFFFF', fontSize: 36, fontWeight: 700, marginBottom: 12}}>
            Your Wallet
          </div>
          <div style={{color: '#8B5CF6', fontSize: 28, fontWeight: 600, marginBottom: 40}}>
            BALANCE
          </div>
          <div style={{color: '#FFFFFF', fontSize: 110, fontWeight: 800, opacity: balanceOp}}>
            {balance}
          </div>
          <div style={{color: '#F5C542', fontSize: 30, fontWeight: 600, marginTop: 12, opacity: balanceOp}}>
            coins
          </div>
        </div>
        {/* right wallet card with QR */}
        <div
          style={{
            position: 'absolute',
            left: 1160,
            top: 300,
            width: 620,
            height: 480,
            background: '#1A1F2E',
            borderRadius: 28,
            boxShadow: '0 18px 40px rgba(0,0,0,0.4)',
            opacity: cardOp,
            padding: '40px 48px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <div style={{color: '#FFFFFF', fontSize: 36, fontWeight: 700, marginBottom: 24}}>
            Recipient
          </div>
          <div style={{background: '#FFFFFF', borderRadius: 16, padding: 14}}>
            <svg width={210} height={210}>
              {qr.map((c, i) =>
                c.on ? <rect key={i} x={c.x * 10} y={c.y * 10} width={10} height={10} fill="#0D1117" /> : null,
              )}
            </svg>
          </div>
          <div style={{color: '#8B5CF6', fontSize: 26, fontWeight: 600, marginTop: 24}}>
            Scan to receive
          </div>
        </div>
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 880,
            textAlign: 'center',
            color: '#FFFFFF',
            fontSize: 34,
            fontWeight: 600,
            letterSpacing: 4,
            opacity: fadeIn(frame - 60, 15) * fadeOutEnd(frame) * 0.85,
          }}
        >
          SECURE WALLET-TO-WALLET TRANSFER
        </div>
      </Grade>
      <GrainNoise opacity={0.05} seed={79} />
      <Vignette strength={0.16} rgb="6,8,16" />
    </AbsoluteFill>
  );
};
