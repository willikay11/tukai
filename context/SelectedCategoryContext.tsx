'use client';

import { ReactNode, createContext, useContext, useState } from 'react';

type SelectedCategoryType = {
  setSelectedCategoryId: (categoryId: string) => void;
  selectedCategoryId?: string;
  setSelectedCitySearchId: (cityId: string) => void;
  selectedCitySearchId?: string;
};

const SelectedCategoryContext = createContext<SelectedCategoryType | undefined>(undefined);

export const SelectedCategoryProvider = ({ children }: { children: ReactNode }) => {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>();
  const [selectedCitySearchId, setSelectedCitySearchId] = useState<string>();

  return (
    <SelectedCategoryContext.Provider
      value={{
        selectedCategoryId,
        selectedCitySearchId,
        setSelectedCategoryId: (categoryId: string) => {
          setSelectedCategoryId(categoryId);
        },
        setSelectedCitySearchId: (cityId: string) => {
          setSelectedCitySearchId(cityId);
        },
      }}
    >
      {children}
    </SelectedCategoryContext.Provider>
  );
};

export const useSelectedCategory = () => {
  const context = useContext(SelectedCategoryContext);
  if (!context) throw new Error('useSelectedCategory must be used inside SelectedCategoryProvider');
  return context;
};
