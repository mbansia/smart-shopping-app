
import React from 'react';
import { UserIcon, WalletIcon } from './icons/Icons';

interface HeaderProps {
  cashback: number;
}

const Header: React.FC<HeaderProps> = ({ cashback }) => {
  return (
    <header className="bg-white/80 backdrop-blur-lg shadow-sm p-4 flex justify-between items-center z-30 flex-shrink-0">
      <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
        <UserIcon className="w-6 h-6 text-neutral-text" />
      </button>
      <div className="flex items-center space-x-2 bg-green-100 text-brand-green font-semibold px-4 py-2 rounded-full">
        <WalletIcon className="w-5 h-5" />
        <span className="text-sm">AED {cashback.toFixed(2)}</span>
      </div>
    </header>
  );
};

export default Header;
