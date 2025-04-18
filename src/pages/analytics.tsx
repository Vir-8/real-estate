"use client";

import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import { financialData } from '@/data/mockData';
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  ChevronRight, 
  TrendingUp, 
  DollarSign, 
  Building, 
  Users, 
  Clock, 
  BarChart4, 
  PieChart, 
  Calendar, 
  Download 
} from 'lucide-react';
import { useState } from 'react';

// Helper function to format currency
const formatCurrency = (amount: number) => {
  if (amount >= 10000000) {
    return `₹${(amount / 10000000).toFixed(2)} Cr`;
  } else if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(2)} Lac`;
  } else {
    return `₹${amount.toLocaleString()}`;
  }
};

export default function AnalyticsPage() {
  const [timeframe, setTimeframe] = useState<'monthly' | 'quarterly' | 'yearly'>('monthly');
  
  // Calculate total revenue and growth rate
  const totalRevenue = financialData.annualSummary.totalRevenue;
  const prevYearRevenue = totalRevenue * 0.85; // Assuming 15% growth for this demo
  const growthRate = ((totalRevenue - prevYearRevenue) / prevYearRevenue) * 100;
  
  // Calculate commission earned
  const totalCommission = financialData.agentPerformance.reduce(
    (total, agent) => total + agent.commission,
    0
  );
  
  // Calculate sales by property type
  const totalSales = financialData.salesByType.reduce(
    (total, type) => total + type.value,
    0
  );

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="Analytics" subtitle="Financial insights and performance metrics" />
        
        <main className="flex-1 overflow-y-auto px-8 py-6">
          {/* Welcome Section */}
          <div className="bg-white rounded-xl overflow-hidden shadow-sm mb-6 border border-gray-100">
            <div className="p-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Financial Overview</h2>
                <p className="text-gray-500 mt-1">Track revenue, expenses, and performance metrics for your business.</p>
              </div>
              <div className="flex space-x-4">
                <div className="bg-gray-100 rounded-lg p-1 flex">
                  <button
                    onClick={() => setTimeframe('monthly')}
                    className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                      timeframe === 'monthly' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-700'
                    }`}
                  >
                    Monthly
                  </button>
                  <button
                    onClick={() => setTimeframe('quarterly')}
                    className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                      timeframe === 'quarterly' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-700'
                    }`}
                  >
                    Quarterly
                  </button>
                  <button
                    onClick={() => setTimeframe('yearly')}
                    className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                      timeframe === 'yearly' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-700'
                    }`}
                  >
                    Yearly
                  </button>
                </div>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center text-sm transition-colors shadow-sm">
                  <Download size={16} className="mr-2" />
                  Export Report
                </button>
              </div>
            </div>
          </div>
          
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Total Revenue */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="p-3 rounded-xl bg-green-50">
                  <DollarSign size={24} className="text-green-600" />
                </div>
                <span className={`text-xs font-medium px-2 py-1 rounded-full flex items-center ${
                  growthRate >= 0 
                    ? 'text-green-600 bg-green-50' 
                    : 'text-red-600 bg-red-50'
                }`}>
                  {growthRate >= 0 ? <ArrowUpRight size={14} className="mr-1" /> : <ArrowDownRight size={14} className="mr-1" />}
                  {Math.abs(growthRate).toFixed(1)}%
                </span>
              </div>
              <div className="mt-4">
                <h3 className="text-3xl font-bold">{formatCurrency(totalRevenue)}</h3>
                <p className="text-gray-500 text-sm mt-1">Total Revenue</p>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="bg-gray-50 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-green-400 to-green-600 h-full rounded-full" 
                    style={{ width: `${(totalRevenue / financialData.annualSummary.targetRevenue) * 100}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {((totalRevenue / financialData.annualSummary.targetRevenue) * 100).toFixed(1)}% of annual target
                </p>
              </div>
            </div>
            
            {/* Net Profit */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="p-3 rounded-xl bg-blue-50">
                  <TrendingUp size={24} className="text-blue-600" />
                </div>
                <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full flex items-center">
                  <ArrowUpRight size={14} className="mr-1" />
                  21.4%
                </span>
              </div>
              <div className="mt-4">
                <h3 className="text-3xl font-bold">{formatCurrency(financialData.annualSummary.netProfit)}</h3>
                <p className="text-gray-500 text-sm mt-1">Net Profit</p>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-sm text-blue-600 flex items-center font-medium">
                  Profit Margin: {((financialData.annualSummary.netProfit / totalRevenue) * 100).toFixed(1)}%
                </p>
              </div>
            </div>
            
            {/* Total Properties Sold */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="p-3 rounded-xl bg-purple-50">
                  <Building size={24} className="text-purple-600" />
                </div>
                <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full flex items-center">
                  <ArrowUpRight size={14} className="mr-1" />
                  8.3%
                </span>
              </div>
              <div className="mt-4">
                <h3 className="text-3xl font-bold">
                  {financialData.salesByType.reduce((total, type) => total + type.count, 0)}
                </h3>
                <p className="text-gray-500 text-sm mt-1">Properties Sold</p>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-sm text-purple-600 flex items-center font-medium">
                  Avg. Days to Sell: {financialData.annualSummary.averageDaysToSell} days
                </p>
              </div>
            </div>
            
            {/* Commission Earned */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="p-3 rounded-xl bg-amber-50">
                  <Users size={24} className="text-amber-600" />
                </div>
                <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full flex items-center">
                  <ArrowUpRight size={14} className="mr-1" />
                  12.6%
                </span>
              </div>
              <div className="mt-4">
                <h3 className="text-3xl font-bold">{formatCurrency(totalCommission)}</h3>
                <p className="text-gray-500 text-sm mt-1">Commission Earned</p>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-sm text-amber-600 flex items-center font-medium">
                  {financialData.agentPerformance.length} Active Agents
                </p>
              </div>
            </div>
          </div>
          
          {/* Revenue Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Revenue Trend */}
            <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-gray-900">Revenue Trend</h2>
                <div className="flex items-center">
                  <div className="flex items-center mr-4">
                    <div className="w-3 h-3 rounded-full bg-blue-500 mr-1.5"></div>
                    <span className="text-sm text-gray-600">Actual</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-gray-300 mr-1.5"></div>
                    <span className="text-sm text-gray-600">Target</span>
                  </div>
                </div>
              </div>
              
              <div className="h-80 relative">
                {/* This is a placeholder for the chart. In a real app, you'd use a chart library like Chart.js or React Charts */}
                <div className="absolute inset-0 flex items-end">
                  {financialData.monthlyRevenue.map((month, index) => (
                    <div key={index} className="flex-1 flex flex-col items-center">
                      {/* Actual revenue bar */}
                      <div className="relative w-full flex flex-col items-center">
                        <div
                          className="w-8 bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-md"
                          style={{ 
                            height: `${(month.revenue / 10000000) * 320}px`,
                            maxHeight: '320px'
                          }}
                        ></div>
                        
                        {/* Target line */}
                        <div 
                          className="absolute w-10 h-0.5 bg-gray-300 transform -translate-y-1/2"
                          style={{ 
                            bottom: `${(month.target / 10000000) * 320}px`,
                          }}
                        ></div>
                      </div>
                      
                      <span className="text-xs text-gray-500 mt-2">{month.month}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Sales by Property Type */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-gray-900">Sales by Property Type</h2>
                <button className="text-sm text-blue-600 hover:text-blue-700 flex items-center font-medium">
                  View Details
                  <ChevronRight size={16} className="ml-1" />
                </button>
              </div>
              
              <div className="space-y-4">
                {financialData.salesByType
                  .sort((a, b) => b.value - a.value)
                  .slice(0, 5)
                  .map((type, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className={`w-3 h-3 rounded-full mr-2 bg-blue-${500 - index * 100}`}></div>
                        <span className="text-sm text-gray-700">{type.type}</span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-sm font-medium">{formatCurrency(type.value)}</span>
                        <span className="text-xs text-gray-500 ml-2">({type.count} units)</span>
                      </div>
                    </div>
                ))}
              </div>
              
              <div className="mt-8">
                <div className="h-40 w-40 mx-auto relative">
                  {/* Placeholder for a pie chart */}
                  <div className="absolute inset-0 rounded-full border-8 border-blue-500"></div>
                  <div className="absolute inset-0 rounded-full border-8 border-blue-400" style={{ clipPath: 'polygon(0 0, 70% 0, 70% 100%, 0 100%)' }}></div>
                  <div className="absolute inset-0 rounded-full border-8 border-blue-300" style={{ clipPath: 'polygon(0 0, 40% 0, 40% 100%, 0 100%)' }}></div>
                  <div className="absolute inset-0 rounded-full border-8 border-blue-200" style={{ clipPath: 'polygon(0 0, 20% 0, 20% 100%, 0 100%)' }}></div>
                  <div className="absolute inset-0 rounded-full border-8 border-blue-100" style={{ clipPath: 'polygon(0 0, 10% 0, 10% 100%, 0 100%)' }}></div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Agent Performance and Location Sales */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Agent Performance */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-gray-900">Agent Performance</h2>
                <button className="text-sm text-blue-600 hover:text-blue-700 flex items-center font-medium">
                  View All
                  <ChevronRight size={16} className="ml-1" />
                </button>
              </div>
              
              <div className="space-y-5">
                {financialData.agentPerformance.map((agent, index) => (
                  <div key={index} className="border border-gray-100 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-medium mr-3">
                          {agent.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{agent.name}</h3>
                          <p className="text-xs text-gray-500">{agent.sales} properties sold</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">{formatCurrency(agent.commission)}</p>
                        <p className="text-xs text-gray-500">Commission earned</p>
                      </div>
                    </div>
                    
                    <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-blue-600 h-full rounded-full" 
                        style={{ width: `${(agent.value / agent.target) * 100}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1.5">
                      {formatCurrency(agent.value)} ({((agent.value / agent.target) * 100).toFixed(0)}% of target)
                    </p>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Sales by Location */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-gray-900">Sales by Location</h2>
                <button className="text-sm text-blue-600 hover:text-blue-700 flex items-center font-medium">
                  View Map
                  <ChevronRight size={16} className="ml-1" />
                </button>
              </div>
              
              <div className="space-y-5">
                {financialData.salesByLocation.map((location, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`p-2.5 rounded-md bg-blue-${100 + index * 100} text-blue-${500 + index * 100}`}>
                        <Building size={18} />
                      </div>
                      <div className="ml-3">
                        <h3 className="font-medium text-gray-900">{location.location}</h3>
                        <p className="text-xs text-gray-500">{location.count} properties</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">{formatCurrency(location.value)}</p>
                      <p className="text-xs text-gray-500">
                        {((location.value / totalSales) * 100).toFixed(1)}% of total
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 pt-6 border-t border-gray-100">
                <div className="w-full bg-gray-100 h-8 rounded-lg overflow-hidden flex">
                  {financialData.salesByLocation.map((location, index) => (
                    <div 
                      key={index}
                      className={`h-full bg-blue-${500 - index * 100}`}
                      style={{ width: `${(location.value / totalSales) * 100}%` }}
                    ></div>
                  ))}
                </div>
                <div className="flex justify-between mt-2">
                  <span className="text-xs text-gray-500">Mumbai</span>
                  <span className="text-xs text-gray-500">Hyderabad</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Top Performing Properties */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-900">Top Performing Properties</h2>
              <button className="text-sm text-blue-600 hover:text-blue-700 flex items-center font-medium">
                View All Properties
                <ChevronRight size={16} className="ml-1" />
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Property
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Days to Sell
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Profit
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ROI
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {financialData.topProperties.map((property, index) => (
                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">{property.title}</div>
                        <div className="text-xs text-gray-500">ID: {property.id}</div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                          {property.type}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Clock size={14} className="text-gray-400 mr-1" />
                          <span className="text-gray-700">{property.daysToSell} days</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap font-medium text-gray-900">
                        {formatCurrency(property.profit)}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="text-green-600 font-medium">{property.roi}%</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          {/* Quarterly Performance */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-900">Quarterly Performance</h2>
              <button className="text-sm text-blue-600 hover:text-blue-700 flex items-center font-medium">
                View Yearly Report
                <ChevronRight size={16} className="ml-1" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {financialData.quarterlyData.map((quarter, index) => (
                <div key={index} className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">{quarter.quarter}</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Revenue</p>
                      <p className="text-lg font-semibold text-gray-900">{formatCurrency(quarter.revenue)}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Expenses</p>
                      <p className="text-lg font-semibold text-gray-900">{formatCurrency(quarter.expenses)}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Profit</p>
                      <p className="text-lg font-semibold text-green-600">{formatCurrency(quarter.profit)}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Margin</p>
                      <p className="text-lg font-semibold text-blue-600">
                        {((quarter.profit / quarter.revenue) * 100).toFixed(1)}%
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
} 