'use client';

import { useRef } from 'react';

import { IconComponent } from '@/app/shared/components/Icons';

interface CustomFileUploadProps {
  id: string;
  accept?: string;
  multiple?: boolean;
  maxFiles?: number;
  maxFileSizeMb?: number;
  onFilesSelected: (files: File[]) => void;
  disabled?: boolean;
}

export const CustomFileUpload = ({
  id,
  accept = 'image/*',
  multiple = false,
  maxFiles = 6,
  maxFileSizeMb = 15,
  onFilesSelected,
  disabled = false,
}: CustomFileUploadProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files ? Array.from(event.target.files) : [];
    if (files.length > 0) {
      onFilesSelected(files);
      if (inputRef.current) {
        inputRef.current.value = '';
      }
    }
  };

  return (
    <label
      htmlFor={id}
      className="inline-flex h-[105px] w-[155px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-emerald-500/50 bg-emerald-50/50 text-center hover:border-emerald-600 hover:bg-emerald-100/50"
    >
      <IconComponent iconName="ImageAdd02Icon" color="#10B981" size={20} />
      <span className="mt-1 text-[10px] font-medium text-emerald-700">Add Photo(s)</span>
      <input
        ref={inputRef}
        id={id}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled}
      />
    </label>
  );
};
