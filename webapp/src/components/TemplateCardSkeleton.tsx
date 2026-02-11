'use client';

import React from 'react';

export default function TemplateCardSkeleton() {
  return (
    <div className="template-card rounded-xl overflow-hidden animate-pulse">
      {/* Image skeleton */}
      <div className="aspect-square bg-secondary-bg relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-secondary-bg via-border to-secondary-bg animate-shimmer" />
      </div>

      {/* Content skeleton */}
      <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
        {/* Title skeleton */}
        <div className="h-6 bg-secondary-bg rounded-lg w-3/4 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-secondary-bg via-border to-secondary-bg animate-shimmer" />
        </div>

        {/* Description skeleton */}
        <div className="space-y-2">
          <div className="h-4 bg-secondary-bg rounded w-full relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-secondary-bg via-border to-secondary-bg animate-shimmer" />
          </div>
          <div className="h-4 bg-secondary-bg rounded w-2/3 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-secondary-bg via-border to-secondary-bg animate-shimmer" />
          </div>
        </div>

        {/* Footer skeleton */}
        <div className="flex items-center justify-between">
          <div className="h-4 bg-secondary-bg rounded w-24 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-secondary-bg via-border to-secondary-bg animate-shimmer" />
          </div>
          <div className="h-4 bg-secondary-bg rounded w-16 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-secondary-bg via-border to-secondary-bg animate-shimmer" />
          </div>
        </div>
      </div>
    </div>
  );
}
