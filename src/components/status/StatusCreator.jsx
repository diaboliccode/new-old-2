
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';
import { Camera, Type, Palette, Clock, X } from 'lucide-react';

export default function StatusCreator({ isOpen, onClose, onCreateStatus }) {
  const [statusText, setStatusText] = useState('');
  const [backgroundColor, setBackgroundColor] = useState('#1a73e8');
  const [textColor, setTextColor] = useState('#ffffff');
  const [fontSize, setFontSize] = useState('text-lg');

  const backgroundColors = [
    '#1a73e8', '#34a853', '#ea4335', '#fbbc04',
    '#9c27b0', '#ff5722', '#607d8b', '#795548'
  ];

  const fontSizes = [
    { label: 'Small', value: 'text-sm' },
    { label: 'Medium', value: 'text-lg' },
    { label: 'Large', value: 'text-xl' },
    { label: 'Extra Large', value: 'text-2xl' }
  ];

  const handleCreate = () => {
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
      content: statusText,
      backgroundColor,
      textColor,
      fontSize,
      timestamp: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    };

    onCreateStatus(status);
    setStatusText('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-card border border-border rounded-lg w-full max-w-md"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3 className="text-lg font-semibold">Create Status</h3>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Preview */}
        <div className="p-4">
          <div 
            className="w-full h-32 rounded-lg flex items-center justify-center p-4 mb-4"
            style={{ backgroundColor }}
          >
            <p 
              className={`${fontSize} font-medium text-center`}
              style={{ color: textColor }}
            >
              {statusText || 'Your status text will appear here...'}
            </p>
          </div>

          {/* Text Input */}
          <Input
            placeholder="What's on your mind?"
            value={statusText}
            onChange={(e) => setStatusText(e.target.value)}
            className="mb-4"
            maxLength={200}
          />

          {/* Background Colors */}
          <div className="mb-4">
            <label className="text-sm font-medium mb-2 block">Background Color</label>
            <div className="flex gap-2">
              {backgroundColors.map((color) => (
                <button
                  key={color}
                  className={`w-8 h-8 rounded-full border-2 ${
                    backgroundColor === color ? 'border-primary' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => setBackgroundColor(color)}
                />
              ))}
            </div>
          </div>

          {/* Font Size */}
          <div className="mb-4">
            <label className="text-sm font-medium mb-2 block">Font Size</label>
            <div className="grid grid-cols-2 gap-2">
              {fontSizes.map((size) => (
                <Button
                  key={size.value}
                  variant={fontSize === size.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFontSize(size.value)}
                >
                  {size.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => toast({
                title: "🚧 Photo Status",
                description: "Photo status creation isn't implemented yet—but don't worry! You can request it in your next prompt! 🚀"
              })}
            >
              <Camera className="w-4 h-4 mr-2" />
              Photo
            </Button>
            <Button className="flex-1" onClick={handleCreate}>
              Share Status
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
