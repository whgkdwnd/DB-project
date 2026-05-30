import Link from 'next/link';
import { Auction } from '@/types';

async function getAuctions(): Promise<Auction[]> {
  const base = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000';
  const res = await fetch(`${base}/api/auctions`, { cache: 'no-store' });
  const json = await res.json();
  return json.success ? json.data : [];
}

function timeLeft(endsAt: string): string {
  const diff = new Date(endsAt).getTime() - Date.now();
  if (diff <= 0) return '종료됨';
  const hours = Math.floor(diff / 1000 / 60 / 60);
  const days = Math.floor(hours / 24);
  return days > 0 ? `${days}일 ${hours % 24}시간 남음` : `${hours}시간 남음`;
}

export default async function HomePage() {
  const auctions = await getAuctions();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">진행 중인 경매</h1>
        <Link href="/auctions/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">
          + 경매 등록
        </Link>
      </div>

      {auctions.length === 0 ? (
        <p className="text-gray-500 text-center py-20">진행 중인 경매가 없습니다.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {auctions.map((a) => (
            <Link key={a.id} href={`/auctions/${a.id}`}
              className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
              <h2 className="font-semibold text-gray-800 truncate">{a.title}</h2>
              <p className="text-sm text-gray-500 mt-1">판매자: {a.seller_name}</p>
              <div className="mt-3 flex items-end justify-between">
                <div>
                  <p className="text-xs text-gray-400">현재가</p>
                  <p className="text-lg font-bold text-blue-600">{a.current_price.toLocaleString()}원</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400">입찰 {a.bid_count}회</p>
                  <p className="text-xs text-orange-500">{timeLeft(a.ends_at)}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
