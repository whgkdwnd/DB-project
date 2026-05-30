'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const router = useRouter();

  async function logout() {
    await fetch('/api/auth/me', { method: 'DELETE' });
    router.push('/auth/login');
    router.refresh();
  }

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
      <Link href="/" className="text-xl font-bold text-blue-600">경매마켓</Link>
      <div className="flex gap-4 text-sm">
        <Link href="/auctions/new" className="text-gray-600 hover:text-blue-600">경매 등록</Link>
        <Link href="/my-bids" className="text-gray-600 hover:text-blue-600">내 입찰</Link>
        <button onClick={logout} className="text-gray-600 hover:text-red-500">로그아웃</button>
      </div>
    </nav>
  );
}
