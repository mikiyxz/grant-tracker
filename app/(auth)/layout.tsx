export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold text-green-700 text-center mb-8">
          Grant Tracker
        </h1>
        {children}
      </div>
    </main>
  );
}
