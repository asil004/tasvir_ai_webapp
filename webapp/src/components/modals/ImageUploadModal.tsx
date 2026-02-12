'use client';

import React, { useRef } from 'react';
import { useAppDispatch, useAppSelector } from '@/store';
import { addUploadedImage, removeUploadedImage } from '@/store/slices/generationSlice';
import { validateImageFile, readFileAsDataURL } from '@/utils/helpers';
import { hapticFeedback } from '@/utils/telegram';

interface ImageUploadModalProps {
  onProceed: () => void;
}

export default function ImageUploadModal({ onProceed }: ImageUploadModalProps) {
  const dispatch = useAppDispatch();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { selectedTemplateId, uploadedImages } = useAppSelector((state) => state.generation);
  const templates = useAppSelector((state) => state.templates.templates);

  const selectedTemplate = templates.find((t) => t.id === selectedTemplateId);

  if (!selectedTemplate) return null;

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const remainingSlots = selectedTemplate.requiredImages - uploadedImages.length;
    const filesToAdd = Array.from(files).slice(0, remainingSlots);

    for (const file of filesToAdd) {
      const validation = validateImageFile(file);
      if (!validation.valid) {
        alert(validation.error);
        continue;
      }

      try {
        const preview = await readFileAsDataURL(file);
        dispatch(
          addUploadedImage({
            file,
            preview,
            name: file.name,
          })
        );
        hapticFeedback('impact', 'light');
      } catch (error) {
        console.error('Failed to read file:', error);
      }
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveImage = (index: number) => {
    dispatch(removeUploadedImage(index));
    hapticFeedback('impact', 'medium');
  };

  const canProceed = uploadedImages.length >= selectedTemplate.requiredImages;

  return (
    <div className="space-y-2">
      {/* Template preview + title row */}
      <div className="flex gap-3 items-start">
        <div className="w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden border border-border bg-secondary-bg">
          <img
            src={selectedTemplate.image}
            alt={selectedTemplate.title}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="font-mono font-bold text-lg leading-tight mb-1">
            {selectedTemplate.title}
          </h2>
          <p className="text-secondary-text text-xs line-clamp-3">
            {selectedTemplate.description}
          </p>
        </div>
      </div>

      {/* Compact upload area */}
      <div className="bg-secondary-bg border-2 border-dashed border-border rounded-lg p-3 text-center">
        <div className="flex items-center justify-center gap-3">
          <svg
            className="w-7 h-7 text-accent flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
          <div className="text-left">
            <p className="font-mono text-sm">
              {selectedTemplate.requiredImages} ta rasm yuklang
            </p>
            <p className="text-secondary-text text-xs">PNG, JPG, WEBP (Max 10MB)</p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleFileSelect}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="btn-secondary px-3 py-1.5 rounded-lg font-mono text-xs border-2 border-border hover:border-accent hover:bg-accent hover:text-[#0a0a0a] transition-all flex-shrink-0"
          >
            Tanlash
          </button>
        </div>
      </div>

      {/* Upload counter */}
      <div className="text-center text-xs font-mono text-secondary-text">
        <span className="text-accent">{uploadedImages.length}</span> /{' '}
        {selectedTemplate.requiredImages} rasm yuklandi
      </div>

      {/* Uploaded images grid */}
      {uploadedImages.length > 0 && (
        <div className="grid grid-cols-4 gap-1.5">
          {uploadedImages.map((img, index) => (
            <div key={index} className="relative group animate-fade-in-up">
              <div className="aspect-square rounded-lg overflow-hidden border-2 border-accent">
                <img
                  src={img.preview}
                  alt={img.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <button
                onClick={() => handleRemoveImage(index)}
                className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-white text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Proceed button */}
      <button
        onClick={onProceed}
        disabled={!canProceed}
        className={`btn-primary w-full py-2.5 rounded-lg font-mono font-bold text-sm transition-all ${
          canProceed
            ? 'bg-accent text-[#0a0a0a] hover:bg-transparent hover:text-accent border-2 border-accent'
            : 'opacity-50 cursor-not-allowed bg-accent text-[#0a0a0a] border-2 border-accent'
        }`}
      >
        Davom etish
      </button>
    </div>
  );
}
