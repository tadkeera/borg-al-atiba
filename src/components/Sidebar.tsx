import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  Settings, 
  ClipboardList,
  ShieldCheck
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const navItems = [
  { name: 'لوحة التحكم', href: '/dashboard', icon: LayoutDashboard, role: 'receptionist' },
  { name: 'الأطباء', href: '/dashboard/doctors', icon: Users, role: 'admin' },
  { name: 'الجداول', href: '/dashboard/schedules', icon: Calendar, role: 'admin' },
  { name: 'الحجوزات', href: '/dashboard/bookings', icon: ClipboardList, role: 'receptionist' },
  { name: 'إعدادات واتساب', href: '/dashboard/settings', icon: Settings, role: 'admin' },
];

export const Sidebar = ({ role }: { role: 'admin' | 'receptionist' }) => {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 min-h-[calc(100vh-5rem)] flex flex-col p-4">
      <nav className="flex-1 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const isAllowed = role === 'admin' || item.role === 'receptionist';
          
          if (!isAllowed) return null;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
                isActive 
                  ? "bg-teal-600 text-white shadow-lg" 
                  : "hover:bg-slate-800 hover:text-white"
              )}
            >
              <item.icon size={20} />
              <span className="font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>
      
      <div className="mt-auto pt-6 border-t border-slate-800">
        <div className="flex items-center gap-2 px-4 text-slate-500 text-sm">
          <ShieldCheck size={16} />
          <span>{role === 'admin' ? 'مدير النظام' : 'موظف استقبال'}</span>
        </div>
      </div>
    </aside>
  );
};
