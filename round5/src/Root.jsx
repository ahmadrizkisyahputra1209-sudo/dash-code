import React from 'react';
import {Composition} from 'remotion';
import {GirihGeometricStar} from './GirihGeometricStar.jsx';
import {RamadanLanterns} from './RamadanLanterns.jsx';
import {CrescentMoonNight} from './CrescentMoonNight.jsx';
import {KetupatWeave} from './KetupatWeave.jsx';
import {GoldIngotsRain} from './GoldIngotsRain.jsx';
import {PlumBlossomBloom} from './PlumBlossomBloom.jsx';
import {EsgDashboard} from './EsgDashboard.jsx';
import {QrPaymentSuccess} from './QrPaymentSuccess.jsx';
import {HealthKpiRings} from './HealthKpiRings.jsx';
import {SavingsGrowth} from './SavingsGrowth.jsx';
import {DeliveryRouteMap} from './DeliveryRouteMap.jsx';
import {PhotosynthesisDiagram} from './PhotosynthesisDiagram.jsx';

export const RemotionRoot = () => {
  return (
    <>
      <Composition id="GirihGeometricStar" component={GirihGeometricStar} durationInFrames={300} fps={30} width={1920} height={1080} />
      <Composition id="RamadanLanterns" component={RamadanLanterns} durationInFrames={300} fps={30} width={1920} height={1080} />
      <Composition id="CrescentMoonNight" component={CrescentMoonNight} durationInFrames={300} fps={30} width={1080} height={1920} />
      <Composition id="KetupatWeave" component={KetupatWeave} durationInFrames={300} fps={30} width={1920} height={1080} />
      <Composition id="GoldIngotsRain" component={GoldIngotsRain} durationInFrames={300} fps={30} width={1080} height={1920} />
      <Composition id="PlumBlossomBloom" component={PlumBlossomBloom} durationInFrames={300} fps={30} width={1920} height={1080} />
      <Composition id="EsgDashboard" component={EsgDashboard} durationInFrames={300} fps={30} width={1920} height={1080} />
      <Composition id="QrPaymentSuccess" component={QrPaymentSuccess} durationInFrames={300} fps={30} width={1080} height={1920} />
      <Composition id="HealthKpiRings" component={HealthKpiRings} durationInFrames={300} fps={30} width={1920} height={1080} />
      <Composition id="SavingsGrowth" component={SavingsGrowth} durationInFrames={300} fps={30} width={1920} height={1080} />
      <Composition id="DeliveryRouteMap" component={DeliveryRouteMap} durationInFrames={300} fps={30} width={1920} height={1080} />
      <Composition id="PhotosynthesisDiagram" component={PhotosynthesisDiagram} durationInFrames={300} fps={30} width={1920} height={1080} />
    </>
  );
};
