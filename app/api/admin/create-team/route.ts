import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    // 1. Validasi Sesi Admin dari Cookie
    const cookieHeader = request.headers.get('cookie') || '';
    const adminId = cookieHeader.match(/(?:^|.*;\s*)admin_id\s*=\s*([^;]*).*$/)?.[1];

    if (!adminId) {
      return NextResponse.json({ error: 'Akses ditolak. Silakan login sebagai panitia.' }, { status: 401 });
    }

    // 2. Cek Role Pengguna di Tabel Users
    const { data: userAdmin, error: authError } = await supabaseAdmin
      .from('users')
      .select('role')
      .eq('id', adminId)
      .single();

    if (authError || !userAdmin || userAdmin.role !== 'admin') {
      return NextResponse.json({ error: 'Hak akses tidak valid. Hanya Admin yang diizinkan.' }, { status: 403 });
    }

    // 3. Ambil Input Data Tim Baru (Tangkap juga 'username' yang dikirim dari frontend)
    const { teamName, username, password } = await request.json();
    
    if (!teamName || !username || !password) {
      return NextResponse.json({ error: 'Nama tim, username, dan password wajib diisi lengkap.' }, { status: 400 });
    }

    // 🛡️ PROTEKSI: Bersihkan '%20' menjadi spasi normal
    // Contoh: "Gryffindor%20Data" akan dikembalikan menjadi "Gryffindor Data"
    const cleanTeamName = decodeURIComponent(teamName).trim();

    // 4. Enkripsi/Hash Password Tim Peserta
    const saltRounds = 10;
    const hashedTeamPassword = await bcrypt.hash(password, saltRounds);

    // 5. Masukkan ke Tabel Teams
    const { error: insertError } = await supabaseAdmin
      .from('teams')
      .insert([
        {
          team_name: cleanTeamName, // Gunakan nama yang sudah bersih dari %20
          username: username,       // Simpan username lowercase untuk login peserta
          password: hashedTeamPassword,
          submission_count: 0
        }
      ]);

    if (insertError) {
      if (insertError.code === '23505') {
        return NextResponse.json({ error: 'Nama tim atau username tersebut sudah terdaftar.' }, { status: 409 });
      }
      throw insertError;
    }

    return NextResponse.json({ success: true, message: `Akun tim "${cleanTeamName}" berhasil dibuat.` });

  } catch (err: any) {
    console.error('Admin API Error:', err);
    return NextResponse.json({ error: 'Gagal memproses pembuatan akun baru.' }, { status: 500 });
  }
}