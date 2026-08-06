/**
 * PageLoader.jsx
 *
 * Full-screen loading spinner used as the <Suspense> fallback while lazy-loaded
 * page chunks are being fetched from the server.
 */
export default function PageLoader() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: 'var(--color-surface-900, #0f1623)',
      }}
      aria-label="Loading page"
      role="status"
    >
      <div
        style={{
          width: '44px',
          height: '44px',
          borderRadius: '50%',
          border: '3px solid rgba(139,92,246,0.2)',
          borderTopColor: '#8b5cf6',
          animation: 'page-spin 0.7s linear infinite',
        }}
      />
      <style>{`
        @keyframes page-spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
