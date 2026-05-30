import Link from 'next/link';
import { Auction } from '@/types';
import sql from '@/lib/db';

async function getAuctions(): Promise<Auction[]> {
  return sql<Auction[]>`
    SELECT a.id, a.title, a.description, a.starting_price, a.current_price,
           a.status, a.ends_at, a.created_at,
           u.name AS seller_name,
           COUNT(b.id)::int AS bid_count
    FROM auctions a
    JOIN users u ON a.seller_id = u.id
    LEFT JOIN bids b ON b.auction_id = a.id
    WHERE a.status = 'active'
    GROUP BY a.id, u.name
    ORDER BY a.ends_at ASC
  `;
}

function timeLeft(endsAt: string): string {
  const diff = new Date(endsAt).getTime() - Date.now();
  if (diff <= 0) return '마감';
  const h = Math.floor(diff / 1000 / 60 / 60);
  const d = Math.floor(h / 24);
  return d > 0 ? `${d}일 ${h % 24}시간 남음` : `${h}시간 남음`;
}

export default async function HomePage() {
  const auctions = await getAuctions();

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 32 }}>
        <div>
          <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--primary)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 }}>
            LIVE AUCTIONS
          </p>
          <h1 style={{ fontSize: 36, fontWeight: 500, color: 'var(--ink-deep)', lineHeight: 1.28, margin: 0 }}>
            진행 중인 경매
          </h1>
        </div>
        <Link href="/auctions/new" className="btn-primary" style={{ textDecoration: 'none' }}>
          + 경매 등록
        </Link>
      </div>

      {auctions.length === 0 ? (
        <div className="card-product" style={{ padding: '80px 40px', textAlign: 'center' }}>
          <p style={{ fontSize: 18, color: 'var(--steel)', margin: 0 }}>진행 중인 경매가 없습니다</p>
          <p style={{ fontSize: 14, color: 'var(--stone)', marginTop: 8 }}>첫 번째 경매를 등록해보세요</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {auctions.map((a) => {
            const urgent = new Date(a.ends_at).getTime() - Date.now() < 1000 * 60 * 60 * 24;
            return (
              <Link key={a.id} href={`/auctions/${a.id}`} style={{ textDecoration: 'none' }}>
                <div className="card-product" style={{ padding: 28, cursor: 'pointer' }}>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                    <span className="badge" style={{
                      background: urgent ? 'var(--warning)' : 'var(--surface-soft)',
                      color: urgent ? 'var(--ink-deep)' : 'var(--steel)',
                    }}>
                      {timeLeft(a.ends_at)}
                    </span>
                    {(a.bid_count ?? 0) > 0 && (
                      <span className="badge" style={{ background: 'var(--surface-soft)', color: 'var(--steel)' }}>
                        입찰 {a.bid_count}회
                      </span>
                    )}
                  </div>
                  <h2 style={{
                    fontSize: 18, fontWeight: 700, color: 'var(--ink-deep)', margin: '0 0 4px',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {a.title}
                  </h2>
                  <p style={{ fontSize: 14, color: 'var(--steel)', margin: '0 0 20px' }}>{a.seller_name}</p>
                  <div style={{ borderTop: '1px solid var(--hairline-soft)', paddingTop: 20 }}>
                    <p style={{ fontSize: 12, color: 'var(--stone)', margin: '0 0 4px', fontWeight: 700, letterSpacing: 0.5 }}>현재가</p>
                    <p style={{ fontSize: 24, fontWeight: 700, color: 'var(--primary)', margin: 0, letterSpacing: '-0.5px' }}>
                      {a.current_price.toLocaleString()}원
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
