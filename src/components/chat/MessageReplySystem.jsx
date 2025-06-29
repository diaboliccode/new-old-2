import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';
import { Reply, X, Send, Quote } from 'lucide-react';

export default function MessageReplySystem({ 
  replyingTo, 
  onSendReply, 
  onCancelReply,
  onQuoteMessage 
}) {
  const [replyText, setReplyText] = useState('');

  const handleSendReply = (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    onSendReply({
      content: replyText.trim(),
      replyTo: replyingTo.id,
      originalMessage: replyingTo.content,
      originalSender: replyingTo.senderName,
      type: 'reply'
    });

    setReplyText('');
    onCancelReply();

    toast({
      title: "Reply Sent! 💬",
      description: `Replied to ${replyingTo.senderName}`
    });
  };

  const handleQuote = () => {
    onQuoteMessage(replyingTo);
    onCancelReply();
  };

  if (!replyingTo) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="border-t border-border bg-gradient-to-r from-card/80 to-card/60 backdrop-blur-sm"
    >
      {/* Reply Preview */}
      <div className="p-3 border-b border-border/50">
        <div className="flex items-start gap-3">
          <Reply className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-medium text-primary">Replying to</span>
              <span className="text-xs text-muted-foreground">{replyingTo.senderName}</span>
            </div>
            <div className="bg-muted/50 rounded-lg p-3 border-l-4 border-primary/50">
              <p className="text-sm text-foreground line-clamp-3">
                {replyingTo.content}
              </p>
              {replyingTo.type !== 'text' && (
                <span className="text-xs text-muted-foreground italic">
                  {replyingTo.type === 'image' && '📷 Image'}
                  {replyingTo.type === 'file' && '📎 File'}
                  {replyingTo.type === 'voice' && '🎤 Voice message'}
                  {replyingTo.type === 'location' && '📍 Location'}
                </span>
              )}
            </div>
          </div>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="w-6 h-6"
              onClick={handleQuote}
              title="Quote message"
            >
              <Quote className="w-3 h-3" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="w-6 h-6"
              onClick={onCancelReply}
              title="Cancel reply"
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </div>

      {/* Reply Input */}
      <div className="p-3">
        <form onSubmit={handleSendReply} className="flex gap-2">
          <Input
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder={`Reply to ${replyingTo.senderName}...`}
            className="flex-1 bg-background/50 border-border/50 focus:border-primary/50"
            autoFocus
          />
          <Button 
            type="submit" 
            disabled={!replyText.trim()}
            size="icon"
            className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </motion.div>
  );
}