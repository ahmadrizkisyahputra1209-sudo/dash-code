import React from 'react';
import {Composition} from 'remotion';
import {GirihRosetteMorph} from './GirihRosetteMorph.jsx';
import {ChineseLanternsRise} from './ChineseLanternsRise.jsx';
import {ValentineWaxSeal} from './ValentineWaxSeal.jsx';
import {EasterEggPattern} from './EasterEggPattern.jsx';
import {BreathingPacer} from './BreathingPacer.jsx';
import {TelemedicineCall} from './TelemedicineCall.jsx';
import {EvChargingDashboard} from './EvChargingDashboard.jsx';
import {EwalletBalance} from './EwalletBalance.jsx';
import {StockTickerTape} from './StockTickerTape.jsx';
import {FlightTrackerMap} from './FlightTrackerMap.jsx';
import {WaterCycleDiagram} from './WaterCycleDiagram.jsx';
import {WayangShadow} from './WayangShadow.jsx';

export const RemotionRoot = () => {
  return (
    <>
      <Composition id="GirihRosetteMorph" component={GirihRosetteMorph} durationInFrames={300} fps={30} width={1920} height={1080} />
      <Composition id="ChineseLanternsRise" component={ChineseLanternsRise} durationInFrames={300} fps={30} width={1080} height={1920} />
      <Composition id="ValentineWaxSeal" component={ValentineWaxSeal} durationInFrames={300} fps={30} width={1920} height={1080} />
      <Composition id="EasterEggPattern" component={EasterEggPattern} durationInFrames={300} fps={30} width={1920} height={1080} />
      <Composition id="BreathingPacer" component={BreathingPacer} durationInFrames={300} fps={30} width={1920} height={1080} />
      <Composition id="TelemedicineCall" component={TelemedicineCall} durationInFrames={300} fps={30} width={1920} height={1080} />
      <Composition id="EvChargingDashboard" component={EvChargingDashboard} durationInFrames={300} fps={30} width={1920} height={1080} />
      <Composition id="EwalletBalance" component={EwalletBalance} durationInFrames={300} fps={30} width={1080} height={1920} />
      <Composition id="StockTickerTape" component={StockTickerTape} durationInFrames={300} fps={30} width={1920} height={1080} />
      <Composition id="FlightTrackerMap" component={FlightTrackerMap} durationInFrames={300} fps={30} width={1920} height={1080} />
      <Composition id="WaterCycleDiagram" component={WaterCycleDiagram} durationInFrames={300} fps={30} width={1920} height={1080} />
      <Composition id="WayangShadow" component={WayangShadow} durationInFrames={300} fps={30} width={1920} height={1080} />
    </>
  );
};
