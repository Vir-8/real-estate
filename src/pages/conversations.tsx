"use client";

import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
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
  ChevronDown
} from 'lucide-react';
import { ConversationMessage, Language } from '@/types';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';
import ChatMessage from '@/components/ChatMessage';
import LanguageSelector from '@/components/LanguageSelector';
import { useData } from '@/context/DataProvider';

export default function ConversationsPage() {
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState<Language>('English');
  const [newMessage, setNewMessage] = useState('');
  const [showInsights, setShowInsights] = useState(true);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterLanguage, setFilterLanguage] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string | null>(null);

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
      id: `msg-${Date.now()}`,
      clientId: selectedClientId,
      content: newMessage,
      timestamp: new Date().toISOString(),
      language: selectedLanguage,
      sender: 'agent'
    };

    // In a real app, update the server here.
    console.log('Sending message:', newMsg);
    setNewMessage('');
  };

  // Language and status options.
  const languages = ['English', 'Hindi', 'Marathi', 'Telugu', 'Mixed'];
  const statuses = ['New', 'Contacted', 'Qualified', 'Negotiating', 'Closed'];

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="Conversations" subtitle="Manage client communications" />

        <div className="flex-1 flex overflow-hidden">
          {/* Clients List */}
          <div className="w-full md:w-80 lg:w-96 border-r border-gray-200 flex flex-col z-10">
            <div className="p-4 bg-white border-b border-gray-200 shadow-sm">
              <div className="relative mb-4">
                <input
                  type="text"
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2.5 w-full border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <h3 className="text-sm font-semibold text-gray-700">All Conversations</h3>
                  <button
                    className={`ml-2 p-1.5 rounded-lg transition-colors ${
                      filterOpen || filterLanguage || filterStatus
                        ? 'bg-blue-50 text-blue-600'
                        : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
                    }`}
                    onClick={() => setFilterOpen(!filterOpen)}
                  >
                    <Filter size={16} />
                  </button>
                </div>
                <button className="text-blue-600 hover:text-blue-700 flex items-center text-sm font-medium">
                  <PlusCircle size={16} className="mr-1" />
                  New Chat
                </button>
              </div>

              {filterOpen && (
                <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200 space-y-3">
                  <div>
                    <label className="text-xs font-medium text-gray-700 block mb-1">Language</label>
                    <select
                      value={filterLanguage || ''}
                      onChange={(e) => setFilterLanguage(e.target.value || null)}
                      className="w-full text-sm border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">All Languages</option>
                      {languages.map(language => (
                        <option key={language} value={language}>
                          {language}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-gray-700 block mb-1">Status</label>
                    <select
                      value={filterStatus || ''}
                      onChange={(e) => setFilterStatus(e.target.value || null)}
                      className="w-full text-sm border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">All Statuses</option>
                      {statuses.map(status => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex justify-between">
                    <button
                      className="text-xs text-gray-600 hover:text-gray-800"
                      onClick={() => {
                        setFilterLanguage(null);
                        setFilterStatus(null);
                      }}
                    >
                      Clear Filters
                    </button>
                    <button
                      className="text-xs text-blue-600 font-medium hover:text-blue-800"
                      onClick={() => setFilterOpen(false)}
                    >
                      Apply Filters
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="flex-1 overflow-y-auto bg-white">
              {sortedClients.map(client => (
                <div
                  key={client.id}
                  onClick={() => setSelectedClientId(client.id)}
                  className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-all ${
                    selectedClientId === client.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                  }`}
                >
                  <div className="flex items-start">
                    <div className="relative flex-shrink-0 mr-3">
                      <div className="h-12 w-12 rounded-full overflow-hidden bg-gray-200">
                        <Image
                          src={client.profilePic}
                          alt={client.name}
                          width={48}
                          height={48}
                          className="object-cover"
                        />
                      </div>
                      {client.unreadCount > 0 && (
                        <div className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 rounded-full flex items-center justify-center border-2 border-white">
                          <span className="text-white text-xs font-bold">{client.unreadCount}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className={`font-medium ${client.unreadCount > 0 ? 'text-gray-900' : 'text-gray-700'} truncate`}>
                          {client.name}
                        </h3>
                        {client.lastMessage && (
                          <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                            {formatDistanceToNow(new Date(client.lastMessage.timestamp), { addSuffix: false })}
                          </span>
                        )}
                      </div>

                      {client.lastMessage ? (
                        <p className={`text-sm truncate ${client.unreadCount > 0 ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
                          {client.lastMessage.sender === 'agent' && <span className="text-blue-600 mr-1">You: </span>}
                          {client.lastMessage.translatedContent || client.lastMessage.content}
                        </p>
                      ) : (
                        <p className="text-sm text-gray-400 italic">No messages yet</p>
                      )}

                      <div className="flex items-center mt-1">
                        <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 border border-gray-200">
                          {client.preferredLanguage}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100 ml-1">
                          {client.leadStatus}
                        </span>
                        {client.lastMessage && client.lastMessage.insights && Object.keys(client.lastMessage.insights).length > 0 && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-100 ml-1 flex items-center">
                            <Star size={10} className="mr-1" />
                            Insights
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {filteredClients.length === 0 && (
                <div className="p-6 text-center">
                  <div className="inline-block p-3 rounded-full bg-gray-100 mb-2">
                    <MessageSquare className="h-6 w-6 text-gray-400" />
                  </div>
                  <p className="text-gray-600 font-medium">No conversations found</p>
                  <p className="text-sm text-gray-500 mt-1">Try adjusting your search or filters</p>
                </div>
              )}
            </div>
          </div>

          {/* Conversation */}
          <div className="hidden md:flex flex-1 flex-col bg-gray-50">
            {selectedClient ? (
              <>
                <div className="bg-white p-4 border-b border-gray-200 flex items-center justify-between shadow-sm">
                  <div className="flex items-center">
                    <div className="h-12 w-12 rounded-full overflow-hidden bg-gray-200 mr-3 border-2 border-white shadow-sm">
                      <Image
                        src={selectedClient.profilePic}
                        alt={selectedClient.name}
                        width={48}
                        height={48}
                        className="object-cover"
                      />
                    </div>

                    <div>
                      <div className="flex items-center">
                        <h3 className="font-semibold text-gray-900">{selectedClient.name}</h3>
                        <div className="ml-2 w-2 h-2 rounded-full bg-green-500"></div>
                      </div>
                      <div className="flex items-center text-xs text-gray-500 mt-0.5">
                        <span className="rounded-full px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-100">
                          {selectedClient.leadStatus}
                        </span>
                        <span className="ml-2 rounded-full px-2 py-0.5 bg-gray-100 text-gray-700 border border-gray-200">
                          {selectedClient.preferredLanguage}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1">
                    <button className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700">
                      <Phone size={18} />
                    </button>
                    <button className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700">
                      <Mail size={18} />
                    </button>
                    <button className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700">
                      <Calendar size={18} />
                    </button>
                    <button
                      className={`p-2 rounded-lg hover:bg-gray-100 ${
                        showInsights ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'
                      }`}
                      onClick={() => setShowInsights(!showInsights)}
                    >
                      <Star size={18} />
                    </button>
                    <button className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700">
                      <MoreHorizontal size={18} />
                    </button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
                  {selectedClientMessages.length > 0 ? (
                    <div className="space-y-2 pb-2">
                      <div className="text-center mb-6">
                        <div className="inline-block bg-white px-4 py-1 rounded-full text-xs font-medium text-gray-500 border border-gray-200 shadow-sm">
                          Conversation started {formatDistanceToNow(new Date(selectedClientMessages[0].timestamp), { addSuffix: true })}
                        </div>
                      </div>
                      {selectedClientMessages.map(message => (
                        <ChatMessage key={message.id} message={{ ...message, clientImage: selectedClient.profilePic }} showInsights={showInsights} />
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-500">
                      <div className="bg-white p-4 rounded-full shadow-sm mb-3">
                        <MessageSquare className="h-12 w-12 text-blue-200" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-700">No messages yet</h3>
                      <p className="text-sm text-center mt-1 max-w-md">
                        Start a conversation with {selectedClient.name} by sending a message below.
                      </p>
                      <div className="mt-6 bg-white rounded-lg shadow-sm p-4 border border-gray-200 max-w-md">
                        <h4 className="font-medium text-gray-800 mb-2">Suggested opening messages:</h4>
                        <div className="space-y-2">
                          <button className="w-full p-2 text-left text-sm text-gray-600 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition-colors">
                            Hello {selectedClient.name}, thank you for your interest in our properties. How can I help you today?
                          </button>
                          <button className="w-full p-2 text-left text-sm text-gray-600 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition-colors">
                            Hi {selectedClient.name}, I'm your dedicated real estate agent. Do you have any specific requirements for your property search?
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="bg-white p-5 border-t border-gray-200 shadow-sm">
                  <div className="flex items-center mb-3">
                    <span className="text-sm text-gray-600 mr-2">Reply in:</span>
                    <div className="w-40">
                      <LanguageSelector selectedLanguage={selectedLanguage} onChange={setSelectedLanguage} />
                    </div>

                    <div className="ml-auto flex items-center text-sm">
                      <button className="flex items-center text-blue-600 hover:text-blue-800 font-medium mr-4">
                        <Globe size={16} className="mr-1.5" />
                        AI Translation
                      </button>
                      <button className="flex items-center text-blue-600 hover:text-blue-800 font-medium">
                        <ArrowRight size={16} className="mr-1.5" />
                        Smart Reply
                      </button>
                    </div>
                  </div>

                  <div className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
                    <div className="p-3 border-b border-gray-100">
                      <div className="flex items-center text-gray-500 text-sm space-x-4">
                        <button className="hover:text-gray-700">
                          <Paperclip size={18} />
                        </button>
                        <button className="hover:text-gray-700">
                          <Mic size={18} />
                        </button>
                        <button className="hover:text-gray-700">
                          <Calendar size={18} />
                        </button>
                        <button className="hover:text-gray-700">
                          <Smile size={18} />
                        </button>
                      </div>
                    </div>
                    <div className="flex">
                      <textarea
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder={`Type a message in ${selectedLanguage}...`}
                        className="flex-1 p-4 outline-none resize-none min-h-[80px]"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage();
                          }
                        }}
                      />
                    </div>
                    <div className="p-3 border-t border-gray-100 flex justify-between items-center bg-gray-50">
                      <div className="text-xs text-gray-500">
                        Press Enter to send, Shift+Enter for new line
                      </div>
                      <button
                        onClick={handleSendMessage}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center shadow-sm"
                      >
                        <Send size={16} className="mr-2" />
                        Send
                      </button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-500 bg-gray-50">
                <div className="bg-white p-5 rounded-xl shadow-sm mb-5 border border-gray-200">
                  <MessageSquare className="h-16 w-16 text-blue-200 mx-auto mb-4" />
                  <h2 className="text-xl font-bold text-gray-800 text-center">Select a conversation</h2>
                  <p className="text-sm text-center text-gray-500 mt-2 max-w-md">
                    Choose a client from the list to view and continue your conversation.
                  </p>
                  <div className="mt-6 flex flex-col items-center">
                    <p className="text-sm text-gray-600 mb-3 font-medium">Quick Stats:</p>
                    <div className="grid grid-cols-3 gap-4 w-full">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{clients.length}</div>
                        <div className="text-xs text-gray-500">Total Clients</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{sortedClients.filter(c => c.unreadCount > 0).length}</div>
                        <div className="text-xs text-gray-500">Unread Chats</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">
                          {Object.values(conversations).reduce((sum, msgs) => sum + msgs.length, 0)}
                        </div>
                        <div className="text-xs text-gray-500">Total Messages</div>
                      </div>
                    </div>
                  </div>
                </div>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow-sm hover:bg-blue-700 transition-colors flex items-center">
                  <PlusCircle size={18} className="mr-2" />
                  Start New Conversation
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
