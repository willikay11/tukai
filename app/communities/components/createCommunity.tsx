'use client';

import { useId, useState } from 'react';
import { useForm } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import CategoryPill from '@/components/ui/categoryPill';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import TukaiImage from '@/components/ui/image';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useGetInterestCategories } from '@/hooks/auth';
import { useCreateCommunity, useCreateCommunityPhotos } from '@/hooks/communities';
import { usePlaceCategories } from '@/hooks/places';
import { toast } from '@/hooks/use-toast';
import { Interest } from '@/types/interest';
import { PlaceCategory } from '@/types/placeCategory';

import FileUploadField from '../../components/fileUploadField';
import IconComponent from '../../components/iconComponent';

const createCommunitySchema = z.object({
  communityName: z.string().min(2, { message: 'Community name is required.' }),
  city: z.string().min(1, { message: 'Please select a city.' }),
  description: z.string().min(10, { message: 'Description must be at least 10 characters.' }),
  selectedCategories: z.array(z.string()).min(1, { message: 'Select at least one category.' }),
  visibility: z.enum(['public', 'private']),
});

type CreateCommunityFormValues = z.infer<typeof createCommunitySchema>;

export default function CreateCommunity() {
  const uploadId = useId();
  const visibilityId = useId();
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  const { data: categories } = useGetInterestCategories();
  const { data: placeCategories } = usePlaceCategories({ pageSize: 100, group: 'cities' }, true);

  const { mutate: createCommunity, isPending: isCreatingCommunity } = useCreateCommunity();
  const { mutate: uploadPhotos, isPending: isUploadingPhotos } = useCreateCommunityPhotos();

  const form = useForm<CreateCommunityFormValues>({
    resolver: zodResolver(createCommunitySchema),
    defaultValues: {
      communityName: '',
      city: '',
      description: '',
      selectedCategories: [],
      visibility: 'public',
    },
  });

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) => {
      const next = prev.includes(category)
        ? prev.filter((item) => item !== category)
        : [...prev, category];

      form.setValue('selectedCategories', next, { shouldValidate: true });
      return next;
    });
  };

  const onSubmit = (values: CreateCommunityFormValues) => {
    createCommunity(
      {
        title: values.communityName,
        description: values.description,
        categoriesIds: values.selectedCategories,
        isPublic: values.visibility === 'public',
        googleMapPlaceId: values.city,
        invitedMemberIds: [],
        invitedCommunityIds: [],
        invitedEmails: [],
      },
      {
        onSuccess: (response: any) => {
          const communityId = response?.data?.id;

          if (communityId && uploadedFiles.length > 0) {
            uploadPhotos(
              { communityId, photos: uploadedFiles as any },
              {
                onSuccess: () => {
                  toast({
                    title: 'Success',
                    description: 'Community created with photos successfully',
                    variant: 'success',
                  });
                  form.reset();
                  setSelectedCategories([]);
                  setUploadedFiles([]);
                },
                onError: () => {
                  toast({
                    title: 'Warning',
                    description: 'Community created, but failed to upload photos',
                    variant: 'default',
                  });
                },
              },
            );
          } else {
            toast({
              title: 'Success',
              description: 'Community created successfully',
              variant: 'success',
            });
            form.reset();
            setSelectedCategories([]);
          }
        },
        onError: () => {
          toast({
            title: 'Error',
            description: 'Failed to create community',
            variant: 'destructive',
          });
        },
      },
    );
  };

  return (
    <div className="mx-auto w-full px-4 py-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-base font-semibold text-gray-900">Create Community</h1>
          <p className="mt-1 text-xs text-gray-800">
            Before you create an experience, please ensure you create a community
          </p>
        </div>
      </div>

      <div className="mt-4 inline-flex items-start gap-2 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3">
        <span className="mt-0.5 shrink-0">
          <IconComponent iconName="UserMultipleIcon" color="#3B82F6" size={16} />
        </span>
        <span className="text-xs text-gray-800">
          Think of Community as your website, business, social media page or even a WhatsApp group.
          Having community will help you manage your experiences and keep members connected between
          experiences.
        </span>
      </div>

      <div className="mt-5">
        <FileUploadField
          id={uploadId}
          label="Upload a community poster (Dimensions: 540*540, Max 15 Mbs)"
          multiple
          onFilesChange={setUploadedFiles}
        />
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="mt-4 space-y-3">
            <FormField
              control={form.control}
              name="communityName"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input placeholder="Community Name" className="h-[55px]" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="h-[55px]">
                        <SelectValue placeholder="City e.g. Nairobi, Watamu..." />
                      </SelectTrigger>
                      <SelectContent>
                        {placeCategories?.data?.results?.map((placeCategory: PlaceCategory) => (
                          <SelectItem key={placeCategory.id} value={placeCategory.id}>
                            <div className="flex items-center gap-2">
                              <div className="relative h-6 w-6 shrink-0 overflow-hidden rounded-md">
                                <TukaiImage
                                  src={placeCategory.image ?? ''}
                                  alt={placeCategory.name}
                                  className="rounded-md"
                                  showNotFoundText={false}
                                />
                              </div>
                              <span>{placeCategory.name}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <p className="mb-2 text-xs font-bold text-gray-800">
                    Add your community description
                  </p>
                  <FormControl>
                    <Textarea
                      rows={5}
                      placeholder="Grab people's attention with a detailed description about the community..."
                      className="rounded-[10px] text-sm placeholder:text-gray-400"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="selectedCategories"
            render={() => (
              <FormItem className="mt-4">
                <p className="text-xs font-bold text-gray-800">
                  Select a category the community falls under, e.g. Hiking, Safari, etc.
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {categories?.map((category: Interest) => (
                    <CategoryPill key={category.id} category={category} onClick={toggleCategory} />
                  ))}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="visibility"
            render={({ field }) => (
              <FormItem className="mt-4">
                <p className="text-xs font-medium text-gray-600">What type of community is this?</p>
                <FormControl>
                  <RadioGroup className="mt-2" value={field.value} onValueChange={field.onChange}>
                    <label
                      htmlFor={`${visibilityId}-public`}
                      className="flex cursor-pointer items-start gap-3 text-xs text-gray-700"
                    >
                      <RadioGroupItem
                        value="public"
                        id={`${visibilityId}-public`}
                        className="mt-0.5 h-4 w-4 shrink-0 border-emerald-500 text-emerald-600"
                      />
                      <span className="leading-relaxed">
                        <span className="font-medium">Public</span> (Anyone can view the community and join)
                      </span>
                    </label>
                    <label
                      htmlFor={`${visibilityId}-private`}
                      className="flex cursor-pointer items-start gap-3 text-xs text-gray-700"
                    >
                      <RadioGroupItem
                        value="private"
                        id={`${visibilityId}-private`}
                        className="mt-0.5 h-4 w-4 shrink-0 border-emerald-500 text-emerald-600"
                      />
                      <span className="leading-relaxed">
                        <span className="font-medium">Private</span> (Only invited guests or members of a given communities can view and join)
                      </span>
                    </label>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="mt-6 flex items-center justify-between">
            <Button type="button" variant="text" className="text-xs text-red-500">
              Cancel
            </Button>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                className="h-9 rounded-full border-primary px-4 text-xs text-primary"
              >
                Save &amp; Exit
              </Button>
              <Button
                type="submit"
                variant="gradient"
                disabled={isCreatingCommunity || isUploadingPhotos}
                className="h-9 rounded-full px-4 text-xs text-white hover:bg-emerald-800 disabled:opacity-50"
              >
                {isCreatingCommunity || isUploadingPhotos ? 'Creating...' : 'Create Community'}
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
