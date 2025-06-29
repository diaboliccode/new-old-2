
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useChat } from '@/contexts/ChatContext';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/components/ui/use-toast';
import VoicePlayer from '@/components/chat/VoicePlayer';
import StyledMessageRenderer from '@/components/chat/StyledMessageRenderer';
import { 
  Reply, 
  MoreHorizontal, 
  Download, 
  Play, 
  Pause,
  MapPin,
  File,
  Image as ImageIcon,
  Video,
  Pin,
  Heart,
  ThumbsUp,
  Laugh
} from 'lucide-react';

export default function MessageBubble({ message, isOwn, contact, previousMessage, onReply, onReact, onPin, showPin = false }) {
  const { markMessageAsRead } = useChat();
  const { user } = useAuth();
  const [showActions, setShowActions] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(null);
  const [showReactions, setShowReactions] = useState(false);

  const isFirstInGroup = !previousMessage || 
    previousMessage.senderId !== message.senderId ||
    new Date(message.timestamp) - new Date(previousMessage.timestamp) > 300000;

  useEffect(() => {
    if (!message.read && !isOwn && markMessageAsRead) {
      markMessageAsRead(message.chatId, message.id);
    }
  }, [message, isOwn, markMessageAsRead]);

  useEffect(() => {
    if (message.autoDelete && !message.read && !isOwn) {
      const timer = setTimeout(() => {
        setTimeLeft(Math.ceil(message.deleteTimer / 1000));
        const countdown = setInterval(() => {
          setTimeLeft(prev => {
            if (prev <= 1) {
              clearInterval(countdown);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [message, isOwn]);

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const handleReply = () => {
    if (onReply) {
      onReply();
    }
  };

  const handlePin = () => {
    if (onPin) {
      onPin();
    }
  };

  const handleReaction = (emoji) => {
    if (onReact) {
      onReact(emoji);
    }
    setShowReactions(false);
  };

  const handleDownload = () => {
    toast({
      title: "🚧 Download Feature",
      description: "File downloads aren't implemented yet—but don't worry! You can request it in your next prompt! 🚀"
    });
  };

  const quickReactions = ['❤️', '👍', '😂', '😮', '😢', '😡'];

  const renderMessageContent = () => {
    switch (message.type) {
      case 'voice':
        return (
          <VoicePlayer
            audioUrl={message.metadata?.audioUrl}
            duration={message.metadata?.duration || '0:05'}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
          />
        );

      case 'file':
        return (
          <div className="flex items-center gap-3 min-w-[200px] p-3 bg-gradient-to-r from-muted/50 to-muted/30 rounded-lg border">
            <div className="w-12 h-12 bg-gradient-to-br from-primary/30 to-primary/10 rounded-lg flex items-center justify-center shadow-lg">
              <File className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-foreground">{message.metadata?.fileName || 'File'}</p>
              <p className="text-xs text-muted-foreground font-medium">
                {message.metadata?.fileSize ? `${(message.metadata.fileSize / 1024).toFixed(1)} KB` : 'Unknown size'}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="w-8 h-8 hover:bg-primary/20"
              onClick={handleDownload}
            >
              <Download className="w-4 h-4" />
            </Button>
          </div>
        );

      case 'location':
        return (
          <div className="min-w-[250px] p-3 bg-gradient-to-r from-muted/50 to-muted/30 rounded-lg border">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="w-5 h-5 text-primary" />
              <span className="font-semibold text-foreground">Location</span>
            </div>
            <div className="bg-primary/10 rounded-lg p-3 border border-primary/20">
              <p className="text-sm font-medium">{message.metadata?.address || 'Shared Location'}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Lat: {message.metadata?.latitude?.toFixed(6)}, 
                Lng: {message.metadata?.longitude?.toFixed(6)}
              </p>
            </div>
          </div>
        );

      case 'reply':
        return (
          <div className="space-y-3">
            <div className="bg-muted/50 border-l-4 border-primary pl-3 py-2 rounded-r-lg">
              <p className="text-xs text-muted-foreground mb-1 font-medium">Replying to:</p>
              <p className="text-sm opacity-80">{message.metadata?.originalMessage}</p>
            </div>
            <StyledMessageRenderer content={message.content} />
          </div>
        );

      case 'image':
        return (
          <div className="max-w-[300px]">
            {message.metadata?.previewUrl ? (
              <div 
                className="rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-all duration-200 shadow-lg border"
                onClick={() => {
                  toast({
                    title: "🚧 Image Viewer",
                    description: "Full-screen image viewer isn't implemented yet—but don't worry! You can request it in your next prompt! 🚀"
                  });
                }}
              >
                <img 
                  src={message.metadata.previewUrl} 
                  alt="Shared image"
                  className="w-full h-auto max-h-64 object-cover"
                />
              </div>
            ) : (
              <div className="bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg p-6 flex items-center justify-center border">
                <ImageIcon className="w-16 h-16 text-primary opacity-50" />
              </div>
            )}
            {message.content && (
              <div className="mt-3">
                <StyledMessageRenderer content={message.content} />
              </div>
            )}
          </div>
        );

      case 'video':
        return (
          <div className="max-w-[300px]">
            {message.metadata?.previewUrl ? (
              <div className="rounded-lg overflow-hidden shadow-lg border">
                <video 
                  src={message.metadata.previewUrl}
                  controls
                  className="w-full h-auto max-h-64"
                  preload="metadata"
                >
                  Your browser does not support video playback.
                </video>
              </div>
            ) : (
              <div className="bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg p-6 flex items-center justify-center border">
                <Video className="w-16 h-16 text-primary opacity-50" />
              </div>
            )}
            {message.content && (
              <div className="mt-3">
                <StyledMessageRenderer content={message.content} />
              </div>
            )}
          </div>
        );

      default:
        return <StyledMessageRenderer content={message.content} />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.3 }}
      className={`flex ${isOwn ? 'justify-end' : 'justify-start'} group relative`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className={`max-w-[70%] ${isOwn ? 'order-2' : 'order-1'}`}>
        {isFirstInGroup && !isOwn && (
          <div className="flex items-center gap-2 mb-2 px-3">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center text-sm shadow-lg">
              {contact?.avatar}
            </div>
            <span className="text-xs font-bold text-muted-foreground">
              {contact?.username}
            </span>
          </div>
        )}

        <div
          className={`relative rounded-2xl px-4 py-3 shadow-lg border backdrop-blur-sm ${
            isOwn
              ? 'bg-gradient-to-br from-primary to-primary/80 text-primary-foreground rounded-br-md border-primary/20'
              : 'bg-gradient-to-br from-card to-card/80 border-border/50 rounded-bl-md'
          } ${isFirstInGroup ? (isOwn ? 'rounded-tr-2xl' : 'rounded-tl-2xl') : ''}`}
        >
          {renderMessageContent()}

          {/* Message Reactions */}
          {message.reactions && message.reactions.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {message.reactions.map((reaction) => (
                <motion.button
                  key={reaction.emoji}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
                    reaction.users.includes(user.id)
                      ? 'bg-primary/20 text-primary border border-primary/30'
                      : 'bg-muted/50 text-muted-foreground border border-border/30 hover:bg-muted'
                  }`}
                  onClick={() => handleReaction(reaction.emoji)}
                >
                  <span>{reaction.emoji}</span>
                  <span>{reaction.count}</span>
                </motion.button>
              ))}
            </div>
          )}

          <div className={`flex items-center justify-between mt-2 gap-2 text-xs opacity-70 ${
            message.type === 'text' ? '' : ''
          }`}>
            <span className="font-medium">{formatTime(message.timestamp)}</span>
            {timeLeft !== null && (
              <span className="text-destructive font-bold">
                Deletes in {timeLeft}s
              </span>
            )}
            {isOwn && (
              <span className="font-medium">{message.read ? '✓✓' : '✓'}</span>
            )}
            {message.isPinned && (
              <Pin className="w-3 h-3 text-yellow-500" />
            )}
          </div>
        </div>
      </div>

      {/* Message Actions */}
      {showActions && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`flex items-center gap-1 ${
            isOwn ? 'order-1 mr-2' : 'order-2 ml-2'
          }`}
        >
          <Button
            variant="ghost"
            size="icon"
            className="w-7 h-7 opacity-60 hover:opacity-100 hover:bg-primary/20 transition-all duration-200"
            onClick={() => setShowReactions(!showReactions)}
          >
            <Heart className="w-3 h-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="w-7 h-7 opacity-60 hover:opacity-100 hover:bg-primary/20 transition-all duration-200"
            onClick={handleReply}
          >
            <Reply className="w-3 h-3" />
          </Button>
          {showPin && (
            <Button
              variant="ghost"
              size="icon"
              className="w-7 h-7 opacity-60 hover:opacity-100 hover:bg-primary/20 transition-all duration-200"
              onClick={handlePin}
            >
              <Pin className="w-3 h-3" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="w-7 h-7 opacity-60 hover:opacity-100 hover:bg-primary/20 transition-all duration-200"
            onClick={() => toast({
              title: "🚧 Message Options",
              description: "Message options aren't implemented yet—but don't worry! You can request them in your next prompt! 🚀"
            })}
          >
            <MoreHorizontal className="w-3 h-3" />
          </Button>
        </motion.div>
      )}

      {/* Quick Reactions */}
      {showReactions && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 10 }}
          className={`absolute ${isOwn ? 'right-0' : 'left-0'} top-0 -mt-12 bg-card border border-border rounded-lg p-2 shadow-xl backdrop-blur-sm z-10`}
        >
          <div className="flex gap-1">
            {quickReactions.map((emoji) => (
              <Button
                key={emoji}
                variant="ghost"
                size="icon"
                className="w-8 h-8 hover:bg-primary/20 transition-all duration-200"
                onClick={() => handleReaction(emoji)}
              >
                {emoji}
              </Button>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
