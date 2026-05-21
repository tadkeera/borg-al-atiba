"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { HOSPITAL_LOGO, SYSTEM_NAME } from '@/utils/constants';
import { Lock, User, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [receptionistName, setReceptionistName] = useState('');
  const [role, setRole] = useState<'admin' | 'receptionist'>('admin');
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (role === 'admin') {
      if (username === '123' && password === '123') {
        // In real app: supabase.auth.signIn...
        localStorage.setItem('user_role', 'admin');
        localStorage.setItem('user_name', 'مدير النظام');
        router.push('/dashboard');
      } else {
        alert('خطأ في اسم المستخدم أو كلمة المرور');
      }
    } else {
      if (receptionistName.trim()) {
        localStorage.setItem('user_role', 'receptionist');
        localStorage.setItem('user_name', receptionistName);
        router.push('/dashboard');
      } else {
        alert('يرجى إدخال اسم الموظف');
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100 transition-all hover:shadow-2xl">
        <div className="p-8 bg-teal-600 flex flex-col items-center text-white">
          <img 
            src={HOSPITAL_LOGO} 
            alt="Hospital Logo" 
            className="w-24 h-24 object-contain bg-white rounded-2xl p-2 mb-4 shadow-lg"
          />
          <h1 className="text-2xl font-bold text-center leading-tight">
            {SYSTEM_NAME}
          </h1>
          <p className="mt-2 text-teal-100">مرحباً بك، يرجى تسجيل الدخول</p>
        </div>

        <div className="p-8">
          <div className="flex bg-slate-100 p-1 rounded-xl mb-8">
            <button
              onClick={() => setRole('admin')}
              className={`flex-1 py-2 rounded-lg font-bold transition-all ${role === 'admin' ? 'bg-white text-teal-600 shadow-sm' : 'text-slate-500'}`}
            >
              مدير النظام
            </button>
            <button
              onClick={() => setRole('receptionist')}
              className={`flex-1 py-2 rounded-lg font-bold transition-all ${role === 'receptionist' ? 'bg-white text-teal-600 shadow-sm' : 'text-slate-500'}`}
            >
              موظف استقبال
            </button>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            {role === 'admin' ? (
              <>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">اسم المستخدم</label>
                  <div className="relative">
                    <User className="absolute right-3 top-3 text-slate-400" size={20} />
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="input-field pr-10"
                      placeholder="أدخل رقم المستخدم"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">كلمة المرور</label>
                  <div className="relative">
                    <Lock className="absolute right-3 top-3 text-slate-400" size={20} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="input-field pr-10"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute left-3 top-3 text-slate-400 hover:text-teal-600"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">اسم الموظف</label>
                <div className="relative">
                  <User className="absolute right-3 top-3 text-slate-400" size={20} />
                  <input
                    type="text"
                    value={receptionistName}
                    onChange={(e) => setReceptionistName(e.target.value)}
                    className="input-field pr-10"
                    placeholder="أدخل اسمك بالكامل"
                    required
                  />
                </div>
              </div>
            )}

            <button type="submit" className="btn-primary w-full py-4 text-lg mt-4 shadow-teal-200 shadow-lg">
              دخول للنظام
            </button>
          </form>
        </div>
      </div>
      
      <p className="mt-8 text-slate-400 text-sm">
        للإبلاغ عن مشاكل تقنية يرجى التواصل مع الإدارة
      </p>
    </div>
  );
}
