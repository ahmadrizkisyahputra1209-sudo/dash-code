import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {clamp01, fadeIn, fadeOutEnd, uiSpring} from './smooth.js';
import {GrainNoise, Grade, Vignette} from './postfx.jsx';

// 10. PLANT-BASED PLATE — 1080x1920 VERTICAL. Top-down plate assembling
// itself: tempeh, tofu, lentils, chickpeas, greens. Palette 60% #2D6A4F
// fresh green / 30% #C65D3B terracotta / 10% #F5EFE6 cream. Text EXACT
// per plan:
// "TEMPEH • TOFU • LENTILS • CHICKPEAS"
// "PLANT-BASED PLATE"
// "EARTH DAY 2027 — FOOD FOR OUR PLANET"
// Tempeh is the Indonesian differentiator in a sea of vegan burgers.
// VERTICAL ONLY (no landscape cut — similar-content rule). Plate rotates
// one full turn per loop (integer cycle, seamless). Safe zones 9:16: text
// 15-75% height (288-1440). Frame 0: green gradient + plate visible.
const W = 1080;
const H = 1920;
const CX = 540;
const CY = 880;

export const PlantBasedPlate = () => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const p = frame / durationInFrames;
  const rot = 360 * p;

  const headOp = fadeIn(frame, 12) * fadeOutEnd(frame);
  const labelOp = fadeIn(frame - 160, 12) * fadeOutEnd(frame);
  const footOp = fadeIn(frame - 200, 12) * fadeOutEnd(frame);

  const items = [
    {key: 'tempeh', delay: 60},
    {key: 'tofu', delay: 80},
    {key: 'lentils', delay: 100},
    {key: 'chickpeas', delay: 120},
    {key: 'greens', delay: 140},
  ];
  const scales = items.map((it) => clamp01(uiSpring(frame, it.delay)));
  const ops = items.map((it) => fadeIn(frame - it.delay, 12) * fadeOutEnd(frame));

  return (
    <AbsoluteFill style={{backgroundColor: '#2D6A4F', overflow: 'hidden'}}>
      <Grade>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(180deg, #2D6A4F 0%, #265C44 55%, #1E4A37 100%)',
          }}
        />
        {/* header */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 330,
            textAlign: 'center',
            color: '#F5EFE6',
            fontSize: 52,
            fontWeight: 800,
            letterSpacing: 4,
            opacity: headOp,
          }}
        >
          PLANT-BASED PLATE
        </div>
        {/* plate */}
        <div
          style={{
            position: 'absolute',
            left: CX - 330,
            top: CY - 330,
            width: 660,
            height: 660,
            borderRadius: '50%',
            background: '#F5EFE6',
            border: '10px solid #C65D3B',
            boxShadow: '0 24px 60px rgba(0,0,0,0.35)',
          }}
        />
        {/* rotating food items on the plate */}
        <div
          style={{
            position: 'absolute',
            left: CX,
            top: CY,
            width: 0,
            height: 0,
            transform: `rotate(${rot.toFixed(2)}deg)`,
          }}
        >
          {/* tempeh: tan rounded block, top */}
          <div
            style={{
              position: 'absolute',
              left: -75,
              top: -280,
              width: 150,
              height: 110,
              borderRadius: 18,
              background: '#D9A05B',
              border: '4px solid #B07E3E',
              transform: `scale(${scales[0].toFixed(3)})`,
              opacity: ops[0],
            }}
          />
          {/* tofu: white cube, right */}
          <div
            style={{
              position: 'absolute',
              left: 110,
              top: -60,
              width: 120,
              height: 120,
              borderRadius: 14,
              background: '#FFFFFF',
              border: '4px solid #E0D8C8',
              transform: `scale(${scales[1].toFixed(3)})`,
              opacity: ops[1],
            }}
          />
          {/* lentils: small brown dots, bottom */}
          <div
            style={{
              position: 'absolute',
              left: -90,
              top: 150,
              width: 180,
              height: 120,
              transform: `scale(${scales[2].toFixed(3)})`,
              opacity: ops[2],
            }}
          >
            {[
              [20, 20], [70, 10], [120, 30], [40, 60], [100, 70], [65, 95], [140, 90],
            ].map(([x, y], i) => (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  left: x,
                  top: y,
                  width: 26,
                  height: 26,
                  borderRadius: '50%',
                  background: '#8B5E3C',
                }}
              />
            ))}
          </div>
          {/* chickpeas: orange circles, left */}
          <div
            style={{
              position: 'absolute',
              left: -260,
              top: -60,
              width: 150,
              height: 120,
              transform: `scale(${scales[3].toFixed(3)})`,
              opacity: ops[3],
            }}
          >
            {[
              [10, 20], [60, 5], [110, 30], [35, 65], [95, 80],
            ].map(([x, y], i) => (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  left: x,
                  top: y,
                  width: 34,
                  height: 34,
                  borderRadius: '50%',
                  background: '#E8A020',
                }}
              />
            ))}
          </div>
          {/* greens: small leaves scattered */}
          <div
            style={{
              position: 'absolute',
              left: -70,
              top: -70,
              width: 140,
              height: 140,
              transform: `scale(${scales[4].toFixed(3)})`,
              opacity: ops[4],
            }}
          >
            {[
              [10, 30], [60, 10], [105, 45], [30, 85], [90, 100],
            ].map(([x, y], i) => (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  left: x,
                  top: y,
                  width: 22,
                  height: 22,
                  borderRadius: '50%',
                  background: '#4ADE80',
                }}
              />
            ))}
          </div>
        </div>
        {/* ingredient labels */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 1300,
            textAlign: 'center',
            color: '#C65D3B',
            fontSize: 34,
            fontWeight: 800,
            letterSpacing: 1,
            opacity: labelOp,
          }}
        >
          TEMPEH • TOFU • LENTILS • CHICKPEAS
        </div>
        {/* footer */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 1390,
            textAlign: 'center',
            color: '#F5EFE6',
            fontSize: 32,
            fontWeight: 700,
            letterSpacing: 1,
            opacity: footOp,
          }}
        >
          EARTH DAY 2027 — FOOD FOR OUR PLANET
        </div>
      </Grade>
      <GrainNoise opacity={0.05} seed={100} />
      <Vignette strength={0.16} rgb="10,30,20" />
    </AbsoluteFill>
  );
};
