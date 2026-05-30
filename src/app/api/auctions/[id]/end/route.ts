import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ success: false, error: '로그인이 필요합니다.' }, { status: 401 });
  }

  const { id: auctionId } = await params;

  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(auctionId)) {
    return NextResponse.json({ success: false, error: '유효하지 않은 경매 ID입니다.' }, { status: 400 });
  }

  try {
    const result = await sql.begin(async (tx) => {
      const [auction] = await tx`
        SELECT id, seller_id, status FROM auctions WHERE id = ${auctionId} FOR UPDATE
      `;

      if (!auction) throw new Error('경매를 찾을 수 없습니다.');
      if (auction.seller_id !== user.userId) throw new Error('본인 경매만 종료할 수 있습니다.');
      if (auction.status === 'ended') throw new Error('이미 종료된 경매입니다.');

      const [topBid] = await tx`
        SELECT b.bidder_id, b.amount, u.name AS bidder_name
        FROM bids b
        JOIN users u ON b.bidder_id = u.id
        WHERE b.auction_id = ${auctionId}
        ORDER BY b.amount DESC
        LIMIT 1
      `;

      await tx`
        UPDATE auctions SET status = 'ended' WHERE id = ${auctionId}
      `;

      return { auctionId, winner: topBid ?? null };
    });

    return NextResponse.json({ success: true, data: result });
  } catch (err) {
    const message = err instanceof Error ? err.message : '경매 종료에 실패했습니다.';
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
