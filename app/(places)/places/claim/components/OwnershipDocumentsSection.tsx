'use client';

import { ChangeEvent, useRef } from 'react';

import { IconComponent } from '@/app/shared/components/Icons';
import { SectionShell } from '@/app/shared/components/Sections';
import { cn } from '@/lib/utils';

import { OWNERSHIP_DOCUMENT_TYPES, REQUIRED_DOCUMENT_COUNT } from '../documentTypes';

export type OwnershipDocument = {
  // One of the API's VerificationDocument.document_type values
  documentType: string;
  file: File;
};

// The API accepts PDF, JPEG and PNG up to 10 MB
const ACCEPTED_TYPES = 'application/pdf,image/jpeg,image/png';
const MAX_FILE_SIZE_MB = 10;

export const OwnershipDocumentsSection = ({
  activeType,
  documents,
  onSelectType,
  onAttach,
  onRemove,
  onError,
}: {
  activeType: string;
  documents: OwnershipDocument[];
  onSelectType: (documentType: string) => void;
  onAttach: (document: OwnershipDocument) => void;
  onRemove: (documentType: string) => void;
  onError: (message: string) => void;
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    // Clearing lets the same file be picked again after a removal
    event.target.value = '';
    if (!file) return;

    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      onError(`${file.name} is larger than ${MAX_FILE_SIZE_MB} MB.`);
      return;
    }

    onAttach({ documentType: activeType, file });
  };

  return (
    <SectionShell
      id="claim-documents"
      title="Proof of ownership"
      subtitle={`Attach at least ${REQUIRED_DOCUMENT_COUNT} documents that show your community owns or manages this place. PDF, JPEG or PNG up to ${MAX_FILE_SIZE_MB} MB.`}
    >
      <div className="flex flex-wrap gap-2">
        {OWNERSHIP_DOCUMENT_TYPES.map((option) => {
          const attached = documents.some((document) => document.documentType === option.value);

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onSelectType(option.value)}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm transition-colors',
                attached
                  ? 'bg-green-200 font-medium text-primary'
                  : activeType === option.value
                    ? 'bg-primary font-medium text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200',
              )}
            >
              {attached && <IconComponent iconName="Tick02Icon" size={14} color="currentColor" />}
              {option.label}
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-gray-200 py-6 text-sm font-medium text-gray-600 hover:border-gray-300"
      >
        <IconComponent iconName="Attachment01Icon" size={18} color="currentColor" />
        Attach {OWNERSHIP_DOCUMENT_TYPES.find((option) => option.value === activeType)?.label}
      </button>

      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPTED_TYPES}
        className="hidden"
        aria-label="Attach document"
        onChange={handleFileChange}
      />

      {documents.length > 0 && (
        <ul className="mt-4 space-y-2">
          {documents.map((document) => (
            <li
              key={document.documentType}
              className="flex items-center gap-3 rounded-2xl border border-gray-100 p-3"
            >
              <IconComponent
                iconName="File01Icon"
                size={18}
                color="currentColor"
                className="flex-shrink-0 text-primary"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-gray-900">{document.file.name}</p>
                <p className="text-xs text-gray-500">
                  {
                    OWNERSHIP_DOCUMENT_TYPES.find(
                      (option) => option.value === document.documentType,
                    )?.label
                  }
                </p>
              </div>
              <button
                type="button"
                onClick={() => onRemove(document.documentType)}
                aria-label={`Remove ${document.file.name}`}
                className="text-gray-400 hover:text-gray-700"
              >
                <IconComponent iconName="Cancel01Icon" size={16} color="currentColor" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </SectionShell>
  );
};
