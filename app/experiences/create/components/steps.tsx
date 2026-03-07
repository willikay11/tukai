'use client';

import IconComponent from '@/app/components/iconComponent';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Experience } from '@/types/experience';

import CreateExperienceAbout from './about';
import ExperienceDates from './dates';
import CreateExperienceInvites from './invites';

export type ExperienceStepId = 'about' | 'dates-tickets' | 'guests' | 'wallet';

const STEPS = [
  {
    id: 'about',
    label: 'About',
    icon: 'InformationCircleIcon',
    filledIcon: 'InformationCircleIcon',
  },
  {
    id: 'dates-tickets',
    label: 'Dates & Tickets',
    icon: 'Ticket02Icon',
    filledIcon: 'Ticket02Icon',
  },
  { id: 'guests', label: 'Invite Guests', icon: 'AddTeamIcon', filledIcon: 'AddTeam02Icon' },
  { id: 'wallet', label: 'Wallet Details', icon: 'WalletAdd02Icon', filledIcon: 'WalletAdd01Icon' },
];

export default function CreateExperienceSteps({
  currentStep = 'about',
  onStepChange,
  onExperienceCreated,
  onDatesUpdatedSuccess,
  experience,
  isLoadingExperience,
}: {
  currentStep?: ExperienceStepId;
  onStepChange?: (step: ExperienceStepId) => void;
  onExperienceCreated?: (experienceId: string, step?: ExperienceStepId) => void;
  onDatesUpdatedSuccess?: (nextStep?: 'guests') => void;
  experience?: Experience;
  isLoadingExperience?: boolean;
}) {
  const currentStepIndex = STEPS.findIndex((step) => step.id === currentStep);

  const handleStepChange = (step: ExperienceStepId) => {
    onStepChange?.(step);
  };

  return (
    <Tabs
      value={currentStep}
      onValueChange={(step) => handleStepChange(step as ExperienceStepId)}
      className="w-full"
    >
      <TabsList className="flex h-auto w-full gap-2 bg-transparent p-0">
        {STEPS.map((step, index) => {
          const isAboutFilled = Boolean(experience?.id);
          const isDatesTicketsFilled = Boolean(experience?.tickets?.length);
          const stepFilledMap: Record<string, boolean> = {
            about: isAboutFilled,
            'dates-tickets': isDatesTicketsFilled,
            guests: false,
            wallet: false,
          };
          const isFilled = stepFilledMap[step.id] ?? false;
          const stepIcon = isFilled ? step.filledIcon : step.icon;

          return (
            <TabsTrigger
              key={step.id}
              value={step.id}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs transition-colors data-[state=active]:border-b-[0px] data-[state=active]:border-emerald-600 data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700 ${
                isFilled ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-800'
              }`}
            >
              <div className="flex-shrink-0">
                <IconComponent iconName={stepIcon} size={20} />
              </div>
              <span className="hidden sm:inline">{step.label}</span>
              <span className="inline sm:hidden">{step.label.split(' ')[0]}</span>
            </TabsTrigger>
          );
        })}
      </TabsList>

      {/* Tab Content */}
      <TabsContent value="about" className="mt-6">
        <CreateExperienceAbout
          experience={experience}
          onSuccess={(experienceId) => {
            onExperienceCreated?.(experienceId, 'dates-tickets');
          }}
        />
      </TabsContent>

      <TabsContent value="dates-tickets" className="mt-6">
        <ExperienceDates
          experienceId={experience?.id || null}
          experience={experience}
          onDatesUpdatedSuccess={onDatesUpdatedSuccess}
        />
      </TabsContent>

      <TabsContent value="guests" className="mt-6">
        <CreateExperienceInvites experienceId={experience?.id || null} />
      </TabsContent>

      <TabsContent value="wallet" className="mt-6">
        <div className="rounded-xl bg-white p-6">
          <p className="text-gray-500">Wallet Details tab coming soon</p>
        </div>
      </TabsContent>
    </Tabs>
  );
}
