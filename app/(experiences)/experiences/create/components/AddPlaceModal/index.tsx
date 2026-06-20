'use client';

import { useState } from 'react';

import { Dialog, DialogContent } from '@/components/ui/dialog';
import { IconComponent } from '@/app/shared/components/Icons';
import { Input } from '@/components/ui/input';
import { usePlaces, usePlaceCategories, useGoogleMapsAutocomplete } from '@/app/shared/hooks/usePlaces';
import { SimplePillFilters } from '@/app/shared/components/Filters/SimplePillFilters';
import { SinglePlace } from '@/app/(places)/places/components/place';
import { GooglePlaceCard } from '../GooglePlaceCard';
import { Place } from '@/types/place';
import { GoogleMapsAutocompletePrediction } from '@/types/googleMaps';

interface AddPlaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (place: {
    id: string;
    name: string;
    imageUrl: string | null;
    city: string | null;
  }) => void;
  selectedPlaceIds?: string[];
}

export const AddPlaceModal = ({
  isOpen,
  onClose,
  onSelect,
  selectedPlaceIds = [],
}: AddPlaceModalProps) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Fetch categories for filter pills
  const { data: categoriesResponse, isLoading: isCategoriesLoading } =
    usePlaceCategories({ pageSize: 100 }, isOpen);

  // Fetch places with current filters
  const { data: placesResponse, isLoading: isPlacesLoading } = usePlaces({
    categoryId: selectedCategory || undefined,
    page: 1,
    enabled: isOpen,
    search: search || undefined,
  });

  const places = placesResponse?.data?.results || [];

  // Determine when to show Google fallback
  const hasTukaiResults = !isPlacesLoading && places.length > 0;
  const showGoogleFallback = !isPlacesLoading && places.length === 0 && search.trim().length >= 2;

  // Google Places fallback — only fetch when Tukai has no results
  const { data: googleResponse, isLoading: isLoadingGoogle } = useGoogleMapsAutocomplete(
    search,
    showGoogleFallback,
  );

  const googlePredictions = Array.isArray(googleResponse?.data) ? googleResponse.data : [];
  const isLoading = isPlacesLoading || (showGoogleFallback && isLoadingGoogle);

  const categories =
    categoriesResponse?.data?.results?.map((cat: any) => ({
      label: cat.name || cat.title,
      value: cat.id,
      icon: cat.icon || 'FolderIcon',
    })) || [];

  const handleGooglePlaceSelect = (prediction: GoogleMapsAutocompletePrediction) => {
    onSelect({
      id: prediction.place_id,
      name: prediction.structured_formatting?.main_text ?? prediction.description,
      imageUrl: null,
      city: prediction.structured_formatting?.secondary_text ?? null,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="flex flex-col max-h-[90vh] w-full max-w-4xl p-0">
        {/* Header with search and title */}
        <div className="flex-shrink-0 space-y-3 px-6 pt-4">
          {/* Search input */}
          <div className="flex items-center gap-2 border border-gray-200 bg-gray-100 rounded-full px-3 py-2">
            <IconComponent
              iconName="Search01Icon"
              size={16}
              className="text-gray-400 flex-shrink-0"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Find a place"
              className="flex-1 text-sm outline-none bg-transparent placeholder:text-gray-400 h-[30px]"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="text-red-400 hover:text-red-500 flex-shrink-0"
              >
                <IconComponent iconName="Cancel01Icon" size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Category filter pills */}
        <div className="flex-shrink-0 px-6 py-0">
          {isCategoriesLoading ? (
            <div className="h-8 bg-gray-100 rounded animate-pulse" />
          ) : categories.length > 0 ? (
            <SimplePillFilters
              filters={categories}
              selected={selectedCategory}
              onChange={setSelectedCategory}
            />
          ) : null}
        </div>

        {/* Place grid */}
        <div className="flex-1 overflow-y-auto px-6 py-4 min-h-[400px]">
          {isLoading ? (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-square bg-gray-200 rounded-lg mb-2" />
                  <div className="h-3 bg-gray-200 rounded mb-2" />
                  <div className="h-2 bg-gray-100 rounded" />
                </div>
              ))}
            </div>
          ) : hasTukaiResults ? (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
              {places.map((place: Place) => {
                const isAdded = selectedPlaceIds.includes(place.id);
                return (
                  <div
                    key={place.id}
                    className="group relative cursor-pointer"
                    onClick={() => {
                      if (!isAdded) {
                        onSelect({
                          id: place.id,
                          name: place.title,
                          imageUrl: place.photos?.[0]?.photo ?? null,
                          city: place.location?.city ?? null,
                        });
                      }
                    }}
                  >
                    {/* Place card using SinglePlace */}
                    <div className="relative">
                      <SinglePlace place={place} />

                      {/* Add/Added button overlay */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!isAdded) {
                            onSelect({
                              id: place.id,
                              name: place.title,
                              imageUrl: place.photos?.[0]?.photo ?? null,
                              city: place.location?.city ?? null,
                            });
                          }
                        }}
                        className={`
                          absolute top-2 right-2
                          flex items-center gap-1
                          px-3 py-1.5 rounded-full text-xs
                          font-medium shadow-sm
                          transition-colors
                          ${
                            isAdded
                              ? 'bg-white text-primary border border-primary'
                              : 'bg-white text-gray-700 border border-gray-200 hover:border-primary hover:text-primary'
                          }
                        `}
                      >
                        <IconComponent
                          iconName={isAdded ? 'CheckmarkCircle01Icon' : 'PlusSignCircleIcon'}
                          size={14}
                        />
                        {isAdded ? 'Added' : 'Add'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : showGoogleFallback ? (
            <div className="space-y-3">
              {/* Section label */}
              {googlePredictions.length > 0 && (
                <p className="text-xs text-gray-500 mb-3">
                  No Tukai places found · Showing Google results
                </p>
              )}

              {/* Google place cards */}
              {googlePredictions.map((prediction) => {
                const isAdded = selectedPlaceIds.includes(prediction.place_id);
                return (
                  <GooglePlaceCard
                    key={prediction.place_id}
                    prediction={prediction}
                    isAdded={isAdded}
                    onAdd={() => handleGooglePlaceSelect(prediction)}
                  />
                );
              })}

              {/* Both empty */}
              {googlePredictions.length === 0 && search.trim().length >= 2 && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <IconComponent iconName="Search01Icon" size={32} className="text-gray-300 mb-2" />
                  <p className="text-sm text-gray-500">No places found for "{search}"</p>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <IconComponent iconName="Search01Icon" size={32} className="text-gray-300 mb-2" />
              <p className="text-sm text-gray-500">Search for a place to get started</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
