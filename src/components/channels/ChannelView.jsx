
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/hooks/useAuth';
import MessageBubble from '@/components/chat/MessageBubble';
import FileUpload from '@/components/chat/FileUpload';
import VoiceRecorder from '@/components/chat/VoiceRecorder';
import TypingIndicator from '@/components/chat/TypingIndicator';
import ChannelHeader from '@/components/channels/ChannelHeader';
import ChannelInput from '@/components/channels/ChannelInput';
import ChannelMembers from '@/components/channels/ChannelMembers';
import { Pin } from 'lucide-react';

export default function ChannelView({ channel, onBack }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [pinnedMessages, setPinnedMessages] = useState([]);
  const [showMembers, setShowMembers] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [channelMuted, setChannelMuted] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    loadChannelMessages();
    loadChannelSettings();
    scrollToBottom();
  }, [channel.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadChannelMessages = () => {
    const saved = localStorage.getItem(`channel-messages-${channel.id}`);
    if (saved) {
      try {
        setMessages(JSON.parse(saved));
      } catch (error) {
        console.error('Error loading channel messages:', error);
      }
    } else {
      const demoMessages = [
        {
          id: 1,
          senderId: 'demo-user-1',
          senderName: 'Alex Chen',
          senderAvatar: '👨‍💻',
          content: `Welcome to #${channel.name}! 🎉`,
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          type: 'text',
          isPinned: true
        },
        {
          id: 2,
          senderId: 'demo-user-2',
          senderName: 'Sarah Wilson',
          senderAvatar: '👩‍🎨',
          content: 'Great to have everyone here! Looking forward to amazing discussions.',
          timestamp: new Date(Date.now() - 1800000).toISOString(),
          type: 'text'
        },
        {
          id: 3,
          senderId: 'demo-user-3',
          senderName: 'Mike Johnson',
          senderAvatar: '🧑‍🚀',
          content: 'This channel is going to be awesome! 🚀',
          timestamp: new Date(Date.now() - 900000).toISOString(),
          type: 'text',
          reactions: [
            { emoji: '🚀', users: ['demo-user-1', 'demo-user-2'], count: 2 },
            { emoji: '👍', users: ['demo-user-1'], count: 1 }
          ]
        }
      ];
      setMessages(demoMessages);
      setPinnedMessages(demoMessages.filter(msg => msg.isPinned));
    }
  };

  const loadChannelSettings = () => {
    const saved = localStorage.getItem(`channel-settings-${channel.id}`);
    if (saved) {
      try {
        const settings = JSON.parse(saved);
        setNotifications(settings.notifications ?? true);
        setChannelMuted(settings.muted ?? false);
      } catch (error) {
        console.error('Error loading channel settings:', error);
      }
    }
  };

  const saveChannelMessages = (updatedMessages) => {
    localStorage.setItem(`channel-messages-${channel.id}`, JSON.stringify(updatedMessages));
  };

  const saveChannelSettings = (settings) => {
    localStorage.setItem(`channel-settings-${channel.id}`, JSON.stringify(settings));
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const applyTextStyle = (style) => {
    const textarea = document.querySelector('input[placeholder*="Message"]');
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = newMessage.substring(start, end);
    
    let styledText = '';
    switch (style) {
      case 'bold':
        styledText = `**${selectedText || 'bold text'}**`;
        break;
      case 'italic':
        styledText = `*${selectedText || 'italic text'}*`;
        break;
      case 'underline':
        styledText = `__${selectedText || 'underlined text'}__`;
        break;
      case 'strikethrough':
        styledText = `~~${selectedText || 'strikethrough text'}~~`;
        break;
      case 'code':
        styledText = `\`${selectedText || 'code'}\``;
        break;
      default:
        return;
    }

    const newText = newMessage.substring(0, start) + styledText + newMessage.substring(end);
    setNewMessage(newText);
    
    toast({
      title: `${style.charAt(0).toUpperCase() + style.slice(1)} Applied! ✨`,
      description: `Text styled with ${style} formatting`
    });
  };

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const message = {
      id: Date.now(),
      senderId: user.id,
      senderName: user.username,
      senderAvatar: user.avatar,
      content: newMessage,
      timestamp: new Date().toISOString(),
      type: 'text',
      reactions: []
    };

    const updatedMessages = [...messages, message];
    setMessages(updatedMessages);
    saveChannelMessages(updatedMessages);
    setNewMessage('');
    setShowEmojiPicker(false);

    setIsTyping(false);
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    toast({
      title: "Message Sent! 📢",
      description: `Your styled message was sent to #${channel.name}`
    });
  };

  const handleTyping = (value) => {
    setNewMessage(value);
    
    if (!isTyping && value.trim()) {
      setIsTyping(true);
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
    }, 2000);
  };

  const handleEmojiSelect = (emoji) => {
    setNewMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  const handleFileUpload = (file) => {
    const message = {
      id: Date.now(),
      senderId: user.id,
      senderName: user.username,
      senderAvatar: user.avatar,
      content: `Shared a file: ${file.name}`,
      timestamp: new Date().toISOString(),
      type: 'file',
      fileData: {
        name: file.name,
        size: file.size,
        type: file.type,
        url: URL.createObjectURL(file)
      },
      reactions: []
    };

    const updatedMessages = [...messages, message];
    setMessages(updatedMessages);
    saveChannelMessages(updatedMessages);
    setShowFileUpload(false);

    toast({
      title: "File Shared! 📎",
      description: `${file.name} was shared in #${channel.name}`
    });
  };

  const handleVoiceNote = (audioBlob) => {
    const message = {
      id: Date.now(),
      senderId: user.id,
      senderName: user.username,
      senderAvatar: user.avatar,
      content: 'Voice message',
      timestamp: new Date().toISOString(),
      type: 'voice',
      voiceData: {
        url: URL.createObjectURL(audioBlob),
        duration: 0
      },
      reactions: []
    };

    const updatedMessages = [...messages, message];
    setMessages(updatedMessages);
    saveChannelMessages(updatedMessages);
    setIsRecording(false);

    toast({
      title: "Voice Note Sent! 🎤",
      description: `Your voice message was sent to #${channel.name}`
    });
  };

  const handleReaction = (messageId, emoji) => {
    const updatedMessages = messages.map(message => {
      if (message.id === messageId) {
        const reactions = message.reactions || [];
        const existingReaction = reactions.find(r => r.emoji === emoji);
        
        if (existingReaction) {
          if (existingReaction.users.includes(user.id)) {
            existingReaction.users = existingReaction.users.filter(id => id !== user.id);
            existingReaction.count = existingReaction.users.length;
            if (existingReaction.count === 0) {
              return {
                ...message,
                reactions: reactions.filter(r => r.emoji !== emoji)
              };
            }
          } else {
            existingReaction.users.push(user.id);
            existingReaction.count = existingReaction.users.length;
          }
        } else {
          reactions.push({
            emoji,
            users: [user.id],
            count: 1
          });
        }
        
        return { ...message, reactions };
      }
      return message;
    });

    setMessages(updatedMessages);
    saveChannelMessages(updatedMessages);
  };

  const handlePinMessage = (messageId) => {
    const messageToPin = messages.find(msg => msg.id === messageId);
    if (!messageToPin) return;

    const updatedMessages = messages.map(message => {
      if (message.id === messageId) {
        const isPinned = !message.isPinned;
        if (isPinned) {
          setPinnedMessages(prev => [...prev, { ...message, isPinned }]);
        } else {
          setPinnedMessages(prev => prev.filter(msg => msg.id !== messageId));
        }
        return { ...message, isPinned };
      }
      return message;
    });

    setMessages(updatedMessages);
    saveChannelMessages(updatedMessages);

    toast({
      title: messageToPin.isPinned ? "Message Unpinned" : "Message Pinned! 📌",
      description: messageToPin.isPinned ? "Message removed from pinned" : "Message pinned to channel"
    });
  };

  const toggleNotifications = () => {
    const newNotifications = !notifications;
    setNotifications(newNotifications);
    saveChannelSettings({ notifications: newNotifications, muted: channelMuted });
    
    toast({
      title: newNotifications ? "Notifications Enabled 🔔" : "Notifications Disabled 🔕",
      description: `Channel notifications ${newNotifications ? 'enabled' : 'disabled'}`
    });
  };

  const toggleMute = () => {
    const newMuted = !channelMuted;
    setChannelMuted(newMuted);
    saveChannelSettings({ notifications, muted: newMuted });
    
    toast({
      title: newMuted ? "Channel Muted 🔇" : "Channel Unmuted 🔊",
      description: `#${channel.name} ${newMuted ? 'muted' : 'unmuted'}`
    });
  };

  const filteredMessages = searchQuery 
    ? messages.filter(msg => 
        msg.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        msg.senderName.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : messages;

  const channelMembers = [
    { id: 'demo-user-1', name: 'Alex Chen', avatar: '👨‍💻', status: 'online', role: 'admin' },
    { id: 'demo-user-2', name: 'Sarah Wilson', avatar: '👩‍🎨', status: 'online', role: 'member' },
    { id: 'demo-user-3', name: 'Mike Johnson', avatar: '🧑‍🚀', status: 'away', role: 'member' },
    { id: user.id, name: user.username, avatar: user.avatar, status: 'online', role: 'member' }
  ];

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-background via-background to-background/95">
      {/* Channel Header */}
      <ChannelHeader
        channel={channel}
        channelMembers={channelMembers}
        pinnedMessages={pinnedMessages}
        channelMuted={channelMuted}
        notifications={notifications}
        showSearch={showSearch}
        onBack={onBack}
        onToggleSearch={() => setShowSearch(!showSearch)}
        onToggleNotifications={toggleNotifications}
        onToggleMute={toggleMute}
        onToggleMembers={() => setShowMembers(!showMembers)}
      />

      {/* Search Bar */}
      <AnimatePresence>
        {showSearch && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-b border-border bg-gradient-to-r from-card/40 to-card/20 backdrop-blur-sm p-4"
          >
            <Input
              placeholder="Search messages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-background/50 border-border/50 focus:border-primary/50"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pinned Messages */}
      <AnimatePresence>
        {pinnedMessages.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-b border-border bg-gradient-to-r from-accent/30 to-accent/10 backdrop-blur-sm p-3"
          >
            <div className="flex items-center gap-2 mb-2">
              <Pin className="w-4 h-4 text-primary" />
              <span className="text-sm font-bold text-foreground">Pinned Messages</span>
            </div>
            <div className="space-y-2">
              {pinnedMessages.slice(0, 2).map((message) => (
                <div key={message.id} className="text-sm text-muted-foreground bg-card/50 rounded-lg p-3 border border-border/30">
                  <span className="font-semibold">{message.senderName}:</span> {message.content}
                </div>
              ))}
              {pinnedMessages.length > 2 && (
                <div className="text-xs text-muted-foreground font-medium">
                  +{pinnedMessages.length - 2} more pinned messages
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 flex">
        {/* Messages Area */}
        <div className="flex-1 flex flex-col">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-transparent to-background/50">
            <AnimatePresence>
              {filteredMessages.map((message, index) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <MessageBubble
                    message={message}
                    isOwn={message.senderId === user.id}
                    onReact={(emoji) => handleReaction(message.id, emoji)}
                    onReply={() => toast({
                      title: "🚧 Reply Feature",
                      description: "Message replies aren't implemented yet—but don't worry! You can request them in your next prompt! 🚀"
                    })}
                    onPin={() => handlePinMessage(message.id)}
                    showPin={true}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
            
            {/* Typing Indicator */}
            {typingUsers.length > 0 && (
              <TypingIndicator users={typingUsers} />
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <ChannelInput
            newMessage={newMessage}
            showEmojiPicker={showEmojiPicker}
            channelName={channel.name}
            onMessageChange={handleTyping}
            onSendMessage={handleSendMessage}
            onToggleEmojiPicker={() => setShowEmojiPicker(!showEmojiPicker)}
            onEmojiSelect={handleEmojiSelect}
            onFileUpload={() => setShowFileUpload(true)}
            onVoiceRecord={() => setIsRecording(true)}
            onApplyStyle={applyTextStyle}
          />
        </div>

        {/* Members Sidebar */}
        <AnimatePresence>
          <ChannelMembers 
            members={channelMembers}
            showMembers={showMembers}
          />
        </AnimatePresence>
      </div>

      {/* File Upload Modal */}
      <FileUpload
        isOpen={showFileUpload}
        onClose={() => setShowFileUpload(false)}
        onFileSelect={handleFileUpload}
      />

      {/* Voice Recorder */}
      <VoiceRecorder
        isRecording={isRecording}
        onStop={handleVoiceNote}
        onCancel={() => setIsRecording(false)}
      />
    </div>
  );
}
