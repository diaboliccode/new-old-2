import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { Upload, Image, File, Video } from 'lucide-react';

export default function FileUpload({ onFileSelect }) {
  const fileInputRef = useRef(null);

  const handleFileSelect = (type) => {
    const input = document.createElement('input');
    input.type = 'file';
    
    switch (type) {
      case 'image':
        input.accept = 'image/*';
        break;
      case 'video':
        input.accept = 'video/*';
        break;
      case 'document':
        input.accept = '.pdf,.doc,.docx,.txt,.xlsx,.pptx';
        break;
      default:
        input.accept = '*/*';
    }

    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        if (file.size > 10 * 1024 * 1024) { // 10MB limit
          toast({
            title: "File Too Large",
            description: "Please select a file smaller than 10MB",
            variant: "destructive"
          });
          return;
        }

        // Create preview URL for images
        let previewUrl = null;
        if (file.type.startsWith('image/')) {
          previewUrl = URL.createObjectURL(file);
        }

        onFileSelect({
          ...file,
          previewUrl,
          type: file.type.startsWith('image/') ? 'image' : 
                file.type.startsWith('video/') ? 'video' : 'document'
        });
      }
    };

    input.click();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="bg-card border border-border rounded-lg p-3"
    >
      <div className="grid grid-cols-3 gap-2">
        <Button
          variant="ghost"
          className="flex flex-col items-center gap-2 h-auto py-3"
          onClick={() => handleFileSelect('image')}
        >
          <Image className="w-6 h-6" />
          <span className="text-xs">Photo</span>
        </Button>
        
        <Button
          variant="ghost"
          className="flex flex-col items-center gap-2 h-auto py-3"
          onClick={() => handleFileSelect('video')}
        >
          <Video className="w-6 h-6" />
          <span className="text-xs">Video</span>
        </Button>
        
        <Button
          variant="ghost"
          className="flex flex-col items-center gap-2 h-auto py-3"
          onClick={() => handleFileSelect('document')}
        >
          <File className="w-6 h-6" />
          <span className="text-xs">Document</span>
        </Button>
      </div>
    </motion.div>
  );
}