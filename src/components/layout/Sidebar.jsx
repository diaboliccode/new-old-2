
import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useChat } from '@/contexts/ChatContext';
import { 
  MessageCircle, 
  Users, 
  Radio, 
  Settings, 
  LogOut,
  Shield
} from 'lucide-react';

const tabs = [
  { id: 'chats', icon: MessageCircle, label: 'Chats' },
  { id: 'status', icon: Radio, label: 'Status' },
  { id: 'channels', icon: Users, label: 'Channels' },
  { id: 'settings', icon: Settings, label: 'Settings' }
];

export default function Sidebar({ activeTab, onTabChange }) {
  const { user, logout } = useAuth();
  const { chats } = useChat();

  const unreadCount = chats.reduce((count, chat) => {
    return count + chat.messages.filter(msg => !msg.read && msg.senderId !== user.id).length;
  }, 0);

  return (
    <div className="w-20 bg-card border-r border-border flex flex-col">
      {/* Logo */}
      <div className="h-16 flex items-center justify-center border-b border-border">
        <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
          <Shield className="w-6 h-6 text-primary" />
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 py-4">
        <nav className="space-y-2 px-2">
          {tabs.map((tab) => (
            <motion.div key={tab.id} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant={activeTab === tab.id ? 'default' : 'ghost'}
                size="icon"
                className="w-12 h-12 relative"
                onClick={() => onTabChange(tab.id)}
              >
                <tab.icon className="w-5 h-5" />
                {tab.id === 'chats' && unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Button>
            </motion.div>
          ))}
        </nav>
      </div>

      {/* User Profile */}
      <div className="p-2 border-t border-border">
        <div className="flex flex-col items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-lg">
            {user?.avatar}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="w-8 h-8"
            onClick={logout}
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
