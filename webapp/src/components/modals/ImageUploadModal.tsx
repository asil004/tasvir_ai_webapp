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
    <div className="space-y-4">
      <div>
        <h2 className="font-mono font-bold text-xl sm:text-2xl mb-1">
          {selectedTemplate.title}
        </h2>
        <p className="text-secondary-text text-xs sm:text-sm">
          {selectedTemplate.description}
        </p>
      </div>

      <div className="aspect-square max-h-80 rounded-lg overflow-hidden border border-border bg-secondary-bg">
        <img
          src={selectedTemplate.image}
          alt={selectedTemplate.title}
          className="w-full h-full object-cover"
        />
      </div>

      <div className="space-y-3">
        <div className="bg-secondary-bg border-2 border-dashed border-border rounded-lg p-4 text-center">
          <div className="mb-3">
            <svg
              className="w-10 h-10 mx-auto text-accent"
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
          </div>
          <p className="font-mono text-base mb-1">
            {selectedTemplate.requiredImages} ta rasm yuklang
          </p>
          <p className="text-secondary-text text-xs mb-3">PNG, JPG, WEBP (Max 10MB)</p>
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
            className="btn-secondary px-4 py-2 rounded-lg font-mono text-sm border-2 border-border hover:border-accent hover:bg-accent hover:text-[#0a0a0a] transition-all"
          >
            📁 Rasmlarni tanlash
          </button>
        </div>

        <div className="text-center text-xs font-mono text-secondary-text">
          <span className="text-accent">{uploadedImages.length}</span> /{' '}
          {selectedTemplate.requiredImages} rasm yuklandi
        </div>

        {uploadedImages.length > 0 && (
          <div className="grid grid-cols-3 gap-2">
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

        <button
          onClick={onProceed}
          disabled={!canProceed}
          className={`btn-primary w-full py-3 rounded-lg font-mono font-bold text-sm transition-all ${
            canProceed
              ? 'bg-accent text-[#0a0a0a] hover:bg-transparent hover:text-accent border-2 border-accent'
              : 'opacity-50 cursor-not-allowed bg-accent text-[#0a0a0a] border-2 border-accent'
          }`}
        >
          Davom etish
        </button>
      </div>
    </div>
  );
}
