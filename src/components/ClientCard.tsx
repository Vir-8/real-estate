import { Client } from '@/types';
import { User, Clock, MessageSquare, Phone, Mail, MapPin, Calendar, MoreHorizontal, Database } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { JSX } from 'react';

interface ClientCardProps {
  client: Client;
  isMem0Data?: boolean;
}

export default function ClientCard({ client, isMem0Data = false }: ClientCardProps) {
  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      New: 'bg-blue-50 text-blue-700 border-blue-200',
      Contacted: 'bg-yellow-50 text-yellow-700 border-yellow-200',
      Qualified: 'bg-green-50 text-green-700 border-green-200',
      Negotiating: 'bg-purple-50 text-purple-700 border-purple-200',
      Closed: 'bg-gray-50 text-gray-700 border-gray-200',
    };
    
    const icons: Record<string, JSX.Element> = {
      New: <div className="w-2 h-2 rounded-full bg-blue-500 mr-1.5"></div>,
      Contacted: <div className="w-2 h-2 rounded-full bg-yellow-500 mr-1.5"></div>,
      Qualified: <div className="w-2 h-2 rounded-full bg-green-500 mr-1.5"></div>,
      Negotiating: <div className="w-2 h-2 rounded-full bg-purple-500 mr-1.5"></div>,
      Closed: <div className="w-2 h-2 rounded-full bg-gray-500 mr-1.5"></div>,
    };

    return (
      <div className={`flex items-center px-2 py-1 rounded-full text-xs font-medium border ${styles[status] || styles.New}`}>
        {icons[status]}
        <span className="hidden sm:inline">{status}</span>
      </div>
    );
  };

  const getLanguageBadge = (language: string) => {
    return (
      <div className="px-2 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200">
        {language}
      </div>
    );
  };

  return (
    <Link href={`/clients/${client.id}`}>
      <div className={`bg-white rounded-xl shadow-sm hover:shadow-md transition-all p-4 sm:p-5 border ${isMem0Data ? 'border-blue-200' : 'border-gray-100'} h-full group relative`}>        
        <div className="flex items-start justify-between">
          <div className="flex">
            <div className={`h-12 w-12 sm:h-14 sm:w-14 rounded-full overflow-hidden bg-gray-100 mr-3 sm:mr-4 border-2 ${isMem0Data ? 'border-blue-300' : 'border-white'} shadow-sm`}>
              <Image
                src={client.profilePic}
                alt={client.name}
                width={56}
                height={56}
                className="object-cover h-full w-full"
              />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 group-hover:text-blue-700 transition-colors text-sm sm:text-base">{client.name}</h3>
              
              <div className="flex items-center mt-1 space-x-2">
                {getStatusBadge(client.leadStatus)}
                {getLanguageBadge(client.preferredLanguage)}
              </div>
            </div>
          </div>
          
          <button className="p-1.5 rounded-full hover:bg-gray-100 opacity-0 group-hover:opacity-100 transition-opacity">
            <MoreHorizontal size={16} className="text-gray-500" />
          </button>
        </div>
        
        <div className="mt-3 sm:mt-4 space-y-2 sm:space-y-3">
          <div className="flex items-center text-xs sm:text-sm text-gray-600">
            <Phone size={14} className="mr-2 text-gray-400" />
            <span className="truncate">{client.phone}</span>
          </div>
          
          <div className="flex items-center text-xs sm:text-sm text-gray-600">
            <Mail size={14} className="mr-2 text-gray-400" />
            <span className="truncate">{client.email}</span>
          </div>
          
          <div className="flex items-center text-xs sm:text-sm text-gray-600">
            <Calendar size={14} className="mr-2 text-gray-400" />
            <span>Last Contact: {formatDistanceToNow(new Date(client.lastContact), { addSuffix: true })}</span>
          </div>
        </div>
        
        {client.memories.length > 0 && (
          <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide">Last Memory</h4>
              <span className="text-xs text-blue-600">{client.memories.length} total</span>
            </div>
            <div className={`${isMem0Data ? 'bg-blue-50 border-blue-100' : 'bg-gray-50 border-gray-100'} p-2 sm:p-3 rounded-lg text-xs sm:text-sm text-gray-700 border`}>
              "{client.memories[0]?.translatedContent || client.memories[0]?.content || 'No memories yet'}"
            </div>
          </div>
        )}
      </div>
    </Link>
  );
}
