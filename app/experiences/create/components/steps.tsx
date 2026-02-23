'use client';

import IconComponent from '@/app/components/iconComponent';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import CreateExperienceAbout from './about';
import ExperienceDates from './dates';
import CreateExperienceInvites from './invites';

const STEPS = [
  { id: 'about', label: 'About', icon: 'InformationCircleIcon' },
  { id: 'dates-tickets', label: 'Dates & Tickets', icon: 'Ticket02Icon' },
  { id: 'guests', label: 'Invite Guests', icon: 'AddTeamIcon' },
  { id: 'wallet', label: 'Wallet Details', icon: 'WalletAdd02Icon' },
];

export default function CreateExperienceSteps({
  currentStep = 'about',
  onStepChange,
}: {
  currentStep?: string;
  onStepChange?: (step: string) => void;
}) {
  return (
    <Tabs defaultValue={currentStep} onValueChange={onStepChange} className="w-full">
      <TabsList className="flex w-full gap-2 bg-transparent h-auto p-0">
        {STEPS.map((step) => (
          <TabsTrigger
            key={step.id}
            value={step.id}
            className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold bg-white text-gray-800 bg-gray-100 data-[state=active]:border-b-[0px] transition-colors data-[state=active]:border-emerald-600 data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700"
          >
            <div className="flex-shrink-0">
              <IconComponent iconName={step.icon} size={20} />
            </div>
            <span className="hidden sm:inline">{step.label}</span>
            <span className="inline sm:hidden">{step.label.split(' ')[0]}</span>
          </TabsTrigger>
        ))}
      </TabsList>

      {/* Tab Content */}
      <TabsContent value="about" className="mt-6">
        <CreateExperienceAbout />
      </TabsContent>

      <TabsContent value="dates-tickets" className="mt-6">
        <ExperienceDates />
      </TabsContent>

      <TabsContent value="guests" className="mt-6">
        <CreateExperienceInvites />
      </TabsContent>

      <TabsContent value="wallet" className="mt-6">
        <div className="bg-white rounded-xl p-6">
          <p className="text-gray-500">Wallet Details tab coming soon</p>
        </div>
      </TabsContent>
    </Tabs>
  );
}