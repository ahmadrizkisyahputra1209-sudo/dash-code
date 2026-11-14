import React from 'react';
import {Composition} from 'remotion';
import {AiAgentWorkflow} from './AiAgentWorkflow.jsx';
import {TaxDeductions2027} from './TaxDeductions2027.jsx';
import {EuAiActTimeline} from './EuAiActTimeline.jsx';
import {HajjJourney} from './HajjJourney.jsx';
import {SuhoorIftarTimetable} from './SuhoorIftarTimetable.jsx';
import {AiDataCentreEnergy} from './AiDataCentreEnergy.jsx';
import {CarbonFootprintCalculator} from './CarbonFootprintCalculator.jsx';
import {WaterFootprintFood} from './WaterFootprintFood.jsx';
import {VerticalFarmYield} from './VerticalFarmYield.jsx';
import {PlantBasedPlate} from './PlantBasedPlate.jsx';
import {StudentLoanRepayment} from './StudentLoanRepayment.jsx';
import {SpotAiScam} from './SpotAiScam.jsx';

export const RemotionRoot = () => {
  return (
    <>
      <Composition id="AiAgentWorkflow" component={AiAgentWorkflow} durationInFrames={300} fps={30} width={1920} height={1080} />
      <Composition id="TaxDeductions2027" component={TaxDeductions2027} durationInFrames={300} fps={30} width={1920} height={1080} />
      <Composition id="EuAiActTimeline" component={EuAiActTimeline} durationInFrames={300} fps={30} width={1920} height={1080} />
      <Composition id="HajjJourney" component={HajjJourney} durationInFrames={300} fps={30} width={1920} height={1080} />
      <Composition id="SuhoorIftarTimetable" component={SuhoorIftarTimetable} durationInFrames={300} fps={30} width={1080} height={1920} />
      <Composition id="AiDataCentreEnergy" component={AiDataCentreEnergy} durationInFrames={300} fps={30} width={1920} height={1080} />
      <Composition id="CarbonFootprintCalculator" component={CarbonFootprintCalculator} durationInFrames={300} fps={30} width={1920} height={1080} />
      <Composition id="WaterFootprintFood" component={WaterFootprintFood} durationInFrames={300} fps={30} width={1920} height={1080} />
      <Composition id="VerticalFarmYield" component={VerticalFarmYield} durationInFrames={300} fps={30} width={1920} height={1080} />
      <Composition id="PlantBasedPlate" component={PlantBasedPlate} durationInFrames={300} fps={30} width={1080} height={1920} />
      <Composition id="StudentLoanRepayment" component={StudentLoanRepayment} durationInFrames={300} fps={30} width={1920} height={1080} />
      <Composition id="SpotAiScam" component={SpotAiScam} durationInFrames={300} fps={30} width={1080} height={1920} />
    </>
  );
};
