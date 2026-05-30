import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ success: false, error: '로그인이 필요합니다.' }, { status: 401 });
  }
  return NextResponse.json({ success: true, data: user });
}

export async function DELETE() {
  const response = NextResponse.json({ success: true, data: null });
  response.cookies.delete('token');
  return response;
}
