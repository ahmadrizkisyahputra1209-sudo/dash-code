import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {clamp01, fadeIn, fadeOutEnd, playfulSpring, uiSpring} from './smooth.js';
import {GrainNoise, Grade, Vignette} from './postfx.jsx';

// 12. SPOT AI SCAM — 1080x1920 VERTICAL. Phone screen: suspicious message
// bubble, then 3 verification checks light up (sender / link / OTP).
// Palette 60% #0F172A dark navy / 30% #C0392B alert red / 10% #3DDC84
// green verified ticks. Text EXACT per plan:
// "VERIFY THE SENDER"
// "CHECK THE LINK"
// "NEVER SHARE YOUR OTP"
// Generic checks only; connects to the 2FA clip already built. VERTICAL
// ONLY (no landscape cut). Safe zones 9:16: text 15-75% height (288-1440).
// Frame 0: navy gradient + phone shell visible (not empty).
const W = 1080;
const H = 1920;
const CHECKS = ['VERIFY THE SENDER', 'CHECK THE LINK', 'NEVER SHARE YOUR OTP'];

export const SpotAiScam = () => {
  const frame = useCurrentFrame();

  const phoneOp = fadeIn(frame, 12) * fadeOutEnd(frame);
  const phoneScale = clamp01(uiSpring(frame, 10));
  const bubbleOp = fadeIn(frame - 40, 12) * fadeOutEnd(frame);
  const bubbleScale = clamp01(uiSpring(frame, 40));

  return (
    <AbsoluteFill style={{backgroundColor: '#0F172A', overflow: 'hidden'}}>
      <Grade>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(180deg, #0F172A 0%, #0C1322 55%, #090F1A 100%)',
          }}
        />
        {/* phone frame */}
        <div
          style={{
            position: 'absolute',
            left: 190,
            top: 300,
            width: 700,
            height: 1200,
            borderRadius: 48,
            background: '#16233A',
            border: '3px solid rgba(255,255,255,0.16)',
            boxShadow: '0 24px 60px rgba(0,0,0,0.5)',
            transform: `scale(${phoneScale.toFixed(3)})`,
            opacity: phoneOp,
          }}
        >
          {/* red alert strip */}
          <div
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              width: 694,
              height: 12,
              borderRadius: '48px 48px 0 0',
              background: '#C0392B',
            }}
          />
          {/* shield icon */}
          <svg width={96} height={96} style={{position: 'absolute', left: 302, top: 52}}>
            <path
              d="M48 6 L84 20 L84 48 C84 70 68 84 48 90 C28 84 12 70 12 48 L12 20 Z"
              fill="none"
              stroke="#3DDC84"
              strokeWidth={5}
              strokeLinejoin="round"
            />
            <polyline
              points="32,48 44,60 66,34"
              fill="none"
              stroke="#3DDC84"
              strokeWidth={6}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          {/* suspicious message bubble (fake text lines, no readable text) */}
          <div
            style={{
              position: 'absolute',
              left: 60,
              top: 210,
              width: 580,
              height: 180,
              borderRadius: 24,
              background: 'rgba(255,255,255,0.10)',
              border: '2px solid rgba(192,57,43,0.6)',
              padding: '28px 32px',
              transform: `scale(${bubbleScale.toFixed(3)})`,
              opacity: bubbleOp,
            }}
          >
            <div style={{width: 420, height: 16, borderRadius: 8, background: 'rgba(255,255,255,0.28)'}} />
            <div style={{width: 500, height: 16, borderRadius: 8, background: 'rgba(255,255,255,0.22)', marginTop: 20}} />
            <div style={{width: 300, height: 16, borderRadius: 8, background: 'rgba(255,255,255,0.18)', marginTop: 20}} />
          </div>
          {/* 3 verification checks */}
          {CHECKS.map((c, i) => {
            const y = 470 + i * 180;
            const rowOp = fadeIn(frame - (70 + i * 22), 12) * fadeOutEnd(frame);
            const rowScale = clamp01(uiSpring(frame, 70 + i * 22));
            const tickScale = clamp01(playfulSpring(frame, 90 + i * 22));
            return (
              <div
                key={c}
                style={{
                  position: 'absolute',
                  left: 60,
                  top: y,
                  width: 580,
                  height: 140,
                  borderRadius: 24,
                  background: 'rgba(61,220,132,0.08)',
                  border: '2px solid rgba(61,220,132,0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0 30px',
                  transform: `scale(${rowScale.toFixed(3)})`,
                  opacity: rowOp,
                }}
              >
                <div
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: '50%',
                    background: '#3DDC84',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transform: `scale(${tickScale.toFixed(3)})`,
                    flexShrink: 0,
                  }}
                >
                  <svg width={38} height={38} viewBox="0 0 40 40">
                    <polyline
                      points="8,21 17,30 33,11"
                      fill="none"
                      stroke="#0F172A"
                      strokeWidth={5}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <div style={{color: '#FFFFFF', fontSize: 32, fontWeight: 800, letterSpacing: 1, marginLeft: 26}}>
                  {c}
                </div>
              </div>
            );
          })}
        </div>
      </Grade>
      <GrainNoise opacity={0.05} seed={102} />
      <Vignette strength={0.16} rgb="6,10,20" />
    </AbsoluteFill>
  );
};
