'use client';

import React from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPrevious: () => void;
  onNext: () => void;
}

export default function Pagination({
  currentPage,
  totalPages,
  onPrevious,
  onNext,
}: PaginationProps) {
  return (
    <div className="flex justify-center items-center space-x-4 mt-12">
      <button
        onClick={onPrevious}
        disabled={currentPage <= 1}
        className="pagination-btn px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-mono text-sm sm:text-base border border-border hover:border-accent hover:bg-accent hover:text-[#0a0a0a] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
      >
        ← Prev
      </button>
      <span className="font-mono text-sm sm:text-base">
        Page <span className="text-accent">{currentPage}</span> / {totalPages}
      </span>
      <button
        onClick={onNext}
        disabled={currentPage >= totalPages}
        className="pagination-btn px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-mono text-sm sm:text-base border border-border hover:border-accent hover:bg-accent hover:text-[#0a0a0a] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
      >
        Next →
      </button>
    </div>
  );
}
