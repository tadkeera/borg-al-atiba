"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { Footer } from '@/components/Footer';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [userName, setUserName] = useState('');
  const [role, setRole] = useState<'admin' | 'receptionist' | null>(null);

  useEffect(() => {
    const storedRole = localStorage.getItem('user_role') as any;
    const storedName = localStorage.getItem('user_name');
    
    if (!storedRole) {
      router.push('/login');
    } else {
      setRole(storedRole);
      setUserName(storedName || '');
    }
  }, [router]);

  if (!role) return <div className="min-h-screen flex items-center justify-center">جاري التحميل...</div>;

  return (
    <div className="min-h-screen flex flex-col">
      <Header userDisplayName={userName} />
      <div className="flex flex-1">
        <Sidebar role={role} />
        <main className="flex-1 p-8 bg-slate-50 overflow-y-auto max-h-[calc(100vh-5rem)]">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
}
