export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-muted/50">
      <div className="lg:hidden bg-white border-b px-4 py-3 sticky top-0 z-50">
        <h1 className="text-xl font-semibold text-primary">Freelance Hub</h1>
      </div>
      <main className="p-4 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}