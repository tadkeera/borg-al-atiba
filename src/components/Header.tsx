import React from 'react';
import { HOSPITAL_LOGO, SYSTEM_NAME } from '@/utils/constants';
import { User, LogOut } from 'lucide-react';

export const Header = ({ userDisplayName }: { userDisplayName: string }) => {
  return (
    <header className="h-20 bg-teal-600 text-white flex items-center justify-between px-8 shadow-md sticky top-0 z-50">
      <div className="flex items-center gap-4">
        <img src={HOSPITAL_LOGO} alt="Logo" className="h-14 w-14 object-contain bg-white rounded-full p-1" />
        <h1 className="text-xl font-bold">{SYSTEM_NAME}</h1>
      </div>
      
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <div className="bg-teal-500 p-2 rounded-full">
            <User size={20} />
          </div>
          <span className="font-medium">{userDisplayName}</span>
        </div>
        <button className="flex items-center gap-1 hover:text-teal-200 transition-colors">
          <LogOut size={20} />
          <span>خروج</span>
        </button>
      </div>
    </header>
  );
};
