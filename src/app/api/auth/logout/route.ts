import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // In a stateless JWT implementation, logout is typically handled client-side
    // by removing the token from storage
    return NextResponse.json({
      message: 'Logout berhasil'
    });

  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}