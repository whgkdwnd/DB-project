import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import sql from '@/lib/db';
import { signToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  const [user] = await sql`SELECT id, email, name, password FROM users WHERE email = ${email}`;
  if (!user) {
    return NextResponse.json({ success: false, error: '이메일 또는 비밀번호가 올바르지 않습니다.' }, { status: 401 });
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    return NextResponse.json({ success: false, error: '이메일 또는 비밀번호가 올바르지 않습니다.' }, { status: 401 });
  }

  const token = await signToken({ userId: user.id, email: user.email, name: user.name });
  const response = NextResponse.json({ success: true, data: { id: user.id, email: user.email, name: user.name } });
  response.cookies.set('token', token, { httpOnly: true, maxAge: 60 * 60 * 24 * 7 });
  return response;
}
