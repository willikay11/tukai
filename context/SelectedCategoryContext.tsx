'use client';

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

type SelectedCategoryType = {
  setSelectedCategoryId: (categoryId: string) => void;
  selectedCategoryId?: string;
};

const SelectedCategoryContext = createContext<SelectedCategoryType | undefined>(undefined);

export const SelectedCategoryProvider = ({ children }: { children: ReactNode }) => {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>();

  return (
    <SelectedCategoryContext.Provider
      value={{
        selectedCategoryId,
        setSelectedCategoryId: (categoryId: string) => {
          setSelectedCategoryId(categoryId);
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
