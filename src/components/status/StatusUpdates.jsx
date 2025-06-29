import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/hooks/useAuth';
import StatusCreator from '@/components/status/StatusCreator';
import PhotoStatusCreator from '@/components/status/PhotoStatusCreator';
import PhotoStatusViewer from '@/components/status/PhotoStatusViewer';
import { Plus, Camera, Type, Smile, Eye } from 'lucide-react';

export default function StatusUpdates() {
  const { user } = useAuth();
  const [statusText, setStatusText] = useState('');
  const [showCreator, setShowCreator] = useState(false);
  const [showPhotoCreator, setShowPhotoCreator] = useState(false);
  const [showStatusViewer, setShowStatusViewer] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [userStatuses, setUserStatuses] = useState([]);

  useEffect(() => {
    loadUserStatuses();
  }, []);

  const loadUserStatuses = () => {
    const saved = localStorage.getItem('securechat-statuses');
    if (saved) {
      try {
        const statuses = JSON.parse(saved);
        // Filter out expired statuses and ensure all required properties exist
        const validStatuses = statuses.filter(status => 
          new Date(status.expiresAt) > new Date()
        ).map(status => ({
          ...status,
          views: status.views || 0,
          viewedBy: status.viewedBy || [],
          type: status.type || 'text'
        }));
        setUserStatuses(validStatuses);
        if (validStatuses.length !== statuses.length) {
          localStorage.setItem('securechat-statuses', JSON.stringify(validStatuses));
        }
      } catch (error) {
        console.error('Error loading statuses:', error);
      }
    }
  };

  const saveUserStatuses = (statuses) => {
    localStorage.setItem('securechat-statuses', JSON.stringify(statuses));
  };

  const handleCreateStatus = (statusData) => {
    const newStatus = {
      ...statusData,
      userId: user.id,
      username: user.username,
      avatar: user.avatar,
      views: 0,
      viewedBy: [],
      type: statusData.type || 'text'
    };

    const updatedStatuses = [newStatus, ...userStatuses];
    setUserStatuses(updatedStatuses);
    saveUserStatuses(updatedStatuses);

    toast({
      title: "Status Created! 🎉",
      description: "Your status has been shared and will disappear in 24 hours"
    });
  };

  const handleQuickStatus = () => {
    if (!statusText.trim()) {
      toast({
        title: "Status Required",
        description: "Please enter some text for your status",
        variant: "destructive"
      });
      return;
    }

    const status = {
      id: Date.now(),
      type: 'text',
      content: statusText,
      backgroundColor: '#1a73e8',
      textColor: '#ffffff',
      fontSize: 'text-lg',
      timestamp: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    };

    handleCreateStatus(status);
    setStatusText('');
  };

  const handleViewStatus = (status) => {
    // Ensure viewedBy is always an array
    const viewedBy = status.viewedBy || [];
    
    if (!viewedBy.includes(user.id)) {
      const updatedStatuses = userStatuses.map(s => {
        if (s.id === status.id) {
          return {
            ...s,
            views: (s.views || 0) + 1,
            viewedBy: [...viewedBy, user.id]
          };
        }
        return s;
      });
      setUserStatuses(updatedStatuses);
      saveUserStatuses(updatedStatuses);
    }
  };

  const formatTimeRemaining = (expiresAt) => {
    const now = new Date();
    const expires = new Date(expiresAt);
    const diff = expires - now;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const demoStatuses = [
    {
      id: 1,
      user: { name: 'You', avatar: '👤' },
      content: 'Working on something exciting! 🚀',
      timestamp: '2 hours ago',
      views: 12
    },
    {
      id: 2,
      user: { name: 'Alice Cooper', avatar: '👩‍💼' },
      content: 'Beautiful sunset today 🌅',
      timestamp: '4 hours ago',
      views: 8
    },
    {
      id: 3,
      user: { name: 'Bob Wilson', avatar: '👨‍💻' },
      content: 'Just finished a great book! 📚',
      timestamp: '6 hours ago',
      views: 15
    }
  ];

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <h1 className="text-2xl font-bold text-foreground mb-2">Status Updates</h1>
        <p className="text-muted-foreground">Share moments that disappear in 24 hours</p>
      </div>

      {/* Create Status */}
      <div className="p-4 border-b border-border bg-card/50">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-lg">
            👤
          </div>
          <div className="flex-1">
            <Input
              placeholder="What's on your mind?"
              value={statusText}
              onChange={(e) => setStatusText(e.target.value)}
              className="border-none bg-transparent text-lg placeholder:text-muted-foreground focus-visible:ring-0"
            />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowPhotoCreator(true)}
            >
              <Camera className="w-4 h-4 mr-2" />
              Photo
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toast({
                title: "🚧 Text Styles",
                description: "Text styling isn't implemented yet—but don't worry! You can request it in your next prompt! 🚀"
              })}
            >
              <Type className="w-4 h-4 mr-2" />
              Style
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toast({
                title: "🚧 Emoji Picker",
                description: "Emoji picker isn't implemented yet—but don't worry! You can request it in your next prompt! 🚀"
              })}
            >
              <Smile className="w-4 h-4 mr-2" />
              Emoji
            </Button>
          </div>

          <Button onClick={handleQuickStatus} disabled={!statusText.trim()}>
            <Plus className="w-4 h-4 mr-2" />
            Share
          </Button>
          <Button variant="outline" onClick={() => setShowCreator(true)}>
            <Type className="w-4 h-4 mr-2" />
            Create
          </Button>
        </div>
      </div>

      {/* My Statuses */}
      {userStatuses.length > 0 && (
        <div className="p-4 border-b border-border">
          <h3 className="text-sm font-medium text-muted-foreground mb-3">My Status</h3>
          <div className="space-y-3">
            {userStatuses.map((status, index) => (
              <motion.div
                key={status.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-3 p-3 bg-card border border-border rounded-lg cursor-pointer hover:bg-accent/50 transition-colors"
                onClick={() => {
                  setSelectedStatus(status);
                  setShowStatusViewer(true);
                }}
              >
                {status.type === 'photo' ? (
                  <div className="w-12 h-12 rounded-lg overflow-hidden">
                    <img 
                      src={status.photoUrl} 
                      alt="Status" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div 
                    className="w-12 h-12 rounded-lg flex items-center justify-center text-sm font-medium"
                    style={{ 
                      backgroundColor: status.backgroundColor,
                      color: status.textColor 
                    }}
                  >
                    {status.content.slice(0, 2)}
                  </div>
                )}
                <div className="flex-1">
                  <p className="text-sm font-medium">{status.content || 'Photo Status'}</p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      {status.views} views
                    </span>
                    <span>Expires in {formatTimeRemaining(status.expiresAt)}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Status List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {demoStatuses.map((status, index) => (
          <motion.div
            key={status.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-card border border-border rounded-lg p-4 hover:bg-accent/50 transition-colors cursor-pointer"
            onClick={() => handleViewStatus(status)}
          >
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-xl border-2 border-primary/30">
                {status.user.avatar}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold text-foreground">{status.user.name}</h3>
                  <span className="text-sm text-muted-foreground">{status.timestamp}</span>
                </div>
                
                <p className="text-foreground mb-3">{status.content}</p>
                
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>{status.views} views</span>
                  <span>Expires in {Math.floor(Math.random() * 20 + 1)}h</span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Privacy Notice */}
      <div className="p-4 border-t border-border">
        <div className="bg-primary/10 border border-primary/20 rounded-lg p-3">
          <p className="text-sm text-foreground">
            🕐 Status updates automatically disappear after 24 hours
          </p>
        </div>
      </div>

      {/* Status Creator Modal */}
      <StatusCreator
        isOpen={showCreator}
        onClose={() => setShowCreator(false)}
        onCreateStatus={handleCreateStatus}
      />

      {/* Photo Status Creator */}
      <PhotoStatusCreator
        isOpen={showPhotoCreator}
        onClose={() => setShowPhotoCreator(false)}
        onCreateStatus={handleCreateStatus}
      />

      {/* Status Viewer */}
      {selectedStatus && (
        <PhotoStatusViewer
          status={selectedStatus}
          isOpen={showStatusViewer}
          onClose={() => {
            setShowStatusViewer(false);
            setSelectedStatus(null);
          }}
          onReact={(statusId, emoji) => {
            toast({
              title: `Reacted with ${emoji}`,
              description: "Your reaction has been added!"
            });
          }}
          onReply={(status) => {
            toast({
              title: "🚧 Reply Feature",
              description: "Status replies aren't implemented yet—but don't worry! You can request it in your next prompt! 🚀"
            });
          }}
        />
      )}
    </div>
  );
}