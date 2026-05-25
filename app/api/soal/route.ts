import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const teamId = searchParams.get('team_id');

  try {
    // Jika belum login, cukup ambil status gerbang global
    if (!teamId) {
      const { data } = await supabaseAdmin.from('global_config').select('value').eq('key', 'is_open').single();
      return NextResponse.json({ jenisLomba: null, isDatasetOpen: data?.value ?? false });
    }

    // Jika sudah login, ambil jenis lomba dan status gerbang
    const [teamRes, configRes] = await Promise.all([
      supabaseAdmin.from('teams').select('jenis_lomba').eq('id', teamId).single(),
      supabaseAdmin.from('global_config').select('value').eq('key', 'is_open').single()
    ]);

    return NextResponse.json({
      jenisLomba: teamRes.data?.jenis_lomba || 'Data Competition',
      isDatasetOpen: configRes.data?.value ?? false
    });
  } catch (err) {
    return NextResponse.json({ error: 'Gagal memuat data' }, { status: 500 });
  }
}