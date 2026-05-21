import { NextRequest, NextResponse } from 'next/server';
import { supabase, getServiceSupabase } from '@/lib/supabase';
import { toZonedTime, format as formatTz } from 'date-fns-tz';
import { addDays, format, getDay, isSameDay, parseISO } from 'date-fns';
import { ar } from 'date-fns/locale';

const TIMEZONE = 'Asia/Aden';

// State Table schema (should be added to SQL): user_states (whatsapp_number, state, data, last_interaction)
// For this mock, we'll assume a table exists or use a simplified logic.

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  if (mode && token) {
    if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
      return new NextResponse(challenge, { status: 200 });
    }
  }
  return new NextResponse('Forbidden', { status: 403 });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const entry = body.entry?.[0];
  const changes = entry?.changes?.[0];
  const value = changes?.value;
  const message = value?.messages?.[0];

  if (!message) return NextResponse.json({ status: 'ok' });

  const sender = message.from;
  const text = message.text?.body?.trim();
  
  const supabaseAdmin = getServiceSupabase();

  // 1. Get User State
  let { data: stateData } = await supabaseAdmin
    .from('user_states')
    .select('*')
    .eq('whatsapp_number', sender)
    .single();

  // Session Timeout Check (10 mins)
  if (stateData && (Date.now() - new Date(stateData.last_interaction).getTime() > 10 * 60 * 1000)) {
    await supabaseAdmin.from('user_states').delete().eq('whatsapp_number', sender);
    await sendWhatsApp(sender, "عذراً، انتهت مدة الجلسة. الرجاء إرسال كلمة 'تسجيل' للبدء من جديد.");
    return NextResponse.json({ status: 'ok' });
  }

  // 2. State Machine
  if (text === 'تسجيل' || !stateData) {
    const { data: doctors } = await supabaseAdmin.from('doctors').select('*');
    let doctorList = doctors?.map((d, i) => `${i+1}- د. ${d.name}`).join('\n') || '';
    
    await supabaseAdmin.from('user_states').upsert({
      whatsapp_number: sender,
      state: 'DOCTOR_SELECT',
      last_interaction: new Date().toISOString()
    });

    await sendWhatsApp(sender, `أهلاً بك في مستشفى برج الأطباء. الرجاء إرسال رقم الطبيب الذي تريد التسجيل لديه:\n${doctorList}`);
  } 
  else if (stateData.state === 'DOCTOR_SELECT') {
    const doctorIndex = parseInt(text) - 1;
    const { data: doctors } = await supabaseAdmin.from('doctors').select('*');
    const doctor = doctors?.[doctorIndex];

    if (!doctor) {
      await sendWhatsApp(sender, "رقم الطبيب غير صحيح، يرجى الاختيار من القائمة أعلاه.");
    } else {
      const { data: schedules } = await supabaseAdmin.from('schedules').select('*').eq('doctor_id', doctor.id);
      
      await supabaseAdmin.from('user_states').update({
        state: 'SHIFT_SELECT',
        data: { doctor_id: doctor.id, doctor_name: doctor.name },
        last_interaction: new Date().toISOString()
      }).eq('whatsapp_number', sender);

      // Check shifts
      const shifts = [...new Set(schedules?.map(s => s.shift))];
      if (shifts.length > 1) {
        await sendWhatsApp(sender, "الطبيب متاح في فترتين، يرجى اختيار الفترة:\n1. صباحية\n2. مسائية");
      } else {
        // Auto select only shift and move to date
        const shift = shifts[0];
        await proceedToDateSelection(sender, doctor.id, shift, supabaseAdmin);
      }
    }
  }
  // Add more state handlers (SHIFT_SELECT, DATE_SELECT, NAME_INPUT) here...
  // For brevity, the full state machine logic should follow the same pattern.

  return NextResponse.json({ status: 'ok' });
}

async function proceedToDateSelection(sender: string, doctorId: string, shift: string, supabaseAdmin: any) {
  const { data: schedules } = await supabaseAdmin
    .from('schedules')
    .select('*')
    .eq('doctor_id', doctorId)
    .eq('shift', shift);

  const daysAr = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
  const availableDays = schedules?.map((s: any) => daysAr[s.day_of_week]).join('، ');

  await supabaseAdmin.from('user_states').update({
    state: 'DATE_SELECT',
    data: { doctor_id: doctorId, shift: shift },
    last_interaction: new Date().toISOString()
  }).eq('whatsapp_number', sender);

  await sendWhatsApp(sender, `يرجى اختيار اليوم المفضل لديك (${availableDays}):`);
}

async function sendWhatsApp(to: string, text: string) {
  const url = `https://graph.facebook.com/v19.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`;
  await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.WHATSAPP_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to: to,
      type: 'text',
      text: { body: text }
    })
  });
}
