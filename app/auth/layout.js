import Link from 'next/link';
import { Sprout } from 'lucide-react';

export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen bg-sand-50 flex flex-col">
      <nav className="px-8 py-5">
        <Link href="/" className="flex items-center gap-2 w-fit">
          <Sprout className="text-velira-600" size={22} />
          <span className="font-display text-xl text-velira-800">Velira</span>
        </Link>
      </nav>
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        {children}
      </div>
    </div>
  );
}
