import Link from 'next/link';

interface BidRecord {
  id: string;
  amount: number;
  created_at: string;
  auction_id: string;
  title: string;
  status: string;
  current_price: number;
}

async function getMyBids(): Promise<BidRecord[]> {
  const base = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000';
  const res = await fetch(`${base}/api/my-bids`, { cache: 'no-store' });
  const json = await res.json();
  return json.success ? json.data : [];
}

export default async function MyBidsPage() {
  const bids = await getMyBids();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">내 입찰 이력</h1>
      {bids.length === 0 ? (
        <p className="text-gray-400 text-center py-20">입찰 이력이 없습니다.</p>
      ) : (
        <div className="space-y-3">
          {bids.map((b) => (
            <Link key={b.id} href={`/auctions/${b.auction_id}`}
              className="block bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-semibold">{b.title}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(b.created_at).toLocaleString('ko-KR')}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-blue-600 font-bold">{b.amount.toLocaleString()}원</p>
                  <p className={`text-xs ${b.status === 'active' ? 'text-green-500' : 'text-gray-400'}`}>
                    {b.status === 'active' ? '진행 중' : '종료'}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
