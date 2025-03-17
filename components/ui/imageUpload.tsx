'use client';

import { useState, useRef, type ChangeEvent, type DragEvent, useEffect } from 'react';
import IconComponent from '@/app/components/iconComponent';
import { Button } from './button';

export default function ImageUpload({
  onImagesChange,
}: {
  onImagesChange: (images: File[]) => void;
}) {
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    addFiles(Array.from(files));
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      addFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const addFiles = (files: File[]) => {
    // Filter for only image files (JPG and PNG)
    const imageFiles = files.filter(
      (file) => file.type === 'image/jpeg' || file.type === 'image/png',
    );

    if (imageFiles.length === 0) return;

    // Create object URLs for previews
    const newPreviews = imageFiles.map((file) => URL.createObjectURL(file));

    setImages((prev) => [...prev, ...imageFiles]);
    setPreviews((prev) => [...prev, ...newPreviews]);
  };

  const removeImage = (index: number) => {
    // Revoke the object URL to avoid memory leaks
    URL.revokeObjectURL(previews[index]);

    setImages((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  useEffect(() => {
    onImagesChange(images);
  }, [images, onImagesChange]);

  return (
    <div className="mx-auto w-full max-w-3xl">
      {previews.length > 0 ? (
        <div className="mt-2">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {previews.map((preview, index) => (
              <div key={index} className="group relative">
                <img
                  src={preview || '/placeholder.svg'}
                  alt={`Preview ${index + 1}`}
                  className="h-32 w-full rounded-lg object-cover"
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeImage(index);
                  }}
                  className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-gray-900 bg-opacity-50 text-white transition-opacity group-hover:opacity-100"
                >
                  <IconComponent iconName="Cancel01Icon" color="text-white" size={16} />
                </button>
              </div>
            ))}
          </div>
          <div className="mt-1 inline-flex items-center">
            <Button variant="primary-text">
              <IconComponent iconName="ImageAdd02Icon" color="text-emerald-500/70" size={16} />
              Add more photos
            </Button>
            <p className="ml-1 text-xs text-gray-400">Supports JPG and PNG</p>
          </div>
        </div>
      ) : (
        <div
          className="flex cursor-pointer flex-col items-center rounded-xl border-2 border-dashed border-emerald-500/50 bg-emerald-50/50 p-8 text-center"
          onClick={handleBrowseClick}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".jpg,.jpeg,.png"
            multiple
            className="inline-flex hidden items-center justify-center"
          />
          <IconComponent iconName="ImageAdd02Icon" color="text-emerald-500/70" size={24} />
          <p className="mt-2 text-sm font-medium text-gray-700">
            Drop your photo(s) here or browse
          </p>
          <p className="mt-1 text-sm text-gray-400">Supports JPG and PNG</p>
        </div>
      )}
    </div>
  );
}
