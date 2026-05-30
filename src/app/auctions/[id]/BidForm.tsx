'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function BidForm({ auctionId, currentPrice }: { auctionId: string; currentPrice: number }) {
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleBid() {
    const parsed = parseInt(amount, 10);
    if (isNaN(parsed) || parsed <= 0) {
      setMessage('올바른 금액을 입력해주세요.');
      return;
    }
    setLoading(true);
    const res = await fetch(`/api/auctions/${auctionId}/bid`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: parsed }),
    });
    const json = await res.json();
    setLoading(false);
    if (json.success) {
      setMessage('입찰 성공!');
      setAmount('');
      router.refresh();
    } else {
      setMessage(json.error);
    }
  }

  const success = message === '입찰 성공!';

  return (
    <div>
      <p style={{ fontSize: 14, color: 'var(--steel)', marginBottom: 12 }}>
        현재가 <strong style={{ color: 'var(--ink-deep)' }}>{currentPrice.toLocaleString()}원</strong> 보다 높은 금액을 입력하세요
      </p>
      <div style={{ display: 'flex', gap: 10 }}>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="입찰가 입력 (원)"
          className="meta-input"
          style={{ flex: 1 }}
          onKeyDown={(e) => e.key === 'Enter' && handleBid()}
        />
        <button onClick={handleBid} disabled={loading} className="btn-buy">
          {loading ? '처리 중…' : '입찰하기'}
        </button>
      </div>
      {message && (
        <div style={{
          marginTop: 12, padding: '10px 16px', borderRadius: 8,
          background: success ? '#e8f5e9' : '#fdecea',
          color: success ? 'var(--success)' : 'var(--critical)',
          fontSize: 14, fontWeight: 700,
        }}>
          {message}
        </div>
      )}
    </div>
  );
}
