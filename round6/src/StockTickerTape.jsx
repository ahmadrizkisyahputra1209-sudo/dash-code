import React, {useMemo} from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {evolvePath, getLength} from '@remotion/paths';
import {fadeIn, fadeOutEnd, smoothstep} from './smooth.js';
import {Grade, GrainNoise, Vignette} from './postfx.jsx';

// 9. STOCK TICKER TAPE — scrolling ticker + mini sparkline.
// Palette 60% #0D1117 dark / 30% #3DDC84 green (up) / 10% #FF5A5A red (down).
// Data EXACT, generic sector labels only (from plan): IDX +1.2%, TECH +2.4%,
// BANK +0.6%, ENERGY -0.8%. No real company tickers.
// Tape scrolls LINEAR, exactly 1 set-width per loop (seamless).
// Sparkline is drawn from the plan values [1.2, 2.4, 0.6, -0.8], drawn
// f15-120, held, erased f240-300 (there-and-back). Frame 0: tape + grid.
const ITEMS = [
  {label: 'IDX', value: '+1.2%', up: true},
  {label: 'TECH', value: '+2.4%', up: true},
  {label: 'BANK', value: '+0.6%', up: true},
  {label: 'ENERGY', value: '-0.8%', up: false},
];
const SET_W = 1840;
const SPARK_D = 'M200,520 L560,352 L920,184 L1280,436 L1640,688';
const AREA_D = 'M200,520 L560,352 L920,184 L1280,436 L1640,688 L1640,780 L200,780 Z';

export const StockTickerTape = () => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const p = frame / durationInFrames;

  const sparkLen = useMemo(() => getLength(SPARK_D), []);
  const tapeX = -p * SET_W;

  // Sparkline: draw f15-120, hold to f240, erase f240-300.
  const drawProg =
    p < 0.05
      ? 0
      : p < 0.4
        ? smoothstep((p - 0.05) / 0.35)
        : p < 0.8
          ? 1
          : 1 - smoothstep((p - 0.8) / 0.2);
  const sparkEvolve = evolvePath(drawProg, SPARK_D);
  const heroOp = fadeIn(frame, 12) * fadeOutEnd(frame);

  const tapeSet = (key) => (
    <div key={key} style={{display: 'flex', flexShrink: 0, width: SET_W}}>
      {ITEMS.map((it, i) => (
        <div
          key={i}
          style={{
            width: 460,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 16,
          }}
        >
          <span style={{fontFamily: 'sans-serif', fontSize: 44, fontWeight: 800, color: '#FFFFFF'}}>
            {it.label}
          </span>
          <span
            style={{
              fontFamily: 'sans-serif',
              fontSize: 44,
              fontWeight: 800,
              color: it.up ? '#3DDC84' : '#FF5A5A',
            }}
          >
            {it.value}
          </span>
          <span style={{fontFamily: 'sans-serif', fontSize: 30, color: '#3A4756'}}>•</span>
        </div>
      ))}
    </div>
  );

  return (
    <AbsoluteFill style={{backgroundColor: '#0D1117', overflow: 'hidden'}}>
      <Grade>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(135deg, #10161F 0%, #0D1117 55%, #090D13 100%)',
          }}
        />
        {/* ticker tape band, scrolling LINEAR 1 wrap per loop */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            width: 1920,
            height: 120,
            backgroundColor: '#161D27',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              display: 'flex',
              height: 120,
              transform: `translateX(${tapeX.toFixed(1)}px)`,
            }}
          >
            {tapeSet('a')}
            {tapeSet('b')}
          </div>
        </div>
        {/* hero value */}
        <div
          style={{
            position: 'absolute',
            left: 200,
            top: 240,
            opacity: heroOp,
            fontFamily: 'sans-serif',
            fontSize: 96,
            fontWeight: 800,
            color: '#FFFFFF',
          }}
        >
          IDX{' '}
          <span style={{color: '#3DDC84'}}>+1.2%</span>
        </div>
        <svg width={1920} height={1080} style={{position: 'absolute'}}>
          {/* grid */}
          {[220, 420, 620, 820].map((y) => (
            <line key={y} x1={120} y1={y} x2={1800} y2={y} stroke="#1B2A3A" strokeWidth={2} />
          ))}
          {/* area fill under the sparkline */}
          <path d={AREA_D} fill="#3DDC84" opacity={0.12 * drawProg} />
          {/* sparkline */}
          <path
            d={SPARK_D}
            fill="none"
            stroke="#3DDC84"
            strokeWidth={8}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray={sparkEvolve.strokeDasharray}
            strokeDashoffset={sparkEvolve.strokeDashoffset}
          />
          {/* end dot, rides the draw head */}
          <circle
            cx={200 + (1640 - 200) * drawProg}
            cy={520 + (688 - 520) * drawProg}
            r={12}
            fill="#3DDC84"
            opacity={drawProg > 0 ? 1 : 0}
          />
        </svg>
      </Grade>
      <GrainNoise opacity={0.05} seed={99} />
      <Vignette strength={0.14} rgb="4,8,14" />
    </AbsoluteFill>
  );
};
