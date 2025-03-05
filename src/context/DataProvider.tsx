import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Client, Property } from '@/types';
import { clients as mockClients, properties as mockProperties, conversations as mockConversations } from '@/data/mockData';
import { useMem0 } from '@/hooks/useMem0';

interface DataContextType {
  clients: Client[];
  properties: Property[];
  conversations: any;
  loading: boolean;
  error: Error | null;
  refetchMem0Data: () => Promise<void>;
}

// Create context
const DataContext = createContext<DataContextType | undefined>(undefined);

interface DataProviderProps {
  children: ReactNode;
  useMockDataOnly?: boolean;
}

export const DataProvider: React.FC<DataProviderProps> = ({ 
  children, 
  useMockDataOnly = false 
}) => {
  // Get mem0 data
  const { 
    clients: mem0Clients, 
    loading: mem0Loading, 
    error: mem0Error, 
    refetch: refetchMem0Data 
  } = useMem0({ autoFetch: !useMockDataOnly });

  // Combine mock data with mem0 data
  const clients = useMockDataOnly ? mockClients : [...mem0Clients, ...mockClients];
  
  // We're keeping the mock properties and conversations as is
  const properties = mockProperties;
  const conversations = mockConversations;

  return (
    <DataContext.Provider
      value={{
        clients,
        properties,
        conversations,
        loading: mem0Loading,
        error: mem0Error,
        refetchMem0Data
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

// Custom hook to use the data context
export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
