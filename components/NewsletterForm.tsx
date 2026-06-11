'use client';

import { useState } from 'react';

type Status = 'idle' | 'loading' | 'success' | 'already' | 'error';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function NewsletterForm({ source = 'homepage' }: { source?: string }) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<Status>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const value = email.trim().toLowerCase();

    if (!EMAIL_RE.test(value)) {
      setStatus('error');
      return;
    }

    setStatus('loading');
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: value, source }),
      });
      const data = await res.json().catch(() => ({}));

      if (res.ok && data.ok) {
        setStatus(data.already ? 'already' : 'success');
        setEmail('');
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  const done = status === 'success' || status === 'already';

  const message: Record<Status, string> = {
    idle: '',
    loading: '',
    success: '¡Listo! Te vamos a avisar de las mejores bajadas de precio. 🎉',
    already: 'Ya estabas en la lista. ¡Gracias por seguirnos! 👌',
    error: 'Ups, revisá el correo e intentá de nuevo.',
  };

  return (
    <div className="max-w-lg mx-auto">
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
        <input
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (status === 'error') setStatus('idle');
          }}
          placeholder="Tu mejor correo..."
          disabled={status === 'loading'}
          aria-label="Tu correo electrónico"
          className="newsletter-input flex-1 px-6 py-4 rounded-2xl border focus:outline-none transition-colors font-bold disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={status === 'loading'}
          className="bg-black-sh text-accent-sh px-8 py-4 rounded-2xl font-syne font-black tracking-widest uppercase hover:scale-105 transition-transform shadow-xl disabled:opacity-70 disabled:hover:scale-100 whitespace-nowrap"
        >
          {status === 'loading' ? 'Enviando…' : '¡Me interesa!'}
        </button>
      </form>

      {message[status] && (
        <p
          role="status"
          className={`mt-4 text-sm font-bold ${
            done ? 'text-black-sh' : 'text-red-700'
          }`}
        >
          {message[status]}
        </p>
      )}
    </div>
  );
}
