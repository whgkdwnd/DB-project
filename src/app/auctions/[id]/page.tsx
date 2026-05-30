import { notFound } from 'next/navigation';
import { Auction, Bid } from '@/types';
import BidForm from './BidForm';

async function getAuction(id: string): Promise<{ auction: Auction; bids: Bid[] } | null> {
  const base = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000';
  const res = await fetch(`${base}/api/auctions/${id}`, { cache: 'no-store' });
  const json = await res.json();
  return json.success ? json.data : null;
}

export default async function AuctionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await getAuction(id);
  if (!data) notFound();

  const { auction, bids } = data;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h1 className="text-2xl font-bold">{auction.title}</h1>
        <p className="text-sm text-gray-500 mt-1">판매자: {auction.seller_name}</p>
        {auction.description && <p className="mt-3 text-gray-700">{auction.description}</p>}

        <div className="mt-4 flex gap-6">
          <div>
            <p className="text-xs text-gray-400">시작가</p>
            <p className="font-semibold">{auction.starting_price.toLocaleString()}원</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">현재가</p>
            <p className="text-xl font-bold text-blue-600">{auction.current_price.toLocaleString()}원</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">상태</p>
            <p className={`font-semibold ${auction.status === 'active' ? 'text-green-600' : 'text-gray-400'}`}>
              {auction.status === 'active' ? '진행 중' : '종료'}
            </p>
          </div>
        </div>

        {auction.status === 'active' && (
          <BidForm auctionId={auction.id} currentPrice={auction.current_price} />
        )}
      </div>

      <div className="mt-6">
        <h2 className="text-lg font-semibold mb-3">입찰 내역 ({bids.length}건)</h2>
        {bids.length === 0 ? (
          <p className="text-gray-400 text-sm">아직 입찰이 없습니다.</p>
        ) : (
          <div className="space-y-2">
            {bids.map((b) => (
              <div key={b.id} className="bg-white border border-gray-200 rounded-lg px-4 py-3 flex justify-between">
                <span className="text-sm text-gray-600">
                  {b.rank === 1 ? '🥇 ' : ''}{b.bidder_name}
                </span>
                <span className="font-semibold">{b.amount.toLocaleString()}원</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
