-- 테스트용 시드 데이터
-- 실행 전 users 테이블에 데이터가 없어야 함

-- 테스트 경매 (직접 회원가입 후 auction_id를 이 파일의 seller_id에 맞게 교체)
-- 아래는 예시이며 실제 user UUID로 교체 필요
/*
INSERT INTO auctions (seller_id, title, description, starting_price, current_price, ends_at)
VALUES (
  'YOUR_USER_UUID_HERE',
  '맥북 프로 2021 M1',
  'M1 칩 14인치, 16GB RAM, 512GB SSD, 충전기 포함',
  800000,
  800000,
  now() + interval '3 days'
);
*/
