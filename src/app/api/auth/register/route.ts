import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import sql from '@/lib/db';
import { signToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const { email, password, name } = await req.json();

  if (!email || !password || !name) {
    return NextResponse.json({ success: false, error: '모든 필드를 입력해주세요.' }, { status: 400 });
  }

  const existing = await sql`SELECT id FROM users WHERE email = ${email}`;
  if (existing.length > 0) {
    return NextResponse.json({ success: false, error: '이미 사용 중인 이메일입니다.' }, { status: 409 });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const [user] = await sql`
    INSERT INTO users (email, password, name)
    VALUES (${email}, ${hashedPassword}, ${name})
    RETURNING id, email, name
  `;

  const token = await signToken({ userId: user.id, email: user.email, name: user.name });
  const response = NextResponse.json({ success: true, data: { id: user.id, email: user.email, name: user.name } });
  response.cookies.set('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
  });
  return response;
}
