'use client';

import { IconComponent } from '@/app/shared/components/Icons';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { Interest } from '@/types/interest';

import { PhotoField, type PhotoFieldPhoto } from '@/app/shared/components/Forms/PhotoField';

import type { NewPlaceDraft } from './useConnectPlaceDrawer';

const COUNTRIES = [
  { value: 'KE', label: 'Kenya' },
  { value: 'UG', label: 'Uganda' },
  { value: 'TZ', label: 'Tanzania' },
  { value: 'RW', label: 'Rwanda' },
];

export interface NewPlaceFormProps {
  draft: NewPlaceDraft;
  onFieldChange: (fields: Partial<NewPlaceDraft>) => void;
  onAddPhotos: (files: File[]) => void;
  onRemovePhoto: (id: string) => void;
  onReorderPhotos: (fromIndex: number, toIndex: number) => void;
  onMovePhoto: (id: string, direction: -1 | 1) => void;
  categories: Interest[];
  onToggleCategory: (id: string) => void;
}

export const NewPlaceForm = ({
  draft,
  onFieldChange,
  onAddPhotos,
  onRemovePhoto,
  onReorderPhotos,
  onMovePhoto,
  categories,
  onToggleCategory,
}: NewPlaceFormProps) => (
  <section className="flex flex-col gap-5" aria-label="New place">
    <PhotoField
      photos={draft.photos as PhotoFieldPhoto[]}
      onAdd={onAddPhotos}
      onRemove={onRemovePhoto}
      onReorder={onReorderPhotos}
      onMove={onMovePhoto}
      showCoverBadge={false}
      label={
        <>
          Photos of the business{' '}
          <span className="font-normal text-ink-muted">
            (square photos work best, up to 15 MB each)
          </span>
        </>
      }
    />

    <label className="flex flex-col gap-2">
      <span className="text-[15px] font-semibold text-gray-800">Business name</span>
      <Input
        type="text"
        maxLength={80}
        placeholder="Enter the name of the business"
        value={draft.title}
        onChange={(event) => onFieldChange({ title: event.target.value })}
        suffixIcon={
          <IconComponent iconName="StoreVerified01Icon" size={20} className="text-ink-muted" />
        }
        containerClassName="h-14 rounded-xl"
      />
    </label>

    <div className="flex flex-col gap-2">
      <span className="text-[15px] font-semibold text-gray-800">Where is your business?</span>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,180px),1fr))] gap-3">
        <Select value={draft.country} onValueChange={(value) => onFieldChange({ country: value })}>
          <SelectTrigger className="h-14 rounded-xl" prefixIcon="GlobeIcon">
            <SelectValue placeholder="Country" />
          </SelectTrigger>
          <SelectContent>
            {COUNTRIES.map((country) => (
              <SelectItem key={country.value} value={country.value}>
                {country.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Input
          type="text"
          maxLength={60}
          placeholder="Town or area, like Westlands"
          aria-label="Town or area"
          value={draft.town}
          onChange={(event) => onFieldChange({ town: event.target.value })}
          containerClassName="h-14 rounded-xl"
        />
      </div>
    </div>

    <label className="flex flex-col gap-2">
      <span className="text-[15px] font-semibold text-gray-800">Short description</span>
      <Textarea
        rows={4}
        maxLength={400}
        placeholder="Tell guests about your business"
        value={draft.description}
        onChange={(event) => onFieldChange({ description: event.target.value })}
        className="rounded-xl border-line focus-visible:border-brand focus-visible:shadow-[0_0_0_3px_#E8F1ED]"
      />
    </label>

    <div className="flex flex-col gap-2.5">
      <span className="text-[15px] font-semibold text-gray-800">
        Contact details <span className="font-normal text-ink-muted">(optional)</span>
      </span>

      <Input
        type="tel"
        inputMode="numeric"
        maxLength={12}
        placeholder="Phone number"
        aria-label="Phone number"
        value={draft.phone}
        onChange={(event) => onFieldChange({ phone: event.target.value })}
        overlay={
          <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center border-r border-line pr-2.5 text-[15px] font-semibold text-gray-800">
            +254
          </span>
        }
        className="pl-[62px]"
        suffixIcon={<IconComponent iconName="Call02Icon" size={20} className="text-ink-muted" />}
        containerClassName="h-14 rounded-xl"
      />

      <Input
        type="email"
        maxLength={80}
        placeholder="Email address"
        aria-label="Email address"
        value={draft.email}
        onChange={(event) => onFieldChange({ email: event.target.value })}
        suffixIcon={<IconComponent iconName="Mail01Icon" size={20} className="text-ink-muted" />}
        containerClassName="h-14 rounded-xl"
      />

      <Input
        type="url"
        maxLength={120}
        placeholder="Website"
        aria-label="Website"
        value={draft.website}
        onChange={(event) => onFieldChange({ website: event.target.value })}
        suffixIcon={<IconComponent iconName="GlobeIcon" size={20} className="text-ink-muted" />}
        containerClassName="h-14 rounded-xl"
      />
    </div>

    <div className="flex flex-col gap-2.5">
      <span className="text-[15px] font-semibold text-gray-800">
        Categories{' '}
        <span className="font-normal text-ink-muted">
          (what your business offers, like hiking or restaurants)
        </span>
      </span>

      <div className="flex flex-wrap gap-2">
        {categories.map((category) => {
          const active = draft.categoryIds.includes(category.id);

          return (
            <button
              key={category.id}
              type="button"
              aria-pressed={active}
              onClick={() => onToggleCategory(category.id)}
              className={cn(
                'inline-flex h-11 items-center gap-2 whitespace-nowrap rounded-full px-[18px] text-[14.5px] font-medium transition-colors',
                active
                  ? 'bg-gradient-to-b from-brand-mid to-brand-deep text-white'
                  : 'bg-surface text-gray-800',
              )}
            >
              {category.icon && (
                <IconComponent
                  iconName={category.icon}
                  size={18}
                  color="currentColor"
                  className="-ml-1"
                />
              )}
              {category.name}
            </button>
          );
        })}
      </div>
    </div>
  </section>
);
