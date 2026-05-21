import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  // Security check for Vercel Cron
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    // return new NextResponse('Unauthorized', { status: 401 });
  }

  const supabase = getServiceSupabase();

  try {
    // 1. Reset capacities
    const { error: capError } = await supabase.rpc('reset_weekly_capacity');
    
    // 2. Clear old user states
    const { error: stateError } = await supabase.from('user_states').delete().neq('id', '0');

    if (capError || stateError) throw new Error('Failed to reset');

    return NextResponse.json({ success: true, message: 'Weekly reset completed' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
