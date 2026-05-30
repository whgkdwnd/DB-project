import type { Metadata } from 'next';
import { Montserrat } from 'next/font/google';
import './globals.css';
import Navbar from './components/Navbar';

const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-montserrat',
  weight: ['300', '400', '500', '700'],
});

export const metadata: Metadata = {
  title: '경매마켓',
  description: 'PostgreSQL 트랜잭션 기반 중고 경매 서비스',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className={montserrat.className} style={{ background: 'var(--surface-soft)', minHeight: '100vh' }}>
        <Navbar />
        <main style={{ maxWidth: 1280, margin: '0 auto', padding: '40px 24px' }}>
          {children}
        </main>
      </body>
    </html>
  );
}
