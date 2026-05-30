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
    <div style={{ maxWidth: 560, margin: '0 auto' }}>
      <div style={{ marginBottom: 32 }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--primary)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 }}>
          NEW LISTING
        </p>
        <h1 style={{ fontSize: 36, fontWeight: 500, color: 'var(--ink-deep)', margin: 0, lineHeight: 1.28 }}>경매 등록</h1>
      </div>

      <div className="card-product" style={{ padding: 40 }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 700, color: 'var(--ink)', marginBottom: 8 }}>상품명</label>
            <input className="meta-input" placeholder="예: 맥북 프로 M3, 에어팟 프로 2세대"
              value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 700, color: 'var(--ink)', marginBottom: 8 }}>
              설명 <span style={{ fontWeight: 400, color: 'var(--stone)' }}>(선택)</span>
            </label>
            <textarea className="meta-textarea" placeholder="상품 상태, 구성품 등을 자유롭게 작성하세요"
              value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={4} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 14, fontWeight: 700, color: 'var(--ink)', marginBottom: 8 }}>시작가 (원)</label>
              <input type="number" className="meta-input" placeholder="10000"
                value={form.starting_price} onChange={(e) => setForm({ ...form, starting_price: e.target.value })} required />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 14, fontWeight: 700, color: 'var(--ink)', marginBottom: 8 }}>마감 일시</label>
              <input type="datetime-local" className="meta-input"
                value={form.ends_at} onChange={(e) => setForm({ ...form, ends_at: e.target.value })} required />
            </div>
          </div>
          {error && (
            <div style={{ padding: '10px 16px', background: '#fdecea', borderRadius: 8, fontSize: 14, color: 'var(--critical)', fontWeight: 700 }}>
              {error}
            </div>
          )}
          <button type="submit" className="btn-buy" style={{ width: '100%', marginTop: 8 }}>
            경매 등록하기
          </button>
        </form>
      </div>
    </div>
  );
}
