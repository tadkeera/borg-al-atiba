"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Search, Filter, Check, X, Clock, Calendar, Phone } from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

interface Booking {
  id: string;
  patient_name: string;
  whatsapp_number: string;
  booking_date: string;
  shift: string;
  queue_number: number;
  payment_status: 'pending' | 'paid' | 'cancelled';
  doctor_name: string;
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    setRole(localStorage.getItem('user_role'));
    fetchBookings();
  }, [filterDate]);

  const fetchBookings = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('bookings')
      .select(`*, doctors(name)`)
      .eq('booking_date', filterDate)
      .order('queue_number', { ascending: true });
    
    if (data) {
      setBookings(data.map(b => ({
        ...b,
        doctor_name: b.doctors?.name
      })));
    }
    setLoading(false);
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    if (role !== 'admin') {
      alert('عذراً، لا تملك صلاحية تعديل حالة الحجز (للعرض فقط)');
      return;
    }
    await supabase.from('bookings').update({ payment_status: status }).eq('id', id);
    fetchBookings();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">إدارة الحجوزات</h1>
          <p className="text-slate-500">مراقبة وتحديث حالات الحجز اليومية</p>
        </div>
        
        <div className="flex items-center gap-3 bg-white p-2 rounded-2xl shadow-sm border border-slate-100">
          <Calendar size={20} className="text-teal-600 mr-2" />
          <input 
            type="date" 
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="outline-none text-slate-700 font-bold"
          />
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-4 font-bold text-slate-700">الرقم</th>
                <th className="px-6 py-4 font-bold text-slate-700">اسم المريض</th>
                <th className="px-6 py-4 font-bold text-slate-700">الطبيب</th>
                <th className="px-6 py-4 font-bold text-slate-700">الفترة</th>
                <th className="px-6 py-4 font-bold text-slate-700">رقم الهاتف</th>
                <th className="px-6 py-4 font-bold text-slate-700">الحالة</th>
                <th className="px-6 py-4 font-bold text-slate-700">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan={7} className="p-8 text-center text-slate-400">جاري التحميل...</td></tr>
              ) : bookings.length === 0 ? (
                <tr><td colSpan={7} className="p-8 text-center text-slate-400">لا توجد حجوزات لهذا التاريخ</td></tr>
              ) : (
                bookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="w-8 h-8 flex items-center justify-center bg-teal-50 text-teal-700 rounded-full font-bold">
                        {booking.queue_number}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-800">{booking.patient_name}</td>
                    <td className="px-6 py-4 text-slate-600">{booking.doctor_name}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${booking.shift === 'morning' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}`}>
                        {booking.shift === 'morning' ? 'صباحية' : 'مسائية'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-slate-500">
                        <Phone size={14} />
                        {booking.whatsapp_number}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {booking.payment_status === 'paid' && <span className="text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full text-sm font-bold">تم الدفع</span>}
                      {booking.payment_status === 'pending' && <span className="text-amber-600 bg-amber-50 px-3 py-1 rounded-full text-sm font-bold">قيد الانتظار</span>}
                      {booking.payment_status === 'cancelled' && <span className="text-rose-600 bg-rose-50 px-3 py-1 rounded-full text-sm font-bold">ملغي</span>}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        {role === 'admin' ? (
                          <>
                            <button 
                              onClick={() => handleUpdateStatus(booking.id, 'paid')}
                              disabled={booking.payment_status === 'paid'}
                              className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors disabled:opacity-30"
                              title="تأكيد الدفع"
                            >
                              <Check size={18} />
                            </button>
                            <button 
                              onClick={() => handleUpdateStatus(booking.id, 'cancelled')}
                              disabled={booking.payment_status === 'cancelled'}
                              className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors disabled:opacity-30"
                              title="إلغاء الحجز"
                            >
                              <X size={18} />
                            </button>
                          </>
                        ) : (
                          <span className="text-slate-300 text-xs italic">للعرض فقط</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
