import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function POST(
  req: NextRequest,
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

  const { amount } = await req.json();

  if (typeof amount !== 'number' || amount <= 0) {
    return NextResponse.json({ success: false, error: '올바른 입찰가를 입력해주세요.' }, { status: 400 });
  }

  try {
    // postgres.js의 sql.begin()은 BEGIN ... COMMIT/ROLLBACK 트랜잭션을 래핑한다.
    // 콜백 내에서 예외가 발생하면 자동으로 ROLLBACK된다.
    const result = await sql.begin(async (tx) => {
      // SELECT FOR UPDATE: 이 행을 읽는 동시에 잠금을 획득한다.
      // 다른 트랜잭션이 같은 행에 FOR UPDATE를 시도하면 이 트랜잭션이 끝날 때까지 대기한다.
      // 이를 통해 동시 입찰 시 Race Condition을 방지한다.
      const [auction] = await tx`
        SELECT id, current_price, status, ends_at, seller_id
        FROM auctions
        WHERE id = ${auctionId}
        FOR UPDATE
      `;

      if (!auction) throw new Error('경매를 찾을 수 없습니다.');
      if (auction.status !== 'active') throw new Error('이미 종료된 경매입니다.');
      if (new Date(auction.ends_at) < new Date()) throw new Error('경매가 만료되었습니다.');
      if (auction.seller_id === user.userId) throw new Error('본인 경매에는 입찰할 수 없습니다.');
      if (amount <= auction.current_price) {
        throw new Error(`현재가(${Number(auction.current_price).toLocaleString()}원)보다 높은 금액을 입력해주세요.`);
      }

      // 입찰 기록 삽입
      const [bid] = await tx`
        INSERT INTO bids (auction_id, bidder_id, amount)
        VALUES (${auctionId}, ${user.userId}, ${amount})
        RETURNING *
      `;

      // 현재가 갱신
      await tx`
        UPDATE auctions
        SET current_price = ${amount}
        WHERE id = ${auctionId}
      `;

      // 콜백이 정상 반환되면 sql.begin()이 자동으로 COMMIT한다.
      return bid;
    });

    return NextResponse.json({ success: true, data: result }, { status: 201 });
  } catch (err) {
    // sql.begin() 콜백에서 throw된 예외 → 자동 ROLLBACK 후 여기로 전달된다.
    const message = err instanceof Error ? err.message : '입찰 처리 중 오류가 발생했습니다.';
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
