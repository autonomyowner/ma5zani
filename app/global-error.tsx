'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="ar" dir="rtl">
      <body style={{ fontFamily: 'sans-serif', margin: 0 }}>
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#f8fafc',
            padding: '1rem',
          }}
        >
          <div style={{ textAlign: 'center', maxWidth: '28rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>
              Something went wrong
            </h2>
            <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>
              An unexpected error occurred. Please try again.
            </p>
            <button
              onClick={reset}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#0054A6',
                color: '#fff',
                border: 'none',
                borderRadius: '0.75rem',
                fontWeight: 500,
                cursor: 'pointer',
                fontSize: '1rem',
              }}
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
