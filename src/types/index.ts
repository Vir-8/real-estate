export type Language = 'English' | 'Hindi' | 'Marathi' | 'Telugu' | 'Mixed';

export type ClientMemory = {
  id: string;
  type: 'location' | 'preference' | 'budget' | 'contact' | 'note' | 'interaction';
  content: string;
  createdAt: string;
  updatedAt: string;
  language: Language;
  translatedContent?: string;
};

export type Client = {
  id: string;
  name: string;
  profilePic: string;
  preferredLanguage: Language;
  lastContact: string;
  phone: string;
  email: string;
  leadStatus: 'New' | 'Contacted' | 'Qualified' | 'Negotiating' | 'Closed';
  memories: ClientMemory[];
  locations?: {
    lat: number;
    lng: number;
    description: string;
  }[];
};

export type PropertyType = 
  | '1BHK' 
  | '2BHK' 
  | '3BHK' 
  | '4BHK' 
  | 'Villa' 
  | 'Plot' 
  | 'Commercial'
  | 'PentHouse';

export type Property = {
  id: string;
  title: string;
  type: PropertyType;
  price: number;
  location: {
    address: string;
    city: string;
    lat: number;
    lng: number;
  };
  amenities: string[];
  images: string[];
  description: string;
  area: number; // in sq ft
  status: 'Available' | 'Sold' | 'Reserved';
};

export type ConversationMessage = {
  id: string;
  clientId: string;
  content: string;
  timestamp: string;
  language: Language;
  translatedContent?: string;
  sender: 'agent' | 'client';
  insights?: {
    interests?: string[];
    budget?: string;
    location?: string;
    urgency?: 'Low' | 'Medium' | 'High';
  };
  clientImage?: string;
  read?: boolean;
};
