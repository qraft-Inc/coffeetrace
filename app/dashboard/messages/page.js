'use client';

import { useState } from 'react';
import { MessageSquare, Send, Search, MoreVertical, Paperclip } from 'lucide-react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

export default function MessagesPage() {
  const [selectedChat, setSelectedChat] = useState(null);
  const [message, setMessage] = useState('');

  const conversations = [
    {
      id: 1,
      name: 'Sarah Johnson',
      role: 'Buyer',
      lastMessage: 'Thanks for the quality coffee!',
      time: '2m ago',
      unread: 2,
      avatar: 'SJ',
    },
    {
      id: 2,
      name: 'Green Valley Coop',
      role: 'Cooperative',
      lastMessage: 'Your lot has been approved',
      time: '1h ago',
      unread: 0,
      avatar: 'GV',
    },
    {
      id: 3,
      name: 'John Kamau',
      role: 'Farmer',
      lastMessage: 'When can we discuss pricing?',
      time: '3h ago',
      unread: 1,
      avatar: 'JK',
    },
  ];

  const messages = selectedChat ? [
    {
      id: 1,
      sender: 'them',
      text: 'Hi, I\'m interested in your latest coffee lot.',
      time: '10:30 AM',
    },
    {
      id: 2,
      sender: 'me',
      text: 'Hello! Thank you for your interest. The lot is CT2024015.',
      time: '10:32 AM',
    },
    {
      id: 3,
      sender: 'them',
      text: 'Great! Can you tell me more about the variety and harvest date?',
      time: '10:35 AM',
    },
    {
      id: 4,
      sender: 'me',
      text: 'Sure! It\'s Arabica SL28, harvested on November 10th. Weight is 500kg.',
      time: '10:36 AM',
    },
    {
      id: 5,
      sender: 'them',
      text: 'Thanks for the quality coffee!',
      time: '10:40 AM',
    },
  ] : [];

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Messages</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Communicate with buyers, farmers, and cooperatives
        </p>
      </div>

      {/* Messages Interface */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden" style={{ height: 'calc(100vh - 250px)' }}>
        <div className="grid grid-cols-12 h-full">
          {/* Conversations List */}
          <div className="col-span-4 border-r border-gray-200 dark:border-gray-700 flex flex-col">
            {/* Search */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                <input
                  type="text"
                  placeholder="Search conversations..."
                  className="w-full pl-9 pr-4 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400"
                />
              </div>
            </div>

            {/* Conversation List */}
            <div className="flex-1 overflow-y-auto">
              {conversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => setSelectedChat(conv)}
                  className={`w-full p-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left ${
                    selectedChat?.id === conv.id ? 'bg-primary-50 dark:bg-primary-900/20' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                      {conv.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                          {conv.name}
                        </p>
                        <span className="text-xs text-gray-500 dark:text-gray-400">{conv.time}</span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{conv.role}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 truncate">{conv.lastMessage}</p>
                    </div>
                    {conv.unread > 0 && (
                      <div className="flex-shrink-0 w-5 h-5 bg-primary-600 rounded-full flex items-center justify-center">
                        <span className="text-xs text-white font-medium">{conv.unread}</span>
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Chat Area */}
          <div className="col-span-8 flex flex-col">
            {selectedChat ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                      {selectedChat.avatar}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{selectedChat.name}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">{selectedChat.role}</p>
                    </div>
                  </div>
                  <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                    <MoreVertical className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                  </button>
                </div>

                {/* Messages */}
                <div className="flex-1 p-4 overflow-y-auto bg-gray-50 dark:bg-gray-900">
                  <div className="space-y-4">
                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                            msg.sender === 'me'
                              ? 'bg-primary-600 text-white'
                              : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700'
                          }`}
                        >
                          <p className="text-sm">{msg.text}</p>
                          <p
                            className={`text-xs mt-1 ${
                              msg.sender === 'me' ? 'text-primary-100' : 'text-gray-500 dark:text-gray-300'
                            }`}
                          >
                            {msg.time}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Message Input */}
                <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                  <div className="flex items-end gap-2">
                    <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                      <Paperclip className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                    </button>
                    <div className="flex-1">
                      <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Type a message..."
                        rows={1}
                        className="w-full px-4 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400"
                      />
                    </div>
                    <button className="p-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
                      <Send className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="text-center">
                  <MessageSquare className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-3" />
                  <p className="text-gray-600 dark:text-gray-400">Select a conversation to start messaging</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      </div>
    </DashboardLayout>
  );
}
