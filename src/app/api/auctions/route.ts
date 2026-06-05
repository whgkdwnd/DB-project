import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  const auctions = await sql`
    SELECT a.id, a.title, a.description, a.starting_price, a.current_price,
           a.status, a.ends_at, a.created_at,
           u.name AS seller_name,
           COUNT(b.id)::int AS bid_count
    FROM auctions a
    JOIN users u ON a.seller_id = u.id
    LEFT JOIN bids b ON b.auction_id = a.id
    WHERE a.status = 'active' AND a.ends_at > now()
    GROUP BY a.id, u.name
    ORDER BY a.ends_at ASC
  `;
  return NextResponse.json({ success: true, data: auctions });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ success: false, error: '로그인이 필요합니다.' }, { status: 401 });
  }

  const { title, description, starting_price, ends_at } = await req.json();

  if (!title || !starting_price || !ends_at) {
    return NextResponse.json({ success: false, error: '필수 항목을 입력해주세요.' }, { status: 400 });
  }

  if (typeof starting_price !== 'number' || starting_price <= 0) {
    return NextResponse.json({ success: false, error: '시작가는 0보다 큰 숫자여야 합니다.' }, { status: 400 });
  }

  const endsAt = new Date(ends_at);
  if (isNaN(endsAt.getTime()) || endsAt <= new Date()) {
    return NextResponse.json({ success: false, error: '마감 시간은 현재보다 미래여야 합니다.' }, { status: 400 });
  }

  try {
    const [auction] = await sql`
      INSERT INTO auctions (seller_id, title, description, starting_price, current_price, ends_at)
      VALUES (${user.userId}, ${title}, ${description ?? null}, ${starting_price}, ${starting_price}, ${ends_at})
      RETURNING *
    `;
    return NextResponse.json({ success: true, data: auction }, { status: 201 });
  } catch {
    return NextResponse.json({ success: false, error: '경매 생성에 실패했습니다.' }, { status: 500 });
  }
}
