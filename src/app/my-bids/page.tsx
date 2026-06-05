import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import sql from '@/lib/db';

export const dynamic = 'force-dynamic';

interface BidRecord {
  id: string;
  amount: number;
  created_at: string;
  auction_id: string;
  title: string;
  status: string;
  current_price: number;
}

export default async function MyBidsPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/auth/login');

  const bids = await sql<BidRecord[]>`
    SELECT b.id, b.amount, b.created_at,
           a.id AS auction_id, a.title, a.current_price,
           CASE WHEN a.status = 'active' AND a.ends_at <= now() THEN 'ended' ELSE a.status END AS status
    FROM bids b
    JOIN auctions a ON b.auction_id = a.id
    WHERE b.bidder_id = ${user.userId}
    ORDER BY b.created_at DESC
  `;

  return (
    <div style={{ maxWidth: 720, margin: '0 auto' }}>
      <div style={{ marginBottom: 32 }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--primary)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 }}>
          MY ACTIVITY
        </p>
        <h1 style={{ fontSize: 36, fontWeight: 500, color: 'var(--ink-deep)', margin: 0, lineHeight: 1.28 }}>
          내 입찰 이력
        </h1>
      </div>

      {bids.length === 0 ? (
        <div className="card-product" style={{ padding: '80px 40px', textAlign: 'center' }}>
          <p style={{ fontSize: 18, color: 'var(--steel)', margin: 0 }}>입찰 이력이 없습니다</p>
          <p style={{ fontSize: 14, color: 'var(--stone)', marginTop: 8 }}>경매에 참여해보세요</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {bids.map((b) => {
            const isLeading = b.amount >= b.current_price;
            return (
              <Link key={b.id} href={`/auctions/${b.auction_id}`} style={{ textDecoration: 'none' }}>
                <div className="card-product" style={{
                  padding: '20px 28px', cursor: 'pointer',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16,
                }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{
                      fontSize: 16, fontWeight: 700, color: 'var(--ink-deep)', margin: '0 0 6px',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {b.title}
                    </p>
                    <p style={{ fontSize: 12, color: 'var(--stone)', margin: 0 }}>
                      {new Date(b.created_at).toLocaleString('ko-KR')}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <p style={{ fontSize: 18, fontWeight: 700, color: 'var(--primary)', margin: '0 0 6px' }}>
                      {b.amount.toLocaleString()}원
                    </p>
                    <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                      <span className="badge" style={{
                        background: b.status === 'active' ? '#e8f5e9' : 'var(--surface-soft)',
                        color: b.status === 'active' ? 'var(--success)' : 'var(--stone)',
                      }}>
                        {b.status === 'active' ? '진행 중' : '종료'}
                      </span>
                      {isLeading && b.status === 'active' && (
                        <span className="badge" style={{ background: 'var(--primary)', color: '#fff' }}>
                          최고가
                        </span>
                      )}
                    </div>
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
