import React from 'react';
import {AbsoluteFill, HtmlInCanvas, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {bevelAlpha} from '@remotion/effects/bevel-alpha';
import {fadeIn, fadeOutEnd, mulberry32, smoothstep} from './smooth.js';
import {GrainNoise, Grade, Vignette} from './postfx.jsx';

// 7. SMART HOME CONTROL — smart home dashboard: lights/thermostat/lock
// toggles, temperature dial. Palette 60% #101820 dark / 30% #F5A623 warm
// amber / 10% #4ECDC4 teal. Data EXACT: temperature 22 C, lights 3 on,
// door Locked. Toggles flip staggered 60ms; dial needle moves with spring.
// Effects: bevelAlpha on the thermostat card (HtmlInCanvas) for premium
// depth + GrainNoise. Toggle knobs slide there-and-back (on during the main
// action, back off at the loop return) so value(300) = value(0).
// Frame 0: bg + thermostat card visible (not empty).
const W = 1920;
const H = 1080;

// Toggle knob position: 0 before f15, 1 from f45, back to 0 by f300.
const knobPos = (frame, startF) => {
  if (frame < startF) return 0;
  if (frame < startF + 30) return smoothstep((frame - startF) / 30);
  if (frame < 285) return 1;
  return 1 - smoothstep((frame - 285) / 15);
};

export const SmartHomeControl = () => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const p = frame / durationInFrames;

  // Dial needle: -120 deg at f0, swings to +16 deg (22 C on a 0-40 C dial
  // spanning -120..+127.5 deg) f30-90, returns to -120 by f300
  // (there-and-back, loop-safe).
  const needleDeg = interpolate(frame, [0, 30, 90, 285, 300], [-120, -120, 16, 16, -120], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const lightsKnob = knobPos(frame, 15);
  const lockKnob = knobPos(frame, 25);
  const driftX = Math.cos(2 * Math.PI * p) * 6;
  const driftY = Math.sin(2 * Math.PI * p) * 6;

  const rows = [
    {label: 'Lights', value: '3 on', knob: lightsKnob, startF: 15, color: '#F5A623'},
    {label: 'Front Door', value: 'Locked', knob: lockKnob, startF: 25, color: '#4ECDC4'},
  ];

  return (
    <AbsoluteFill style={{backgroundColor: '#101820', overflow: 'hidden'}}>
      <Grade>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(135deg, #101820 0%, #0D141B 55%, #090F14 100%)',
          }}
        />
        <svg width={W} height={H} style={{position: 'absolute'}}>
          <g transform={`translate(${driftX.toFixed(1)} ${driftY.toFixed(1)})`}>
            {Array.from({length: 16}, (_, i) => {
              const rand = mulberry32(77 + i);
              return (
                <circle key={i} cx={rand() * W} cy={rand() * H} r={2.5} fill="#F5A623" opacity={0.12} />
              );
            })}
          </g>
        </svg>
        {/* thermostat card with bevelAlpha depth (HtmlInCanvas) */}
        <HtmlInCanvas
          width={520}
          height={560}
          effects={[bevelAlpha({edgeThickness: 3, lightAngle: -60, lightColor: '#FFFFFF', lightIntensity: 0.4})]}
          effectsOutputSize={{width: 520, height: 560}}
          style={{position: 'absolute', left: 140, top: 260}}
        >
          <div
            style={{
              width: 520,
              height: 560,
              background: '#1A2530',
              borderRadius: 28,
              boxShadow: '0 18px 40px rgba(0,0,0,0.4)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              paddingTop: 44,
            }}
          >
            <div style={{color: '#FFFFFF', fontSize: 32, fontWeight: 700, letterSpacing: 3, marginBottom: 24}}>
              THERMOSTAT
            </div>
            <div style={{position: 'relative', width: 300, height: 300}}>
              <svg width={300} height={300}>
                <circle cx={150} cy={150} r={140} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth={10} />
                <circle
                  cx={150}
                  cy={150}
                  r={140}
                  fill="none"
                  stroke="#F5A623"
                  strokeWidth={10}
                  strokeLinecap="round"
                  strokeDasharray={`${(((needleDeg + 120) / 247.5) * 879).toFixed(1)} 879`}
                  transform="rotate(-120 150 150)"
                />
                {Array.from({length: 12}, (_, i) => {
                  const a = (-120 + i * 22.5) * (Math.PI / 180);
                  const x1 = 150 + Math.cos(a) * 118;
                  const y1 = 150 + Math.sin(a) * 118;
                  const x2 = 150 + Math.cos(a) * 132;
                  const y2 = 150 + Math.sin(a) * 132;
                  return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(255,255,255,0.4)" strokeWidth={3} />;
                })}
                <line
                  x1={150}
                  y1={150}
                  x2={150 + Math.cos((needleDeg * Math.PI) / 180) * 108}
                  y2={150 + Math.sin((needleDeg * Math.PI) / 180) * 108}
                  stroke="#FFFFFF"
                  strokeWidth={6}
                  strokeLinecap="round"
                />
                <circle cx={150} cy={150} r={14} fill="#F5A623" />
              </svg>
            </div>
            <div style={{color: '#FFFFFF', fontSize: 84, fontWeight: 800, marginTop: 8}}>
              22&deg;C
            </div>
            <div style={{color: '#4ECDC4', fontSize: 26, fontWeight: 600, letterSpacing: 3}}>
              COMFORT MODE
            </div>
          </div>
        </HtmlInCanvas>
        {/* device rows */}
        {rows.map((r, i) => (
          <div
            key={r.label}
            style={{
              position: 'absolute',
              left: 780,
              top: 260 + i * 300,
              width: 1000,
              height: 240,
              background: '#1A2530',
              borderRadius: 28,
              boxShadow: '0 18px 40px rgba(0,0,0,0.4)',
              display: 'flex',
              alignItems: 'center',
              padding: '0 48px',
              opacity: fadeIn(frame - r.startF, 12) * fadeOutEnd(frame),
            }}
          >
            <div style={{flex: 1}}>
              <div style={{color: '#FFFFFF', fontSize: 44, fontWeight: 700}}>{r.label}</div>
              <div style={{color: r.color, fontSize: 32, fontWeight: 600, marginTop: 8}}>{r.value}</div>
            </div>
            {/* toggle pill */}
            <div
              style={{
                width: 150,
                height: 76,
                borderRadius: 38,
                background: r.knob > 0.5 ? r.color : 'rgba(255,255,255,0.18)',
                position: 'relative',
                transition: 'none',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: 8,
                  left: 8 + r.knob * 74,
                  width: 60,
                  height: 60,
                  borderRadius: 30,
                  background: '#FFFFFF',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
                }}
              />
            </div>
          </div>
        ))}
        <div
          style={{
            position: 'absolute',
            left: 780,
            top: 860,
            color: '#FFFFFF',
            fontSize: 32,
            fontWeight: 600,
            letterSpacing: 4,
            opacity: fadeIn(frame - 60, 15) * fadeOutEnd(frame) * 0.85,
          }}
        >
          3 DEVICES CONNECTED
        </div>
      </Grade>
      <GrainNoise opacity={0.05} seed={77} />
      <Vignette strength={0.16} rgb="6,10,14" />
    </AbsoluteFill>
  );
};
