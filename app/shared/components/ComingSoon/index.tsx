import { IconComponent } from '@/app/shared/components/Icons';

interface ComingSoonProps {
  feature: string;
  iconName?: string;
}

export const ComingSoon = ({ feature, iconName = 'Clock01Icon' }: ComingSoonProps) => (
  <div className="py-20 text-center">
    <div className="flex justify-center">
      <IconComponent iconName={iconName} size={28} color="currentColor" className="text-gray-300" />
    </div>
    <p className="mt-4 text-lg font-bold text-gray-900">{feature} coming soon</p>
    <p className="mt-1 text-sm text-gray-400">We&rsquo;re building this. Check back shortly.</p>
  </div>
);
