import { ConversationMessage } from '@/types';
import { format } from 'date-fns';
import { AlertTriangle, BrainCircuit, Copy, Check, ThumbsUp, Clock, Lightbulb } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';

interface ChatMessageProps {
  message: ConversationMessage;
  showInsights?: boolean;
}

export default function ChatMessage({ message, showInsights = true }: ChatMessageProps) {
  const isAgent = message.sender === 'agent';
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getLanguageBadge = (language: string) => {
    const styles: Record<string, string> = {
      English: 'bg-blue-50 text-blue-700 border-blue-100',
      Hindi: 'bg-green-50 text-green-700 border-green-100',
      Marathi: 'bg-purple-50 text-purple-700 border-purple-100',
      Telugu: 'bg-amber-50 text-amber-700 border-amber-100',
      Mixed: 'bg-gray-50 text-gray-700 border-gray-100',
    };

    return styles[language] || styles.English;
  };

  return (
    <div className={`flex ${isAgent ? 'justify-start' : 'justify-end'} group mb-6`}>
      {isAgent && (
        <div className="flex-shrink-0 mr-3">
          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium shadow-sm">
            AR
          </div>
        </div>
      )}
      
      <div className={`max-w-[70%] ${isAgent ? 'order-2' : 'order-1'}`}>
        <div 
          className={`px-5 py-4 rounded-2xl shadow-sm ${
            isAgent 
              ? 'bg-white border border-gray-100' 
              : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white'
          }`}
        >
          <div className="flex justify-between items-start mb-1">
            <span className={`text-xs font-medium ${isAgent ? 'text-gray-500' : 'text-blue-100'}`}>
              {isAgent ? 'Agent' : 'Client'}
            </span>
            <div className="flex space-x-1">
              {!isAgent && (
                <span className={`text-xs rounded-full px-2 py-0.5 ${
                  getLanguageBadge(message.language)
                }`}>
                  {message.language}
                </span>
              )}
            </div>
          </div>
          
          <p className={isAgent ? 'text-gray-800' : 'text-white'}>
            {message.content}
          </p>
          
          {message.translatedContent && message.content !== message.translatedContent && (
            <div className={`mt-2 pt-2 ${isAgent ? 'border-t border-gray-100' : 'border-t border-blue-500'}`}>
              <p className={`text-sm italic ${isAgent ? 'text-gray-500' : 'text-blue-100'}`}>
                Translation: {message.translatedContent}
              </p>
            </div>
          )}
        </div>
        
        <div className="flex justify-between items-center mt-1 px-1">
          <span className={`text-xs ${isAgent ? 'text-gray-400' : 'text-gray-500'}`}>
            {format(new Date(message.timestamp), 'h:mm a')}
          </span>
          
          <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
            {isAgent ? (
              <>
                <button 
                  onClick={copyToClipboard}
                  className="p-1 rounded text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                </button>
                <button className="p-1 rounded text-gray-400 hover:text-gray-600 hover:bg-gray-100">
                  <Clock size={14} />
                </button>
              </>
            ) : (
              <>
                <button className="p-1 rounded text-gray-400 hover:text-blue-600 hover:bg-gray-100">
                  <ThumbsUp size={14} />
                </button>
                <button className="p-1 rounded text-gray-400 hover:text-blue-600 hover:bg-gray-100">
                  <Lightbulb size={14} />
                </button>
              </>
            )}
          </div>
        </div>
        
        {!isAgent && showInsights && message.insights && Object.keys(message.insights).length > 0 && (
          <div className="bg-amber-50 border border-amber-200 mt-3 p-4 rounded-xl shadow-sm">
            <div className="flex items-center text-sm text-amber-800 font-medium mb-2">
              <BrainCircuit size={16} className="mr-2 text-amber-600" />
              AI-Generated Insights
            </div>
            <div className="space-y-2">
              {message.insights.interests && message.insights.interests.length > 0 && (
                <div className="flex items-start">
                  <div className="w-24 flex-shrink-0 text-xs font-medium text-amber-700">Interests</div>
                  <div className="flex-1 flex flex-wrap gap-1">
                    {message.insights.interests.map((interest, idx) => (
                      <span key={idx} className="inline-block px-2 py-1 bg-amber-100 text-amber-800 rounded text-xs">
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {message.insights.budget && (
                <div className="flex items-start">
                  <div className="w-24 flex-shrink-0 text-xs font-medium text-amber-700">Budget</div>
                  <div className="flex-1 text-sm text-amber-800">
                    {message.insights.budget}
                  </div>
                </div>
              )}
              {message.insights.location && (
                <div className="flex items-start">
                  <div className="w-24 flex-shrink-0 text-xs font-medium text-amber-700">Location</div>
                  <div className="flex-1 text-sm text-amber-800">
                    {message.insights.location}
                  </div>
                </div>
              )}
              {message.insights.urgency && (
                <div className="flex items-start">
                  <div className="w-24 flex-shrink-0 text-xs font-medium text-amber-700">Urgency</div>
                  <div className="flex-1 text-sm text-amber-800">
                    {message.insights.urgency}
                  </div>
                </div>
              )}
            </div>
            <div className="mt-3 pt-3 border-t border-amber-200 flex justify-between items-center">
              <span className="text-xs text-amber-600">AI generated from client message</span>
              <button className="text-xs font-medium text-blue-600 hover:text-blue-800">
                Add to Client Memory
              </button>
            </div>
          </div>
        )}
      </div>
      
      {!isAgent && (
        <div className="flex-shrink-0 ml-3">
          <div className="h-10 w-10 rounded-full overflow-hidden bg-gray-200 border-2 border-white shadow-sm">
            <Image
              src={message.clientImage || "/placeholder-profile.jpg"}
              alt="Client"
              width={40}
              height={40}
              className="object-cover h-full w-full"
            />
          </div>
        </div>
      )}
    </div>
  );
}
