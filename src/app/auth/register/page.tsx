'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '', name: '' });
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const json = await res.json();
    if (json.success) { router.push('/'); router.refresh(); }
    else setError(json.error);
  }

  return (
    <div className="max-w-sm mx-auto mt-20">
      <h1 className="text-2xl font-bold mb-6 text-center">회원가입</h1>
      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <input placeholder="이름" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900"
          value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        <input type="email" placeholder="이메일" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900"
          value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        <input type="password" placeholder="비밀번호" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900"
          value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
          가입하기
        </button>
        <p className="text-center text-sm text-gray-500">
          이미 계정이 있으신가요? <Link href="/auth/login" className="text-blue-600">로그인</Link>
        </p>
      </form>
    </div>
  );
}
