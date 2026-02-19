import { ChangeEvent, DragEvent, useEffect, useRef, useState } from 'react';

import IconComponent from './iconComponent';

type FileUploadFieldProps = {
  id: string;
  label: string;
  buttonText?: string;
  accept?: string;
  multiple?: boolean;
  maxFiles?: number;
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
};

export default function FileUploadField({
  id,
  label,
  buttonText = 'Add Photo(s)',
  accept = 'image/*',
  multiple = false,
  maxFiles,
  onChange,
}: FileUploadFieldProps) {
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const latestPreviewUrlsRef = useRef<string[]>([]);

  useEffect(() => {
    latestPreviewUrlsRef.current = previewUrls;
  }, [previewUrls]);

  useEffect(() => {
    return () => {
      latestPreviewUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files ? Array.from(event.target.files) : [];

    if (files.length > 0) {
      const newUrls = files.map((file) => URL.createObjectURL(file));

      setPreviewUrls((previous) => {
        const combined = [...previous, ...newUrls];

        if (maxFiles && combined.length > maxFiles) {
          combined.slice(maxFiles).forEach((url) => URL.revokeObjectURL(url));
          return combined.slice(0, maxFiles);
        }

        return combined;
      });
    }

    onChange?.(event);
    event.target.value = '';
  };

  const hasReachedMaxFiles = Boolean(maxFiles && previewUrls.length >= maxFiles);

  const handleDragStart = (event: DragEvent<HTMLDivElement>, index: number) => {
    event.dataTransfer.effectAllowed = 'move';
    setDraggedIndex(index);
  };

  const handleDragOver = (event: DragEvent<HTMLDivElement>, index: number) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (targetIndex: number) => {
    if (draggedIndex === null || draggedIndex === targetIndex) {
      setDraggedIndex(null);
      return;
    }

    setPreviewUrls((previous) => {
      const updated = [...previous];
      const [movedItem] = updated.splice(draggedIndex, 1);

      if (!movedItem) {
        return previous;
      }

      updated.splice(targetIndex, 0, movedItem);
      return updated;
    });

    setDraggedIndex(null);
  };

  return (
    <div>
      <p className="text-xs font-medium text-gray-800">{label}</p>
      <div className="mt-2 flex flex-wrap items-start gap-3">
        {previewUrls.map((previewUrl, index) => {
          const isDragging = draggedIndex === index;

          return (
            <div
              key={previewUrl}
              draggable
              onDragStart={(event) => handleDragStart(event, index)}
              onDragOver={(event) => handleDragOver(event, index)}
              onDrop={() => handleDrop(index)}
              onDragEnd={() => {
                setDraggedIndex(null);
              }}
              className={`relative h-[105px] w-[155px] cursor-grab rounded-xl transition-transform active:cursor-grabbing ${
                isDragging ? 'border-2 border-dashed border-emerald-500/50 bg-emerald-50/50 p-1' : ''
              } ${isDragging ? 'rotate-3' : ''}`}
            >
              <img
                src={previewUrl}
                alt={`Selected photo ${index + 1}`}
                className={`h-full w-full rounded-xl object-cover ${isDragging ? 'opacity-0' : ''}`}
              />

              <span className="absolute bottom-2 left-2 flex h-8 w-8 items-center justify-center rounded-full bg-gray-700/70 text-base font-medium text-white">
                {index + 1}
              </span>

              {isDragging && (
                <span className="absolute left-1/2 top-2 -translate-x-1/2 rounded-full bg-white/80 p-1">
                  <IconComponent iconName="HandPointingRight01Icon" color="#10B981" size={16} />
                </span>
              )}
            </div>
          );
        })}

        {!hasReachedMaxFiles && (
          <label
            htmlFor={id}
            className="inline-flex h-[105px] w-[155px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-emerald-500/50 bg-emerald-50/50 text-center"
          >
            <IconComponent iconName="ImageAdd02Icon" color="#10B981" size={20} />
            <span className="mt-1 text-[10px] font-medium text-emerald-700">{buttonText}</span>
          </label>
        )}
      </div>
      <input
        id={id}
        type="file"
        className="hidden"
        accept={accept}
        multiple={multiple}
        onChange={handleFileChange}
      />
    </div>
  );
}