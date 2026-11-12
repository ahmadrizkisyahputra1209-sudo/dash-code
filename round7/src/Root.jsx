import React from 'react';
import {Composition} from 'remotion';
import {TaxRefund} from './TaxRefund.jsx';
import {EarthDayFoodCycle} from './EarthDayFoodCycle.jsx';
import {EidAlAdha} from './EidAlAdha.jsx';
import {Graduation2027} from './Graduation2027.jsx';
import {PassportStampTravel} from './PassportStampTravel.jsx';
import {PasskeyLogin} from './PasskeyLogin.jsx';
import {SmartHomeControl} from './SmartHomeControl.jsx';
import {TwoFactorOtp} from './TwoFactorOtp.jsx';
import {CryptoWalletTransfer} from './CryptoWalletTransfer.jsx';
import {InsuranceClaimTracker} from './InsuranceClaimTracker.jsx';
import {MoonPhases} from './MoonPhases.jsx';
import {HumanAiCopilot} from './HumanAiCopilot.jsx';

export const RemotionRoot = () => {
  return (
    <>
      <Composition id="TaxRefund" component={TaxRefund} durationInFrames={300} fps={30} width={1920} height={1080} />
      <Composition id="EarthDayFoodCycle" component={EarthDayFoodCycle} durationInFrames={300} fps={30} width={1920} height={1080} />
      <Composition id="EidAlAdha" component={EidAlAdha} durationInFrames={300} fps={30} width={1920} height={1080} />
      <Composition id="Graduation2027" component={Graduation2027} durationInFrames={300} fps={30} width={1920} height={1080} />
      <Composition id="PassportStampTravel" component={PassportStampTravel} durationInFrames={300} fps={30} width={1920} height={1080} />
      <Composition id="PasskeyLogin" component={PasskeyLogin} durationInFrames={300} fps={30} width={1920} height={1080} />
      <Composition id="SmartHomeControl" component={SmartHomeControl} durationInFrames={300} fps={30} width={1920} height={1080} />
      <Composition id="TwoFactorOtp" component={TwoFactorOtp} durationInFrames={300} fps={30} width={1080} height={1920} />
      <Composition id="CryptoWalletTransfer" component={CryptoWalletTransfer} durationInFrames={300} fps={30} width={1920} height={1080} />
      <Composition id="InsuranceClaimTracker" component={InsuranceClaimTracker} durationInFrames={300} fps={30} width={1920} height={1080} />
      <Composition id="MoonPhases" component={MoonPhases} durationInFrames={300} fps={30} width={1920} height={1080} />
      <Composition id="HumanAiCopilot" component={HumanAiCopilot} durationInFrames={300} fps={30} width={1920} height={1080} />
    </>
  );
};
