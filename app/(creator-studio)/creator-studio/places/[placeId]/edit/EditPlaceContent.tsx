'use client';

import { useMemo, useState } from 'react';

import { useRouter } from 'next/navigation';

import { IconComponent } from '@/app/shared/components/Icons';
import { PageContainer } from '@/app/shared/components/Layout';
import { usePlaceManager, useSavePlaceEdits } from '@/app/shared/hooks/usePlaces';
import { useToast } from '@/app/shared/hooks/useToast';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Photo } from '@/types/photo';
import { Place, PlaceProperty, PlaceSocialLink } from '@/types/place';
import { PlaceEditDraft } from '@/types/placeEdit';

import { EditPlaceAboutStep } from './components/EditPlaceAboutStep';
import { EditPlacePropertiesStep } from './components/EditPlacePropertiesStep';
import { EditPlaceSocialLinksStep } from './components/EditPlaceSocialLinksStep';
import {
  EditPhoto,
  EditPlaceValues,
  PropertyValue,
  SocialLinkValue,
  editPlaceSchema,
  zodErrorsToMap,
} from './schemas';

const STEPS = [
  { id: 'about', label: 'About', icon: 'InformationCircleIcon' },
  { id: 'properties', label: 'Properties', icon: 'Menu02Icon' },
  { id: 'social-links', label: 'Social Links', icon: 'Link02Icon' },
] as const;

type StepId = (typeof STEPS)[number]['id'];

// Which tab an error belongs to, so validation can open the one holding it
const STEP_FOR_FIELD: Record<string, StepId> = {
  title: 'about',
  description: 'about',
  address: 'about',
  googleMapPlaceId: 'about',
  photos: 'about',
  entry: 'about',
  properties: 'properties',
  socialLinks: 'social-links',
};

// Free or paid entry is not a field on a place — the API has no such column —
// so it is kept as the property of this name, which is also how it reaches the
// place page. The pill and the Properties row are therefore one value.
const ENTRY_KEY = 'Entry';
const ENTRY_LABEL = { free: 'Free entry', paid: 'Paid entry' };

const isNew = (id: string) => id.startsWith('new-');

const toEditPhotos = (photos: Photo[] = []): EditPhoto[] =>
  photos
    .filter((photo) => Boolean(photo.photo))
    .map((photo) => ({
      id: photo.id,
      url: photo.photo as string,
      isCover: photo.isCover,
    }));

const toPropertyValues = (properties: PlaceProperty[] = []): PropertyValue[] =>
  properties.map((property) => ({
    id: property.id,
    key: property.key,
    value: property.value,
    icon: property.icon,
    canCopy: property.canCopy,
  }));

const toSocialLinkValues = (links: PlaceSocialLink[] = []): SocialLinkValue[] =>
  links.map((link) => ({
    id: link.id,
    platformName: link.platformName,
    url: link.url,
    icon: link.icon,
  }));

/**
 * The three steps of editing a place: what it is, the details people scan, and
 * where else it lives online.
 *
 * Laid out as the create-experience wizard is — the same pill tabs over one
 * form — because it is the same job: a long form broken into parts that each
 * fit on a screen. Everything is held here and saved once, so switching tabs
 * never loses work and one button covers all three.
 */
export const EditPlaceContent = ({ place }: { place: Place }) => {
  const router = useRouter();
  const { toast } = useToast();
  const { isManager, isLoading } = usePlaceManager(place.id);
  const { mutate: save, isPending } = useSavePlaceEdits(place.id);

  const [step, setStep] = useState<StepId>('about');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const initial = useMemo(
    () => ({
      title: place.title ?? '',
      description: place.description ?? '',
      address: place.location?.formattedAddress ?? place.location?.name ?? '',
      photos: toEditPhotos(place.photos),
      properties: toPropertyValues(place.properties),
      socialLinks: toSocialLinkValues(place.socialLinks),
    }),
    [place],
  );

  const [title, setTitle] = useState(initial.title);
  const [description, setDescription] = useState(initial.description);
  const [address, setAddress] = useState(initial.address);
  const [googleMapPlaceId, setGoogleMapPlaceId] = useState('');
  const [photos, setPhotos] = useState<EditPhoto[]>(initial.photos);
  const [properties, setProperties] = useState<PropertyValue[]>(initial.properties);
  const [socialLinks, setSocialLinks] = useState<SocialLinkValue[]>(initial.socialLinks);

  // Shown as the source of the pill groups, exactly as the API lists them
  const categoryNames = (place.categories ?? []).map((category) => category.name).filter(Boolean);

  const entryProperty = properties.find(
    (property) => property.key.trim().toLowerCase() === ENTRY_KEY.toLowerCase(),
  );
  const entry: 'free' | 'paid' = /paid/i.test(entryProperty?.value ?? '') ? 'paid' : 'free';

  const setEntry = (next: 'free' | 'paid') => {
    const value = ENTRY_LABEL[next];

    setProperties((current) =>
      entryProperty
        ? current.map((property) =>
            property.id === entryProperty.id ? { ...property, value } : property,
          )
        : [...current, { id: `new-entry-${Date.now()}`, key: ENTRY_KEY, value }],
    );
  };

  const values: EditPlaceValues = {
    title,
    description,
    address,
    googleMapPlaceId,
    entry,
    photos,
    properties,
    socialLinks,
  };

  const handleAboutChange = (patch: Partial<EditPlaceValues>) => {
    if (patch.title !== undefined) setTitle(patch.title);
    if (patch.description !== undefined) setDescription(patch.description);
    if (patch.address !== undefined) setAddress(patch.address);
    if (patch.googleMapPlaceId !== undefined) setGoogleMapPlaceId(patch.googleMapPlaceId);
    if (patch.photos !== undefined) setPhotos(patch.photos);
    if (patch.entry !== undefined) setEntry(patch.entry);
  };

  const buildDraft = (): PlaceEditDraft => {
    const draft: PlaceEditDraft = {};

    const aboutChanged =
      title !== initial.title || description !== initial.description || Boolean(googleMapPlaceId);

    if (aboutChanged) {
      draft.about = {
        title,
        description,
        ...(googleMapPlaceId ? { googleMapPlaceId } : {}),
      };
    }

    const keptPhotoIds = new Set(photos.map((photo) => photo.id));
    const removedPhotoIds = initial.photos
      .filter((photo) => !keptPhotoIds.has(photo.id))
      .map((photo) => photo.id);
    const addedPhotos = photos.filter((photo) => photo.file);

    if (removedPhotoIds.length || addedPhotos.length) {
      draft.photos = {
        removedIds: removedPhotoIds,
        added: addedPhotos.map((photo, index) => ({
          file: photo.file as File,
          // A place stripped of every photo needs a new cover, and the first
          // one uploaded is it
          isCover: removedPhotoIds.length === initial.photos.length && index === 0,
          order: photos.indexOf(photo),
        })),
      };
    }

    const keptPropertyIds = new Set(properties.map((property) => property.id));
    const propertyById = new Map(initial.properties.map((property) => [property.id, property]));
    const changedProperties = properties.filter((property) => {
      const before = propertyById.get(property.id);
      return before && (before.key !== property.key || before.value !== property.value);
    });
    const addedProperties = properties.filter((property) => isNew(property.id));
    const removedPropertyIds = initial.properties
      .filter((property) => !keptPropertyIds.has(property.id))
      .map((property) => property.id);

    if (changedProperties.length || addedProperties.length || removedPropertyIds.length) {
      draft.properties = {
        removedIds: removedPropertyIds,
        updated: changedProperties.map(({ id, key, value, icon, canCopy }) => ({
          id,
          data: { key, value, icon, canCopy },
        })),
        added: addedProperties.map(({ key, value, icon, canCopy }) => ({
          key,
          value,
          icon,
          canCopy,
        })),
      };
    }

    const keptLinkIds = new Set(socialLinks.map((link) => link.id));
    const linkById = new Map(initial.socialLinks.map((link) => [link.id, link]));
    const changedLinks = socialLinks.filter((link) => {
      const before = linkById.get(link.id);
      return before && (before.platformName !== link.platformName || before.url !== link.url);
    });
    const addedLinks = socialLinks.filter((link) => isNew(link.id));
    const removedLinkIds = initial.socialLinks
      .filter((link) => !keptLinkIds.has(link.id))
      .map((link) => link.id);

    if (changedLinks.length || addedLinks.length || removedLinkIds.length) {
      draft.socialLinks = {
        removedIds: removedLinkIds,
        updated: changedLinks.map(({ id, platformName, url, icon }) => ({
          id,
          data: { platformName, url, icon },
        })),
        added: addedLinks.map(({ platformName, url, icon }) => ({ platformName, url, icon })),
      };
    }

    return draft;
  };

  const handleSave = () => {
    const parsed = editPlaceSchema.safeParse(values);
    const nextErrors = parsed.success ? {} : zodErrorsToMap(parsed.error);

    // The API keys a place's location off the Google id, so an address typed
    // over by hand cannot be saved as one
    if (address !== initial.address && !googleMapPlaceId) {
      nextErrors.address = 'Pick the address from the suggestions';
    }

    setErrors(nextErrors);

    const firstError = Object.keys(nextErrors)[0];
    if (firstError) {
      setStep(STEP_FOR_FIELD[firstError.split('.')[0]] ?? 'about');
      toast({
        title: 'Check the highlighted fields',
        description: nextErrors[firstError],
        variant: 'destructive',
      });
      return;
    }

    const draft = buildDraft();

    if (Object.keys(draft).length === 0) {
      toast({ title: 'Nothing to save', description: 'You have not changed anything yet.' });
      return;
    }

    save(draft, {
      onSuccess: () => {
        toast({ title: 'Changes saved', description: `${title} has been updated.` });
        router.push(`/creator-studio/places/${place.id}`);
      },
      onError: (error: Error) =>
        toast({
          title: 'Could not save',
          description: error.message,
          variant: 'destructive',
        }),
    });
  };

  if (isLoading) {
    return (
      <PageContainer className="py-6">
        <div className="h-96 animate-pulse rounded-3xl bg-gray-100" />
      </PageContainer>
    );
  }

  if (!isManager) {
    return (
      <PageContainer className="py-16 text-center">
        <p className="text-sm text-gray-500">
          Only the community that owns {place.title} can edit it.
        </p>
      </PageContainer>
    );
  }

  return (
    <PageContainer className="py-6">
      <h1 className="text-2xl font-bold text-gray-900">Edit Place</h1>

      <Tabs value={step} onValueChange={(value) => setStep(value as StepId)} className="mt-6">
        {/* The wizard's own tab row, so a step here looks like a step there */}
        <TabsList className="h-auto w-full justify-start gap-2 overflow-x-auto bg-transparent p-0 scrollbar-hide">
          {STEPS.map((entry) => (
            <TabsTrigger
              key={entry.id}
              value={entry.id}
              className="inline-flex flex-shrink-0 items-center gap-2 rounded-full bg-gray-100 px-4 py-2 text-xs text-gray-800 data-[state=active]:border-b-[0px] data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700"
            >
              <div className="flex-shrink-0">
                <IconComponent iconName={entry.icon} size={20} variant="twotone" />
              </div>
              {entry.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* The same column the create-experience steps write in: the tab row
            spans the page, the form itself stays a readable width */}
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-12 lg:col-span-6">
            <TabsContent value="about" className="mt-6">
              <EditPlaceAboutStep values={values} errors={errors} onChange={handleAboutChange} />
            </TabsContent>

            <TabsContent value="properties" className="mt-6">
              <EditPlacePropertiesStep
                categoryNames={categoryNames}
                properties={properties}
                errors={errors}
                onChange={setProperties}
              />
            </TabsContent>

            <TabsContent value="social-links" className="mt-6">
              <EditPlaceSocialLinksStep
                socialLinks={socialLinks}
                errors={errors}
                onChange={setSocialLinks}
              />
            </TabsContent>

            {/* One save for all three steps, laid out as every wizard step's
                actions are: the way out on the left, the way on at the right */}
            <div className="flex gap-2 pt-6 lg:gap-3">
              <button
                type="button"
                onClick={() => router.push(`/creator-studio/places/${place.id}`)}
                className="text-xs font-medium text-destructive hover:text-destructive/80"
              >
                Cancel
              </button>
              <div className="flex-1" />
              <Button
                type="button"
                variant="lime"
                isLoading={isPending}
                onClick={handleSave}
                className="rounded-[50px] text-xs font-medium"
              >
                Save changes
              </Button>
            </div>
          </div>
        </div>
      </Tabs>
    </PageContainer>
  );
};
