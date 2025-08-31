"use client";

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Upload, Check, X } from 'lucide-react';

interface BannerUploadProps {
  onSave: (url: string) => Promise<void>;
  currentBanner?: string;
  onCancel: () => void;
}

export default function BannerUpload({ onSave, currentBanner, onCancel }: BannerUploadProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [bannerUrl, setBannerUrl] = useState(currentBanner || '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = async () => {
    if (!bannerUrl.trim()) return;

    try {
      setIsSaving(true);
      await onSave(bannerUrl.trim());
      onCancel();
    } catch (error) {
      console.error('Failed to save banner:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // For now, we'll just show a message about file upload
      // In a real implementation, you'd upload to a service like AWS S3, Cloudinary, etc.
      alert('File upload not implemented yet. Please use a URL for now.');
      event.target.value = '';
    }
  };

  return (
    <div className="absolute inset-0 bg-black/60 flex items-center justify-center p-4">
      <div className="bg-background rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4">Update Banner</h3>
        
        <div className="space-y-4">
          {/* URL Input */}
          <div>
            <label className="text-sm font-medium mb-2 block">Banner URL</label>
            <div className="flex gap-2">
              <Input
                value={bannerUrl}
                onChange={(e) => setBannerUrl(e.target.value)}
                placeholder="https://example.com/your-banner.jpg"
                type="url"
              />
            </div>
          </div>

          {/* File Upload (placeholder) */}
          <div>
            <label className="text-sm font-medium mb-2 block">Or upload file</label>
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="w-full"
              disabled
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload File (Coming Soon)
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          {/* Preview */}
          {bannerUrl && (
            <div className="border rounded-lg overflow-hidden">
              <img
                src={bannerUrl}
                alt="Banner preview"
                className="w-full h-24 object-cover"
                onError={() => console.log('Invalid image URL')}
              />
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button
              onClick={handleSave}
              disabled={!bannerUrl.trim() || isSaving}
              className="flex-1"
            >
              <Check className="w-4 h-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save Banner'}
            </Button>
            <Button
              variant="outline"
              onClick={onCancel}
              disabled={isSaving}
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
