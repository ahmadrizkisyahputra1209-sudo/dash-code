import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {Grade, Grain, Vignette} from './postfx.jsx';

// 2. ROBOT ARM ASSEMBLY — bright clean factory, conveyor with boxes looping
// left→right, articulated arm (2 segments + gripper) working in a periodic
// cycle, hazard stripe, ceiling lights. Frame 0: arm mid-cycle over a box.
// Niche: industrial manufacturing / automation (low-supply niche, Adobe
// helpx lists manufacturing under business & technology). Pure code.
export const RobotArmAssembly = () => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const p = frame / durationInFrames;
  const cyc = 2 * Math.PI * p;
  // Arm joint angles: smooth periodic pick-and-place cycle
  const shoulder = -38 + 26 * Math.sin(cyc);
  const elbow = 62 + 30 * Math.sin(cyc + 1.2);
  const grip = 0.55 + 0.45 * Math.sin(cyc + 2.4); // 0=open 1=closed
  const baseX = 960, baseY = 760;
  const L1 = 260, L2 = 230;
  const a1 = ((shoulder - 90) * Math.PI) / 180;
  const jx = baseX + L1 * Math.cos(a1);
  const jy = baseY + L1 * Math.sin(a1);
  const a2 = a1 + ((elbow - 90) * Math.PI) / 180 + Math.PI / 2 - Math.PI / 2;
  // second segment angle relative: elbow bends back toward belt
  const a2r = ((shoulder + elbow - 180) * Math.PI) / 180;
  const hx = jx + L2 * Math.cos(a2r);
  const hy = jy + L2 * Math.sin(a2r);
  const boxes = [0, 1, 2, 3].map((i) => {
    const bx = ((i * 520 + p * 1920 * 0.55) % 2300) - 190;
    return {x: bx, y: 700, held: false};
  });
  const heldBoxY = hy + 46;
  return (
    <AbsoluteFill style={{backgroundColor: '#E8EEF4', overflow: 'hidden'}}>
      <Grade>
        <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, #DCE7F0 0%, #EAF1F7 55%, #C9D6E2 55.2%, #B7C7D6 100%)'}} />
        {/* ceiling light panels */}
        {[300, 960, 1620].map((x, i) => (
          <div key={i} style={{position: 'absolute', left: x - 130, top: 36, width: 260, height: 34, borderRadius: 8, background: 'rgba(255,255,255,0.95)', boxShadow: '0 0 40px rgba(255,255,255,0.9)'}} />
        ))}
        {/* back wall panels */}
        <svg width={1920} height={1080} style={{position: 'absolute'}}>
          {[0, 1, 2, 3].map((i) => (
            <rect key={i} x={120 + i * 460} y={150} width={380} height={300} rx={14} fill="#FFFFFF" opacity={0.35} stroke="#9FB4C6" strokeWidth={2} />
          ))}
          {/* conveyor belt */}
          <rect x={0} y={700} width={1920} height={110} fill="#33475B" />
          <rect x={0} y={700} width={1920} height={14} fill="#4A6478" />
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
            <rect key={i} x={((i * 260 + p * 1056) % 2080) - 80} y={742} width={90} height={26} rx={6} fill="#5B7A94" />
          ))}
          {/* hazard stripe on floor */}
          <rect x={0} y={880} width={1920} height={26} fill="#F5B81D" />
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
            <polygon key={i} points={`${i * 200},880 ${i * 200 + 100},880 ${i * 200 + 60},906 ${i * 200 - 40},906`} fill="#222E3A" />
          ))}
          {/* boxes on belt */}
          {boxes.map((b, i) => (
            <g key={i}>
              <rect x={b.x} y={610} width={130} height={90} rx={6} fill="#E8A33D" stroke="#B97E22" strokeWidth={3} />
              <rect x={b.x + 58} y={610} width={14} height={90} fill="#B97E22" opacity={0.6} />
              <rect x={b.x + 8} y={636} width={114} height={10} fill="#B97E22" opacity={0.45} />
            </g>
          ))}
          {/* robot pedestal + arm */}
          <rect x={baseX - 110} y={baseY} width={220} height={120} rx={12} fill="#2F4A63" />
          <rect x={baseX - 80} y={baseY - 40} width={160} height={48} rx={10} fill="#3E617F" />
          <line x1={baseX} y1={baseY - 40} x2={jx} y2={jy} stroke="#F28C28" strokeWidth={44} strokeLinecap="round" />
          <line x1={jx} y1={jy} x2={hx} y2={hy} stroke="#F28C28" strokeWidth={36} strokeLinecap="round" />
          <circle cx={baseX} cy={baseY - 40} r={34} fill="#D96F0E" />
          <circle cx={jx} cy={jy} r={28} fill="#D96F0E" />
          <circle cx={hx} cy={hy} r={22} fill="#2F4A63" />
          {/* gripper */}
          <g transform={`rotate(${(shoulder + elbow - 90).toFixed(1)} ${hx} ${hy})`}>
            <rect x={hx - 26} y={hy + 8} width={12} height={44 + grip * 10} rx={5} fill="#2F4A63" />
            <rect x={hx + 14} y={hy + 8} width={12} height={44 + grip * 10} rx={5} fill="#2F4A63" />
          </g>
          {/* held box under gripper */}
          {grip > 0.7 && (
            <g>
              <rect x={hx - 55} y={heldBoxY} width={110} height={76} rx={6} fill="#E8A33D" stroke="#B97E22" strokeWidth={3} />
              <rect x={hx - 7} y={heldBoxY} width={14} height={76} fill="#B97E22" opacity={0.6} />
            </g>
          )}
          {/* status light */}
          <circle cx={baseX + 84} cy={baseY - 16} r={12} fill="#37C978" />
          <circle cx={baseX + 84} cy={baseY - 16} r={20} fill="#37C978" opacity={0.25 + 0.2 * Math.sin(cyc * 2)} />
        </svg>
      </Grade>
      <Grain opacity={0.05} />
      <Vignette strength={0.16} rgb="40,70,100" />
    </AbsoluteFill>
  );
};
