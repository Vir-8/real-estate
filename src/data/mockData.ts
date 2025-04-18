import { Client, ConversationMessage, Property } from '@/types';
import { format, subDays, subHours, subMinutes } from 'date-fns';

// Mock clients data
export const clients: Client[] = [
  {
    id: '1',
    name: 'Rahul Sharma',
    profilePic: 'https://api.dicebear.com/7.x/personas/png?seed=twin',
    preferredLanguage: 'Hindi',
    lastContact: format(subHours(new Date(), 2), 'yyyy-MM-dd HH:mm:ss'),
    phone: '+91 9876543210',
    email: 'rahul.sharma@example.com',
    leadStatus: 'Qualified',
    memories: [
      {
        id: 'm1',
        type: 'preference',
        content: 'पसंद है 3BHK अपार्टमेंट जो अच्छे स्कूलों के पास हो',
        createdAt: format(subDays(new Date(), 5), 'yyyy-MM-dd HH:mm:ss'),
        language: 'Hindi',
        translatedContent: 'Prefers 3BHK apartment near good schools'
      },
      {
        id: 'm2',
        type: 'budget',
        content: 'बजट है 80 लाख से 1 करोड़ तक',
        createdAt: format(subDays(new Date(), 5), 'yyyy-MM-dd HH:mm:ss'),
        language: 'Hindi',
        translatedContent: 'Budget is between 80 lakhs to 1 crore'
      },
      {
        id: 'm3',
        type: 'location',
        content: 'अंधेरी या बांद्रा में घर चाहिए',
        createdAt: format(subDays(new Date(), 4), 'yyyy-MM-dd HH:mm:ss'),
        language: 'Hindi',
        translatedContent: 'Wants home in Andheri or Bandra'
      },
      {
        id: 'm4',
        type: 'note',
        content: 'वाइफ को गार्डन व्यू चाहिए',
        createdAt: format(subDays(new Date(), 3), 'yyyy-MM-dd HH:mm:ss'),
        language: 'Hindi',
        translatedContent: 'Wife wants garden view'
      }
    ],
    locations: [
      {
        lat: 19.1136,
        lng: 72.8697,
        description: 'Andheri, Mumbai'
      },
      {
        lat: 19.0596,
        lng: 72.8295,
        description: 'Bandra, Mumbai'
      }
    ]
  },
  {
    id: '2',
    name: 'Priya Patel',
    profilePic: 'https://api.dicebear.com/7.x/personas/png?seed=twin',
    preferredLanguage: 'English',
    lastContact: format(subDays(new Date(), 1), 'yyyy-MM-dd HH:mm:ss'),
    phone: '+91 8765432109',
    email: 'priya.patel@example.com',
    leadStatus: 'Negotiating',
    memories: [
      {
        id: 'm5',
        type: 'preference',
        content: 'Looking for 2BHK apartment with modern amenities',
        createdAt: format(subDays(new Date(), 10), 'yyyy-MM-dd HH:mm:ss'),
        language: 'English',
      },
      {
        id: 'm6',
        type: 'budget',
        content: 'Budget is 60-70 lakhs',
        createdAt: format(subDays(new Date(), 10), 'yyyy-MM-dd HH:mm:ss'),
        language: 'English',
      },
      {
        id: 'm7',
        type: 'location',
        content: 'Interested in Powai area due to proximity to office',
        createdAt: format(subDays(new Date(), 8), 'yyyy-MM-dd HH:mm:ss'),
        language: 'English',
      }
    ],
    locations: [
      {
        lat: 19.1176,
        lng: 72.9060,
        description: 'Powai, Mumbai'
      }
    ]
  },
  {
    id: '3',
    name: 'Suresh Reddy',
    profilePic: 'https://api.dicebear.com/7.x/personas/png?seed=twin',
    preferredLanguage: 'Telugu',
    lastContact: format(subDays(new Date(), 3), 'yyyy-MM-dd HH:mm:ss'),
    phone: '+91 7654321098',
    email: 'suresh.reddy@example.com',
    leadStatus: 'Contacted',
    memories: [
      {
        id: 'm8',
        type: 'preference',
        content: 'నాకు విశాలమైన విల్లా కావాలి గార్డెన్ తో',
        createdAt: format(subDays(new Date(), 7), 'yyyy-MM-dd HH:mm:ss'),
        language: 'Telugu',
        translatedContent: 'I want a spacious villa with garden'
      },
      {
        id: 'm9',
        type: 'budget',
        content: '2 కోట్లు పైన ఖర్చు చేయగలను',
        createdAt: format(subDays(new Date(), 7), 'yyyy-MM-dd HH:mm:ss'),
        language: 'Telugu',
        translatedContent: 'Can spend above 2 crores'
      }
    ],
    locations: [
      {
        lat: 17.4399,
        lng: 78.4983,
        description: 'Jubilee Hills, Hyderabad'
      }
    ]
  },
  {
    id: '4',
    name: 'Anjali Deshmukh',
    profilePic: 'https://api.dicebear.com/7.x/personas/png?seed=twin',
    preferredLanguage: 'Marathi',
    lastContact: format(subDays(new Date(), 5), 'yyyy-MM-dd HH:mm:ss'),
    phone: '+91 6543210987',
    email: 'anjali.d@example.com',
    leadStatus: 'New',
    memories: [
      {
        id: 'm10',
        type: 'preference',
        content: 'मला शांत भागात 2BHK हवा आहे',
        createdAt: format(subDays(new Date(), 6), 'yyyy-MM-dd HH:mm:ss'),
        language: 'Marathi',
        translatedContent: 'I want a 2BHK in a quiet area'
      }
    ],
    locations: [
      {
        lat: 18.5204,
        lng: 73.8567,
        description: 'Kothrud, Pune'
      }
    ]
  },
  {
    id: '5',
    name: 'Vikram Singh',
    profilePic: 'https://api.dicebear.com/7.x/personas/png?seed=twin',
    preferredLanguage: 'Mixed',
    lastContact: format(subHours(new Date(), 6), 'yyyy-MM-dd HH:mm:ss'),
    phone: '+91 5432109876',
    email: 'vikram.s@example.com',
    leadStatus: 'Qualified',
    memories: [
      {
        id: 'm11',
        type: 'preference',
        content: 'Looking for 4BHK apartment, lekin jo society mein ho with swimming pool and gym',
        createdAt: format(subDays(new Date(), 4), 'yyyy-MM-dd HH:mm:ss'),
        language: 'Mixed',
        translatedContent: 'Looking for 4BHK apartment, but it should be in a society with swimming pool and gym'
      },
      {
        id: 'm12',
        type: 'budget',
        content: 'Budget is around 1.5 to 2 crores',
        createdAt: format(subDays(new Date(), 4), 'yyyy-MM-dd HH:mm:ss'),
        language: 'Mixed',
      }
    ],
    locations: [
      {
        lat: 28.5355,
        lng: 77.3910,
        description: 'Noida, Delhi NCR'
      }
    ]
  }
];

// Mock properties data
export const properties: Property[] = [
  {
    id: 'p1',
    title: 'Luxury 3BHK Apartment in Andheri West',
    type: '3BHK',
    price: 9500000, // 95 lakhs
    location: {
      address: 'Palm Springs, Andheri West',
      city: 'Mumbai',
      lat: 19.1364,
      lng: 72.8296
    },
    amenities: ['Swimming Pool', 'Gym', '24x7 Security', 'Power Backup', 'Children\'s Play Area'],
    images: ['https://hips.hearstapps.com/hmg-prod/images/hbx010125palmerweiss-003-6776bc3c48acd.jpg', 'https://hips.hearstapps.com/hmg-prod/images/hbx010125palmerweiss-003-6776bc3c48acd.jpg'],
    description: 'A beautiful 3BHK apartment with modern amenities in the heart of Andheri West. Close to schools, markets, and metro station.',
    area: 1200,
    status: 'Available'
  },
  {
    id: 'p2',
    title: '2BHK Apartment in Powai',
    type: '2BHK',
    price: 6800000, // 68 lakhs
    location: {
      address: 'Hiranandani Gardens, Powai',
      city: 'Mumbai',
      lat: 19.1207,
      lng: 72.9080
    },
    amenities: ['Gym', '24x7 Security', 'Park View', 'Clubhouse'],
    images: ['https://hips.hearstapps.com/hmg-prod/images/hbx010125palmerweiss-003-6776bc3c48acd.jpg', 'https://hips.hearstapps.com/hmg-prod/images/hbx010125palmerweiss-003-6776bc3c48acd.jpg'],
    description: 'A well-maintained 2BHK apartment in the premium Hiranandani Gardens locality. Perfect for working professionals.',
    area: 950,
    status: 'Available'
  },
  {
    id: 'p3',
    title: 'Spacious Villa in Jubilee Hills',
    type: 'Villa',
    price: 25000000, // 2.5 crores
    location: {
      address: 'Road No. 10, Jubilee Hills',
      city: 'Hyderabad',
      lat: 17.4315,
      lng: 78.4097
    },
    amenities: ['Private Garden', 'Swimming Pool', 'Home Theater', 'Servant Quarters', 'Modern Kitchen'],
    images: ['https://hips.hearstapps.com/hmg-prod/images/hbx010125palmerweiss-003-6776bc3c48acd.jpg', 'https://hips.hearstapps.com/hmg-prod/images/hbx010125palmerweiss-003-6776bc3c48acd.jpg'],
    description: 'A luxurious villa with 5 bedrooms, private garden, and swimming pool in the prestigious Jubilee Hills area.',
    area: 3500,
    status: 'Available'
  },
  {
    id: 'p4',
    title: '2BHK Apartment in Kothrud',
    type: '2BHK',
    price: 5500000, // 55 lakhs
    location: {
      address: 'Mahatma Society, Kothrud',
      city: 'Pune',
      lat: 18.5119,
      lng: 73.8323
    },
    amenities: ['Children\'s Play Area', 'Garden', 'Security', 'Parking'],
    images: ['https://hips.hearstapps.com/hmg-prod/images/hbx010125palmerweiss-003-6776bc3c48acd.jpg', 'https://hips.hearstapps.com/hmg-prod/images/hbx010125palmerweiss-003-6776bc3c48acd.jpg'],
    description: 'A quiet and peaceful 2BHK apartment in one of Pune\'s best localities. Perfect for families.',
    area: 980,
    status: 'Available'
  },
  {
    id: 'p5',
    title: 'Premium 4BHK Apartment in Noida',
    type: '4BHK',
    price: 18000000, // 1.8 crores
    location: {
      address: 'Sector 93, Noida',
      city: 'Delhi NCR',
      lat: 28.5513,
      lng: 77.3929
    },
    amenities: ['Swimming Pool', 'Gym', 'Clubhouse', 'Tennis Court', 'Spa', '24x7 Security'],
    images: ['https://hips.hearstapps.com/hmg-prod/images/hbx010125palmerweiss-003-6776bc3c48acd.jpg', 'https://hips.hearstapps.com/hmg-prod/images/hbx010125palmerweiss-003-6776bc3c48acd.jpg'],
    description: 'A premium 4BHK apartment with all modern amenities in one of Noida\'s most sought-after sectors.',
    area: 2100,
    status: 'Available'
  }
];

// Mock conversations data
export const conversations: Record<string, ConversationMessage[]> = {
  '1': [
    {
      id: 'msg1',
      clientId: '1',
      content: 'नमस्ते, मैं अंधेरी या बांद्रा में 3BHK फ्लैट ढूंढ रहा हूं',
      timestamp: format(subDays(new Date(), 5), 'yyyy-MM-dd HH:mm:ss'),
      language: 'Hindi',
      translatedContent: 'Hello, I am looking for a 3BHK flat in Andheri or Bandra',
      sender: 'client',
      insights: {
        interests: ['3BHK'],
        location: 'Andheri or Bandra',
        urgency: 'Medium'
      }
    },
    {
      id: 'msg2',
      clientId: '1',
      content: 'जी हां, आपके लिए कुछ अच्छे विकल्प हैं। आपका बजट क्या है?',
      timestamp: format(subDays(new Date(), 5), 'yyyy-MM-dd HH:mm:ss'),
      language: 'Hindi',
      translatedContent: 'Yes, there are some good options for you. What is your budget?',
      sender: 'agent'
    },
    {
      id: 'msg3',
      clientId: '1',
      content: 'मेरा बजट 80 लाख से 1 करोड़ के बीच है',
      timestamp: format(subDays(new Date(), 5), 'yyyy-MM-dd HH:mm:ss'),
      language: 'Hindi',
      translatedContent: 'My budget is between 80 lakhs to 1 crore',
      sender: 'client',
      insights: {
        budget: '80 lakhs - 1 crore'
      }
    },
    {
      id: 'msg4',
      clientId: '1',
      content: 'क्या आपके परिवार की कोई विशेष आवश्यकताएं हैं?',
      timestamp: format(subDays(new Date(), 4), 'yyyy-MM-dd HH:mm:ss'),
      language: 'Hindi',
      translatedContent: 'Are there any specific requirements for your family?',
      sender: 'agent'
    },
    {
      id: 'msg5',
      clientId: '1',
      content: 'हां, मेरी पत्नी को गार्डन व्यू चाहिए और अच्छे स्कूलों के पास होना चाहिए',
      timestamp: format(subDays(new Date(), 4), 'yyyy-MM-dd HH:mm:ss'),
      language: 'Hindi',
      translatedContent: 'Yes, my wife wants garden view and it should be near good schools',
      sender: 'client',
      insights: {
        interests: ['Garden View', 'Near Schools']
      }
    },
    {
      id: 'msg6',
      clientId: '1',
      content: 'मैंने अंधेरी में एक अच्छा 3BHK देखा है, 95 लाख में, गार्डन व्यू के साथ और स्कूल के पास। क्या आप इसे देखना चाहेंगे?',
      timestamp: format(subHours(new Date(), 2), 'yyyy-MM-dd HH:mm:ss'),
      language: 'Hindi',
      translatedContent: 'I have seen a good 3BHK in Andheri, for 95 lakhs, with garden view and near a school. Would you like to see it?',
      sender: 'agent'
    }
  ],
  '2': [
    {
      id: 'msg7',
      clientId: '2',
      content: 'Hi, I\'m looking for a 2BHK apartment in Powai',
      timestamp: format(subDays(new Date(), 10), 'yyyy-MM-dd HH:mm:ss'),
      language: 'English',
      sender: 'client',
      insights: {
        interests: ['2BHK'],
        location: 'Powai'
      }
    },
    {
      id: 'msg8',
      clientId: '2',
      content: 'Great! What\'s your budget range for the apartment?',
      timestamp: format(subDays(new Date(), 10), 'yyyy-MM-dd HH:mm:ss'),
      language: 'English',
      sender: 'agent'
    },
    {
      id: 'msg9',
      clientId: '2',
      content: 'I can spend between 60-70 lakhs',
      timestamp: format(subDays(new Date(), 10), 'yyyy-MM-dd HH:mm:ss'),
      language: 'English',
      sender: 'client',
      insights: {
        budget: '60-70 lakhs'
      }
    }
  ],
  '3': [
    {
      id: 'msg10',
      clientId: '3',
      content: 'నాకు విశాలమైన విల్లా కావాలి గార్డెన్ తో',
      timestamp: format(subDays(new Date(), 7), 'yyyy-MM-dd HH:mm:ss'),
      language: 'Telugu',
      translatedContent: 'I want a spacious villa with garden',
      sender: 'client',
      insights: {
        interests: ['Villa', 'Garden']
      }
    }
  ],
  '4': [
    {
      id: 'msg11',
      clientId: '4',
      content: 'मला शांत भागात 2BHK हवा आहे',
      timestamp: format(subDays(new Date(), 6), 'yyyy-MM-dd HH:mm:ss'),
      language: 'Marathi',
      translatedContent: 'I want a 2BHK in a quiet area',
      sender: 'client',
      insights: {
        interests: ['2BHK', 'Quiet Area']
      }
    }
  ],
  '5': [
    {
      id: 'msg12',
      clientId: '5',
      content: 'Looking for 4BHK apartment, lekin jo society mein ho with swimming pool and gym',
      timestamp: format(subDays(new Date(), 4), 'yyyy-MM-dd HH:mm:ss'),
      language: 'Mixed',
      sender: 'client',
      insights: {
        interests: ['4BHK', 'Swimming Pool', 'Gym']
      }
    },
    {
      id: 'msg13',
      clientId: '5',
      content: 'Sure, what\'s your budget range for such properties?',
      timestamp: format(subDays(new Date(), 4), 'yyyy-MM-dd HH:mm:ss'),
      language: 'English',
      sender: 'agent'
    },
    {
      id: 'msg14',
      clientId: '5',
      content: 'Budget is around 1.5 to 2 crores, but location should be premium',
      timestamp: format(subDays(new Date(), 4), 'yyyy-MM-dd HH:mm:ss'),
      language: 'Mixed',
      sender: 'client',
      insights: {
        budget: '1.5-2 crores',
        interests: ['Premium Location']
      }
    },
    {
      id: 'msg15',
      clientId: '5',
      content: 'I have a few options in Noida that might interest you. When would you like to schedule a viewing?',
      timestamp: format(subHours(new Date(), 6), 'yyyy-MM-dd HH:mm:ss'),
      language: 'English',
      sender: 'agent'
    }
  ]
};

// Mock financial data for analytics
export const financialData = {
  // Monthly revenue data (last 12 months)
  monthlyRevenue: [
    { month: 'Jan', revenue: 5400000, target: 5000000 },
    { month: 'Feb', revenue: 4800000, target: 5000000 },
    { month: 'Mar', revenue: 6200000, target: 5500000 },
    { month: 'Apr', revenue: 7100000, target: 5500000 },
    { month: 'May', revenue: 5900000, target: 6000000 },
    { month: 'Jun', revenue: 6800000, target: 6000000 },
    { month: 'Jul', revenue: 7300000, target: 6500000 },
    { month: 'Aug', revenue: 6750000, target: 6500000 },
    { month: 'Sep', revenue: 8100000, target: 7000000 },
    { month: 'Oct', revenue: 9200000, target: 7000000 },
    { month: 'Nov', revenue: 8500000, target: 7500000 },
    { month: 'Dec', revenue: 8800000, target: 7500000 },
  ],
  
  // Property sales by type
  salesByType: [
    { type: '1BHK', count: 24, value: 14400000 },
    { type: '2BHK', count: 42, value: 33600000 },
    { type: '3BHK', count: 35, value: 35000000 },
    { type: '4BHK', count: 18, value: 27000000 },
    { type: 'Villa', count: 8, value: 36000000 },
    { type: 'Plot', count: 12, value: 18000000 },
    { type: 'Commercial', count: 6, value: 42000000 },
    { type: 'PentHouse', count: 4, value: 32000000 },
  ],
  
  // Sales by location
  salesByLocation: [
    { location: 'Mumbai', count: 65, value: 97500000 },
    { location: 'Pune', count: 32, value: 35200000 },
    { location: 'Bangalore', count: 28, value: 42000000 },
    { location: 'Delhi NCR', count: 25, value: 41250000 },
    { location: 'Hyderabad', count: 22, value: 33000000 },
  ],
  
  // Agent performance data
  agentPerformance: [
    { name: 'Aditya Rao', sales: 28, value: 56000000, commission: 1680000, target: 50000000 },
    { name: 'Sneha Verma', sales: 24, value: 42000000, commission: 1260000, target: 45000000 },
    { name: 'Raj Kapoor', sales: 19, value: 38000000, commission: 1140000, target: 40000000 },
    { name: 'Neha Singh', sales: 21, value: 34000000, commission: 1020000, target: 40000000 },
    { name: 'Arjun Mehta', sales: 16, value: 28000000, commission: 840000, target: 35000000 },
  ],
  
  // Recurring income (rent collections, maintenance fees)
  recurringIncome: {
    rentCollections: 3450000,
    maintenanceFees: 980000,
    propertyManagement: 650000
  },
  
  // Top performing properties
  topProperties: [
    { id: 'p17', title: 'Luxury Villa in Jubilee Hills', type: 'Villa', daysToSell: 34, profit: 2800000, roi: 18.6 },
    { id: 'p24', title: 'Commercial Space in BKC', type: 'Commercial', daysToSell: 41, profit: 2300000, roi: 15.3 },
    { id: 'p12', title: '4BHK Apartment in South Mumbai', type: '4BHK', daysToSell: 29, profit: 1900000, roi: 14.2 },
    { id: 'p33', title: 'PentHouse in Koregaon Park', type: 'PentHouse', daysToSell: 38, profit: 1750000, roi: 13.8 },
    { id: 'p28', title: '3BHK in Indiranagar', type: '3BHK', daysToSell: 22, profit: 1600000, roi: 12.5 },
  ],
  
  // Current year summary
  annualSummary: {
    totalRevenue: 82000000,
    totalExpenses: 23400000,
    netProfit: 58600000,
    targetRevenue: 95000000,
    averageDaysToSell: 42,
    conversionRate: 28.5, // percentage of leads converted to sales
    customerAcquisitionCost: 84500
  },
  
  // Quarterly data
  quarterlyData: [
    { quarter: 'Q1', revenue: 16400000, expenses: 5200000, profit: 11200000 },
    { quarter: 'Q2', revenue: 19800000, expenses: 5800000, profit: 14000000 },
    { quarter: 'Q3', revenue: 22150000, expenses: 6100000, profit: 16050000 },
    { quarter: 'Q4', revenue: 23650000, expenses: 6300000, profit: 17350000 },
  ]
};
