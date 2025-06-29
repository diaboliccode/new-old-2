
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { encryptMessage, decryptMessage } from '@/lib/encryption';
import { toast } from '@/components/ui/use-toast';

const ChatContext = createContext();

export function ChatProvider({ children }) {
  const { user } = useAuth();
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [typingUsers, setTypingUsers] = useState({});

  useEffect(() => {
    if (user) {
      loadChats();
      loadContacts();
    }
  }, [user]);

  const loadChats = () => {
    const savedChats = localStorage.getItem('securechat-chats');
    if (savedChats) {
      try {
        setChats(JSON.parse(savedChats));
      } catch (error) {
        console.error('Error loading chats:', error);
      }
    }
  };

  const loadContacts = () => {
    const savedContacts = localStorage.getItem('securechat-contacts');
    if (savedContacts) {
      try {
        setContacts(JSON.parse(savedContacts));
      } catch (error) {
        console.error('Error loading contacts:', error);
      }
    } else {
      // Initialize with some demo contacts
      const demoContacts = [
        {
          id: 'demo-1',
          username: 'Alice Cooper',
          avatar: '👩‍💼',
          status: 'online',
          lastSeen: new Date().toISOString(),
          publicKey: 'demo-key-1'
        },
        {
          id: 'demo-2',
          username: 'Bob Wilson',
          avatar: '👨‍💻',
          status: 'away',
          lastSeen: new Date(Date.now() - 300000).toISOString(),
          publicKey: 'demo-key-2'
        },
        {
          id: 'demo-3',
          username: 'Carol Smith',
          avatar: '👩‍🎨',
          status: 'offline',
          lastSeen: new Date(Date.now() - 3600000).toISOString(),
          publicKey: 'demo-key-3'
        }
      ];
      setContacts(demoContacts);
      localStorage.setItem('securechat-contacts', JSON.stringify(demoContacts));
    }
  };

  const saveChats = (updatedChats) => {
    localStorage.setItem('securechat-chats', JSON.stringify(updatedChats));
  };

  const createChat = (contactId, type = 'private') => {
    const contact = contacts.find(c => c.id === contactId);
    if (!contact) return null;

    const chatId = `chat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newChat = {
      id: chatId,
      type,
      participants: [user.id, contactId],
      messages: [],
      createdAt: new Date().toISOString(),
      lastActivity: new Date().toISOString(),
      settings: {
        autoDelete: true,
        deleteTimer: 5000,
        encryption: true
      }
    };

    const updatedChats = [...chats, newChat];
    setChats(updatedChats);
    saveChats(updatedChats);
    setActiveChat(newChat);
    
    return newChat;
  };

  const sendMessage = async (chatId, content, type = 'text', metadata = {}) => {
    const chat = chats.find(c => c.id === chatId);
    if (!chat) return;

    try {
      const messageId = `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const message = {
        id: messageId,
        chatId,
        senderId: user.id,
        content,
        type,
        metadata,
        timestamp: new Date().toISOString(),
        encrypted: true,
        read: false,
        autoDelete: chat.settings.autoDelete,
        deleteTimer: chat.settings.deleteTimer
      };

      const updatedChats = chats.map(c => {
        if (c.id === chatId) {
          return {
            ...c,
            messages: [...c.messages, message],
            lastActivity: new Date().toISOString()
          };
        }
        return c;
      });

      setChats(updatedChats);
      saveChats(updatedChats);

      // Auto-delete message if enabled
      if (message.autoDelete) {
        setTimeout(() => {
          deleteMessage(chatId, messageId);
        }, message.deleteTimer);
      }

      return message;
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive"
      });
    }
  };

  const deleteMessage = (chatId, messageId) => {
    const updatedChats = chats.map(c => {
      if (c.id === chatId) {
        return {
          ...c,
          messages: c.messages.filter(m => m.id !== messageId)
        };
      }
      return c;
    });

    setChats(updatedChats);
    saveChats(updatedChats);
  };

  const markMessageAsRead = (chatId, messageId) => {
    const updatedChats = chats.map(c => {
      if (c.id === chatId) {
        return {
          ...c,
          messages: c.messages.map(m => {
            if (m.id === messageId && !m.read) {
              return { ...m, read: true };
            }
            return m;
          })
        };
      }
      return c;
    });

    setChats(updatedChats);
    saveChats(updatedChats);
  };

  const setTyping = (chatId, isTyping) => {
    setTypingUsers(prev => ({
      ...prev,
      [chatId]: isTyping ? user.id : null
    }));

    // Clear typing indicator after 3 seconds
    if (isTyping) {
      setTimeout(() => {
        setTypingUsers(prev => ({
          ...prev,
          [chatId]: null
        }));
      }, 3000);
    }
  };

  return (
    <ChatContext.Provider value={{
      chats,
      activeChat,
      contacts,
      typingUsers,
      setActiveChat,
      createChat,
      sendMessage,
      deleteMessage,
      markMessageAsRead,
      setTyping
    }}>
      {children}
    </ChatContext.Provider>
  );
}

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
