/**
 * PageContainer — scrollable main content wrapper with responsive padding.
 *
 * Props:
 *   children — page-level content
 */
export default function PageContainer({ children }) {
  return (
    <main
      id="page-container"
      className="flex-1 overflow-y-auto px-4 py-6 md:px-6 lg:px-8 bg-surface-950"
    >
      <div className="mx-auto max-w-7xl animate-fade-up">
        {children}
      </div>
    </main>
  );
}
