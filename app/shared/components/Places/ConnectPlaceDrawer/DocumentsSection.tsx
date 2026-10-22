'use client';

import { ChangeEvent, useRef } from 'react';

import { IconComponent } from '@/app/shared/components/Icons';
import { cn } from '@/lib/utils';

import { OWNERSHIP_DOCUMENT_TYPES, REQUIRED_DOCUMENT_COUNT } from './documentTypes';
import type { PendingDocument } from './useConnectPlaceDrawer';

// The API accepts PDF, JPEG and PNG up to 10 MB
const ACCEPTED_TYPES = 'application/pdf,image/jpeg,image/png';
const MAX_FILE_SIZE_MB = 10;

const helpLine = (count: number) => {
  if (count === 0) return 'Pick the documents you have, then attach them.';
  if (count === 1) return '1 attached. Add one more.';
  return `${count} documents attached.`;
};

export interface DocumentsSectionProps {
  pickedDocumentTypes: string[];
  onToggleDocumentType: (value: string) => void;
  pendingDocuments: PendingDocument[];
  onAttach: (documentType: string, file: File) => void;
  onRemove: (documentType: string) => void;
  onError: (message: string) => void;
  title?: string;
  subtitle?: string;
}

/**
 * Pick which document types prove ownership, then attach one file per type -
 * one row (its own dropzone, or its attached file) for each type picked.
 */
export const DocumentsSection = ({
  pickedDocumentTypes,
  onToggleDocumentType,
  pendingDocuments,
  onAttach,
  onRemove,
  onError,
  title = 'Proof of ownership',
  subtitle = 'attach at least two documents',
}: DocumentsSectionProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const activeTypeRef = useRef<string | null>(null);

  const openPicker = (documentType: string) => {
    activeTypeRef.current = documentType;
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    const documentType = activeTypeRef.current;
    // Clears the input so the same file can be picked again after a removal
    event.target.value = '';
    if (!file || !documentType) return;

    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      onError(`${file.name} is larger than ${MAX_FILE_SIZE_MB} MB.`);
      return;
    }

    onAttach(documentType, file);
  };

  return (
    <section className="flex flex-col gap-3" aria-label="Proof of ownership">
      <span className="text-[15px] font-semibold text-gray-800">
        {title} <span className="text-[13.5px] font-normal text-ink-muted">({subtitle})</span>
      </span>

      <div className="flex flex-wrap gap-2">
        {OWNERSHIP_DOCUMENT_TYPES.map((option) => {
          const picked = pickedDocumentTypes.includes(option.value);

          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={picked}
              onClick={() => onToggleDocumentType(option.value)}
              className={cn(
                'inline-flex h-11 items-center rounded-full px-[18px] text-[14.5px] font-semibold transition-colors',
                picked
                  ? 'bg-gradient-to-b from-brand-mid to-brand-deep text-white'
                  : 'bg-surface text-gray-800',
              )}
            >
              {option.label}
            </button>
          );
        })}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPTED_TYPES}
        className="hidden"
        aria-label="Attach document"
        onChange={handleFileChange}
      />

      {pickedDocumentTypes.length > 0 && (
        <div className="mt-1 flex flex-col gap-3.5">
          {pickedDocumentTypes.map((documentType) => {
            const label =
              OWNERSHIP_DOCUMENT_TYPES.find((option) => option.value === documentType)?.label ??
              documentType;
            const attached = pendingDocuments.find((document) => document.documentType === documentType);

            return (
              <div key={documentType} className="flex flex-col gap-2">
                <span className="text-sm font-semibold text-gray-800">{label}</span>

                {attached ? (
                  <div className="flex min-h-[60px] items-center gap-3 rounded-xl bg-surface-brand py-2 pl-3.5 pr-2">
                    <IconComponent
                      iconName="Copy01Icon"
                      size={22}
                      color="currentColor"
                      className="flex-shrink-0 text-brand"
                    />
                    <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                      <span className="truncate text-[14.5px] font-semibold text-brand-ink">
                        {attached.file.name}
                      </span>
                      <span className="text-[12.5px] text-ink">
                        {Math.round(attached.file.size / 1024)} KB
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => openPicker(documentType)}
                      aria-label={`Replace ${label}`}
                      className="h-11 flex-shrink-0 rounded-full bg-white px-3.5 text-sm font-semibold text-brand"
                    >
                      Replace
                    </button>
                    <button
                      type="button"
                      onClick={() => onRemove(documentType)}
                      aria-label={`Remove ${label}`}
                      className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full text-danger hover:bg-danger-surface"
                    >
                      <IconComponent iconName="Delete02Icon" size={18} color="currentColor" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => openPicker(documentType)}
                    className="flex min-h-24 flex-col items-center justify-center gap-1 rounded-xl border-[1.5px] border-dashed border-surface-tab bg-surface-brand px-4 py-4 text-center text-[14.5px] font-semibold text-brand hover:bg-surface"
                  >
                    <IconComponent iconName="FileUploadIcon" size={22} color="currentColor" />
                    Attach {label.toLowerCase()}
                    <span className="text-[12.5px] font-normal text-ink-muted">PDF, JPG or PNG</span>
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      <p className="text-[13.5px] leading-relaxed text-ink-muted">
        {helpLine(pendingDocuments.length)} One set covers every place in the claim, and only
        Tukai&apos;s reviewers see them.
        {pendingDocuments.length < REQUIRED_DOCUMENT_COUNT && ' At least two are required.'}
      </p>
    </section>
  );
};
