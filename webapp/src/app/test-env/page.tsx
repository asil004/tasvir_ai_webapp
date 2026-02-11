'use client';

import { useEffect, useState } from 'react';

export default function TestEnvPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>🔍 Environment Variables Test</h1>

      <div style={{ marginTop: '20px' }}>
        <h2>Client-side (Browser):</h2>
        <div style={{ background: '#f5f5f5', padding: '15px', borderRadius: '5px' }}>
          <p><strong>NEXT_PUBLIC_API_BASE_URL:</strong></p>
          <code>{process.env.NEXT_PUBLIC_API_BASE_URL || '❌ NOT SET'}</code>

          <p style={{ marginTop: '10px' }}><strong>NEXT_PUBLIC_BOT_USERNAME:</strong></p>
          <code>{process.env.NEXT_PUBLIC_BOT_USERNAME || '❌ NOT SET'}</code>

          <p style={{ marginTop: '10px' }}><strong>NODE_ENV:</strong></p>
          <code>{process.env.NODE_ENV || '❌ NOT SET'}</code>
        </div>
      </div>

      <div style={{ marginTop: '20px', padding: '15px', background: '#fff3cd', borderRadius: '5px' }}>
        <h3>📝 Ma'lumot:</h3>
        <ul>
          <li>✅ Agar qiymatlar ko'rinsa - <code>.env.local</code> to'g'ri ishlayapti</li>
          <li>❌ Agar "NOT SET" ko'rinsa - environment variables o'qilmayapti</li>
          <li>🔄 O'zgartirganingizdan keyin dev server'ni restart qiling</li>
        </ul>
      </div>

      <div style={{ marginTop: '20px' }}>
        <h3>📍 Current .env.local location:</h3>
        <code>webapp/.env.local</code>
      </div>

      <div style={{ marginTop: '20px' }}>
        <a href="/" style={{ color: 'blue', textDecoration: 'underline' }}>
          ← Bosh sahifaga qaytish
        </a>
      </div>
    </div>
  );
}
