interface AuthCardProps {
  children: React.ReactNode;
}

export default function AuthCard({ children }: AuthCardProps) {
  return (
    <div className="min-h-screen flex items-center justify-center px-2 py-12 bg-gradient-to-br from-gray-50 to-gray-100 relative overflow-hidden">
      {/* Subtle background gradient circles */}
      <div className="absolute w-[500px] h-[500px] bg-gradient-to-br from-black/5 to-transparent rounded-full -top-48 -right-48 blur-3xl pointer-events-none select-none" />
      <div className="absolute w-[400px] h-[400px] bg-gradient-to-br from-black/3 to-transparent rounded-full -bottom-32 -left-32 blur-3xl pointer-events-none select-none" />

      <div className="relative w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-10 sm:p-12 backdrop-blur-sm">
          {children}
        </div>
      </div>
    </div>
  );
}