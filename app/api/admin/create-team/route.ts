import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const cookieHeader = request.headers.get('cookie') || '';
    const adminId = cookieHeader.match(/(?:^|.*;\s*)admin_id\s*=\s*([^;]*).*$/)?.[1];

    if (!adminId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: userAdmin, error: authError } = await supabaseAdmin
      .from('users')
      .select('role')
      .eq('id', adminId)
      .single();

    if (authError || !userAdmin || userAdmin.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Menggunakan try-catch untuk parsing JSON guna mencegah error sistem terekspos
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid request format.' }, { status: 400 });
    }

    const { teamName, username, password, jenisLomba } = body;
    
    if (!teamName || !username || !password) {
      return NextResponse.json({ error: 'Data tidak lengkap.' }, { status: 400 });
    }

    const cleanTeamName = decodeURIComponent(teamName).trim();
    const cleanUsername = username.trim().toLowerCase();

    const saltRounds = 10;
    const hashedTeamPassword = await bcrypt.hash(password, saltRounds);

    const { error: insertError } = await supabaseAdmin
      .from('teams')
      .insert([
        {
          team_name: cleanTeamName,
          username: cleanUsername,
          password: hashedTeamPassword,
          submission_count: 0,
          jenis_lomba: jenisLomba
        }
      ]);

    if (insertError) {
      // 23505 adalah kode error untuk duplikat (Unique Constraint)
      if (insertError.code === '23505') {
        return NextResponse.json({ error: 'Tim atau username sudah ada.' }, { status: 409 });
      }
      // Jangan return insertError ke client! Ini yang sering jadi bocor.
      throw new Error('Database operation failed');
    }

    return NextResponse.json({ success: true, message: 'Akun tim berhasil dibuat.' });

  } catch (err: any) {
    // Log eror asli hanya di terminal server (VS Code)
    console.error('Admin API Error:', err.message);
    
    // Kirim pesan eror yang "aman" ke client
    return NextResponse.json({ error: 'Terjadi kesalahan internal pada server.' }, { status: 500 });
  }
}