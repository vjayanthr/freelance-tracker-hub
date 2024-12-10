export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#F5F5F7]">
      <div className="lg:hidden bg-white border-b px-4 py-3">
        <h1 className="text-xl font-semibold">Freelance Hub</h1>
      </div>
      <main className="p-6 lg:p-8">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}