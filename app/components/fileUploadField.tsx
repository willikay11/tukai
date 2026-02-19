import { ChangeEvent, useEffect, useState } from 'react';

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

  useEffect(() => {
    return () => {
      previewUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previewUrls]);

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

  return (
    <div>
      <p className="text-xs font-medium text-gray-800">{label}</p>
      <div className="mt-2 flex flex-wrap items-start gap-3">
        {previewUrls.map((previewUrl, index) => (
          <img
            key={`${previewUrl}-${index}`}
            src={previewUrl}
            alt={`Selected photo ${index + 1}`}
            className="h-[105px] w-[155px] rounded-xl object-cover"
          />
        ))}

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