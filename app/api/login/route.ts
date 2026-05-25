import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    // 1. Terima input 'username' dari frontend, bukan lagi teamName langsung
    const { username, password } = await request.json();

    // 🛡️ PROTEKSI: Bersihkan spasi gaib di awal/akhir input akibat typo/copy-paste
    // Dan paksa input username menjadi lowercase agar konsisten dengan DB
    const cleanUsername = username?.trim().toLowerCase().replace(/\s+/g, '');
    const cleanPassword = password?.trim();

    if (!cleanUsername || !cleanPassword) {
      return NextResponse.json({ error: 'Username asrama dan kata sandi wajib diisi.' }, { status: 400 });
    }

    // 2. Ambil data tim berdasarkan kolom 'username' (menggunakan .eq karena sudah pasti lowercase dan tanpa spasi)
    const { data: teamData, error: fetchError } = await supabaseAdmin
      .from('teams')
      .select('id, team_name, username, password')
      .eq('username', cleanUsername)
      .single();

    // 🔍 DEBUG SERVER (Cek terminal VS Code Anda jika login gagal)
    
    if (teamData) {

    }
    if (fetchError) {
     
    }
   

    // Jika tim tidak ditemukan di DB
    if (fetchError || !teamData) {
      return NextResponse.json({ error: 'Username asrama tidak terdaftar di catatan sihir.' }, { status: 401 });
    }

    // 3. Bandingkan password murni dari input dengan hash murni dari database
    const isPasswordMatch = await bcrypt.compare(cleanPassword, teamData.password);

    if (!isPasswordMatch) {
      return NextResponse.json({ error: 'Kata sandi asrama Anda salah.' }, { status: 401 });
    }

    // 4. Jika kecocokan sukses, buat cookie sesi peserta
    const response = NextResponse.json({ 
      success: true, 
      message: 'Berhasil menembus gerbang masuk arena ISFEST!' 
    });

    response.cookies.set('team_id', teamData.id, { path: '/', maxAge: 60 * 60 * 24 }); // Aktif 1 Hari
    response.cookies.set('team_name', encodeURIComponent(teamData.team_name), { path: '/', maxAge: 60 * 60 * 24 });

    return response;

  } catch (err: any) {
    console.error('Critical Login API Error:', err);
    return NextResponse.json({ error: 'Terjadi anomali pada sistem gerbang login.' }, { status: 500 });
  }
}