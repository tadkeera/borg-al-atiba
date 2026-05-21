"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Edit2, Save, X, Calendar as CalendarIcon, Clock } from 'lucide-react';

const DAYS_AR = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
// Mapping 0-6 to Sat-Fri for hospital logic (Sat=6, Sun=0...)
const WORKING_DAYS = [6, 0, 1, 2, 3, 4]; // Sat to Thu

interface Schedule {
  id: string;
  doctor_id: string;
  doctor_name?: string;
  day_of_week: number;
  shift: 'morning' | 'evening';
  max_capacity: number;
  available_capacity: number;
}

export default function SchedulesPage() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<number>(0);

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    const { data, error } = await supabase
      .from('schedules')
      .select(`*, doctors(name)`)
      .order('day_of_week', { ascending: true });
    
    if (data) {
      setSchedules(data.map(s => ({
        ...s,
        doctor_name: s.doctors?.name
      })));
    }
  };

  const handleUpdateCapacity = async (id: string) => {
    const { error } = await supabase
      .from('schedules')
      .update({ max_capacity: editValue, available_capacity: editValue })
      .eq('id', id);
    
    if (!error) {
      setEditingId(null);
      fetchSchedules();
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">جداول العيادات</h1>
        <p className="text-slate-500">إدارة المواعيد والسعة اليومية للأطباء (السبت - الخميس)</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {WORKING_DAYS.map(dayNum => (
          <div key={dayNum} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2 text-teal-700 font-bold text-lg">
                <CalendarIcon size={20} />
                {DAYS_AR[dayNum]}
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-right">
                <thead>
                  <tr className="text-slate-400 text-sm border-b border-slate-50">
                    <th className="px-6 py-3 font-medium">الطبيب</th>
                    <th className="px-6 py-3 font-medium">الفترة</th>
                    <th className="px-6 py-3 font-medium">السعة القصوى</th>
                    <th className="px-6 py-3 font-medium">المتاح حالياً</th>
                    <th className="px-6 py-3 font-medium">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {schedules.filter(s => s.day_of_week === dayNum).map(schedule => (
                    <tr key={schedule.id} className="hover:bg-slate-50/50">
                      <td className="px-6 py-4 font-bold text-slate-800">{schedule.doctor_name}</td>
                      <td className="px-6 py-4 text-slate-600">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${schedule.shift === 'morning' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}`}>
                          <Clock size={12} />
                          {schedule.shift === 'morning' ? 'صباحية' : 'مسائية'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {editingId === schedule.id ? (
                          <input
                            type="number"
                            value={editValue}
                            onChange={(e) => setEditValue(parseInt(e.target.value))}
                            className="w-20 p-2 border border-teal-500 rounded-lg outline-none"
                            autoFocus
                          />
                        ) : (
                          <span className="font-bold text-teal-600">{schedule.max_capacity}</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-slate-500">{schedule.available_capacity}</td>
                      <td className="px-6 py-4">
                        {editingId === schedule.id ? (
                          <div className="flex gap-2">
                            <button 
                              onClick={() => handleUpdateCapacity(schedule.id)}
                              className="bg-teal-600 text-white p-2 rounded-lg hover:bg-teal-700"
                            >
                              <Save size={16} />
                            </button>
                            <button 
                              onClick={() => setEditingId(null)}
                              className="bg-slate-200 text-slate-600 p-2 rounded-lg hover:bg-slate-300"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        ) : (
                          <button 
                            onClick={() => {
                              setEditingId(schedule.id);
                              setEditValue(schedule.max_capacity);
                            }}
                            className="flex items-center gap-1 text-slate-400 hover:text-teal-600 font-medium transition-colors"
                          >
                            <Edit2 size={16} />
                            <span>تعديل السعة</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {schedules.filter(s => s.day_of_week === dayNum).length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-slate-400 italic">
                        لا يوجد مواعيد محددة لهذا اليوم
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
