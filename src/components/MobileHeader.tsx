import { Menu } from 'lucide-react';

interface MobileHeaderProps {
  onMenuClick: () => void;
  title: string;
}

export default function MobileHeader({ onMenuClick, title }: MobileHeaderProps) {
  return (
    <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center">
          <button
            onClick={onMenuClick}
            className="p-2 rounded-lg hover:bg-gray-100"
          >
            <Menu size={24} />
          </button>
          <div className="ml-3 flex items-center">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white font-bold">
              PP
            </div>
            <h1 className="ml-2 text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent">
              {title}
            </h1>
          </div>
        </div>
      </div>
    </div>
  );
} 