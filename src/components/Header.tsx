import { Bell, Search, User, Plus, Calendar, ChevronDown, Menu } from 'lucide-react';
import { useState } from 'react';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export default function Header({ title, subtitle }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <header className="bg-white border-b border-gray-200 py-4 px-4 sm:py-5 sm:px-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{title}</h1>
          {subtitle && <p className="text-xs sm:text-sm text-gray-500 mt-1">{subtitle}</p>}
        </div>
        
        <div className="flex items-center space-x-2 sm:space-x-4">
          {/* Search - Hidden on mobile */}
          <div className="relative hidden sm:block">
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64 text-sm transition-all duration-200 hover:border-gray-400"
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
          
          {/* Calendar - Hidden on mobile */}
          <button className="p-2.5 rounded-xl hover:bg-gray-100 transition-colors relative border border-gray-200 hidden sm:block">
            <Calendar className="h-5 w-5 text-gray-600" />
          </button>
          
          {/* Notifications */}
          <button className="p-2.5 rounded-xl hover:bg-gray-100 transition-colors relative border border-gray-200">
            <Bell className="h-5 w-5 text-gray-600" />
            <span className="absolute top-2 right-2 h-2.5 w-2.5 bg-red-500 rounded-full border-2 border-white"></span>
          </button>
          
          {/* Add New Button - Hidden on mobile */}
          <button className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors text-sm flex items-center shadow-sm hidden sm:flex">
            <Plus className="h-4 w-4 mr-2" />
            Add New
          </button>
          
          {/* User Profile - Simplified on mobile */}
          <div className="flex items-center pl-4 border-l border-gray-200">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-medium mr-2">
              AR
            </div>
            <div className="hidden sm:flex items-center cursor-pointer hover:bg-gray-50 p-1 rounded">
              <div className="mr-2">
                <p className="text-sm font-medium text-gray-800">Aditya Rao</p>
                <p className="text-xs text-gray-500">Agent</p>
              </div>
              <ChevronDown size={16} className="text-gray-400" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
