'use client';

import { useEffect } from 'react';

// Last line of defence: this replaces the root layout, so it renders its own
// document and must not depend on any provider, context or shared component
// from the tree that just failed.
const primaryButton = {
  borderRadius: '9999px',
  border: 'none',
  background: '#047857',
  color: '#ffffff',
  padding: '10px 24px',
  fontSize: '14px',
  fontWeight: 600,
  cursor: 'pointer',
} as const;

const secondaryButton = {
  ...primaryButton,
  background: '#ffffff',
  color: '#111827',
  border: '1px solid #e5e7eb',
} as const;

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Unhandled root error:', error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            padding: '24px',
            textAlign: 'center',
            fontFamily: 'system-ui, sans-serif',
            color: '#111827',
          }}
        >
          <h1 style={{ fontSize: '20px', fontWeight: 700 }}>Something went wrong</h1>
          <p style={{ fontSize: '14px', color: '#6b7280', maxWidth: '420px' }}>
            Tukai ran into an unexpected problem. Try again, and if it keeps happening please come
            back shortly.
          </p>
          {error?.digest && (
            <p style={{ fontSize: '12px', color: '#d1d5db' }}>Reference: {error.digest}</p>
          )}
          {/* Three ways out rather than one: if the root layout itself is
              what failed, retrying in place may not be enough. Plain DOM
              navigation, since the router is part of what just broke. */}
          <div
            style={{
              marginTop: '8px',
              display: 'flex',
              flexWrap: 'wrap',
              gap: '8px',
              justifyContent: 'center',
            }}
          >
            <button type="button" onClick={reset} style={primaryButton}>
              Try again
            </button>
            <button type="button" onClick={() => window.history.back()} style={secondaryButton}>
              Go back
            </button>
            <button
              type="button"
              onClick={() => {
                window.location.href = '/';
              }}
              style={secondaryButton}
            >
              Go home
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
