"use client";

import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import ClientCard from '@/components/ClientCard';
import { useCallback, useEffect, useState } from 'react';
import { Filter, Plus, Search, RefreshCcw, AlertCircle } from 'lucide-react';
import { Client } from '@/types';
import { useData } from '@/context/DataProvider';

export default function ClientsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);

  // Use data from context
  const { clients, loading, error, refetchMem0Data } = useData();

  // Filter clients based on search query and filters
  const filteredClients = clients.filter(client => {
    // Search filter
    const matchesSearch = 
      searchQuery === '' || 
      client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.phone.includes(searchQuery);
    
    // Language filter
    const matchesLanguage = 
      !selectedLanguage || 
      client.preferredLanguage === selectedLanguage;
    
    // Status filter
    const matchesStatus = 
      !selectedStatus || 
      client.leadStatus === selectedStatus;
    
    return matchesSearch && matchesLanguage && matchesStatus;
  });

  // Wrap the refresh function in useCallback so it doesn't change on every render.
  const handleRefresh = useCallback(() => {
    console.log('Fetching Mem0 data...');
    refetchMem0Data();
  }, [refetchMem0Data]);

  // Run the effect only once on mount.
  useEffect(() => {
    const timer = setTimeout(() => {
      handleRefresh();
    }, 100);

    return () => clearTimeout(timer);
  }, []);


  // Language options
  const languages = ['English', 'Hindi', 'Marathi', 'Telugu', 'Mixed'];
  
  // Status options
  const statuses = ['New', 'Contacted', 'Qualified', 'Negotiating', 'Closed'];

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="Clients" subtitle="Manage your client relationships" />
        
        <main className="flex-1 overflow-y-auto p-6">
          {/* Data Fetch Status */}
          {loading && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center">
              <div className="animate-spin w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full mr-3"></div>
              <p className="text-blue-700">Loading client data from Mem0...</p>
            </div>
          )}
          
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center">
              <AlertCircle className="h-5 w-5 text-red-600 mr-3" />
              <div>
                <p className="text-red-700">Error loading data from Mem0</p>
                <p className="text-sm text-red-600">{error.message}</p>
              </div>
              <button 
                onClick={handleRefresh}
                className="ml-auto bg-white text-red-600 border border-red-300 py-1 px-3 rounded-lg hover:bg-red-50 text-sm flex items-center"
              >
                <RefreshCcw size={14} className="mr-1" />
                Retry
              </button>
            </div>
          )}

          {/* Search and Filter Bar */}
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-6">
            <div className="relative w-full md:w-auto md:flex-1 max-w-md">
              <input
                type="text"
                placeholder="Search clients..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2.5 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
            
            <div className="flex items-center gap-2 w-full md:w-auto">
              <div className="relative">
                <select
                  value={selectedLanguage || ''}
                  onChange={(e) => setSelectedLanguage(e.target.value || null)}
                  className="pl-3 pr-8 py-2.5 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                >
                  <option value="">All Languages</option>
                  {languages.map(language => (
                    <option key={language} value={language}>{language}</option>
                  ))}
                </select>
                <Filter className="absolute right-3 top-2.5 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
              
              <div className="relative">
                <select
                  value={selectedStatus || ''}
                  onChange={(e) => setSelectedStatus(e.target.value || null)}
                  className="pl-3 pr-8 py-2.5 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                >
                  <option value="">All Statuses</option>
                  {statuses.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
                <Filter className="absolute right-3 top-2.5 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
              
              <button 
                onClick={handleRefresh}
                className="p-2.5 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors mr-2"
                title="Refresh Mem0 Data"
              >
                <RefreshCcw size={18} />
              </button>
              
              <button className="bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 transition-colors flex items-center">
                <Plus className="h-4 w-4 mr-1" />
                Add Client
              </button>
            </div>
          </div>
          
          {/* Data source indicator */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">
              {filteredClients.length} Clients
            </h2>
            <div className="flex items-center">
              <div className="mr-4 flex items-center">
                <div className="w-3 h-3 rounded-full bg-blue-600 mr-1.5"></div>
                <span className="text-sm text-gray-600">Mem0 Data</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-gray-400 mr-1.5"></div>
                <span className="text-sm text-gray-600">Mock Data</span>
              </div>
            </div>
          </div>
          
          {/* Clients Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredClients.map(client => (
              <ClientCard 
                key={client.id} 
                client={client}
                // Add a prop to indicate data source
                isMem0Data={!client.id.startsWith('c')} // Assuming mock client IDs start with 'c'
              />
            ))}
            
            {filteredClients.length === 0 && !loading && (
              <div className="col-span-full flex flex-col items-center justify-center py-12 text-gray-500">
                <Search className="h-10 w-10 mb-2 text-gray-300" />
                <h3 className="text-lg font-medium">No clients found</h3>
                <p className="text-sm">Try adjusting your search or filters</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
