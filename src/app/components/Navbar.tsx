'use client';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';

const navLinks = [
  { href: '/', label: '경매 목록' },
  { href: '/auctions/new', label: '경매 등록' },
  { href: '/my-bids', label: '내 입찰' },
];

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();

  async function logout() {
    await fetch('/api/auth/me', { method: 'DELETE' });
    router.push('/auth/login');
    router.refresh();
  }

  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 50,
      background: 'var(--canvas)',
      borderBottom: '1px solid var(--hairline-soft)',
    }}>
      <div style={{
        maxWidth: 1280, margin: '0 auto', padding: '0 24px',
        height: 64, display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', gap: 24,
      }}>
        <Link href="/" style={{
          fontSize: 18, fontWeight: 700, color: 'var(--ink-deep)',
          textDecoration: 'none', letterSpacing: '-0.5px', flexShrink: 0,
        }}>
          경매마켓
        </Link>

        <nav style={{ display: 'flex', gap: 8 }}>
          {navLinks.map((link) => {
            const active = pathname === link.href;
            return (
              <Link key={link.href} href={link.href} style={{
                fontSize: 14, fontWeight: 700, letterSpacing: '-0.14px',
                padding: '8px 16px', borderRadius: 100, textDecoration: 'none',
                border: active ? 'none' : '1px solid var(--hairline)',
                background: active ? 'var(--ink-deep)' : 'var(--canvas)',
                color: active ? '#fff' : 'var(--ink)',
                transition: 'all 120ms ease-out',
              }}>
                {link.label}
              </Link>
            );
          })}
        </nav>

        <button onClick={logout} style={{
          fontSize: 14, fontWeight: 700, letterSpacing: '-0.14px',
          padding: '8px 18px', borderRadius: 100,
          background: 'transparent', color: 'var(--steel)',
          border: '1px solid var(--hairline)', cursor: 'pointer',
          flexShrink: 0, transition: 'all 120ms ease-out',
        }}>
          로그아웃
        </button>
      </div>
    </header>
  );
}
