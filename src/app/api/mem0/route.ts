import { NextResponse } from 'next/server';
import { initializeMem0, fetchAllMem0UsersWithMemories, fetchMem0ClientDetail, searchMem0UserMemories } from '@/lib/mem0Service';

// Initialize Mem0 on server startup
let isInitialized = false;

async function initialize() {
  if (!isInitialized) {
    const mem0ApiKey = process.env.MEM0_API_KEY;
    const googleApiKey = process.env.GEMINI_API_KEY;
    
    if (!mem0ApiKey) {
      throw new Error('MEM0_API_KEY is not configured');
    }
    
    await initializeMem0(mem0ApiKey, googleApiKey || '');
    isInitialized = true;
  }
}

export async function GET(request: Request) {
  try {
    await initialize();
    
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const query = searchParams.get('query');
    
    if (userId && query) {
      const memories = await searchMem0UserMemories(userId, query);
      return NextResponse.json(memories);
    } else if (userId) {
      const client = await fetchMem0ClientDetail(userId);
      return NextResponse.json(client);
    } else {
      const clients = await fetchAllMem0UsersWithMemories();
      return NextResponse.json(clients);
    }
  } catch (error) {
    console.error('Mem0 API error:', error);
    return NextResponse.json(
      { error: 'Failed to process Mem0 request' },
      { status: 500 }
    );
  }
} 