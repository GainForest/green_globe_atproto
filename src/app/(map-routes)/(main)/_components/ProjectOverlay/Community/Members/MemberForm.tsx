"use client";
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserCircle2, Upload, X } from "lucide-react";
import { CommunityMember } from "./store/types";

interface MemberFormProps {
  isOpen: boolean;
  onClose: () => void;
  member?: CommunityMember | null;
  onSave: (member: Partial<CommunityMember>) => Promise<void>;
  isLoading?: boolean;
}

const MemberForm: React.FC<MemberFormProps> = ({
  isOpen,
  onClose,
  member,
  onSave,
  isLoading = false
}) => {
  const [formData, setFormData] = useState<Partial<CommunityMember>>({
    first_name: "",
    last_name: "",
    title: "",
    bio: "",
    profile_image_url: null,
    display_order: null,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize form data when editing an existing member
  useEffect(() => {
    if (member) {
      setFormData({
        first_name: member.first_name || "",
        last_name: member.last_name || "",
        title: member.title || "",
        bio: member.bio || "",
        profile_image_url: member.profile_image_url,
        display_order: member.display_order,
      });
    } else {
      // Reset form for new member
      setFormData({
        first_name: "",
        last_name: "",
        title: "",
        bio: "",
        profile_image_url: null,
        display_order: null,
      });
    }
    setErrors({});
  }, [member, isOpen]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Required field validations
    if (!formData.first_name?.trim()) {
      newErrors.first_name = "First name is required";
    } else if (formData.first_name.trim().length > 50) {
      newErrors.first_name = "First name must be less than 50 characters";
    }

    if (!formData.last_name?.trim()) {
      newErrors.last_name = "Last name is required";
    } else if (formData.last_name.trim().length > 50) {
      newErrors.last_name = "Last name must be less than 50 characters";
    }

    if (!formData.title?.trim()) {
      newErrors.title = "Title/Role is required";
    } else if (formData.title.trim().length > 100) {
      newErrors.title = "Title must be less than 100 characters";
    }

    // Optional field validations
    if (formData.bio && formData.bio.length > 500) {
      newErrors.bio = "Bio must be less than 500 characters";
    }

    if (formData.display_order !== null && formData.display_order !== undefined) {
      const order = Number(formData.display_order);
      if (isNaN(order) || order < 1 || order > 999) {
        newErrors.display_order = "Display order must be a number between 1 and 999";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error("Error saving member:", error);
      // Error handling will be done in the parent component
    }
  };

  const handleInputChange = (field: keyof CommunityMember, value: string | number | null) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // In a real app, you'd upload to a server and get back a URL
      // For now, we'll use a placeholder
      const reader = new FileReader();
      reader.onload = (event) => {
        setFormData(prev => ({
          ...prev,
          profile_image_url: event.target?.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setFormData(prev => ({ ...prev, profile_image_url: null }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {member ? "Edit Community Member" : "Add Community Member"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profile Image */}
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <Avatar className="w-20 h-20">
                <AvatarImage src={formData.profile_image_url || ""} />
                <AvatarFallback>
                  <UserCircle2 className="w-12 h-12 opacity-50" />
                </AvatarFallback>
              </Avatar>
              {formData.profile_image_url && (
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                  onClick={removeImage}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
            <div>
              <Label htmlFor="profile-image" className="cursor-pointer">
                <div className="flex items-center gap-2 px-3 py-2 border border-input rounded-md hover:bg-accent">
                  <Upload className="h-4 w-4" />
                  <span className="text-sm">
                    {formData.profile_image_url ? "Change Image" : "Upload Image"}
                  </span>
                </div>
                <Input
                  id="profile-image"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                />
              </Label>
            </div>
          </div>

          {/* Name Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="first_name">First Name *</Label>
              <Input
                id="first_name"
                value={formData.first_name || ""}
                onChange={(e) => handleInputChange("first_name", e.target.value)}
                className={errors.first_name ? "border-red-500" : ""}
                maxLength={50}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{errors.first_name && <span className="text-red-500">{errors.first_name}</span>}</span>
                <span>{(formData.first_name || "").length}/50</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="last_name">Last Name *</Label>
              <Input
                id="last_name"
                value={formData.last_name || ""}
                onChange={(e) => handleInputChange("last_name", e.target.value)}
                className={errors.last_name ? "border-red-500" : ""}
                maxLength={50}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{errors.last_name && <span className="text-red-500">{errors.last_name}</span>}</span>
                <span>{(formData.last_name || "").length}/50</span>
              </div>
            </div>
          </div>

          {/* Title/Role */}
          <div className="space-y-2">
            <Label htmlFor="title">Title/Role *</Label>
            <Input
              id="title"
              value={formData.title || ""}
              onChange={(e) => handleInputChange("title", e.target.value)}
              placeholder="e.g., Community Leader, Farmer, Conservationist"
              className={errors.title ? "border-red-500" : ""}
              maxLength={100}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{errors.title && <span className="text-red-500">{errors.title}</span>}</span>
              <span>{(formData.title || "").length}/100</span>
            </div>
          </div>

          {/* Display Order */}
          <div className="space-y-2">
            <Label htmlFor="display_order">Display Order</Label>
            <Input
              id="display_order"
              type="number"
              value={formData.display_order || ""}
              onChange={(e) => handleInputChange("display_order", e.target.value ? parseInt(e.target.value) : null)}
              placeholder="Optional: Lower numbers appear first"
              min="1"
              max="999"
              className={errors.display_order ? "border-red-500" : ""}
            />
            <div className="text-xs text-muted-foreground">
              {errors.display_order ? (
                <span className="text-red-500">{errors.display_order}</span>
              ) : (
                "Optional: Controls the order members appear in the list"
              )}
            </div>
          </div>

          {/* Bio */}
          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={formData.bio || ""}
              onChange={(e) => handleInputChange("bio", e.target.value)}
              placeholder="Tell us about this community member's background, experience, and contributions..."
              rows={4}
              maxLength={500}
              className={errors.bio ? "border-red-500" : ""}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <div>
                {errors.bio ? (
                  <span className="text-red-500">{errors.bio}</span>
                ) : (
                  "Optional: Share information about their environmental work, local knowledge, or community role"
                )}
              </div>
              <span>{(formData.bio || "").length}/500</span>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : (member ? "Update Member" : "Add Member")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default MemberForm;
