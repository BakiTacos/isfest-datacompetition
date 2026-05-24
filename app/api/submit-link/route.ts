import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const { team_id, drive_link } = await request.json();

    if (!team_id || !drive_link) {
      return NextResponse.json(
        { error: 'ID Tim dan Tautan Drive wajib diisi.' },
        { status: 400 }
      );
    }

    // 🛡️ Proteksi sederhana untuk memastikan input berupa URL yang valid
    try {
      new URL(drive_link);
    } catch (e) {
      return NextResponse.json(
        { error: 'Format tautan tidak valid! Pastikan diawali dengan http:// atau https://' },
        { status: 400 }
      );
    }

    // Update kolom final_link di tabel teams berdasarkan id peserta
    const { error: updateError } = await supabaseAdmin
      .from('teams')
      .update({ final_link: drive_link.trim() })
      .eq('id', team_id);

    if (updateError) {
      console.error('Database Update Error:', updateError);
      return NextResponse.json(
        { error: 'Gagal menyimpan tautan ke catatan perpustakaan sihir.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Tautan berhasil disimpan secara permanen.'
    });

  } catch (err: any) {
    console.error('Submit Link API Error:', err);
    return NextResponse.json(
      { error: 'Terjadi anomali pada sistem penyimpan tautan.' },
      { status: 500 }
    );
  }
}