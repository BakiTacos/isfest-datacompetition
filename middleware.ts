import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isMaintenance = false; // Set ke FALSE jika ingin website normal kembali
  if (isMaintenance && !request.nextUrl.pathname.startsWith('/maintenance')) {
    return NextResponse.redirect(new URL('/maintenance', request.url));
  }

  // 1. Cek apakah ini path admin
  if (pathname.startsWith('/admin')) {
    // Kecualikan halaman login admin agar tidak redirect loop
    if (pathname === '/admin/login') {
      return NextResponse.next();
    }

    const adminId = request.cookies.get('admin_id');

    // Jika tidak ada cookie admin, paksa ke login admin
    if (!adminId) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  return NextResponse.next();
}

// Konfigurasi agar middleware hanya berjalan di path tertentu
export const config = {
  matcher: ['/admin/:path*'],
};