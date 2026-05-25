import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const { teamId, link } = await request.json();
    
    if (!teamId || !link) {
      return NextResponse.json({ error: 'Data tidak lengkap.' }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from('teams')
      .update({ final_link: link })
      .eq('id', teamId);

    if (error) throw error;
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Gagal menyegel tautan.' }, { status: 500 });
  }
}