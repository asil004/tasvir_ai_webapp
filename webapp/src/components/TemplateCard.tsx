'use client';

import React from 'react';
import { Template } from '@/types';
import { formatNumber } from '@/utils/helpers';
import { hapticFeedback } from '@/utils/telegram';

interface TemplateCardProps {
  template: Template;
  onClick: () => void;
}

export default function TemplateCard({ template, onClick }: TemplateCardProps) {
  const handleClick = () => {
    hapticFeedback('impact', 'light');
    onClick();
  };

  return (
    <div
      className="template-card rounded-xl overflow-hidden cursor-pointer animate-fade-in-up transition-all duration-300 hover:transform hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(0,255,136,0.15)] hover:border-accent"
      onClick={handleClick}
    >
      <div className="aspect-square overflow-hidden bg-secondary-bg">
        <img
          src={template.image}
          alt={template.title}
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
          loading="lazy"
        />
      </div>
      <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
        <h3 className="font-mono font-bold text-lg sm:text-xl">{template.title}</h3>
        {template.description && (
          <p className="text-secondary-text text-xs sm:text-sm">{template.description}</p>
        )}
        <div className="flex items-center justify-between text-xs sm:text-sm">
          <span className="text-secondary-text">Kerak: {template.requiredImages} ta rasm</span>
          <span className="text-accent font-mono">{formatNumber(template.usageCount)} uses</span>
        </div>
      </div>
    </div>
  );
}
