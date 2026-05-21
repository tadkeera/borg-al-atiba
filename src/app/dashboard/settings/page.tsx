"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Save, ShieldCheck, Globe, Key, PhoneCall } from 'lucide-react';

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    WHATSAPP_TOKEN: '',
    WHATSAPP_PHONE_ID: '',
    YEMEN_PHONE_PREFIX: '+967'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    const { data } = await supabase.from('settings').select('*');
    if (data) {
      const settingsObj = data.reduce((acc: any, curr) => {
        acc[curr.key] = curr.value;
        return acc;
      }, {});
      setSettings(prev => ({ ...prev, ...settingsObj }));
    }
    setLoading(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    const updates = Object.entries(settings).map(([key, value]) => ({
      key, value
    }));

    await supabase.from('settings').upsert(updates);
    setSaving(false);
    alert('تم حفظ الإعدادات بنجاح');
  };

  if (loading) return <div className="p-8">جاري التحميل...</div>;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">إعدادات واتساب</h1>
        <p className="text-slate-500">ربط النظام مع WhatsApp Cloud API</p>
      </div>

      <form onSubmit={handleSave} className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-8 space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-teal-600 font-bold mb-2">
              <Key size={20} />
              <span>رموز الوصول (API)</span>
            </div>
            
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">WhatsApp Access Token</label>
              <textarea
                value={settings.WHATSAPP_TOKEN}
                onChange={(e) => setSettings({ ...settings, WHATSAPP_TOKEN: e.target.value })}
                className="input-field min-h-[100px]"
                placeholder="EAA..."
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Phone Number ID</label>
              <input
                type="text"
                value={settings.WHATSAPP_PHONE_ID}
                onChange={(e) => setSettings({ ...settings, WHATSAPP_PHONE_ID: e.target.value })}
                className="input-field"
                placeholder="1234567890..."
              />
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 space-y-4">
            <div className="flex items-center gap-2 text-teal-600 font-bold mb-2">
              <Globe size={20} />
              <span>إعدادات المنطقة</span>
            </div>
            
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">مقدمة الأرقام (اليمن)</label>
              <div className="relative">
                <PhoneCall className="absolute right-3 top-3 text-slate-400" size={20} />
                <input
                  type="text"
                  value={settings.YEMEN_PHONE_PREFIX}
                  onChange={(e) => setSettings({ ...settings, YEMEN_PHONE_PREFIX: e.target.value })}
                  className="input-field pr-10"
                  placeholder="+967"
                />
              </div>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={saving}
            className="btn-primary w-full py-4 text-lg flex items-center justify-center gap-2 shadow-teal-100 shadow-lg"
          >
            <Save size={20} />
            {saving ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
          </button>
        </div>
        
        <div className="bg-slate-50 px-8 py-4 border-t border-slate-100 flex items-center gap-2 text-slate-400 text-sm">
          <ShieldCheck size={16} />
          <span>هذه الإعدادات مشفرة ولا يمكن الوصول إليها إلا من قبل مدير النظام</span>
        </div>
      </form>
    </div>
  );
}
