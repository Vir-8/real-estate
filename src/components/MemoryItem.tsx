import { ClientMemory } from '@/types';
import { MapPin, Heart, DollarSign, Phone, Clipboard, MessageCircle, Clock, MoreHorizontal, Pin, Copy, Edit, Trash2, Database, Globe } from 'lucide-react';
import { format } from 'date-fns';
import { useState } from 'react';

interface MemoryItemProps {
  memory: ClientMemory;
  isMem0Data?: boolean;
}

export default function MemoryItem({ memory, isMem0Data = false }: MemoryItemProps) {
  const [showActions, setShowActions] = useState(false);
  const [isPinned, setIsPinned] = useState(false);

  const getMemoryIcon = (type: string) => {
    switch (type) {
      case 'location':
        return <MapPin className="h-4 w-4 sm:h-5 sm:w-5" />;
      case 'preference':
        return <Heart className="h-4 w-4 sm:h-5 sm:w-5" />;
      case 'budget':
        return <DollarSign className="h-4 w-4 sm:h-5 sm:w-5" />;
      case 'contact':
        return <Phone className="h-4 w-4 sm:h-5 sm:w-5" />;
      case 'note':
        return <Clipboard className="h-4 w-4 sm:h-5 sm:w-5" />;
      case 'interaction':
        return <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5" />;
      default:
        return <Clipboard className="h-4 w-4 sm:h-5 sm:w-5" />;
    }
  };

  const getMemoryColor = (type: string) => {
    switch (type) {
      case 'location':
        return {
          icon: 'text-blue-600 bg-blue-100',
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          tag: 'bg-blue-100 text-blue-800'
        };
      case 'preference':
        return {
          icon: 'text-purple-600 bg-purple-100',
          bg: 'bg-purple-50',
          border: 'border-purple-200',
          tag: 'bg-purple-100 text-purple-800'
        };
      case 'budget':
        return {
          icon: 'text-green-600 bg-green-100',
          bg: 'bg-green-50',
          border: 'border-green-200',
          tag: 'bg-green-100 text-green-800'
        };
      case 'contact':
        return {
          icon: 'text-orange-600 bg-orange-100',
          bg: 'bg-orange-50',
          border: 'border-orange-200',
          tag: 'bg-orange-100 text-orange-800'
        };
      case 'note':
        return {
          icon: 'text-gray-600 bg-gray-100',
          bg: 'bg-gray-50',
          border: 'border-gray-200',
          tag: 'bg-gray-100 text-gray-800'
        };
      case 'interaction':
        return {
          icon: 'text-amber-600 bg-amber-100',
          bg: 'bg-amber-50',
          border: 'border-amber-200',
          tag: 'bg-amber-100 text-amber-800'
        };
      default:
        return {
          icon: 'text-gray-600 bg-gray-100',
          bg: 'bg-gray-50',
          border: 'border-gray-200',
          tag: 'bg-gray-100 text-gray-800'
        };
    }
  };

  const colors = getMemoryColor(memory.type || 'note');

  return (
    <div className={`rounded-xl p-4 sm:p-5 shadow-sm ${colors.bg} ${colors.border} border group relative transition-all hover:shadow-md ${isPinned ? 'ring-2 ring-blue-500 ring-offset-2' : ''}`}>      
      <div className="flex items-start">
        <div className={`p-2 sm:p-3 rounded-xl mr-3 sm:mr-4 ${colors.icon}`}>
          {getMemoryIcon(memory.type || 'note')}
        </div>
        
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center flex-wrap gap-1.5 sm:gap-2">
              <span className={`px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-xs font-medium capitalize ${colors.tag}`}>
                {memory.type || 'Note'}
              </span>
              {isPinned && (
                <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                  Pinned
                </span>
              )}
              <span className={`px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200`}>
                {memory.language}
              </span>
            </div>
            
            <div className="flex items-center">
              <span className="text-xs text-gray-500 flex items-center mr-2">
                <Clock size={12} className="mr-1" />
                {format(new Date(memory.createdAt || new Date()), 'MMM d, yyyy')}
              </span>
              
              <button 
                className="relative p-1.5 rounded-lg hover:bg-white text-gray-500"
                onClick={() => setShowActions(!showActions)}
              >
                <MoreHorizontal size={16} />
              </button>
              
              {showActions && (
                <div className="absolute top-12 right-4 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10 w-40">
                  <button className="flex items-center w-full px-4 py-2 text-sm text-left hover:bg-gray-50 text-gray-700">
                    <Copy size={14} className="mr-2" />
                    Copy
                  </button>
                  <button className="flex items-center w-full px-4 py-2 text-sm text-left hover:bg-gray-50 text-gray-700">
                    <Edit size={14} className="mr-2" />
                    Edit
                  </button>
                  <button 
                    className="flex items-center w-full px-4 py-2 text-sm text-left hover:bg-gray-50 text-gray-700"
                    onClick={() => setIsPinned(!isPinned)}
                  >
                    <Pin size={14} className="mr-2" />
                    {isPinned ? 'Unpin' : 'Pin'}
                  </button>
                  <div className="border-t border-gray-100 my-1"></div>
                  <button className="flex items-center w-full px-4 py-2 text-sm text-left hover:bg-red-50 text-red-600">
                    <Trash2 size={14} className="mr-2" />
                    Delete
                  </button>
                </div>
              )}
            </div>
          </div>
          
          <div className="mt-2 sm:mt-3">
            <p className="text-sm sm:text-base text-gray-800">
              {memory.content}
            </p>
            {memory.translatedContent && memory.content !== memory.translatedContent && (
              <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-gray-200 opacity-80">
                <div className="flex items-center mb-1">
                  <Globe size={12} className="mr-1 text-gray-500" />
                  <p className="text-xs font-medium text-gray-500">TRANSLATION</p>
                </div>
                <p className="text-xs sm:text-sm text-gray-700">
                  {memory.translatedContent}
                </p>
              </div>
            )}
          </div>
          
          <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-gray-200 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0">
              <div className="flex space-x-2">
                <button className="px-2 sm:px-3 py-1 sm:py-1.5 bg-white rounded-lg text-xs font-medium hover:bg-gray-50 text-gray-700 border border-gray-200 shadow-sm">
                  Apply Filter
                </button>
                <button className="px-2 sm:px-3 py-1 sm:py-1.5 bg-white rounded-lg text-xs font-medium hover:bg-gray-50 text-gray-700 border border-gray-200 shadow-sm">
                  Add to Note
                </button>
              </div>
              <button 
                className={`p-1.5 rounded-lg ${isPinned ? 'text-blue-500 hover:text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                onClick={() => setIsPinned(!isPinned)}
              >
                <Pin size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
