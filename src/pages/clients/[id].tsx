"use client";

import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Client, ConversationMessage, Property } from "@/types";
import {
  CalendarClock,
  ChevronLeft,
  Edit,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Plus,
  User,
  Heart,
  DollarSign,
  Star,
  Building,
  Send,
  Share2,
  Copy,
  MoreHorizontal,
  Download,
  BookOpen,
  FileText,
  Users,
  ChevronRight,
  Globe,
  RefreshCcw,
  Database,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import MemoryItem from "@/components/MemoryItem";
import ChatMessage from "@/components/ChatMessage";
import MapView from "@/components/MapView";
import PropertyCard from "@/components/PropertyCard";
import LanguageSelector from "@/components/LanguageSelector";
import { useData } from "@/context/DataProvider";

export default function ClientDetailPage() {
  const params = useParams();
  const id = params?.id as string;

  const { clients, properties, conversations, loading, refetchMem0Data } =
    useData();

  const [client, setClient] = useState<Client | null>(null);
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [recommendedProperties, setRecommendedProperties] = useState<
    Property[]
  >([]);
  const [currentTab, setCurrentTab] = useState("profile");
  const [newMessage, setNewMessage] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState<
    "English" | "Hindi" | "Marathi" | "Telugu" | "Mixed"
  >("English");
  const [isMem0Data, setIsMem0Data] = useState(false);

  useEffect(() => {
    // Find client data
    const foundClient = clients.find((c) => c.id === id);
    if (foundClient) {
      setClient(foundClient);
      setSelectedLanguage(foundClient.preferredLanguage);
      // Check if this is Mem0 data (assuming mock client IDs start with 'c')
      setIsMem0Data(!foundClient.id.startsWith("c"));
    }

    // Find conversation messages
    const clientMessages = conversations[id] || [];
    setMessages(clientMessages);

    // Find recommended properties based on client preferences
    if (foundClient) {
      const clientPreferences = foundClient.memories.filter(
        (m: { type: string }) => m.type === "preference"
      );
      const preferenceContent = clientPreferences
        .map((p: any) => p.translatedContent || p.content)
        .join(" ")
        .toLowerCase();

      // Very basic matching algorithm for demo
      const matched = properties.filter((property) => {
        const propDescription = property.description.toLowerCase();
        const propTitle = property.title.toLowerCase();
        return (
          (propDescription.includes("3bhk") &&
            preferenceContent.includes("3bhk")) ||
          (propDescription.includes("2bhk") &&
            preferenceContent.includes("2bhk")) ||
          (propTitle.includes("andheri") &&
            preferenceContent.includes("andheri")) ||
          (propTitle.includes("bandra") &&
            preferenceContent.includes("bandra")) ||
          (propDescription.includes("garden") &&
            preferenceContent.includes("garden"))
        );
      });

      setRecommendedProperties(
        matched.length > 0 ? matched : properties.slice(0, 2)
      );
    }
  }, [id, clients, properties, conversations]);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !client) return;

    const newMsg: ConversationMessage = {
      id: `msg-${Date.now()}`,
      clientId: client.id,
      content: newMessage,
      timestamp: new Date().toISOString(),
      language: selectedLanguage,
      sender: "agent",
    };

    setMessages([...messages, newMsg]);
    setNewMessage("");
  };

  const getTabs = () => [
    {
      id: "profile",
      label: "Profile",
      icon: User,
    },
    {
      id: "memories",
      label: `Memories (${client?.memories.length || 0})`,
      icon: BookOpen,
    },
    {
      id: "conversation",
      label: `Conversation (${messages.length})`,
      icon: MessageSquare,
    },
    {
      id: "documents",
      label: "Documents",
      icon: FileText,
    },
  ];

  if (loading && !client) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block p-4 rounded-full bg-blue-50 text-blue-600 mb-4">
              <div className="animate-spin h-10 w-10 border-4 border-blue-600 border-t-transparent rounded-full"></div>
            </div>
            <h2 className="text-xl font-semibold text-gray-700 mb-2">
              Loading client data...
            </h2>
            <p className="text-gray-500">
              Please wait while we fetch the client information
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block p-4 rounded-full bg-red-50 text-red-600 mb-4">
              <Users size={36} />
            </div>
            <h2 className="text-xl font-semibold text-gray-700 mb-2">
              Client not found
            </h2>
            <p className="text-gray-500 mb-4">
              The client you're looking for doesn't exist or has been removed
            </p>
            <Link
              href="/clients"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 inline-flex items-center"
            >
              <ChevronLeft size={16} className="mr-2" />
              Back to Clients List
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title={client.name} subtitle={`Client #${client.id}`} />

        <main className="flex-1 overflow-y-auto px-8 py-6">
          <div className="flex items-center mb-6">
            <Link
              href="/clients"
              className="flex items-center text-gray-600 hover:text-blue-600 transition-colors mr-4 font-medium"
            >
              <ChevronLeft size={18} className="mr-1" />
              Back to Clients
            </Link>

            {/* Data source indicator */}
            {isMem0Data && (
              <div className="px-3 py-1 rounded-lg bg-blue-100 text-blue-700 text-sm font-medium flex items-center mr-auto">
                <Database size={16} className="mr-1.5" />
                Mem0 Data
                <button
                  onClick={() => refetchMem0Data()}
                  className="ml-2 p-1 rounded-full hover:bg-blue-200 transition-colors"
                  title="Refresh Mem0 Data"
                >
                  <RefreshCcw size={14} />
                </button>
              </div>
            )}

            <div className="ml-auto flex space-x-3">
              <button className="px-4 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center text-sm font-medium transition-colors">
                <Share2 size={16} className="mr-2" />
                Share
              </button>
              <button className="px-4 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center text-sm font-medium transition-colors">
                <Copy size={16} className="mr-2" />
                Duplicate
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center text-sm font-medium transition-colors shadow-sm">
                <Edit size={16} className="mr-2" />
                Edit Client
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Left Column - Client Info */}
            <div className="lg:col-span-1">
              <div
                className={`bg-white rounded-xl shadow-sm overflow-hidden mb-6 ${
                  isMem0Data
                    ? "border border-blue-200"
                    : "border border-gray-100"
                }`}
              >
                <div className="relative">
                  <div
                    className={`h-32 ${
                      isMem0Data
                        ? "bg-gradient-to-r from-blue-500 to-indigo-600"
                        : "bg-gradient-to-r from-blue-400 to-blue-600"
                    }`}
                  ></div>
                  <div className="absolute -bottom-10 left-6">
                    <div
                      className={`h-20 w-20 rounded-xl overflow-hidden ${
                        isMem0Data ? "bg-blue-50" : "bg-white"
                      } p-1 shadow-md`}
                    >
                      <Image
                        src={client.profilePic}
                        alt={client.name}
                        width={80}
                        height={80}
                        className="object-cover rounded-lg"
                      />
                    </div>
                  </div>
                </div>

                <div className="p-6 pt-12">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">
                        {client.name}
                      </h2>
                      <div className="flex items-center mt-1 space-x-2">
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                          {client.leadStatus}
                        </span>
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100">
                          {client.preferredLanguage}
                        </span>
                      </div>
                    </div>
                    <button className="p-2 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50">
                      <Star size={20} />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-start">
                      <div className="p-2 rounded-md bg-blue-50 text-blue-600 mr-3">
                        <Phone className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Phone</p>
                        <p className="font-medium text-gray-900">
                          {client.phone}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <div className="p-2 rounded-md bg-purple-50 text-purple-600 mr-3">
                        <Mail className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="font-medium text-gray-900">
                          {client.email}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <div className="p-2 rounded-md bg-amber-50 text-amber-600 mr-3">
                        <CalendarClock className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Last Contact</p>
                        <p className="font-medium text-gray-900">
                          {format(new Date(client.lastContact), "PPP")}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t border-gray-100 grid grid-cols-3 gap-2">
                    <button className="flex flex-col items-center justify-center p-3 rounded-lg hover:bg-gray-50">
                      <div className="p-2 rounded-full bg-blue-50 text-blue-600 mb-1">
                        <Phone size={16} />
                      </div>
                      <span className="text-xs font-medium text-gray-700">
                        Call
                      </span>
                    </button>

                    <button className="flex flex-col items-center justify-center p-3 rounded-lg hover:bg-gray-50">
                      <div className="p-2 rounded-full bg-green-50 text-green-600 mb-1">
                        <Mail size={16} />
                      </div>
                      <span className="text-xs font-medium text-gray-700">
                        Email
                      </span>
                    </button>

                    <button className="flex flex-col items-center justify-center p-3 rounded-lg hover:bg-gray-50">
                      <div className="p-2 rounded-full bg-purple-50 text-purple-600 mb-1">
                        <MessageSquare size={16} />
                      </div>
                      <span className="text-xs font-medium text-gray-700">
                        Message
                      </span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Location Information */}
              {client.locations && client.locations.length > 0 && (
                <div
                  className={`bg-white rounded-xl shadow-sm overflow-hidden mb-6 ${
                    isMem0Data
                      ? "border border-blue-200"
                      : "border border-gray-100"
                  }`}
                >
                  <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                    <h3 className="font-bold text-gray-900">
                      Interested Locations
                    </h3>
                    <button className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-50 hover:text-blue-600">
                      <Plus size={16} />
                    </button>
                  </div>

                  <div className="h-64">
                    <MapView locations={client.locations} />
                  </div>

                  <div className="p-5">
                    <ul className="space-y-3">
                      {client.locations.map((location, index) => (
                        <li
                          key={index}
                          className="flex items-center p-3 rounded-lg border border-gray-100 hover:bg-gray-50 group"
                        >
                          <div className="p-2 rounded-md bg-blue-50 text-blue-600 mr-3">
                            <MapPin size={16} />
                          </div>
                          <span className="text-sm text-gray-700">
                            {location.description}
                          </span>
                          <button className="ml-auto p-1.5 rounded-lg text-gray-400 opacity-0 group-hover:opacity-100 hover:bg-blue-50 hover:text-blue-600">
                            <MoreHorizontal size={16} />
                          </button>
                        </li>
                      ))}
                    </ul>
                    <button className="mt-4 w-full py-2 border border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:text-blue-600 hover:border-blue-300 flex items-center justify-center">
                      <Plus size={16} className="mr-1" />
                      Add New Location
                    </button>
                  </div>
                </div>
              )}

              {/* Recommended Properties */}
              <div
                className={`bg-white rounded-xl shadow-sm overflow-hidden ${
                  isMem0Data
                    ? "border border-blue-200"
                    : "border border-gray-100"
                }`}
              >
                <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                  <h3 className="font-bold text-gray-900">
                    Recommended Properties
                  </h3>
                  <button className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-50 hover:text-blue-600">
                    <MoreHorizontal size={16} />
                  </button>
                </div>

                <div className="p-5">
                  <div className="grid gap-4">
                    {recommendedProperties.map((property) => (
                      <div
                        key={property.id}
                        className="rounded-xl overflow-hidden border border-gray-100 hover:shadow-md transition-shadow"
                      >
                        <div className="relative h-32">
                          <Image
                            src={property.images[0]}
                            alt={property.title}
                            fill
                            className="object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-50"></div>
                          <div className="absolute bottom-2 left-2">
                            <div className="text-white font-bold text-sm drop-shadow-md">
                              {property.price >= 10000000
                                ? `₹${(property.price / 10000000).toFixed(
                                    2
                                  )} Cr`
                                : `₹${(property.price / 100000).toFixed(
                                    2
                                  )} Lac`}
                            </div>
                          </div>
                        </div>
                        <div className="p-3">
                          <h4 className="font-medium text-gray-900 text-sm line-clamp-1">
                            {property.title}
                          </h4>
                          <div className="flex items-center mt-1 text-xs text-gray-500">
                            <MapPin size={12} className="mr-1" />
                            <span className="truncate">
                              {property.location.city}
                            </span>
                            <span className="ml-2 px-1.5 py-0.5 rounded-sm bg-blue-50 text-blue-700">
                              {property.type}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Link
                    href="/properties"
                    className="mt-4 w-full py-2.5 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-100 flex items-center justify-center"
                  >
                    <Building size={16} className="mr-1" />
                    Show All Properties
                  </Link>
                </div>
              </div>
            </div>

            {/* Right Column - Tabs */}
            <div className="lg:col-span-3">
              <div
                className={`bg-white rounded-xl shadow-sm overflow-hidden ${
                  isMem0Data
                    ? "border border-blue-200"
                    : "border border-gray-100"
                }`}
              >
                <div className="border-b border-gray-100">
                  <div className="flex">
                    {getTabs().map((tab) => (
                      <button
                        key={tab.id}
                        className={`flex items-center px-5 py-4 text-sm font-medium transition-colors ${
                          currentTab === tab.id
                            ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50/50"
                            : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                        }`}
                        onClick={() => setCurrentTab(tab.id)}
                      >
                        <tab.icon size={16} className="mr-2" />
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-6">
                  {currentTab === "profile" && (
                    <div>
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-gray-900">
                          Client Profile
                        </h3>
                        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center text-sm font-medium transition-colors shadow-sm">
                          <Download size={16} className="mr-2" />
                          Export Profile
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-blue-50 p-5 rounded-xl border border-blue-100">
                          <div className="flex items-center mb-4">
                            <div className="p-2 rounded-md bg-blue-100 text-blue-600 mr-3">
                              <Heart className="h-5 w-5" />
                            </div>
                            <h4 className="text-md font-semibold text-gray-900">
                              Preferences Summary
                            </h4>
                          </div>
                          {client.memories.filter(
                            (m) => m.type === "preference"
                          ).length > 0 ? (
                            <ul className="space-y-2 text-sm">
                              {client.memories
                                .filter((m) => m.type === "preference")
                                .map((memory) => (
                                  <li
                                    key={memory.id}
                                    className="flex items-start bg-white p-3 rounded-lg border border-blue-100"
                                  >
                                    <span className="text-blue-600 mr-2">
                                      •
                                    </span>
                                    <span className="text-gray-800">
                                      {memory.translatedContent ||
                                        memory.content}
                                    </span>
                                  </li>
                                ))}
                            </ul>
                          ) : (
                            <div className="bg-white p-4 rounded-lg border border-blue-100 text-center">
                              <p className="text-gray-500">
                                No preferences recorded yet
                              </p>
                              <button className="mt-2 px-3 py-1.5 text-xs bg-blue-100 text-blue-700 rounded-lg">
                                Add Preference
                              </button>
                            </div>
                          )}
                        </div>

                        <div className="bg-green-50 p-5 rounded-xl border border-green-100">
                          <div className="flex items-center mb-4">
                            <div className="p-2 rounded-md bg-green-100 text-green-600 mr-3">
                              <DollarSign className="h-5 w-5" />
                            </div>
                            <h4 className="text-md font-semibold text-gray-900">
                              Budget Information
                            </h4>
                          </div>
                          {client.memories.filter((m) => m.type === "budget")
                            .length > 0 ? (
                            <ul className="space-y-2 text-sm">
                              {client.memories
                                .filter((m) => m.type === "budget")
                                .map((memory) => (
                                  <li
                                    key={memory.id}
                                    className="flex items-start bg-white p-3 rounded-lg border border-green-100"
                                  >
                                    <span className="text-green-600 mr-2">
                                      •
                                    </span>
                                    <span className="text-gray-800">
                                      {memory.translatedContent ||
                                        memory.content}
                                    </span>
                                  </li>
                                ))}
                            </ul>
                          ) : (
                            <div className="bg-white p-4 rounded-lg border border-green-100 text-center">
                              <p className="text-gray-500">
                                No budget information recorded yet
                              </p>
                              <button className="mt-2 px-3 py-1.5 text-xs bg-green-100 text-green-700 rounded-lg">
                                Add Budget Info
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="mt-6">
                        <div className="flex items-center mb-4">
                          <div className="p-2 rounded-md bg-purple-100 text-purple-600 mr-3">
                            <MessageSquare className="h-5 w-5" />
                          </div>
                          <h4 className="text-md font-semibold text-gray-900">
                            Recent Communication
                          </h4>
                        </div>
                        {messages.length > 0 ? (
                          <div className="bg-purple-50 rounded-xl p-5 border border-purple-100">
                            <div className="flex items-center justify-between mb-3">
                              <p className="text-sm font-medium text-purple-800">
                                Last conversation:{" "}
                                {format(
                                  new Date(
                                    messages[messages.length - 1].timestamp
                                  ),
                                  "PPP"
                                )}
                              </p>
                              <Link
                                href="#"
                                onClick={() => setCurrentTab("conversation")}
                                className="text-sm text-blue-600 hover:text-blue-700 flex items-center"
                              >
                                View Conversation
                                <ChevronRight size={16} className="ml-1" />
                              </Link>
                            </div>
                            <div className="bg-white p-4 rounded-lg border border-purple-100">
                              <div className="flex items-center mb-2">
                                <div className="h-8 w-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-medium mr-2">
                                  {messages[messages.length - 1].sender ===
                                  "agent"
                                    ? "AR"
                                    : client.name.charAt(0)}
                                </div>
                                <div>
                                  <p className="text-sm font-medium">
                                    {messages[messages.length - 1].sender ===
                                    "agent"
                                      ? "You"
                                      : client.name}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {format(
                                      new Date(
                                        messages[messages.length - 1].timestamp
                                      ),
                                      "h:mm a"
                                    )}
                                  </p>
                                </div>
                                <div className="ml-auto px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700 flex items-center">
                                  <Globe size={12} className="mr-1" />
                                  {messages[messages.length - 1].language}
                                </div>
                              </div>
                              <p className="text-gray-800 text-sm">
                                {messages[messages.length - 1].content}
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div className="bg-gray-50 p-8 rounded-xl border border-gray-200 text-center">
                            <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-600">
                              No recent conversations
                            </p>
                            <button
                              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
                              onClick={() => setCurrentTab("conversation")}
                            >
                              Start Conversation
                            </button>
                          </div>
                        )}
                      </div>

                      <div className="mt-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center">
                            <div className="p-2 rounded-md bg-amber-100 text-amber-600 mr-3">
                              <FileText className="h-5 w-5" />
                            </div>
                            <h4 className="text-md font-semibold text-gray-900">
                              Client Activity Timeline
                            </h4>
                          </div>
                        </div>

                        <div className="relative pl-6 border-l-2 border-gray-200 ml-3">
                          <div className="space-y-6">
                            {[1, 2, 3].map((index) => (
                              <div key={index} className="relative">
                                <div className="absolute -left-8 top-0 h-6 w-6 rounded-full bg-blue-100 border-2 border-white z-10 flex items-center justify-center shadow-sm">
                                  <div className="h-2.5 w-2.5 rounded-full bg-blue-500"></div>
                                </div>
                                <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
                                  <div className="flex items-center justify-between mb-1">
                                    <p className="text-sm font-medium text-gray-900">
                                      {index === 1
                                        ? "Viewed Bandra Apartment"
                                        : index === 2
                                        ? "Added to lead pipeline"
                                        : "Initial contact established"}
                                    </p>
                                    <span className="text-xs text-gray-500">
                                      {index === 1
                                        ? "2 days ago"
                                        : index === 2
                                        ? "1 week ago"
                                        : "2 weeks ago"}
                                    </span>
                                  </div>
                                  <p className="text-xs text-gray-600">
                                    {index === 1
                                      ? "Client has expressed interest in the 3BHK apartment at Bandra West"
                                      : index === 2
                                      ? "Added as a qualified lead with high priority"
                                      : "First inquiry through website form"}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {currentTab === "conversation" && (
                    <div className="flex flex-col h-[calc(70vh-10rem)]">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-gray-900">
                          Conversation History
                        </h3>
                        <div className="flex items-center space-x-3">
                          <button className="px-3 py-1.5 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center text-xs font-medium transition-colors">
                            <Download size={14} className="mr-1.5" />
                            Export
                          </button>
                          <button className="px-3 py-1.5 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center text-xs font-medium transition-colors">
                            <BookOpen size={14} className="mr-1.5" />
                            Create Summary
                          </button>
                        </div>
                      </div>

                      <div className="flex-1 overflow-y-auto mb-4 bg-gray-50 p-4 rounded-xl border border-gray-200">
                        {messages.length > 0 ? (
                          <div className="space-y-1">
                            {messages.map((message) => (
                              <ChatMessage
                                key={message.id}
                                message={{
                                  ...message,
                                  clientImage: client.profilePic,
                                }}
                              />
                            ))}
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center h-full text-gray-500">
                            <MessageSquare className="h-12 w-12 text-gray-300 mb-2" />
                            <p className="text-center">
                              No conversation history yet
                            </p>
                            <p className="text-sm text-center mt-1">
                              Start a conversation with this client
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="border-t border-gray-200 pt-4 bg-white">
                        <div className="flex items-center mb-3">
                          <span className="text-sm text-gray-500 mr-2">
                            Reply in:
                          </span>
                          <div className="w-40">
                            <LanguageSelector
                              selectedLanguage={selectedLanguage}
                              onChange={setSelectedLanguage}
                            />
                          </div>

                          <div className="ml-auto">
                            <div className="flex items-center space-x-4">
                              <button className="flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium">
                                <Globe size={16} className="mr-1" />
                                Use AI Translation
                              </button>
                              <button className="flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium">
                                <MessageSquare size={16} className="mr-1" />
                                Suggest Response
                              </button>
                            </div>
                          </div>
                        </div>

                        <div className="flex">
                          <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder={`Type a message in ${selectedLanguage}...`}
                            className="flex-1 border border-gray-300 rounded-l-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                handleSendMessage();
                              }
                            }}
                          />
                          <button
                            onClick={handleSendMessage}
                            className="bg-blue-600 text-white px-5 py-3 rounded-r-xl hover:bg-blue-700 transition-colors flex items-center"
                          >
                            <Send size={18} className="mr-2" />
                            Send
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {currentTab === "documents" && (
                    <div>
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-gray-900">
                          Client Documents
                        </h3>
                        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center text-sm font-medium transition-colors shadow-sm">
                          <Plus size={16} className="mr-2" />
                          Upload Document
                        </button>
                      </div>

                      <div className="bg-gray-50 rounded-xl border border-gray-200 p-8 text-center">
                        <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-600">
                          No documents uploaded yet
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          Upload identity, property, or loan documents
                        </p>
                        <button className="mt-4 px-4 py-2 border border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:text-blue-600 hover:border-blue-300 flex items-center justify-center mx-auto">
                          <Plus size={16} className="mr-1" />
                          Add Document
                        </button>
                      </div>
                    </div>
                  )}
                  {currentTab === "memories" && (
                    <div>
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-gray-900">
                          Client Memories
                        </h3>
                        <div className="flex items-center">
                          {isMem0Data && (
                            <button
                              onClick={() => refetchMem0Data()}
                              className="mr-3 px-3 py-1.5 border border-gray-200 rounded-lg flex items-center text-sm"
                              title="Refresh Mem0 Data"
                            >
                              <RefreshCcw size={14} className="mr-1.5" />
                              Refresh
                            </button>
                          )}
                          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center text-sm font-medium transition-colors shadow-sm">
                            <Plus size={16} className="mr-2" />
                            Add Memory
                          </button>
                        </div>
                      </div>

                      {client.memories.length > 0 ? (
                        <div className="grid grid-cols-1 gap-4">
                          {client.memories.map((memory) => (
                            <MemoryItem
                              key={memory.id}
                              memory={memory}
                              isMem0Data={isMem0Data}
                            />
                          ))}
                        </div>
                      ) : (
                        <div className="bg-gray-50 p-8 rounded-xl border border-gray-200 text-center">
                          <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                          <p className="text-gray-600 font-medium">
                            No memories found
                          </p>
                          <p className="text-sm text-gray-500 mt-1">
                            Start adding memories to keep track of client
                            preferences and information
                          </p>
                          <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 inline-flex items-center">
                            <Plus size={16} className="mr-2" />
                            Add First Memory
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
