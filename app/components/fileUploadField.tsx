import { ChangeEvent, DragEvent, useEffect, useRef, useState } from 'react';

import IconComponent from './iconComponent';

type FileUploadFieldProps = {
  id: string;
  label: string;
  buttonText?: string;
  accept?: string;
  excludedMimeTypes?: string[];
  multiple?: boolean;
  maxFiles?: number;
  maxFileSizeMb?: number;
  minImageWidth?: number;
  minImageHeight?: number;
  maxImageWidth?: number;
  maxImageHeight?: number;
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
  onFilesChange?: (files: File[]) => void;
  onValidationError?: (errors: string[]) => void;
};

export default function FileUploadField({
  id,
  label,
  buttonText = 'Add Photo(s)',
  accept = 'image/*',
  excludedMimeTypes = [],
  multiple = false,
  maxFiles,
  maxFileSizeMb = 15,
  minImageWidth,
  minImageHeight,
  maxImageWidth,
  maxImageHeight,
  onChange,
  onFilesChange,
  onValidationError,
}: FileUploadFieldProps) {
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const latestPreviewUrlsRef = useRef<string[]>([]);

  const isAcceptedFileType = (file: File) => {
    if (!accept || accept === '*/*') {
      return true;
    }

    const acceptedTypes = accept
      .split(',')
      .map((type) => type.trim().toLowerCase())
      .filter(Boolean);

    if (acceptedTypes.length === 0) {
      return true;
    }

    const mimeType = file.type.toLowerCase();
    const fileName = file.name.toLowerCase();

    return acceptedTypes.some((type) => {
      if (type.startsWith('.')) {
        return fileName.endsWith(type);
      }

      if (type.endsWith('/*')) {
        return mimeType.startsWith(type.replace('/*', '/'));
      }

      return mimeType === type;
    });
  };

  const isExcludedFileType = (file: File) => {
    if (!file.type) {
      return false;
    }

    const mimeType = file.type.toLowerCase();
    return excludedMimeTypes.map((type) => type.toLowerCase()).includes(mimeType);
  };

  const getImageDimensions = (file: File) =>
    new Promise<{ width: number; height: number }>((resolve, reject) => {
      const tempUrl = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        const dimensions = { width: img.naturalWidth, height: img.naturalHeight };
        URL.revokeObjectURL(tempUrl);
        resolve(dimensions);
      };
      img.onerror = () => {
        URL.revokeObjectURL(tempUrl);
        reject(new Error('Failed to decode image'));
      };
      img.src = tempUrl;
    });

  const validateFile = async (file: File) => {
    if (isExcludedFileType(file)) {
      return `${file.name}: this image type is not allowed.`;
    }

    if (!isAcceptedFileType(file)) {
      return `${file.name}: unsupported file type.`;
    }

    if (file.size <= 0) {
      return `${file.name}: empty file is not allowed.`;
    }

    if (maxFileSizeMb && file.size > maxFileSizeMb * 1024 * 1024) {
      return `${file.name}: exceeds ${maxFileSizeMb}MB size limit.`;
    }

    if (file.type.startsWith('image/')) {
      try {
        const { width, height } = await getImageDimensions(file);

        if (minImageWidth && width < minImageWidth) {
          return `${file.name}: image width must be at least ${minImageWidth}px.`;
        }

        if (minImageHeight && height < minImageHeight) {
          return `${file.name}: image height must be at least ${minImageHeight}px.`;
        }

        if (maxImageWidth && width > maxImageWidth) {
          return `${file.name}: image width must be at most ${maxImageWidth}px.`;
        }

        if (maxImageHeight && height > maxImageHeight) {
          return `${file.name}: image height must be at most ${maxImageHeight}px.`;
        }
      } catch {
        return `${file.name}: invalid or corrupted image.`;
      }
    }

    return null;
  };

  useEffect(() => {
    latestPreviewUrlsRef.current = previewUrls;
  }, [previewUrls]);

  useEffect(() => {
    return () => {
      latestPreviewUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const fileList = event.target.files ? Array.from(event.target.files) : [];

    if (fileList.length > 0) {
      const validationResults = await Promise.all(fileList.map((file) => validateFile(file)));
      const currentErrors = validationResults.filter((result): result is string => Boolean(result));
      const validFiles = fileList.filter((_, index) => !validationResults[index]);

      const nextErrors = [...currentErrors];

      setFiles((previous) => {
        const combinedFiles = [...previous, ...validFiles];
        const cappedFiles = maxFiles ? combinedFiles.slice(0, maxFiles) : combinedFiles;

        if (maxFiles && combinedFiles.length > maxFiles) {
          nextErrors.push(`You can only upload up to ${maxFiles} file${maxFiles > 1 ? 's' : ''}.`);
        }

        setPreviewUrls((previousUrls) => {
          const currentFileCount = previous.length;
          const acceptedNewCount = Math.max(cappedFiles.length - currentFileCount, 0);
          const acceptedNewFiles = validFiles.slice(0, acceptedNewCount);
          const droppedNewFiles = validFiles.slice(acceptedNewCount);

          const acceptedNewUrls = acceptedNewFiles.map((file) => URL.createObjectURL(file));
          droppedNewFiles.forEach((file) => {
            nextErrors.push(`${file.name}: skipped because max files limit is reached.`);
          });

          return [...previousUrls, ...acceptedNewUrls];
        });

        onFilesChange?.(cappedFiles);
        return cappedFiles;
      });

      setValidationErrors(nextErrors);

      if (nextErrors.length > 0) {
        onValidationError?.(nextErrors);
      }
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

    setFiles((previous) => {
      const updated = [...previous];
      const [movedItem] = updated.splice(draggedIndex, 1);

      if (!movedItem) {
        return previous;
      }

      updated.splice(targetIndex, 0, movedItem);
      onFilesChange?.(updated);
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
                isDragging
                  ? 'border-2 border-dashed border-emerald-500/50 bg-emerald-50/50 p-1'
                  : ''
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
      {validationErrors.length > 0 && (
        <div className="mt-2 space-y-1">
          {validationErrors.map((error) => (
            <p key={error} className="text-xs text-red-500">
              {error}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
