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

  return (
    <div className="mt-6 p-4 bg-blue-50 rounded-xl">
      <p className="text-sm text-gray-600 mb-2">
        현재가보다 높은 금액을 입력하세요 (현재: {currentPrice.toLocaleString()}원)
      </p>
      <div className="flex gap-2">
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="입찰가 입력"
          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm"
        />
        <button
          onClick={handleBid}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50">
          {loading ? '처리 중...' : '입찰하기'}
        </button>
      </div>
      {message && (
        <p className={`text-sm mt-2 ${message === '입찰 성공!' ? 'text-green-600' : 'text-red-500'}`}>
          {message}
        </p>
      )}
    </div>
  );
}
