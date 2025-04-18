import { useState, useEffect } from 'react';
import { Client } from '@/types';

interface UseMem0Props {
  autoFetch?: boolean;
}

interface UseMem0Return {
  clients: Client[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  initialized: boolean;
  fetchClientDetail: (userId: string) => Promise<Client | null>;
  searchMemories: (userId: string, query: string) => Promise<any[]>;
}

/**
 * Hook to interact with Mem0 through the server-side API
 */
export const useMem0 = ({ autoFetch = true }: UseMem0Props = {}): UseMem0Return => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [initialized, setInitialized] = useState<boolean>(true); // Always true since initialization is handled server-side

  // Function to fetch clients from Mem0
  const fetchClients = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/mem0');
      if (!response.ok) {
        throw new Error('Failed to fetch clients');
      }
      const data = await response.json();
      setClients(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch clients from Mem0'));
    } finally {
      setLoading(false);
    }
  };
  
  // Function to fetch a single client with detailed information
  const fetchClientDetail = async (userId: string): Promise<Client | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/mem0?userId=${userId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch client detail');
      }
      const data = await response.json();
      return data;
    } catch (err) {
      setError(err instanceof Error ? err : new Error(`Failed to fetch client detail for ${userId}`));
      return null;
    } finally {
      setLoading(false);
    }
  };
  
  // Function to search memories for a specific client
  const searchMemories = async (userId: string, query: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/mem0?userId=${userId}&query=${encodeURIComponent(query)}`);
      if (!response.ok) {
        throw new Error('Failed to search memories');
      }
      const data = await response.json();
      return data;
    } catch (err) {
      setError(err instanceof Error ? err : new Error(`Failed to search memories for ${userId}`));
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Auto-fetch clients on mount if enabled
  useEffect(() => {
    if (autoFetch) {
      fetchClients();
    }
  }, [autoFetch]);

  return {
    clients,
    loading,
    error,
    refetch: fetchClients,
    initialized,
    fetchClientDetail,
    searchMemories
  };
};
