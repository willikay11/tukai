import IconComponent from '@/app/components/iconComponent';
import clsx from 'clsx';

export default function StepIndicator({
  currentStep = 0,
  steps,
}: {
  currentStep: number;
  steps: { label: string; completed: boolean }[];
}) {
  return (
    <div className="flex w-full items-center">
      {steps.map((step, idx) => (
        <div key={idx} className="w-full">
          <div className="flex w-full flex-row items-center overflow-hidden">
            <div className="flex flex-col items-center justify-center">
              <div
                className={`flex h-[28px] w-[28px] items-center justify-center rounded-full border-[1px] border-primary p-[2px] ${
                  currentStep > idx ? 'bg-primary' : 'border-gray-300'
                } text-white`}
              >
                {currentStep > idx ? <IconComponent iconName="TickDoubleIcon" size={16} /> : null}
              </div>
            </div>
            <div className="h-[2px] w-full shrink-0 bg-muted" />
          </div>
          <span
            className={clsx(
              'text-xs',
              idx === currentStep || currentStep > idx
                ? 'font-medium text-primary'
                : 'text-gray-500',
            )}
          >
            {step.label}
          </span>
        </div>
      ))}
    </div>
  );
}
