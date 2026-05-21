"use client";

import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, CheckCircle, XCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  allow_2nd_week: boolean;
  limit_2_patients: boolean;
}

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    specialty: '',
    allow_2nd_week: false,
    limit_2_patients: false,
  });

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    const { data, error } = await supabase.from('doctors').select('*').order('created_at', { ascending: false });
    if (data) setDoctors(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingDoctor) {
      await supabase.from('doctors').update(formData).eq('id', editingDoctor.id);
    } else {
      await supabase.from('doctors').insert([formData]);
    }
    setIsModalOpen(false);
    setEditingDoctor(null);
    setFormData({ name: '', specialty: '', allow_2nd_week: false, limit_2_patients: false });
    fetchDoctors();
  };

  const handleEdit = (doctor: Doctor) => {
    setEditingDoctor(doctor);
    setFormData({
      name: doctor.name,
      specialty: doctor.specialty,
      allow_2nd_week: doctor.allow_2nd_week,
      limit_2_patients: doctor.limit_2_patients,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا الطبيب؟')) {
      await supabase.from('doctors').delete().eq('id', id);
      fetchDoctors();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">إدارة الأطباء</h1>
          <p className="text-slate-500">إضافة وتعديل بيانات الأطباء في النظام</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="btn-primary flex items-center gap-2 shadow-teal-100 shadow-lg"
        >
          <Plus size={20} />
          إضافة طبيب جديد
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-right border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="p-4 font-bold text-slate-700">اسم الطبيب</th>
              <th className="p-4 font-bold text-slate-700">التخصص</th>
              <th className="p-4 font-bold text-slate-700">حجز الأسبوع الثاني</th>
              <th className="p-4 font-bold text-slate-700">تحديد مريضين لكل رقم</th>
              <th className="p-4 font-bold text-slate-700">الإجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {doctors.map((doctor) => (
              <tr key={doctor.id} className="hover:bg-slate-50 transition-colors">
                <td className="p-4 font-medium text-slate-800">{doctor.name}</td>
                <td className="p-4 text-slate-600">{doctor.specialty}</td>
                <td className="p-4">
                  {doctor.allow_2nd_week ? (
                    <span className="inline-flex items-center gap-1 text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full text-sm">
                      <CheckCircle size={14} /> مسموح
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-slate-400 bg-slate-50 px-3 py-1 rounded-full text-sm">
                      <XCircle size={14} /> غير مسموح
                    </span>
                  )}
                </td>
                <td className="p-4">
                  {doctor.limit_2_patients ? (
                    <span className="inline-flex items-center gap-1 text-amber-600 bg-amber-50 px-3 py-1 rounded-full text-sm">
                      <CheckCircle size={14} /> مفعل
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-slate-400 bg-slate-50 px-3 py-1 rounded-full text-sm">
                      <XCircle size={14} /> معطل
                    </span>
                  )}
                </td>
                <td className="p-4">
                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(doctor)} className="p-2 text-teal-600 hover:bg-teal-50 rounded-lg transition-colors">
                      <Edit2 size={18} />
                    </button>
                    <button onClick={() => handleDelete(doctor.id)} className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="bg-teal-600 p-6 text-white flex justify-between items-center">
              <h2 className="text-xl font-bold">{editingDoctor ? 'تعديل بيانات الطبيب' : 'إضافة طبيب جديد'}</h2>
              <button onClick={() => { setIsModalOpen(false); setEditingDoctor(null); }} className="hover:rotate-90 transition-transform">
                <XCircle size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-bold text-slate-700 mb-2">اسم الطبيب</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="input-field"
                    placeholder="د. محمد الصنعاني"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-bold text-slate-700 mb-2">التخصص</label>
                  <input
                    type="text"
                    required
                    value={formData.specialty}
                    onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                    className="input-field"
                    placeholder="قلب وأوعية دموية"
                  />
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-slate-100">
                <label className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl cursor-pointer hover:bg-slate-100 transition-colors">
                  <input
                    type="checkbox"
                    checked={formData.allow_2nd_week}
                    onChange={(e) => setFormData({ ...formData, allow_2nd_week: e.target.checked })}
                    className="w-5 h-5 text-teal-600 rounded focus:ring-teal-500"
                  />
                  <span className="font-medium text-slate-700">السماح للحجز للأسبوع الثاني</span>
                </label>

                <label className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl cursor-pointer hover:bg-slate-100 transition-colors">
                  <input
                    type="checkbox"
                    checked={formData.limit_2_patients}
                    onChange={(e) => setFormData({ ...formData, limit_2_patients: e.target.checked })}
                    className="w-5 h-5 text-teal-600 rounded focus:ring-teal-500"
                  />
                  <span className="font-medium text-slate-700">منع رقم الهاتف من تسجيل أكثر من مريضين</span>
                </label>
              </div>

              <div className="flex gap-4 pt-4">
                <button type="submit" className="btn-primary flex-1 py-3 text-lg">
                  {editingDoctor ? 'حفظ التعديلات' : 'إضافة الطبيب'}
                </button>
                <button 
                  type="button" 
                  onClick={() => { setIsModalOpen(false); setEditingDoctor(null); }}
                  className="flex-1 bg-slate-100 text-slate-600 font-bold py-3 rounded-xl hover:bg-slate-200 transition-all"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
