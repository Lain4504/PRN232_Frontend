"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { X, Plus, Tag } from "lucide-react";
import { COMMON_CREATIVE_TAGS } from "@/lib/types/creatives";

interface CreativeTagsProps {
  tags: string[];
  onTagsChange: (tags: string[]) => void;
  maxTags?: number;
  showCommonTags?: boolean;
  disabled?: boolean;
}

export function CreativeTags({ 
  tags, 
  onTagsChange, 
  maxTags = 10,
  showCommonTags = true,
  disabled = false
}: CreativeTagsProps) {
  const [tagInput, setTagInput] = useState("");

  const addTag = (tag: string) => {
    const trimmedTag = tag.trim();
    if (trimmedTag && !tags.includes(trimmedTag) && tags.length < maxTags) {
      onTagsChange([...tags, trimmedTag]);
    }
  };

  const removeTag = (tagToRemove: string) => {
    onTagsChange(tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === "Enter") {
      event.preventDefault();
      addTag(tagInput);
      setTagInput("");
    }
  };

  const handleAddClick = () => {
    addTag(tagInput);
    setTagInput("");
  };

  return (
    <div className="space-y-4">
      {/* Tag Input */}
      <div className="space-y-2">
        <Label htmlFor="tag-input">Tags</Label>
        <div className="flex gap-2">
          <Input
            id="tag-input"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Add a tag"
            maxLength={50}
            disabled={disabled || tags.length >= maxTags}
          />
          <Button
            type="button"
            variant="outline"
            onClick={handleAddClick}
            disabled={disabled || !tagInput.trim() || tags.length >= maxTags}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        {tags.length >= maxTags && (
          <p className="text-xs text-muted-foreground">
            Maximum {maxTags} tags allowed
          </p>
        )}
      </div>

      {/* Current Tags */}
      {tags.length > 0 && (
        <div className="space-y-2">
          <Label className="text-sm font-medium">Current Tags ({tags.length})</Label>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                <Tag className="h-3 w-3" />
                {tag}
                {!disabled && (
                  <X
                    className="h-3 w-3 cursor-pointer hover:text-destructive"
                    onClick={() => removeTag(tag)}
                  />
                )}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Common Tags */}
      {showCommonTags && (
        <div className="space-y-2">
          <Label className="text-sm font-medium">Common Tags</Label>
          <div className="flex flex-wrap gap-2">
            {COMMON_CREATIVE_TAGS.map((tag) => (
              <Badge
                key={tag}
                variant="outline"
                className={`cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors ${
                  tags.includes(tag) ? 'bg-primary text-primary-foreground' : ''
                }`}
                onClick={() => {
                  if (!disabled && !tags.includes(tag) && tags.length < maxTags) {
                    addTag(tag);
                  }
                }}
              >
                {tag}
              </Badge>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            Click on a common tag to add it to your creative
          </p>
        </div>
      )}
    </div>
  );
}
