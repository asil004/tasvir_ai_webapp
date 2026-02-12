'use client';

import React from 'react';
import { Category } from '@/types';

interface CategoryTabsProps {
  categories: Category[];
  selectedId: number | null;
  onSelect: (id: number | null) => void;
  loading?: boolean;
}

export default function CategoryTabs({ categories, selectedId, onSelect, loading }: CategoryTabsProps) {
  if (loading) {
    return (
      <div className="overflow-x-auto scrollbar-hide flex gap-2 pb-2 mb-6">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="h-9 w-24 rounded-lg bg-card animate-pulse shrink-0"
          />
        ))}
      </div>
    );
  }

  if (categories.length === 0) return null;

  return (
    <div className="overflow-x-auto scrollbar-hide flex gap-2 pb-2 mb-6">
      <button
        onClick={() => onSelect(null)}
        className={`shrink-0 px-4 py-2 rounded-lg text-sm font-medium border transition-all duration-200 ${
          selectedId === null
            ? 'bg-accent/10 text-accent border-accent/30'
            : 'bg-card text-secondary-text border-border hover:border-accent/20'
        }`}
      >
        Ommabop
      </button>
      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() => onSelect(category.id)}
          className={`shrink-0 px-4 py-2 rounded-lg text-sm font-medium border transition-all duration-200 ${
            selectedId === category.id
              ? 'bg-accent/10 text-accent border-accent/30'
              : 'bg-card text-secondary-text border-border hover:border-accent/20'
          }`}
        >
          {category.name}
        </button>
      ))}
    </div>
  );
}
