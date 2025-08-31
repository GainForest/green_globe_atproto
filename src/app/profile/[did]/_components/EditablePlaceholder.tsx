"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Edit3, Check, X } from 'lucide-react';

interface EditablePlaceholderProps {
  value?: string;
  placeholder: string;
  onSave: (value: string) => Promise<void>;
  isOwner: boolean;
  type?: 'text' | 'textarea' | 'url';
  icon?: React.ReactNode;
  title?: string;
  className?: string;
}

export default function EditablePlaceholder({
  value,
  placeholder,
  onSave,
  isOwner,
  type = 'textarea',
  icon,
  title,
  className = '',
}: EditablePlaceholderProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value || '');
  const [isSaving, setIsSaving] = useState(false);



  const handleSave = async () => {
    if (editValue.trim() === value?.trim()) {
      setIsEditing(false);
      return;
    }

    try {
      setIsSaving(true);
      await onSave(editValue.trim());
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to save:', error);
      // Optionally show error toast here
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditValue(value || '');
    setIsEditing(false);
  };

  const handleEdit = () => {
    setEditValue(value || '');
    setIsEditing(true);
  };

  if (isEditing) {
    return (
      <div className={`space-y-3 ${className}`}>
        {title && (
          <div className="flex items-center gap-2">
            {icon}
            <h3 className="font-medium">{title}</h3>
          </div>
        )}
        {type === 'textarea' ? (
          <Textarea
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            placeholder={placeholder}
            className="min-h-[100px] resize-none"
            autoFocus
          />
        ) : (
          <Input
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            placeholder={placeholder}
            type={type === 'url' ? 'url' : 'text'}
            autoFocus
          />
        )}
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={handleSave}
            disabled={isSaving}
          >
            <Check className="w-4 h-4 mr-1" />
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleCancel}
            disabled={isSaving}
          >
            <X className="w-4 h-4 mr-1" />
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  // Display mode
  if (value) {
    return (
      <div className={`group relative ${className}`}>
        {title && (
          <div className="flex items-center gap-2 mb-2">
            {icon}
            <h3 className="font-medium">{title}</h3>
          </div>
        )}
        <div className="whitespace-pre-wrap leading-relaxed">
          {value}
        </div>
        {isOwner && (
          <Button
            size="sm"
            variant="ghost"
            className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={handleEdit}
          >
            <Edit3 className="w-4 h-4" />
          </Button>
        )}
      </div>
    );
  }

  // Empty state with placeholder
  if (isOwner) {
    return (
      <div 
        className={`p-6 bg-muted/50 rounded-lg border-2 border-dashed border-muted-foreground/20 hover:border-muted-foreground/40 transition-colors cursor-pointer ${className}`}
        onClick={handleEdit}
      >
        <div className="text-center">
          {icon && (
            <div className="flex justify-center mb-3">
              {icon}
            </div>
          )}
          {title && (
            <h3 className="font-medium text-muted-foreground mb-2">{title}</h3>
          )}
          <p className="text-muted-foreground text-sm mb-3">
            {placeholder}
          </p>
          <Button variant="outline" size="sm">
            <Edit3 className="w-4 h-4 mr-2" />
            Click to add
          </Button>
        </div>
      </div>
    );
  }

  // Empty state for non-owners
  return (
    <div className={`p-6 bg-muted/50 rounded-lg ${className}`}>
      <div className="text-center">
        {icon && (
          <div className="flex justify-center mb-3 opacity-50">
            {icon}
          </div>
        )}
        {title && (
          <h3 className="font-medium text-muted-foreground mb-2">{title}</h3>
        )}
        <p className="text-muted-foreground text-sm">
          {placeholder}
        </p>
      </div>
    </div>
  );
}
