'use client';

import { useState } from 'react';

import CreateExperienceSteps, { type ExperienceStepId } from './components/steps';
import ExperienceStepSidePanel from './components/step-side-panel';

export default function CreateExperiencePage() {
  const [activeStep, setActiveStep] = useState<ExperienceStepId>('about');

  return (
    <main className="mt-6 grid h-full grid-cols-12 gap-4 px-4 md:px-0">
      <div className="col-span-12 mb-4 md:col-span-10 md:col-start-2 md:mx-0 lg:col-span-4 lg:col-start-3 xl:col-span-4 xl:col-start-3 3xl:col-span-2 3xl:col-start-4 4xl:col-span-2 4xl:col-start-5">
        <CreateExperienceSteps currentStep={activeStep} onStepChange={setActiveStep} />
      </div>
      <div className="lg:col-span-4 lg:col-start-8">
        <ExperienceStepSidePanel step={activeStep} />
      </div>
    </main>
  );
}
