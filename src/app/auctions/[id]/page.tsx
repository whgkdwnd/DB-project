import { notFound } from 'next/navigation';
import { Auction, Bid } from '@/types';
import BidForm from './BidForm';
import sql from '@/lib/db';

async function getAuction(id: string): Promise<{ auction: Auction; bids: Bid[] } | null> {
  const [auction] = await sql<Auction[]>`
    SELECT a.*, u.name AS seller_name
    FROM auctions a
    JOIN users u ON a.seller_id = u.id
    WHERE a.id = ${id}
  `;
  if (!auction) return null;

  const bids = await sql<Bid[]>`
    SELECT b.id, b.amount, b.created_at, u.name AS bidder_name,
           RANK() OVER (ORDER BY b.amount DESC)::int AS rank
    FROM bids b
    JOIN users u ON b.bidder_id = u.id
    WHERE b.auction_id = ${id}
    ORDER BY b.amount DESC
  `;
  return { auction, bids };
}

export default async function AuctionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await getAuction(id);
  if (!data) notFound();

  const { auction, bids } = data;

  return (
    <div style={{ maxWidth: 720, margin: '0 auto' }}>
      {/* 메인 카드 */}
      <div className="card-product" style={{ padding: 40, marginBottom: 16 }}>
        {/* 상태 배지 */}
        <div style={{ marginBottom: 20 }}>
          <span className="badge" style={{
            background: auction.status === 'active' ? '#e8f5e9' : 'var(--surface-soft)',
            color: auction.status === 'active' ? 'var(--success)' : 'var(--stone)',
          }}>
            {auction.status === 'active' ? '● 진행 중' : '종료'}
          </span>
        </div>

        <h1 style={{ fontSize: 28, fontWeight: 500, color: 'var(--ink-deep)', margin: '0 0 8px', lineHeight: 1.21 }}>
          {auction.title}
        </h1>
        <p style={{ fontSize: 14, color: 'var(--steel)', margin: '0 0 24px' }}>
          판매자 · {auction.seller_name}
        </p>

        {auction.description && (
          <p style={{ fontSize: 16, color: 'var(--charcoal)', margin: '0 0 28px', lineHeight: 1.6 }}>
            {auction.description}
          </p>
        )}

        {/* 가격 정보 */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr',
          gap: 16, padding: '24px 0',
          borderTop: '1px solid var(--hairline-soft)',
          borderBottom: auction.status === 'active' ? '1px solid var(--hairline-soft)' : 'none',
          marginBottom: auction.status === 'active' ? 28 : 0,
        }}>
          <div style={{
            background: 'var(--surface-soft)', borderRadius: 16, padding: '16px 20px',
          }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--stone)', margin: '0 0 6px', letterSpacing: 0.5 }}>시작가</p>
            <p style={{ fontSize: 18, fontWeight: 700, color: 'var(--charcoal)', margin: 0 }}>
              {auction.starting_price.toLocaleString()}원
            </p>
          </div>
          <div style={{
            background: 'var(--primary)', borderRadius: 16, padding: '16px 20px',
          }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.7)', margin: '0 0 6px', letterSpacing: 0.5 }}>현재가</p>
            <p style={{ fontSize: 24, fontWeight: 700, color: '#fff', margin: 0, letterSpacing: '-0.5px' }}>
              {auction.current_price.toLocaleString()}원
            </p>
          </div>
        </div>

        {auction.status === 'active' && (
          <BidForm auctionId={auction.id} currentPrice={auction.current_price} />
        )}
      </div>

      {/* 입찰 내역 */}
      <div className="card-product" style={{ padding: 32 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--ink-deep)', margin: '0 0 20px' }}>
          입찰 내역 <span style={{ color: 'var(--steel)', fontWeight: 400 }}>({bids.length}건)</span>
        </h2>
        {bids.length === 0 ? (
          <p style={{ fontSize: 14, color: 'var(--stone)', textAlign: 'center', padding: '32px 0', margin: 0 }}>
            아직 입찰이 없습니다
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {bids.map((b, i) => (
              <div key={b.id} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '14px 20px', borderRadius: 16,
                background: i === 0 ? 'var(--surface-soft)' : 'transparent',
                border: i === 0 ? 'none' : '1px solid var(--hairline-soft)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  {i === 0 && (
                    <span style={{
                      fontSize: 11, fontWeight: 700, color: '#fff',
                      background: 'var(--primary)', padding: '3px 10px', borderRadius: 100,
                    }}>1위</span>
                  )}
                  <span style={{ fontSize: 14, color: 'var(--charcoal)', fontWeight: i === 0 ? 700 : 400 }}>
                    {b.bidder_name}
                  </span>
                </div>
                <span style={{ fontSize: 16, fontWeight: 700, color: i === 0 ? 'var(--primary)' : 'var(--ink)' }}>
                  {b.amount.toLocaleString()}원
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
