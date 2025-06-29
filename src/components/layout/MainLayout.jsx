import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Sidebar from '@/components/layout/Sidebar';
import ChatArea from '@/components/chat/ChatArea';
import ContactList from '@/components/contacts/ContactList';
import StatusUpdates from '@/components/status/StatusUpdates';
import Channels from '@/components/channels/Channels';
import Settings from '@/components/settings/Settings';
import VideoCall from '@/components/video/VideoCall';
import VideoCallInterface from '@/components/video/VideoCallInterface';
import ThemeSelector from '@/components/theme/ThemeSelector';
import { useChat } from '@/contexts/ChatContext';

export default function MainLayout() {
  const [activeTab, setActiveTab] = useState('chats');
  const [showVideoCall, setShowVideoCall] = useState(false);
  const [videoCallContact, setVideoCallContact] = useState(null);
  const [isVideoCallMinimized, setIsVideoCallMinimized] = useState(false);
  const { activeChat } = useChat();

  const renderContent = () => {
    switch (activeTab) {
      case 'chats':
        return activeChat ? <ChatArea /> : <ContactList />;
      case 'status':
        return <StatusUpdates />;
      case 'channels':
        return <Channels />;
      case 'settings':
        return <Settings />;
      default:
        return <ContactList />;
    }
  };

  return (
    <div className="h-screen flex bg-background">
      {/* Sidebar */}
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="h-16 border-b border-border bg-card/50 backdrop-blur-sm flex items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-foreground">
              {activeTab === 'chats' && activeChat ? 'Chat' :
               activeTab === 'chats' ? 'Contacts' :
               activeTab === 'status' ? 'Status Updates' :
               activeTab === 'channels' ? 'Channels' :
               activeTab === 'settings' ? 'Settings' : 'SecureChat'}
            </h2>
          </div>
          
          <div className="flex items-center gap-2">
            <ThemeSelector />
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="h-full"
          >
            {renderContent()}
          </motion.div>
        </div>
      </div>

      {/* Video Call Interface */}
      {showVideoCall && videoCallContact && (
        <VideoCallInterface
          contact={videoCallContact}
          onEnd={() => {
            setShowVideoCall(false);
            setVideoCallContact(null);
            setIsVideoCallMinimized(false);
          }}
          isMinimized={isVideoCallMinimized}
          onToggleMinimize={() => setIsVideoCallMinimized(!isVideoCallMinimized)}
        />
      )}
    </div>
  );
}