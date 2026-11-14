import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {Trail} from '@remotion/motion-blur';
import {clamp01, cyc, env, fadeIn, fadeOutEnd, mulberry32, playfulSpring, triWave, uiSpring} from './smooth.js';
import {GrainNoise, Grade, Vignette} from './postfx.jsx';

// 1. AI AGENT WORKFLOW — REDESIGN v3 (15 Nov 2026).
// v1 (3.45 Mbps) and v2 (CBR filler, 9.90 Mbps) BOTH got Adobe's
// "Video quality may be too low" flag, so the check measures visual
// complexity, not bitrate. This redesign packs the frame: layered
// node-network background, 3-column layout (task queue rail / pipeline
// hero / activity log rail), bottom strip with bar chart + status chips.
// Palette 60% #0B1F3A deep navy / 30% #22D3EE electric cyan /
// 10% #F5A623 amber (approval state). Lighter/darker shades of the same
// three colours only — no new dominant colour.
// Text EXACT per plan (unchanged):
// "TASK RECEIVED → PLAN → ACT → AWAITING APPROVAL → DONE"
// "AGENT: Book flights"
// "STATUS: Awaiting approval"
// All other labels are generic (no invented numbers, rates or counts).
// Grain raised to 0.08 IN THIS FILE (this file overrides the prop;
// editing postfx.jsx does nothing here — lesson from the v2 attempt).
// Pipeline dot travels there-and-back (env, seamless) — the ONLY fast
// element, so the only <Trail> (layers 6, lag 1). Frame 0: gradient +
// grid + node network + glows visible (not empty). f150: finished look.
const W = 1920;
const H = 1080;
const NODES = ['TASK RECEIVED', 'PLAN', 'ACT', 'AWAITING APPROVAL', 'DONE'];
const NODE_W = 196;
const NODE_GAP = 24;
const NODE_X0 = 400;
const NODE_Y = 470;
const NODE_H = 110;
const LINE_X0 = 430;
const LINE_X1 = 1490;
const LINE_Y = 525;

const QUEUE = [
  {title: 'Book flights', sub: 'In progress', active: true},
  {title: 'Draft report', sub: 'Queued', active: false},
  {title: 'Schedule meeting', sub: 'Queued', active: false},
];

const LOG = [
  {text: 'Task received', amber: false},
  {text: 'Agent started task', amber: false},
  {text: 'Plan ready', amber: false},
  {text: 'Waiting for approval', amber: true},
];

const BAR_COUNT = 8;

// Node-network background: fixed seeded positions, slow seamless drift
// (cyc, 1 cycle per loop) and pulse (env). Built fresh per frame from the
// same seed, so it is deterministic and identical at f0 and f300.
const NET_N = 26;
const netRand = mulberry32(777);
const NET_BASE = Array.from({length: NET_N}, (_, i) => ({
  x: 60 + netRand() * 1800,
  y: 60 + netRand() * 960,
  ph: i * 0.37,
  r: 2.5 + netRand() * 2.5,
}));

export const AiAgentWorkflow = () => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const p = frame / durationInFrames;

  // Pipeline dot: there-and-back over the loop (env 0..1..0), seamless.
  const dotX = LINE_X0 + (LINE_X1 - LINE_X0) * env(p);
  const dotY = LINE_Y;

  const cardOp = fadeIn(frame, 12) * fadeOutEnd(frame);
  const cardScale = clamp01(uiSpring(frame, 15));
  const statusOp = fadeIn(frame - 180, 12) * fadeOutEnd(frame);
  const statusScale = clamp01(uiSpring(frame, 180));
  const lineProg = clamp01((frame - 50) / 120);
  const checkScale = clamp01(playfulSpring(frame, 210));

  // Node-network positions this frame (drift + pulse, all seamless).
  const netPos = NET_BASE.map((n) => ({
    x: n.x + 12 * cyc(p, 1, n.ph),
    y: n.y + 9 * cyc(p, 1, n.ph + 2.1),
    o: 0.1 + 0.2 * env(p, n.ph),
    r: n.r + 1.2 * env(p, n.ph + 1.4),
  }));

  // Active queue card fill: fills once, holds, fades at the end.
  const queueFill = interpolate(frame, [60, 180], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{backgroundColor: '#0B1F3A', overflow: 'hidden'}}>
      <Grade>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(135deg, #0B1F3A 0%, #0A1B33 55%, #081426 100%)',
          }}
        />
        {/* fine grid, static, visible from f0 */}
        <svg width={W} height={H} style={{position: 'absolute'}}>
          {Array.from({length: 17}, (_, i) => (
            <line key={`v${i}`} x1={i * 120} y1={0} x2={i * 120} y2={H} stroke="#22D3EE" strokeWidth={1} opacity={0.05} />
          ))}
          {Array.from({length: 10}, (_, i) => (
            <line key={`h${i}`} x1={0} y1={i * 120} x2={W} y2={i * 120} stroke="#22D3EE" strokeWidth={1} opacity={0.05} />
          ))}
        </svg>
        {/* radial glows: cyan behind pipeline, amber behind status pill */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(circle at 50% 48%, rgba(34,211,238,0.14) 0%, rgba(34,211,238,0) 65%)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(circle at 50% 68%, rgba(245,166,35,0.10) 0%, rgba(245,166,35,0) 60%)',
          }}
        />
        {/* node-network background: connectors + drifting pulsing nodes */}
        <svg width={W} height={H} style={{position: 'absolute'}}>
          {netPos.map((n, i) => {
            const m = netPos[(i + 9) % NET_N];
            return (
              <line key={`c${i}`} x1={n.x} y1={n.y} x2={m.x} y2={m.y} stroke="#22D3EE" strokeWidth={1.5} opacity={0.06} />
            );
          })}
          {netPos.map((n, i) => (
            <circle key={`n${i}`} cx={n.x} cy={n.y} r={n.r} fill="#22D3EE" opacity={n.o} />
          ))}
        </svg>

        {/* ---- LEFT RAIL: task queue ---- */}
        <div
          style={{
            position: 'absolute',
            left: 40,
            top: 118,
            color: 'rgba(34,211,238,0.85)',
            fontSize: 26,
            fontWeight: 800,
            letterSpacing: 4,
            opacity: fadeIn(frame - 10, 12) * fadeOutEnd(frame),
          }}
        >
          TASK QUEUE
        </div>
        {QUEUE.map((q, i) => {
          const y = 168 + i * 148;
          const s = clamp01(uiSpring(frame, 20 + i * 4));
          return (
            <div
              key={q.title}
              style={{
                position: 'absolute',
                left: 40,
                top: y,
                width: 290,
                height: 118,
                borderRadius: 18,
                background: q.active ? 'rgba(34,211,238,0.12)' : 'rgba(34,211,238,0.05)',
                border: q.active ? '2px solid #22D3EE' : '2px solid rgba(34,211,238,0.35)',
                boxShadow: q.active ? '0 0 28px rgba(34,211,238,0.35), 0 12px 28px rgba(0,0,0,0.35)' : '0 12px 28px rgba(0,0,0,0.30)',
                transform: `scale(${s.toFixed(3)})`,
                opacity: s * fadeOutEnd(frame),
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  left: 22,
                  top: 26,
                  width: 14,
                  height: 14,
                  borderRadius: '50%',
                  background: q.active ? '#22D3EE' : 'rgba(255,255,255,0.35)',
                  boxShadow: q.active ? '0 0 12px #22D3EE' : 'none',
                }}
              />
              <div style={{position: 'absolute', left: 50, top: 18, color: '#FFFFFF', fontSize: 25, fontWeight: 700}}>
                {q.title}
              </div>
              <div
                style={{
                  position: 'absolute',
                  left: 50,
                  top: 58,
                  color: q.active ? '#22D3EE' : 'rgba(255,255,255,0.55)',
                  fontSize: 19,
                  fontWeight: 600,
                }}
              >
                {q.sub}
              </div>
              {q.active && (
                <div
                  style={{
                    position: 'absolute',
                    left: 22,
                    bottom: 14,
                    width: 246,
                    height: 6,
                    borderRadius: 3,
                    background: 'rgba(34,211,238,0.20)',
                  }}
                >
                  <div
                    style={{
                      width: `${(queueFill * 246).toFixed(1)}px`,
                      height: 6,
                      borderRadius: 3,
                      background: '#22D3EE',
                    }}
                  />
                </div>
              )}
            </div>
          );
        })}
        {/* approval gate card under the queue */}
        <div
          style={{
            position: 'absolute',
            left: 40,
            top: 612,
            width: 290,
            height: 120,
            borderRadius: 18,
            background: 'rgba(245,166,35,0.12)',
            border: '2px solid #F5A623',
            boxShadow: '0 0 24px rgba(245,166,35,0.25), 0 12px 28px rgba(0,0,0,0.30)',
            opacity: fadeIn(frame - 120, 12) * fadeOutEnd(frame),
          }}
        >
          <div
            style={{
              position: 'absolute',
              left: 22,
              top: 24,
              width: 34,
              height: 34,
              borderRadius: '50%',
              background: '#F5A623',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#0B1F3A',
              fontSize: 22,
              fontWeight: 800,
            }}
          >
            !
          </div>
          <div style={{position: 'absolute', left: 70, top: 20, color: '#F5A623', fontSize: 24, fontWeight: 800}}>
            Approval required
          </div>
          <div style={{position: 'absolute', left: 70, top: 60, color: 'rgba(255,255,255,0.60)', fontSize: 19, fontWeight: 600}}>
            Waiting for human
          </div>
        </div>

        {/* ---- CENTER: pipeline hero ---- */}
        {/* exact flow line (verbatim, per plan) */}
        <div
          style={{
            position: 'absolute',
            left: 400,
            top: 118,
            width: 1120,
            textAlign: 'center',
            color: '#FFFFFF',
            fontSize: 24,
            fontWeight: 700,
            letterSpacing: 1,
            opacity: fadeIn(frame - 8, 12) * fadeOutEnd(frame),
          }}
        >
          TASK RECEIVED → PLAN → ACT → AWAITING APPROVAL → DONE
        </div>
        {/* task card */}
        <div
          style={{
            position: 'absolute',
            left: 640,
            top: 185,
            width: 640,
            height: 120,
            borderRadius: 24,
            background: 'rgba(34,211,238,0.10)',
            border: '2px solid rgba(34,211,238,0.55)',
            boxShadow: '0 18px 40px rgba(0,0,0,0.35)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
            fontSize: 44,
            fontWeight: 700,
            transform: `scale(${cardScale.toFixed(3)})`,
            opacity: cardOp,
          }}
        >
          AGENT: Book flights
        </div>
        {/* agent working dots under the task card */}
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: 920 + i * 40,
              top: 352,
              width: 16,
              height: 16,
              borderRadius: '50%',
              background: '#22D3EE',
              boxShadow: '0 0 10px #22D3EE',
              opacity: (0.35 + 0.65 * env(p, i * 1.5)) * fadeIn(frame - 40, 12) * fadeOutEnd(frame),
            }}
          />
        ))}
        {/* connector line */}
        <div
          style={{
            position: 'absolute',
            left: LINE_X0,
            top: LINE_Y - 3,
            width: LINE_X1 - LINE_X0,
            height: 6,
            borderRadius: 3,
            background: 'rgba(34,211,238,0.35)',
            transform: `scaleX(${lineProg.toFixed(3)})`,
            transformOrigin: 'left center',
            opacity: fadeOutEnd(frame),
          }}
        />
        {/* pipeline nodes */}
        {NODES.map((n, i) => {
          const x = NODE_X0 + i * (NODE_W + NODE_GAP);
          const isApproval = n === 'AWAITING APPROVAL';
          const s = clamp01(uiSpring(frame, 30 + i * 6));
          return (
            <div
              key={n}
              style={{
                position: 'absolute',
                left: x,
                top: NODE_Y,
                width: NODE_W,
                height: NODE_H,
                borderRadius: 20,
                background: isApproval ? 'rgba(245,166,35,0.16)' : 'rgba(34,211,238,0.10)',
                border: `2px solid ${isApproval ? '#F5A623' : 'rgba(34,211,238,0.7)'}`,
                boxShadow: isApproval ? '0 0 26px rgba(245,166,35,0.30)' : '0 0 18px rgba(34,211,238,0.18)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: isApproval ? '#F5A623' : '#FFFFFF',
                fontSize: isApproval ? 21 : 24,
                fontWeight: 800,
                letterSpacing: 1,
                textAlign: 'center',
                padding: '0 10px',
                transform: `scale(${s.toFixed(3)})`,
                opacity: s * fadeOutEnd(frame),
              }}
            >
              {n}
            </div>
          );
        })}
        {/* arrows between nodes */}
        {[0, 1, 2, 3].map((i) => {
          const x = NODE_X0 + i * (NODE_W + NODE_GAP) + NODE_W + 2;
          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: x,
                top: NODE_Y + 36,
                color: '#22D3EE',
                fontSize: 28,
                fontWeight: 800,
                opacity: fadeIn(frame - (50 + i * 6), 10) * fadeOutEnd(frame),
              }}
            >
              →
            </div>
          );
        })}
        {/* secondary data packets along the connector (no blur) */}
        {[2.1, 4.2].map((ph) => {
          const px = LINE_X0 + (LINE_X1 - LINE_X0) * env(p, ph);
          return (
            <div
              key={ph}
              style={{
                position: 'absolute',
                left: px - 7,
                top: LINE_Y - 7,
                width: 14,
                height: 14,
                borderRadius: '50%',
                background: '#22D3EE',
                boxShadow: '0 0 10px #22D3EE',
                opacity: 0.9 * fadeOutEnd(frame),
              }}
            />
          );
        })}
        {/* travelling dot with motion-blur trail (fast element only) */}
        <Trail layers={6} lagInFrames={1} trailOpacity={0.5}>
          <svg width={W} height={H} style={{position: 'absolute'}} opacity={fadeOutEnd(frame)}>
            <circle cx={dotX} cy={dotY} r={14} fill="#F5A623" />
            <circle cx={dotX} cy={dotY} r={14} fill="none" stroke="#FFFFFF" strokeWidth={3} />
          </svg>
        </Trail>
        {/* DONE checkmark badge on the last node corner */}
        <div
          style={{
            position: 'absolute',
            left: 1436,
            top: 446,
            width: 52,
            height: 52,
            borderRadius: '50%',
            background: '#22D3EE',
            boxShadow: '0 0 20px rgba(34,211,238,0.55)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transform: `scale(${checkScale.toFixed(3)})`,
            opacity: checkScale * fadeOutEnd(frame),
          }}
        >
          <svg width={32} height={32} viewBox="0 0 40 40">
            <polyline points="8,21 17,30 33,11" fill="none" stroke="#0B1F3A" strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        {/* status pill */}
        <div
          style={{
            position: 'absolute',
            left: 660,
            top: 655,
            width: 600,
            height: 100,
            borderRadius: 50,
            background: 'rgba(245,166,35,0.16)',
            border: '2px solid #F5A623',
            boxShadow: '0 0 26px rgba(245,166,35,0.28)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#F5A623',
            fontSize: 36,
            fontWeight: 700,
            transform: `scale(${statusScale.toFixed(3)})`,
            opacity: statusOp,
          }}
        >
          STATUS: Awaiting approval
        </div>

        {/* ---- RIGHT RAIL: activity log ---- */}
        <div
          style={{
            position: 'absolute',
            left: 1590,
            top: 118,
            color: 'rgba(34,211,238,0.85)',
            fontSize: 26,
            fontWeight: 800,
            letterSpacing: 4,
            opacity: fadeIn(frame - 10, 12) * fadeOutEnd(frame),
          }}
        >
          ACTIVITY LOG
        </div>
        {LOG.map((row, i) => {
          const y = 168 + i * 72;
          return (
            <div
              key={row.text}
              style={{
                position: 'absolute',
                left: 1590,
                top: y,
                width: 290,
                height: 56,
                borderBottom: '1px solid rgba(34,211,238,0.15)',
                opacity: fadeIn(frame - (24 + i * 4), 10) * fadeOutEnd(frame),
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  left: 4,
                  top: 22,
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  background: row.amber ? '#F5A623' : '#22D3EE',
                  boxShadow: row.amber ? '0 0 10px #F5A623' : '0 0 10px #22D3EE',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  left: 28,
                  top: 12,
                  color: row.amber ? '#F5A623' : '#FFFFFF',
                  fontSize: 21,
                  fontWeight: 600,
                }}
              >
                {row.text}
              </div>
            </div>
          );
        })}
        {/* human review card under the log */}
        <div
          style={{
            position: 'absolute',
            left: 1590,
            top: 540,
            width: 290,
            height: 130,
            borderRadius: 18,
            background: 'rgba(245,166,35,0.12)',
            border: '2px solid #F5A623',
            boxShadow: '0 0 24px rgba(245,166,35,0.25), 0 12px 28px rgba(0,0,0,0.30)',
            opacity: fadeIn(frame - 130, 12) * fadeOutEnd(frame),
          }}
        >
          <div
            style={{
              position: 'absolute',
              left: 22,
              top: 24,
              width: 34,
              height: 34,
              borderRadius: '50%',
              background: '#F5A623',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg width={20} height={20} viewBox="0 0 40 40">
              <polyline points="8,21 17,30 33,11" fill="none" stroke="#0B1F3A" strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div style={{position: 'absolute', left: 70, top: 22, color: '#F5A623', fontSize: 24, fontWeight: 800}}>
            Review and approve
          </div>
          <div style={{position: 'absolute', left: 70, top: 62, color: 'rgba(255,255,255,0.60)', fontSize: 19, fontWeight: 600}}>
            Approval pending
          </div>
        </div>

        {/* ---- BOTTOM STRIP: bar chart + status chips ---- */}
        <div
          style={{
            position: 'absolute',
            left: 40,
            top: 920,
            width: 1840,
            height: 120,
            borderRadius: 20,
            background: 'rgba(34,211,238,0.06)',
            border: '1px solid rgba(34,211,238,0.25)',
            opacity: fadeIn(frame - 20, 12) * fadeOutEnd(frame),
          }}
        >
          <div
            style={{
              position: 'absolute',
              left: 30,
              top: 44,
              color: 'rgba(34,211,238,0.85)',
              fontSize: 22,
              fontWeight: 800,
              letterSpacing: 3,
            }}
          >
            AGENT FLOW
          </div>
          {Array.from({length: BAR_COUNT}, (_, i) => {
            const h = 16 + 40 * (0.3 + 0.7 * (triWave(frame + i * 17, 100) / 50));
            return (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  left: 240 + i * 56,
                  bottom: 22,
                  width: 34,
                  height: h.toFixed(1),
                  borderRadius: 6,
                  background: i === 2 ? '#F5A623' : '#22D3EE',
                  boxShadow: i === 2 ? '0 0 12px rgba(245,166,35,0.5)' : '0 0 10px rgba(34,211,238,0.4)',
                }}
              />
            );
          })}
          <div
            style={{
              position: 'absolute',
              left: 1140,
              top: 34,
              width: 300,
              height: 52,
              borderRadius: 26,
              border: '2px solid #22D3EE',
              background: 'rgba(34,211,238,0.10)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#22D3EE',
              fontSize: 22,
              fontWeight: 800,
              letterSpacing: 1,
            }}
          >
            AGENT ACTIVE
          </div>
          <div
            style={{
              position: 'absolute',
              left: 1470,
              top: 34,
              width: 340,
              height: 52,
              borderRadius: 26,
              border: '2px solid #F5A623',
              background: 'rgba(245,166,35,0.10)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#F5A623',
              fontSize: 22,
              fontWeight: 800,
              letterSpacing: 1,
            }}
          >
            HUMAN IN THE LOOP
          </div>
        </div>
      </Grade>
      <GrainNoise opacity={0.08} seed={91} />
      <Vignette strength={0.16} rgb="4,12,26" />
    </AbsoluteFill>
  );
};
