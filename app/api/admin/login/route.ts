import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json({ error: 'Username dan password wajib diisi.' }, { status: 400 });
    }

    // 1. Cari data admin langsung di tabel 'users' berdasarkan username
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .select('id, username, password, role')
      .eq('username', username)
      .single();

    // 2. Validasi keberadaan akun dan pencocokan teks password asli
    if (userError || !userData || userData.password !== password) {
      return NextResponse.json({ error: 'Username atau password panitia salah.' }, { status: 401 });
    }

    // 3. Pastikan akun tersebut benar-benar memiliki role 'admin'
    if (userData.role !== 'admin') {
      return NextResponse.json({ error: 'Akses ditolak. Anda bukan panitia inti.' }, { status: 403 });
    }

    // 4. Buat cookie akses jika berhasil
    const response = NextResponse.json({ success: true, message: 'Berhasil masuk ke panel Panitia.' });
    
    // Cookie admin_id disimpan untuk validasi di halaman /admin/add-team
    response.cookies.set('admin_id', userData.id, { path: '/', maxAge: 60 * 60 * 8 }); // Aktif 8 Jam

    return response;

  } catch (err: any) {
    console.error('Admin Login Error:', err);
    return NextResponse.json({ error: 'Terjadi anomali pada server admin.' }, { status: 500 });
  }
}