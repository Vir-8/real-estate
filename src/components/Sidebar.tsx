import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Users, 
  Home, 
  MessageSquare, 
  Building, 
  PieChart, 
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useState } from 'react';
import Image from 'next/image';

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const menuItems = [
    { name: 'Dashboard', href: '/', icon: Home },
    { name: 'Clients', href: '/clients', icon: Users },
    { name: 'Conversations', href: '/conversations', icon: MessageSquare },
    { name: 'Properties', href: '/properties', icon: Building },
    { name: 'Analytics', href: '/analytics', icon: PieChart },
    { name: 'Settings', icon: Settings },
  ];

  return (
    <div className={`bg-white border-r border-gray-200 min-h-screen z-10 ${collapsed ? 'w-20' : 'w-72'} transition-all duration-300 flex flex-col`}>
      <div className="p-5 flex items-center justify-between border-b border-gray-100">
        {!collapsed ? (
          <div className="flex items-center">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white font-bold mr-2">
              PP
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent">
              PropertyPulse
            </h1>
          </div>
        ) : (
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white font-bold mx-auto">
            PP
          </div>
        )}
        
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
        >
          {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>
      
      <div className="py-6 px-3 flex-1">
        <nav className="flex flex-col gap-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            
            return (
              <Link
                key={item.name}
                href={item.href || '#'}
                className={`flex items-center px-4 py-3 rounded-xl transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 font-medium shadow-sm'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <div className={`${isActive ? 'text-blue-600' : 'text-gray-500'}`}>
                  <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                </div>
                {!collapsed && <span className={`ml-3 ${isActive ? 'text-blue-700' : ''}`}>{item.name}</span>}
                {isActive && !collapsed && (
                  <div className="w-1 h-6 bg-blue-600 rounded-full absolute right-3"></div>
                )}
              </Link>
            );
          })}
        </nav>
      </div>
      
      <div className="p-5 border-t border-gray-100">
        {!collapsed ? (
          <div className="flex items-center p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-all cursor-pointer">
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium mr-3">
              AR
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-gray-900 truncate">Aditya Rao</h3>
              <p className="text-xs text-gray-500">Real Estate Agent</p>
            </div>
            <LogOut size={18} className="text-gray-400 hover:text-gray-700" />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium mb-2">
              AR
            </div>
            <LogOut size={20} className="text-gray-400 hover:text-gray-700 cursor-pointer" />
          </div>
        )}
      </div>
    </div>
  );
}
