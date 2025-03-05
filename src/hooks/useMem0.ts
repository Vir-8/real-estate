import { useState, useEffect } from 'react';
import { Client } from '@/types';
import { 
  initializeMem0, 
  fetchAllMem0UsersWithMemories, 
  fetchMem0ClientDetail,
  searchMem0UserMemories
} from '@/lib/mem0Service';

interface UseMem0Props {
  apiKey?: string;
  googleApiKey?: string;
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
 * Enhanced hook to initialize and fetch data from Mem0
 */
export const useMem0 = ({ 
  apiKey = process.env.NEXT_PUBLIC_MEM0_API_KEY, 
  googleApiKey = process.env.NEXT_PUBLIC_GOOGLE_AI_API_KEY,
  autoFetch = true 
}: UseMem0Props = {}): UseMem0Return => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [initialized, setInitialized] = useState<boolean>(false);

  // Initialize the Mem0 client
  useEffect(() => {
    if (!apiKey) {
      setError(new Error('Mem0 API key not provided'));
      return;
    }

    const initialize = async () => {
      try {
        await initializeMem0(apiKey, googleApiKey || '');
        setInitialized(true);
        
        if (autoFetch) {
          await fetchClients();
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to initialize Mem0'));
      }
    };

    initialize();
  }, [apiKey, googleApiKey]);

  // Function to fetch clients from Mem0
  const fetchClients = async () => {
    if (!initialized) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const mem0Clients = await fetchAllMem0UsersWithMemories();
      setClients(mem0Clients);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch clients from Mem0'));
    } finally {
      setLoading(false);
    }
  };
  
  // Function to fetch a single client with detailed information
  const fetchClientDetail = async (userId: string): Promise<Client | null> => {
    if (!initialized) {
      return null;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const clientDetail = await fetchMem0ClientDetail(userId);
      return clientDetail;
    } catch (err) {
      setError(err instanceof Error ? err : new Error(`Failed to fetch client detail for ${userId}`));
      return null;
    } finally {
      setLoading(false);
    }
  };
  
  // Function to search memories for a specific client
  const searchMemories = async (userId: string, query: string) => {
    if (!initialized) {
      return [];
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const memories = await searchMem0UserMemories(userId, query);
      return memories;
    } catch (err) {
      setError(err instanceof Error ? err : new Error(`Failed to search memories for ${userId}`));
      return [];
    } finally {
      setLoading(false);
    }
  };

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
