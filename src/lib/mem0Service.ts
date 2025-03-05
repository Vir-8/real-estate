import Mem0 from 'mem0ai';
import { Client, ClientMemory, Language } from '@/types';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Create a singleton instance of the Mem0 client
let mem0Client: any = null;

// Initialize Google Generative AI
let genAI: any = null;
let geminiModel: any = null;

/**
 * Initialize the Google AI and Gemini model
 * @param apiKey The Google AI API key
 */
const initializeGoogleAI = (apiKey: string) => {
  if (!genAI) {
    genAI = new GoogleGenerativeAI(apiKey);
    geminiModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    console.log('Google Generative AI initialized successfully');
  }
  return geminiModel;
};

/**
 * Initialize the Mem0 client with API key
 * @param apiKey The Mem0 API key
 * @param googleApiKey The Google AI API key
 */
export const initializeMem0 = async (apiKey: string, googleApiKey: string) => {
  try {
    mem0Client = new Mem0({ apiKey });
    
    // Initialize Google AI if API key is provided
    if (googleApiKey) {
      initializeGoogleAI(googleApiKey);
    }
    
    console.log('Mem0 client initialized successfully');
    return mem0Client;
  } catch (error) {
    console.error('Failed to initialize Mem0 client:', error);
    throw error;
  }
};

/**
 * Get the Mem0 client instance
 * @returns The Mem0 client instance
 */
export const getMem0Client = () => {
  if (!mem0Client) {
    throw new Error('Mem0 client not initialized. Call initializeMem0 first.');
  }
  return mem0Client;
};

/**
 * Fetch all users from Mem0
 * @returns Array of users converted to Client format
 */
export const fetchAllMem0Users = async (): Promise<Client[]> => {
  try {
    const client = getMem0Client();
    const users = await client.users();
    
    // Map Mem0 user data to our Client type
    const mappedUsers = await Promise.all(
      users.results.map((user: any) => mapMem0UserToClient(user))
    );
    
    return mappedUsers;
  } catch (error) {
    console.error('Error fetching Mem0 users:', error);
    return [];
  }
};

/**
 * Fetch memories for a specific user
 * @param userId The user ID
 * @returns Array of memories for the user
 */
export const fetchMem0UserMemories = async (userId: string): Promise<ClientMemory[]> => {
  try {
    const client = getMem0Client();
    const memories = await client.getAll({ user_id: userId, page: 1, page_size: 5 });
    
    // Map Mem0 memories to our ClientMemory type
    const mappedMemories = await Promise.all(
      memories.results.map((memory: any) => mapMem0MemoryToClientMemory(memory))
    );
    
    return mappedMemories;
  } catch (error) {
    console.error(`Error fetching memories for user ${userId}:`, error);
    return [];
  }
};

/**
 * Search for specific memories for a user
 * @param userId The user ID
 * @param query The search query
 * @returns Array of memories matching the query
 */
export const searchMem0UserMemories = async (userId: string, query: string): Promise<ClientMemory[]> => {
  try {
    const client = getMem0Client();
    const searchResults = await client.search(query, { 
      user_id: userId, 
      output_format: "v1.1",
      page: 1,
      page_size: 20
    });
    
    // Map search results to our ClientMemory type
    const mappedMemories = await Promise.all(
      searchResults.results.map((memory: any) => mapMem0MemoryToClientMemory(memory))
    );
    
    return mappedMemories;
  } catch (error) {
    console.error(`Error searching memories for user ${userId} with query "${query}":`, error);
    return [];
  }
};

/**
 * Fetch memories by category for a specific user
 * @param userId The user ID
 * @param category The category to search for (preferences, budget, etc.)
 * @returns Array of memories in the specified category
 */
export const fetchMem0UserMemoriesByCategory = async (userId: string, category: string): Promise<ClientMemory[]> => {
  const categoryQueries: Record<string, string> = {
    preference: "What are the client's preferences? What do they like or prefer?",
    budget: "What is the client's budget? How much are they willing to spend?",
    location: "What locations is the client interested in?",
    contact: "What contact information does the client have?",
    note: "Any general notes about the client?"
  };
  
  const query = categoryQueries[category] || `Find memories related to ${category}`;
  return searchMem0UserMemories(userId, query);
};

/**
 * Fetch all Mem0 users with their memories
 * @returns Array of clients with their memories
 */
export const fetchAllMem0UsersWithMemories = async (): Promise<Client[]> => {
  try {
    const users = await fetchAllMem0Users();
    
    // For each user, fetch their memories
    const usersWithMemories = await Promise.all(
      users.map(async (user) => {
        const memories = await fetchMem0UserMemories(user.id);
        return {
          ...user,
          memories
        };
      })
    );
    
    return usersWithMemories;
  } catch (error) {
    console.error('Error fetching Mem0 users with memories:', error);
    return [];
  }
};

/**
 * Helper function to convert a string to Title Case.
 * Also replaces hyphens with spaces.
 * @param str The input string.
 * @returns The string in Title Case.
 */
const toTitleCase = (str: string): string => {
  return str
    .replace(/-/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

/**
 * Map Mem0 user data to our Client type using dummy data.
 * Replaces the Gemini API call with pre-defined logic.
 * If name is something like "xyz-abc", it will be transformed to "Xyz Abc",
 * and email is generated based on the name.
 * @param mem0User The Mem0 user data
 * @returns Client object
 */
const mapMem0UserToClient = async (mem0User: any): Promise<Client> => {
  // Process the name: convert hyphens to spaces and title-case it.
  let name = mem0User.name ? toTitleCase(mem0User.name) : 'Unknown Name';
  
  // Generate email based on the processed name.
  let email = name.toLowerCase().replace(/\s+/g, ".") + '@gmail.com';
  
  // Use provided phone or a realistic dummy phone number.
  let phone = mem0User.phone || '+91-989-634-0173';
  
  // Use provided preferred language or default to English.
  let preferredLanguage: Language = mem0User.preferredLanguage || 'English';
  
  // Use provided lead status or default to New.
  let leadStatus: 'New' | 'Contacted' | 'Qualified' | 'Negotiating' | 'Closed' = mem0User.leadStatus || 'New';
  
  let locations: { lat: number; lng: number; description: string }[] = [];
  
  // Use dummy logic for location data.
  if (mem0User.locations && mem0User.locations.length > 0) {
    locations = mem0User.locations.map((loc: any) => ({
      lat: loc.lat || (19.0760 + (Math.random() * 0.1 - 0.05)),
      lng: loc.lng || (72.8777 + (Math.random() * 0.1 - 0.05)),
      description: loc.description || `Location near ${['Bandra', 'Andheri', 'Juhu', 'Colaba', 'Worli'][Math.floor(Math.random() * 5)]}, Mumbai`
    }));
  }
  
  // Ensure we have at least one location.
  if (locations.length === 0) {
    locations = [{
      lat: 19.0760 + (Math.random() * 0.1 - 0.05),
      lng: 72.8777 + (Math.random() * 0.1 - 0.05),
      description: `Location near ${['Bandra', 'Andheri', 'Juhu', 'Colaba', 'Worli'][Math.floor(Math.random() * 5)]}, Mumbai`
    }];
  }
  
  return {
    id: mem0User.name || String(mem0User.user_id),
    name,
    email,
    phone,
    profilePic: mem0User.profile_pic || 'https://api.dicebear.com/7.x/personas/png?seed=' + name.replace(/\s+/g, ''),
    leadStatus,
    preferredLanguage,
    lastContact: mem0User.last_contact || new Date().toISOString(),
    memories: [], // Will be populated separately
    locations
  };
};

/**
 * Helper function that checks for a full-word or exact phrase match in a text.
 * It uses regex with word boundaries and escapes special regex characters.
 * @param text The text to search.
 * @param phrase The word or phrase to match.
 * @returns True if a full match is found.
 */
const containsWord = (text: string, phrase: string): boolean => {
  const escaped = phrase.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
  const regex = new RegExp(`\\b${escaped}\\b`, 'i');
  return regex.test(text);
};

/**
 * Map Mem0 memory data to our ClientMemory type using pre-defined logic only.
 * Gemini API is no longer called for every single memory mapping.
 * @param mem0Memory The Mem0 memory data
 * @returns ClientMemory object
 */
const mapMem0MemoryToClientMemory = async (mem0Memory: any): Promise<ClientMemory> => {
  let type: 'preference' | 'budget' | 'location' | 'contact' | 'note' | 'interaction' = 'note';
  let language: 'English' | 'Hindi' | 'Marathi' | 'Telugu' | 'Mixed' = 'English';
  
  // Use simple heuristic categorization based on pre-defined logic.
  const content = mem0Memory.memory.toLowerCase();
  console.log('Content:', content);
  
  if (
    containsWord(content, 'budget') || 
    containsWord(content, 'price') || 
    containsWord(content, 'afford') || 
    containsWord(content, 'lac') || 
    containsWord(content, 'crore') || 
    containsWord(content, 'rs') || 
    containsWord(content, 'rupees')
  ) {
    type = 'budget';
  } else if (
    containsWord(content, 'prefer') || 
    containsWord(content, 'prefers') || 
    containsWord(content, 'like') || 
    containsWord(content, 'want') || 
    containsWord(content, 'look for') || 
    containsWord(content, 'bhk')
  ) {
    type = 'preference';
  } else if (
    containsWord(content, 'location') || 
    containsWord(content, 'area') || 
    containsWord(content, 'bandra') || 
    containsWord(content, 'andheri') || 
    containsWord(content, 'juhu') || 
    containsWord(content, 'mumbai')
  ) {
    type = 'location';
  } else if (
    containsWord(content, 'call') || 
    containsWord(content, 'email') || 
    containsWord(content, 'contact') || 
    containsWord(content, 'phone') || 
    content.includes('@') || 
    content.includes('+91')
  ) {
    type = 'contact';
  } else if (
    containsWord(content, 'meet') || 
    containsWord(content, 'talk') || 
    containsWord(content, 'discuss') || 
    containsWord(content, 'conversation') || 
    containsWord(content, 'visit')
  ) {
    type = 'interaction';
  }
  
  // Simple language detection.
  if (content.includes('मैं') || content.includes('हम') || content.includes('आप')) {
    language = 'Hindi';
  } else if (content.includes('मी') || content.includes('आम्ही') || content.includes('तुम्ही')) {
    language = 'Marathi';
  } else if (content.includes('నేను') || content.includes('మేము') || content.includes('మీరు')) {
    language = 'Telugu';
  }
  
  return {
    id: mem0Memory.id || `memory-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type,
    content: mem0Memory.memory || '',
    translatedContent: mem0Memory.memory,
    language,
    createdAt: mem0Memory.created_at || new Date().toISOString(),
    updatedAt: mem0Memory.updated_at || new Date().toISOString()
  };
};

/**
 * Optimized fetch for client detail page - loads only essential memories
 * @param userId The user ID
 * @returns Client with essential memories
 */
export const fetchMem0ClientDetail = async (userId: string): Promise<Client | null> => {
  try {
    const client = getMem0Client();
    
    // Get basic user info.
    const users = await client.users();
    const userData = users.results.find((u: any) => u.id === userId || u.name === userId);
    
    if (!userData) {
      console.error(`User ${userId} not found`);
      return null;
    }
    
    // Map user to our format.
    const mappedUser = await mapMem0UserToClient(userData);
    
    // Fetch different types of memories in parallel.
    const [preferences, budgets, locations, general] = await Promise.all([
      fetchMem0UserMemoriesByCategory(userId, 'preference'),
      fetchMem0UserMemoriesByCategory(userId, 'budget'),
      fetchMem0UserMemoriesByCategory(userId, 'location'),
      fetchMem0UserMemoriesByCategory(userId, 'note')
    ]);
    
    // Combine memories, but limit to top 5 of each type.
    mappedUser.memories = [
      ...preferences.slice(0, 5),
      ...budgets.slice(0, 3),
      ...locations.slice(0, 3),
      ...general.slice(0, 3)
    ];
    
    return mappedUser;
    
  } catch (error) {
    console.error(`Error fetching client detail for ${userId}:`, error);
    return null;
  }
};
