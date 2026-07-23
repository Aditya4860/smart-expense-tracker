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
      className="flex-1 px-4 py-6 md:px-8 lg:px-10 bg-surface-950"
    >
      <div className="mx-auto w-full max-w-[1600px] animate-fade-up">
        {children}
      </div>
    </main>
  );
}
