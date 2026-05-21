import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import { subHours } from 'date-fns';

export async function GET(req: NextRequest) {
  const supabase = getServiceSupabase();

  try {
    const fortyEightHoursAgo = subHours(new Date(), 48).toISOString();

    // Find pending bookings older than 48 hours
    const { data: expiredBookings } = await supabase
      .from('bookings')
      .select('id, doctor_id, shift, booking_date')
      .eq('payment_status', 'pending')
      .lt('created_at', fortyEightHoursAgo);

    if (expiredBookings && expiredBookings.length > 0) {
      for (const booking of expiredBookings) {
        // Mark as cancelled
        await supabase
          .from('bookings')
          .update({ payment_status: 'cancelled' })
          .eq('id', booking.id);
        
        // Find the schedule and increment available_capacity
        // Note: This logic depends on whether capacity is tracked globally or template-based.
        // In this app, we reset it weekly, so we should increment it back.
        const dayOfWeek = new Date(booking.booking_date).getDay();
        
        const { data: schedule } = await supabase
          .from('schedules')
          .select('id, available_capacity')
          .eq('doctor_id', booking.doctor_id)
          .eq('day_of_week', dayOfWeek)
          .eq('shift', booking.shift)
          .single();

        if (schedule) {
          await supabase
            .from('schedules')
            .update({ available_capacity: schedule.available_capacity + 1 })
            .eq('id', schedule.id);
        }
      }
    }

    return NextResponse.json({ success: true, processed: expiredBookings?.length || 0 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
