'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const json = await res.json();
    if (json.success) { router.push('/'); router.refresh(); }
    else setError(json.error);
  }

  return (
    <div style={{ maxWidth: 400, margin: '60px auto 0' }}>
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 500, color: 'var(--ink-deep)', margin: '0 0 8px' }}>로그인</h1>
        <p style={{ fontSize: 14, color: 'var(--steel)', margin: 0 }}>경매마켓에 오신 것을 환영합니다</p>
      </div>
      <div className="card-product" style={{ padding: 36 }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 700, color: 'var(--ink)', marginBottom: 8 }}>이메일</label>
            <input type="email" placeholder="name@example.com" className="meta-input"
              value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 700, color: 'var(--ink)', marginBottom: 8 }}>비밀번호</label>
            <input type="password" placeholder="비밀번호 입력" className="meta-input"
              value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
          </div>
          {error && (
            <div style={{ padding: '10px 16px', background: '#fdecea', borderRadius: 8, fontSize: 14, color: 'var(--critical)', fontWeight: 700 }}>
              {error}
            </div>
          )}
          <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: 8 }}>
            로그인
          </button>
          <p style={{ textAlign: 'center', fontSize: 14, color: 'var(--steel)', margin: 0 }}>
            계정이 없으신가요?{' '}
            <Link href="/auth/register" style={{ color: 'var(--primary)', fontWeight: 700, textDecoration: 'none' }}>회원가입</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
