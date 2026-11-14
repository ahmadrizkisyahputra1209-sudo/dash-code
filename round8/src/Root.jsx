import React from 'react';
import {Composition} from 'remotion';
import {ZakatCalculator} from './ZakatCalculator.jsx';
import {IftarCountdown} from './IftarCountdown.jsx';
import {LaylatAlQadr} from './LaylatAlQadr.jsx';
import {FireGoatZodiac} from './FireGoatZodiac.jsx';
import {GroundwaterAquifer} from './GroundwaterAquifer.jsx';
import {FoodWasteJourney} from './FoodWasteJourney.jsx';
import {TaxDayCountdown} from './TaxDayCountdown.jsx';
import {QurbaniThreeShares} from './QurbaniThreeShares.jsx';
import {SongketWeave} from './SongketWeave.jsx';
import {JamuKunyitAsam} from './JamuKunyitAsam.jsx';

export const RemotionRoot = () => {
  return (
    <>
      <Composition id="ZakatCalculator" component={ZakatCalculator} durationInFrames={300} fps={30} width={1080} height={1920} />
      <Composition id="IftarCountdown" component={IftarCountdown} durationInFrames={300} fps={30} width={1080} height={1920} />
      <Composition id="LaylatAlQadr" component={LaylatAlQadr} durationInFrames={300} fps={30} width={1920} height={1080} />
      <Composition id="FireGoatZodiac" component={FireGoatZodiac} durationInFrames={300} fps={30} width={1920} height={1080} />
      <Composition id="GroundwaterAquifer" component={GroundwaterAquifer} durationInFrames={300} fps={30} width={1920} height={1080} />
      <Composition id="FoodWasteJourney" component={FoodWasteJourney} durationInFrames={300} fps={30} width={1920} height={1080} />
      <Composition id="TaxDayCountdown" component={TaxDayCountdown} durationInFrames={300} fps={30} width={1920} height={1080} />
      <Composition id="QurbaniThreeShares" component={QurbaniThreeShares} durationInFrames={300} fps={30} width={1920} height={1080} />
      <Composition id="SongketWeave" component={SongketWeave} durationInFrames={300} fps={30} width={1920} height={1080} />
      <Composition id="JamuKunyitAsam" component={JamuKunyitAsam} durationInFrames={300} fps={30} width={1920} height={1080} />
    </>
  );
};
