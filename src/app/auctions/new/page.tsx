'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NewAuctionPage() {
  const router = useRouter();
  const [form, setForm] = useState({ title: '', description: '', starting_price: '', ends_at: '' });
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch('/api/auctions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, starting_price: parseInt(form.starting_price, 10) }),
    });
    const json = await res.json();
    if (json.success) router.push(`/auctions/${json.data.id}`);
    else setError(json.error);
  }

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-6">경매 등록</h1>
      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">상품명</label>
          <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">설명</label>
          <textarea className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">시작가 (원)</label>
          <input type="number" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            value={form.starting_price} onChange={(e) => setForm({ ...form, starting_price: e.target.value })} required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">마감 일시</label>
          <input type="datetime-local" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            value={form.ends_at} onChange={(e) => setForm({ ...form, ends_at: e.target.value })} required />
        </div>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
          등록하기
        </button>
      </form>
    </div>
  );
}
