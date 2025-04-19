"use client";

import { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  Search,
  User,
  MapPin,
  Filter,
  PlusCircle,
  MoreHorizontal,
  Phone,
  Mail,
  Clock,
  Star,
  Pin,
  Send,
  Globe,
  Paperclip,
  Mic,
  Smile,
  Calendar,
  ArrowRight,
  ChevronDown,
  X
} from 'lucide-react';
import { ConversationMessage, Language } from '@/types';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';
import ChatMessage from '@/components/ChatMessage';
import LanguageSelector from '@/components/LanguageSelector';
import { useData } from '@/context/DataProvider';
import Layout from '@/components/Layout';

export default function ConversationsPage() {
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState<Language>('English');
  const [newMessage, setNewMessage] = useState('');
  const [showInsights, setShowInsights] = useState(true);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterLanguage, setFilterLanguage] = useState<string | undefined>(undefined);
  const [filterStatus, setFilterStatus] = useState<string | undefined>(undefined);
  const [isMobile, setIsMobile] = useState(false);
  const [showChat, setShowChat] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Get mem0-integrated data from context.
  const { clients, conversations, loading, error, refetchMem0Data } = useData();

  // Ensure mem0 data is fetched only once on mount.
  const didFetchRef = useRef(false);
  useEffect(() => {
    if (!didFetchRef.current) {
      didFetchRef.current = true;
      refetchMem0Data();
    }
  }, [refetchMem0Data]);

  // Compute clients with their last message and unread count.
  const clientsWithLastMessage = clients.map(client => {
    const clientMessages = conversations[client.id] || [];
    const lastMessage = clientMessages.length > 0 ? clientMessages[clientMessages.length - 1] : null;
    return {
      ...client,
      lastMessage,
      unreadCount: clientMessages.filter((msg: ConversationMessage) => msg.sender === 'client' && !msg.read).length
    };
  });

  // Filter clients based on search query and filters.
  const filteredClients = clientsWithLastMessage.filter(client => {
    const matchesSearch =
      searchQuery === '' ||
      client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (client.lastMessage && client.lastMessage.content.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesLanguage = !filterLanguage || client.preferredLanguage === filterLanguage;
    const matchesStatus = !filterStatus || client.leadStatus === filterStatus;
    return matchesSearch && matchesLanguage && matchesStatus;
  });

  // Sort clients: first by unread count, then by recency of last message, then alphabetically.
  const sortedClients = [...filteredClients].sort((a, b) => {
    if (a.unreadCount !== b.unreadCount) return b.unreadCount - a.unreadCount;
    if (a.lastMessage && b.lastMessage) {
      return new Date(b.lastMessage.timestamp).getTime() - new Date(a.lastMessage.timestamp).getTime();
    }
    if (a.lastMessage) return -1;
    if (b.lastMessage) return 1;
    return a.name.localeCompare(b.name);
  });

  // Get messages for the selected client.
  const selectedClientMessages: ConversationMessage[] = selectedClientId
    ? conversations[selectedClientId] || []
    : [];

  const selectedClient = selectedClientId ? clients.find(c => c.id === selectedClientId) : null;

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedClientId) return;

    const newMsg: ConversationMessage = {
      id: Date.now().toString(),
      content: newMessage,
      timestamp: new Date().toISOString(),
      sender: 'agent',
      read: true,
      translatedContent: undefined,
      clientId: selectedClientId,
      language: 'English'
    };

    // Add the new message to the conversation
    conversations[selectedClientId] = [...selectedClientMessages, newMsg];
    setNewMessage('');
  };

  const handleClientSelect = (clientId: string) => {
    setSelectedClientId(clientId);
    if (isMobile) {
      setShowChat(true);
    }
  };

  // Language and status options.
  const languages = ['English', 'Hindi', 'Marathi', 'Telugu', 'Mixed'];
  const statuses = ['New', 'Contacted', 'Qualified', 'Negotiating', 'Closed'];

  return (
    <Layout title="Conversations" subtitle="Manage your client communications">
      <div className="flex h-full">
        {/* Clients List */}
        <div className={`${isMobile && showChat ? 'hidden' : 'flex'} flex-col w-full md:w-96 border-r border-gray-200 bg-white`}>
          {/* Search and Filter Bar */}
          <div className="p-4 border-b border-gray-200">
            <div className="relative">
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
            
            <div className="flex items-center gap-2 mt-3">
              <button
                onClick={() => setFilterOpen(!filterOpen)}
                className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                <Filter size={16} />
                Filters
              </button>
              
              {filterOpen && (
                <div className="absolute top-16 left-4 right-4 bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-10">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium">Filters</h3>
                    <button onClick={() => setFilterOpen(false)}>
                      <X size={16} className="text-gray-500" />
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Language</label>
                      <select
                        value={filterLanguage || ''}
                        onChange={(e) => setFilterLanguage(e.target.value || '')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">All Languages</option>
                        <option value="English">English</option>
                        <option value="Hindi">Hindi</option>
                        <option value="Kannada">Kannada</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Status</label>
                      <select
                        value={filterStatus || ''}
                        onChange={(e) => setFilterStatus(e.target.value || '')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">All Statuses</option>
                        <option value="New">New</option>
                        <option value="Contacted">Contacted</option>
                        <option value="Qualified">Qualified</option>
                        <option value="Negotiating">Negotiating</option>
                        <option value="Closed">Closed</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Clients List */}
          <div className="flex-1 overflow-y-auto">
            {sortedClients.map(client => (
              <div
                key={client.id}
                onClick={() => handleClientSelect(client.id)}
                className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                  selectedClientId === client.id ? 'bg-blue-50' : ''
                }`}
              >
                <div className="flex items-start">
                  <div className="h-10 w-10 rounded-full overflow-hidden bg-gray-100 mr-3">
                    <Image
                      src={client.profilePic}
                      alt={client.name}
                      width={40}
                      height={40}
                      className="object-cover h-full w-full"
                    />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-gray-900 truncate">{client.name}</h3>
                      <span className="text-xs text-gray-500">
                        {client.lastMessage && formatDistanceToNow(new Date(client.lastMessage.timestamp), { addSuffix: true })}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-600 truncate mt-1">
                      {client.lastMessage?.content || 'No messages yet'}
                    </p>
                    
                    <div className="flex items-center gap-2 mt-2">
                      {client.unreadCount > 0 && (
                        <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">
                          {client.unreadCount}
                        </span>
                      )}
                      <span className="text-xs text-gray-500">
                        {client.preferredLanguage}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Chat Area */}
        <div className={`${isMobile && !showChat ? 'hidden' : 'flex'} flex-1 flex-col bg-white`}>
          {selectedClient ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full overflow-hidden bg-gray-100 mr-3">
                      <Image
                        src={selectedClient.profilePic}
                        alt={selectedClient.name}
                        width={40}
                        height={40}
                        className="object-cover h-full w-full"
                      />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{selectedClient.name}</h3>
                      <p className="text-sm text-gray-500">{selectedClient.email}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button className="p-2 rounded-lg hover:bg-gray-100">
                      <Phone size={20} className="text-gray-600" />
                    </button>
                    <button className="p-2 rounded-lg hover:bg-gray-100">
                      <Mail size={20} className="text-gray-600" />
                    </button>
                    <button className="p-2 rounded-lg hover:bg-gray-100">
                      <MoreHorizontal size={20} className="text-gray-600" />
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4">
                {selectedClientMessages.map((message) => (
                  <ChatMessage
                    key={message.id}
                    message={message}
                    client={selectedClient}
                    selectedLanguage={selectedLanguage}
                  />
                ))}
              </div>
              
              {/* Message Input */}
              <div className="p-4 border-t border-gray-200">
                <div className="flex items-center gap-2">
                  <button className="p-2 rounded-lg hover:bg-gray-100">
                    <Paperclip size={20} className="text-gray-600" />
                  </button>
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  />
                  <button className="p-2 rounded-lg hover:bg-gray-100">
                    <Mic size={20} className="text-gray-600" />
                  </button>
                  <button className="p-2 rounded-lg hover:bg-gray-100">
                    <Smile size={20} className="text-gray-600" />
                  </button>
                  <button
                    onClick={handleSendMessage}
                    className="p-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                  >
                    <Send size={20} />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <MessageSquare size={48} className="mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium">Select a conversation</h3>
                <p className="text-sm">Choose a client from the list to start chatting</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
