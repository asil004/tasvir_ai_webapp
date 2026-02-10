'use client';

import React from 'react';
import { useAppSelector } from '@/store';

interface SubscriptionModalProps {
  onCheck: () => void;
  onBack: () => void;
}

export default function SubscriptionModal({ onCheck, onBack }: SubscriptionModalProps) {
  const { channels, loading } = useAppSelector((state) => state.subscription);

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="font-mono font-bold text-xl sm:text-2xl mb-1">
          Telegram Kanallarga Obuna Bo&apos;ling
        </h3>
        <p className="text-secondary-text text-xs sm:text-sm">
          Davom etish uchun barcha kanallarga a&apos;zo bo&apos;lishingiz kerak
        </p>
      </div>

      <div className="space-y-2">
        {channels.map((channel, index) => (
          <a
            key={index}
            href={channel.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-3 bg-secondary-bg hover:bg-accent hover:text-[#0a0a0a] rounded-lg transition-all group border border-border hover:border-accent"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-[#0088cc] rounded-full flex items-center justify-center text-white group-hover:bg-[#0a0a0a]">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.64-.203-.658-.64.135-.954l11.566-4.458c.538-.196 1.006.128.832.941z" />
                </svg>
              </div>
              <div className="text-left">
                <p className="font-mono font-bold text-sm">{channel.name}</p>
                {channel.username && (
                  <p className="text-xs text-secondary-text group-hover:text-[#0a0a0a]">
                    {channel.username}
                  </p>
                )}
              </div>
            </div>
            <svg
              className="w-5 h-5 text-secondary-text group-hover:text-[#0a0a0a] group-hover:translate-x-1 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          </a>
        ))}
      </div>

      <div className="relative overflow-hidden rounded-xl border-2 border-accent bg-gradient-to-br from-accent to-[#00dd77] p-[2px]">
        <div className="bg-card rounded-lg p-4 relative">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center animate-pulse">
                <svg className="w-6 h-6 text-[#0a0a0a]" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>
            <div className="flex-1">
              <h4 className="font-mono font-bold text-sm mb-1 text-accent">MUHIM!</h4>
              <p className="text-xs leading-relaxed">
                Barcha kanallarga a&apos;zo bo&apos;lgandan keyin{' '}
                <span className="font-bold text-accent">&quot;Tekshirish&quot;</span> tugmasini bosing
              </p>
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={onCheck}
        disabled={loading}
        className="btn-primary w-full py-3 rounded-lg font-mono font-bold text-sm bg-accent text-[#0a0a0a] hover:bg-transparent hover:text-accent border-2 border-accent transition-all disabled:opacity-50"
      >
        {loading ? 'Tekshirilmoqda...' : 'Tekshirish'}
      </button>

      <button
        onClick={onBack}
        className="btn-secondary w-full py-2 rounded-lg font-mono text-xs border-2 border-border hover:border-accent hover:bg-accent hover:text-[#0a0a0a] transition-all"
      >
        Orqaga
      </button>
    </div>
  );
}
