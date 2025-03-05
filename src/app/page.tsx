"use client";

import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import { clients, properties, conversations } from '@/data/mockData';
import { Clock, Users, Building, MessageSquare, TrendingUp, AlertTriangle, ChevronRight, Wallet, Calendar, BarChart3, Phone, Mail, MapPin } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import ClientCard from '@/components/ClientCard';
import PropertyCard from '@/components/PropertyCard';
import Image from 'next/image';

export default function Home() {
  const [recentClients, setRecentClients] = useState(clients.slice(0, 3));
  const [featuredProperties, setFeaturedProperties] = useState(properties.slice(0, 3));
  
  // Count total conversations
  const totalConversations = Object.values(conversations).reduce(
    (total, messages) => total + messages.length, 
    0
  );
  
  // Get client messages with insights
  const clientMessagesWithInsights = Object.values(conversations)
    .flat()
    .filter(msg => msg.sender === 'client' && msg.insights && Object.keys(msg.insights).length > 0);
  
  // Stats for the dashboard
  const stats = [
    {
      title: 'Total Clients',
      value: clients.length,
      icon: Users,
      color: 'from-blue-500 to-blue-600',
      textColor: 'text-blue-600',
      bgColor: 'bg-blue-50',
      increase: '+12%',
    },
    {
      title: 'Properties',
      value: properties.length,
      icon: Building,
      color: 'from-green-500 to-emerald-600',
      textColor: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      increase: '+5%',
    },
    {
      title: 'Conversations',
      value: totalConversations,
      icon: MessageSquare,
      color: 'from-purple-500 to-purple-600',
      textColor: 'text-purple-600',
      bgColor: 'bg-purple-50',
      increase: '+18%',
    },
    {
      title: 'Insights Generated',
      value: clientMessagesWithInsights.length,
      icon: TrendingUp,
      color: 'from-amber-500 to-amber-600',
      textColor: 'text-amber-600',
      bgColor: 'bg-amber-50',
      increase: '+24%',
    },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="Dashboard" subtitle="Welcome back, Agent" />
        
        <main className="flex-1 overflow-y-auto px-8 py-6">
          {/* Welcome Section */}
          <div className="bg-white rounded-xl overflow-hidden shadow-sm mb-6 border border-gray-100">
            <div className="p-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Good Morning, Aditya!</h2>
                <p className="text-gray-500 mt-1">Here's what's happening with your properties today.</p>
              </div>
              <div className="flex space-x-4">
                <button className="px-4 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center text-sm transition-colors">
                  <Calendar size={16} className="mr-2" />
                  View Calendar
                </button>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center text-sm transition-colors shadow-sm">
                  <TrendingUp size={16} className="mr-2" />
                  View Reports
                </button>
              </div>
            </div>
          </div>
        
          {/* Stats Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                    <stat.icon size={24} className={stat.textColor} />
                  </div>
                  <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                    {stat.increase}
                  </span>
                </div>
                <div className="mt-4">
                  <h3 className="text-3xl font-bold">{stat.value}</h3>
                  <p className="text-gray-500 text-sm mt-1">{stat.title}</p>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <Link href="#" className="text-sm text-blue-600 hover:text-blue-800 flex items-center font-medium">
                    View All
                    <ChevronRight size={16} className="ml-1" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Recent Clients */}
            <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-gray-900">Recent Clients</h2>
                <Link href="/clients" className="text-sm text-blue-600 hover:text-blue-700 flex items-center font-medium">
                  View All
                  <ChevronRight size={16} className="ml-1" />
                </Link>
              </div>
              
              <div className="space-y-4">
                {recentClients.map(client => (
                  <div key={client.id} className="p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="h-12 w-12 rounded-full overflow-hidden bg-gray-100 mr-4 border-2 border-white shadow-sm">
                        <Image
                          src={client.profilePic}
                          alt={client.name}
                          width={48}
                          height={48}
                          className="object-cover h-full w-full"
                        />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{client.name}</h3>
                        <div className="flex items-center mt-1">
                          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                            {client.leadStatus}
                          </span>
                          <span className="ml-2 text-xs text-gray-500">{client.preferredLanguage}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button className="p-2 rounded-full hover:bg-gray-200 text-gray-500">
                        <Phone size={16} />
                      </button>
                      <button className="p-2 rounded-full hover:bg-gray-200 text-gray-500">
                        <Mail size={16} />
                      </button>
                      <Link href={`/clients/${client.id}`} className="p-2 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-600">
                        <ChevronRight size={16} />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Action Items */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-gray-900">Action Items</h2>
                <button className="text-sm text-blue-600 hover:text-blue-700 flex items-center font-medium">
                  View All
                  <ChevronRight size={16} className="ml-1" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                  <div className="flex items-start">
                    <div className="p-2 bg-amber-100 rounded-lg mr-3">
                      <AlertTriangle className="h-5 w-5 text-amber-600" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-amber-800">Follow up with Priya Patel</h3>
                      <p className="text-xs text-amber-700 mt-1">
                        Pending response on property viewing request for 2 days
                      </p>
                      <div className="mt-2 flex items-center">
                        <button className="px-3 py-1 bg-amber-100 text-amber-800 rounded-lg text-xs font-medium hover:bg-amber-200 transition-colors">
                          Follow Up
                        </button>
                        <span className="text-xs text-amber-600 ml-3">Due Today</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                  <div className="flex items-start">
                    <div className="p-2 bg-blue-100 rounded-lg mr-3">
                      <Clock className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-blue-800">Schedule meeting with Rahul Sharma</h3>
                      <p className="text-xs text-blue-700 mt-1">
                        To discuss Andheri property options
                      </p>
                      <div className="mt-2 flex items-center">
                        <button className="px-3 py-1 bg-blue-100 text-blue-800 rounded-lg text-xs font-medium hover:bg-blue-200 transition-colors">
                          Schedule
                        </button>
                        <span className="text-xs text-blue-600 ml-3">Due Tomorrow</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 bg-purple-50 border border-purple-200 rounded-xl">
                  <div className="flex items-start">
                    <div className="p-2 bg-purple-100 rounded-lg mr-3">
                      <MessageSquare className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-purple-800">Translate conversation</h3>
                      <p className="text-xs text-purple-700 mt-1">
                        New Telugu message from Suresh Reddy needs translation
                      </p>
                      <div className="mt-2 flex items-center">
                        <button className="px-3 py-1 bg-purple-100 text-purple-800 rounded-lg text-xs font-medium hover:bg-purple-200 transition-colors">
                          Translate
                        </button>
                        <span className="text-xs text-purple-600 ml-3">New Message</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Featured Properties */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-900">Featured Properties</h2>
              <Link href="/properties" className="text-sm text-blue-600 hover:text-blue-700 flex items-center font-medium">
                View All
                <ChevronRight size={16} className="ml-1" />
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredProperties.map(property => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          </div>
          
          {/* Activity Timeline */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-900">Recent Activity</h2>
              <button className="text-sm text-blue-600 hover:text-blue-700 flex items-center font-medium">
                View All
                <ChevronRight size={16} className="ml-1" />
              </button>
            </div>
            
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-3 top-1 bottom-0 w-0.5 bg-gray-200"></div>
              
              <div className="space-y-6">
                <div className="flex">
                  <div className="relative flex items-center justify-center flex-shrink-0">
                    <div className="h-6 w-6 rounded-full bg-green-100 border-2 border-white z-10 flex items-center justify-center shadow-sm">
                      <div className="h-2.5 w-2.5 rounded-full bg-green-500"></div>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-900">Rahul Sharma viewed Sea View Apartment</p>
                    <p className="text-xs text-gray-500 mt-0.5">30 minutes ago</p>
                  </div>
                </div>
                
                <div className="flex">
                  <div className="relative flex items-center justify-center flex-shrink-0">
                    <div className="h-6 w-6 rounded-full bg-blue-100 border-2 border-white z-10 flex items-center justify-center shadow-sm">
                      <div className="h-2.5 w-2.5 rounded-full bg-blue-500"></div>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-900">New inquiry from Priya Patel</p>
                    <p className="text-xs text-gray-500 mt-0.5">2 hours ago</p>
                  </div>
                </div>
                
                <div className="flex">
                  <div className="relative flex items-center justify-center flex-shrink-0">
                    <div className="h-6 w-6 rounded-full bg-purple-100 border-2 border-white z-10 flex items-center justify-center shadow-sm">
                      <div className="h-2.5 w-2.5 rounded-full bg-purple-500"></div>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-900">Suresh Reddy requested property tour</p>
                    <p className="text-xs text-gray-500 mt-0.5">5 hours ago</p>
                  </div>
                </div>
                
                <div className="flex">
                  <div className="relative flex items-center justify-center flex-shrink-0">
                    <div className="h-6 w-6 rounded-full bg-amber-100 border-2 border-white z-10 flex items-center justify-center shadow-sm">
                      <div className="h-2.5 w-2.5 rounded-full bg-amber-500"></div>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-900">Added new property: Bandra Luxury Villa</p>
                    <p className="text-xs text-gray-500 mt-0.5">Yesterday</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
