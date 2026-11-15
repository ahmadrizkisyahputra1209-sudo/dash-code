import React from 'react';
import {Composition} from 'remotion';
import {RamadanCountdown2027} from './RamadanCountdown2027.jsx';
import {MudikLebaranMap} from './MudikLebaranMap.jsx';
import {TrumpAccounts} from './TrumpAccounts.jsx';
import {SolarEclipse2027} from './SolarEclipse2027.jsx';
import {HolyWeekTimeline} from './HolyWeekTimeline.jsx';
import {KartiniDay} from './KartiniDay.jsx';
import {NyepiDay} from './NyepiDay.jsx';
import {FafsaExplainer} from './FafsaExplainer.jsx';
import {Limit401k2027} from './Limit401k2027.jsx';
import {DataCentreWater} from './DataCentreWater.jsx';
import {FoodMiles} from './FoodMiles.jsx';
import {WaisakBorobudur} from './WaisakBorobudur.jsx';

export const RemotionRoot = () => {
  return (
    <>
      <Composition id="RamadanCountdown2027" component={RamadanCountdown2027} durationInFrames={300} fps={30} width={1080} height={1920} />
      <Composition id="MudikLebaranMap" component={MudikLebaranMap} durationInFrames={300} fps={30} width={1920} height={1080} />
      <Composition id="TrumpAccounts" component={TrumpAccounts} durationInFrames={300} fps={30} width={1920} height={1080} />
      <Composition id="SolarEclipse2027" component={SolarEclipse2027} durationInFrames={300} fps={30} width={1920} height={1080} />
      <Composition id="HolyWeekTimeline" component={HolyWeekTimeline} durationInFrames={300} fps={30} width={1920} height={1080} />
      <Composition id="KartiniDay" component={KartiniDay} durationInFrames={300} fps={30} width={1080} height={1920} />
      <Composition id="NyepiDay" component={NyepiDay} durationInFrames={300} fps={30} width={1920} height={1080} />
      <Composition id="FafsaExplainer" component={FafsaExplainer} durationInFrames={300} fps={30} width={1080} height={1920} />
      <Composition id="Limit401k2027" component={Limit401k2027} durationInFrames={300} fps={30} width={1920} height={1080} />
      <Composition id="DataCentreWater" component={DataCentreWater} durationInFrames={300} fps={30} width={1920} height={1080} />
      <Composition id="FoodMiles" component={FoodMiles} durationInFrames={300} fps={30} width={1920} height={1080} />
      <Composition id="WaisakBorobudur" component={WaisakBorobudur} durationInFrames={300} fps={30} width={1920} height={1080} />
    </>
  );
};
