'use client';

import { useState } from 'react';

import { Drawer } from '@/components/ui/drawer';
import { IconComponent } from '@/app/shared/components/Icons';
import { usePlaces, usePlaceCategories } from '@/app/shared/hooks/usePlaces';
import { SimplePillFilters } from '@/app/shared/components/Filters/SimplePillFilters';
import { SinglePlace } from '@/app/(places)/places/components/place';
import { Place } from '@/types/place';

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
    usePlaceCategories({ pageSize: 100 }, true);

  // Fetch places with current filters
  const { data: placesResponse, isLoading: isPlacesLoading } = usePlaces({
    categoryId: selectedCategory || undefined,
    page: 1,
    enabled: isOpen,
    // Note: search param is passed to fetchPlaces but not exposed in current usePlaces hook
    // We'll use the existing hook as-is and rely on categoryId filtering
  });

  if (!isOpen) return null;

  const categories =
    categoriesResponse?.data?.results?.map((cat: any) => ({
      label: cat.name || cat.title,
      value: cat.id,
      icon: cat.icon || 'FolderIcon',
    })) || [];

  const places = placesResponse?.data?.results || [];

  return (
    <Drawer isOpen={isOpen} setIsOpen={onClose}>
      <div className="flex h-full flex-col overflow-hidden">
        {/* Header with search and close */}
        <div className="flex-shrink-0 space-y-3 px-4 py-4">
          {/* Search input */}
          <div className="flex items-center gap-2 border border-gray-200 rounded-full px-3 py-2">
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
              className="flex-1 text-sm outline-none bg-transparent placeholder:text-gray-400"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="text-red-400 hover:text-red-500 flex-shrink-0"
              >
                <IconComponent iconName="Cancel01Icon" size={14} />
              </button>
            )}
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 flex-shrink-0 ml-2"
            >
              <IconComponent iconName="Cancel01Icon" size={18} />
            </button>
          </div>
        </div>

        {/* Category filter pills */}
        <div className="flex-shrink-0 px-4 py-0">
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
        <div className="flex-1 overflow-y-auto px-4 py-4">
          {isPlacesLoading ? (
            <div className="grid grid-cols-2 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-square bg-gray-200 rounded-lg mb-2" />
                  <div className="h-3 bg-gray-200 rounded mb-2" />
                  <div className="h-2 bg-gray-100 rounded" />
                </div>
              ))}
            </div>
          ) : places.length > 0 ? (
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
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <IconComponent iconName="Search01Icon" size={32} className="text-gray-300 mb-2" />
              <p className="text-sm text-gray-500">No places found</p>
            </div>
          )}
        </div>
      </div>
    </Drawer>
  );
};
