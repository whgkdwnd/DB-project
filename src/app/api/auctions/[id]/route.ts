import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(id)) {
    return NextResponse.json({ success: false, error: '유효하지 않은 경매 ID입니다.' }, { status: 400 });
  }

  const [auction] = await sql`
    SELECT a.*, u.name AS seller_name
    FROM auctions a
    JOIN users u ON a.seller_id = u.id
    WHERE a.id = ${id}
  `;

  if (!auction) {
    return NextResponse.json({ success: false, error: '경매를 찾을 수 없습니다.' }, { status: 404 });
  }

  // ends_at이 지났는데 status가 여전히 active이면 ended로 업데이트
  if (auction.status === 'active' && new Date(auction.ends_at) <= new Date()) {
    await sql`UPDATE auctions SET status = 'ended' WHERE id = ${id} AND status = 'active'`;
    auction.status = 'ended';
  }

  const bids = await sql`
    SELECT b.id, b.amount, b.created_at, u.name AS bidder_name,
           RANK() OVER (ORDER BY b.amount DESC)::int AS rank
    FROM bids b
    JOIN users u ON b.bidder_id = u.id
    WHERE b.auction_id = ${id}
    ORDER BY b.amount DESC
  `;

  return NextResponse.json({ success: true, data: { auction, bids } });
}
