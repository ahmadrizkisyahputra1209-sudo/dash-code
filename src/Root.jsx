import React from 'react';
import {Composition} from 'remotion';
import {SolarPanelField} from './SolarPanelField.jsx';
import {RobotArmAssembly} from './RobotArmAssembly.jsx';
import {DroneDelivery} from './DroneDelivery.jsx';
import {DonutChart} from './DonutChart.jsx';
import {DnaHelix} from './DnaHelix.jsx';
import {RamenNoodle} from './RamenNoodle.jsx';
import {MosqueCrescentDawn} from './MosqueCrescentDawn.jsx';
import {AngpaoVertical} from './AngpaoVertical.jsx';
import {RoseBloom} from './RoseBloom.jsx';
import {TulipSpring} from './TulipSpring.jsx';
import {HotAirBalloon} from './HotAirBalloon.jsx';
import {ParcelTrackingVertical} from './ParcelTrackingVertical.jsx';

export const RemotionRoot = () => {
  return (
    <>
      <Composition id="SolarPanelField" component={SolarPanelField} durationInFrames={300} fps={30} width={1920} height={1080} />
      <Composition id="RobotArmAssembly" component={RobotArmAssembly} durationInFrames={300} fps={30} width={1920} height={1080} />
      <Composition id="DroneDelivery" component={DroneDelivery} durationInFrames={300} fps={30} width={1920} height={1080} />
      <Composition id="DonutChart" component={DonutChart} durationInFrames={300} fps={30} width={1920} height={1080} />
      <Composition id="DnaHelix" component={DnaHelix} durationInFrames={300} fps={30} width={1920} height={1080} />
      <Composition id="RamenNoodle" component={RamenNoodle} durationInFrames={300} fps={30} width={1920} height={1080} />
      <Composition id="MosqueCrescentDawn" component={MosqueCrescentDawn} durationInFrames={300} fps={30} width={1920} height={1080} />
      <Composition id="AngpaoVertical" component={AngpaoVertical} durationInFrames={300} fps={30} width={1080} height={1920} />
      <Composition id="RoseBloom" component={RoseBloom} durationInFrames={300} fps={30} width={1920} height={1080} />
      <Composition id="TulipSpring" component={TulipSpring} durationInFrames={300} fps={30} width={1920} height={1080} />
      <Composition id="HotAirBalloon" component={HotAirBalloon} durationInFrames={300} fps={30} width={1920} height={1080} />
      <Composition id="ParcelTrackingVertical" component={ParcelTrackingVertical} durationInFrames={300} fps={30} width={1080} height={1920} />
    </>
  );
};
