import { NextResponse } from 'next/server';
import sql from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ success: false, error: '로그인이 필요합니다.' }, { status: 401 });
  }

  const bids = await sql`
    SELECT b.id, b.amount, b.created_at,
           a.id AS auction_id, a.title, a.status, a.current_price
    FROM bids b
    JOIN auctions a ON b.auction_id = a.id
    WHERE b.bidder_id = ${user.userId}
    ORDER BY b.created_at DESC
  `;

  return NextResponse.json({ success: true, data: bids });
}
