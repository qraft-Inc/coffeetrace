'use client';

import { Bell, Check, CheckCheck, Trash2, Filter } from 'lucide-react';
import { useState } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

export default function NotificationsPage() {
  const [filter, setFilter] = useState('all');

  const notifications = [
    {
      id: 1,
      type: 'offer',
      title: 'New offer received',
      message: 'Sarah Johnson made an offer of $2,100 on your lot CT2024001',
      time: '2 hours ago',
      read: false,
      icon: '💰',
    },
    {
      id: 2,
      type: 'status',
      title: 'Lot status updated',
      message: 'Your lot CT2024015 status has been changed to "Listed"',
      time: '5 hours ago',
      read: false,
      icon: '📦',
    },
    {
      id: 3,
      type: 'message',
      title: 'New message from buyer',
      message: 'John Kamau sent you a message about pricing',
      time: '1 day ago',
      read: true,
      icon: '💬',
    },
    {
      id: 4,
      type: 'payment',
      title: 'Payment received',
      message: 'Payment of $1,350 received for lot CT2024009',
      time: '2 days ago',
      read: true,
      icon: '✅',
    },
    {
      id: 5,
      type: 'system',
      title: 'Profile verification complete',
      message: 'Your farm profile has been verified by the administrator',
      time: '3 days ago',
      read: true,
      icon: '🎉',
    },
  ];

  const filteredNotifications = filter === 'unread' 
    ? notifications.filter(n => !n.read)
    : notifications;

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Notifications</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm text-gray-900 dark:text-gray-100">
              <CheckCheck className="h-4 w-4" />
              Mark all as read
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-4 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setFilter('all')}
            className={`pb-3 px-1 border-b-2 transition-colors text-sm font-medium ${
              filter === 'all'
                ? 'border-primary-600 dark:border-primary-400 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
            }`}
          >
            All ({notifications.length})
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`pb-3 px-1 border-b-2 transition-colors text-sm font-medium ${
              filter === 'unread'
                ? 'border-primary-600 dark:border-primary-400 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
            }`}
          >
            Unread ({unreadCount})
          </button>
        </div>

        {/* Notifications List */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          {filteredNotifications.length > 0 ? (
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                    !notification.read ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center text-xl">
                      {notification.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 flex items-center gap-2">
                            {notification.title}
                            {!notification.read && (
                              <span className="w-2 h-2 bg-primary-600 dark:bg-primary-400 rounded-full"></span>
                            )}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                            {notification.time}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {!notification.read && (
                            <button
                              className="p-1 text-gray-400 dark:text-gray-500 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                              title="Mark as read"
                            >
                              <Check className="h-4 w-4" />
                            </button>
                          )}
                          <button
                            className="p-1 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center">
              <Bell className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-3" />
              <p className="text-gray-600 dark:text-gray-400">No notifications to display</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
