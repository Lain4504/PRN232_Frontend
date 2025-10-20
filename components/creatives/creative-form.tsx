"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Upload,
  X,
  AlertCircle,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { useUpdateCreative } from "@/hooks/use-creatives";
import { useFileUpload } from "@/hooks/use-file-upload";
import { updateCreativeSchema, type UpdateCreativeFormData } from "@/lib/validators/creative-schemas";
import { CREATIVE_TYPES, CREATIVE_FILE_LIMITS } from "@/lib/types/creatives";
import type { AdCreativeResponse } from "@/lib/types/creatives";
import { toast } from "sonner";

interface CreativeFormProps {
  creative: AdCreativeResponse;
  onSuccess: () => void;
  onCancel: () => void;
}

export function CreativeForm({ creative, onSuccess, onCancel }: CreativeFormProps) {
  const [selectedTags, setSelectedTags] = useState<string[]>(creative.tags || []);
  const [tagInput, setTagInput] = useState("");
  
  const updateMutation = useUpdateCreative();
  const fileUpload = useFileUpload({
    onSuccess: () => {
      toast.success("File uploaded successfully");
    },
    onError: (error) => {
      toast.error(error);
    }
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset
  } = useForm<UpdateCreativeFormData>({
    resolver: zodResolver(updateCreativeSchema),
    defaultValues: {
      id: creative.id,
      name: creative.name,
      type: creative.type,
      content: creative.content || "",
      tags: creative.tags || [],
      isActive: creative.isActive
    }
  });

  const watchedType = watch("type");

  useEffect(() => {
    setSelectedTags(creative.tags || []);
    setValue("tags", creative.tags || []);
  }, [creative.tags, setValue]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && watchedType) {
      fileUpload.uploadFile(file, watchedType as 'IMAGE' | 'VIDEO' | 'CAROUSEL' | 'TEXT' | 'GIF' | 'STORY');
      setValue("mediaFile", file);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file && watchedType) {
      fileUpload.uploadFile(file, watchedType as 'IMAGE' | 'VIDEO' | 'CAROUSEL' | 'TEXT' | 'GIF' | 'STORY');
      setValue("mediaFile", file);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const addTag = () => {
    if (tagInput.trim() && !selectedTags.includes(tagInput.trim())) {
      const newTags = [...selectedTags, tagInput.trim()];
      setSelectedTags(newTags);
      setValue("tags", newTags);
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    const newTags = selectedTags.filter(tag => tag !== tagToRemove);
    setSelectedTags(newTags);
    setValue("tags", newTags);
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === "Enter") {
      event.preventDefault();
      addTag();
    }
  };

  const onSubmit = async (data: UpdateCreativeFormData) => {
    try {
      await updateMutation.mutateAsync(data);
      onSuccess();
    } catch (error) {
      console.error("Update creative error:", error);
    }
  };

  const getFileRequirements = (type: string) => {
    const limits = CREATIVE_FILE_LIMITS[type as keyof typeof CREATIVE_FILE_LIMITS];
    if (!limits) return null;
    
    return {
      maxSize: Math.round(limits.maxSize / (1024 * 1024)),
      formats: limits.formats.join(", ")
    };
  };

  const requirements = watchedType ? getFileRequirements(watchedType) : null;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Creative Type Selection */}
      <div className="space-y-2">
        <Label htmlFor="type">Creative Type</Label>
        <Select
          value={watchedType || ""}
          onValueChange={(value) => {
            setValue("type", value as 'IMAGE' | 'VIDEO' | 'CAROUSEL' | 'TEXT' | 'GIF' | 'STORY');
            fileUpload.reset();
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select creative type" />
          </SelectTrigger>
          <SelectContent>
            {CREATIVE_TYPES.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                <div className="flex items-center gap-2">
                  {type.label}
                  <span className="text-xs text-muted-foreground">
                    - {type.description}
                  </span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.type && (
          <p className="text-sm text-destructive">{errors.type.message}</p>
        )}
      </div>

      {/* File Upload */}
      {watchedType && ['IMAGE', 'VIDEO', 'GIF'].includes(watchedType) && (
        <div className="space-y-2">
          <Label>Media File (Optional - leave empty to keep current)</Label>
          <div
            className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center hover:border-muted-foreground/50 transition-colors cursor-pointer"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={() => document.getElementById('file-input')?.click()}
          >
            <input
              id="file-input"
              type="file"
              className="hidden"
              accept={requirements?.formats}
              onChange={handleFileSelect}
            />
            
            {fileUpload.file ? (
              <div className="space-y-4">
                <div className="flex items-center justify-center">
                  {fileUpload.preview ? (
                    <img
                      src={fileUpload.preview}
                      alt="Preview"
                      className="max-h-32 max-w-32 object-cover rounded"
                    />
                  ) : (
                    <Upload className="h-12 w-12 text-muted-foreground" />
                  )}
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">{fileUpload.file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(fileUpload.file.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                  {fileUpload.isUploading && (
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${fileUpload.progress}%` }}
                      />
                    </div>
                  )}
                  {fileUpload.error && (
                    <div className="flex items-center gap-2 text-destructive text-sm">
                      <AlertCircle className="h-4 w-4" />
                      {fileUpload.error}
                    </div>
                  )}
                  {!fileUpload.error && !fileUpload.isUploading && (
                    <div className="flex items-center gap-2 text-green-600 text-sm">
                      <CheckCircle className="h-4 w-4" />
                      File ready
                    </div>
                  )}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileUpload.removeFile();
                    setValue("mediaFile", undefined);
                  }}
                >
                  <X className="h-4 w-4 mr-1" />
                  Remove
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <Upload className="h-12 w-12 text-muted-foreground mx-auto" />
                <div>
                  <p className="text-sm font-medium">Click to upload or drag and drop</p>
                  <p className="text-xs text-muted-foreground">
                    {requirements && `Max ${requirements.maxSize}MB, ${requirements.formats}`}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Current file: {creative.mediaUrl ? "Uploaded" : "None"}
                  </p>
                </div>
              </div>
            )}
          </div>
          {errors.mediaFile && (
            <p className="text-sm text-destructive">{errors.mediaFile.message as string}</p>
          )}
        </div>
      )}

      {/* Creative Name */}
      <div className="space-y-2">
        <Label htmlFor="name">Creative Name</Label>
        <Input
          id="name"
          {...register("name")}
          placeholder="Enter creative name"
          className="h-10 sm:h-9"
        />
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name.message}</p>
        )}
      </div>

      {/* Content (for TEXT type) */}
      {watchedType === 'TEXT' && (
        <div className="space-y-2">
          <Label htmlFor="content">Content</Label>
          <Textarea
            id="content"
            {...register("content")}
            placeholder="Enter creative content"
            rows={6}
            className="min-h-[120px] sm:min-h-[100px]"
          />
          {errors.content && (
            <p className="text-sm text-destructive">{errors.content.message}</p>
          )}
        </div>
      )}

      {/* Tags */}
      <div className="space-y-2">
        <Label>Tags</Label>
        <div className="flex flex-col sm:flex-row gap-2">
          <Input
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Add a tag"
            maxLength={50}
            className="h-10 sm:h-9"
          />
          <Button type="button" variant="outline" onClick={addTag} className="h-10 sm:h-9">
            Add
          </Button>
        </div>
        {selectedTags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {selectedTags.map((tag) => (
              <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                {tag}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => removeTag(tag)}
                />
              </Badge>
            ))}
          </div>
        )}
        {errors.tags && (
          <p className="text-sm text-destructive">{errors.tags.message}</p>
        )}
      </div>

      {/* Active Status */}
      <div className="flex items-center space-x-2">
        <Switch
          id="isActive"
          checked={watch("isActive")}
          onCheckedChange={(checked) => setValue("isActive", checked)}
        />
        <Label htmlFor="isActive">Active</Label>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} className="w-full sm:w-auto h-10 sm:h-9">
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={updateMutation.isPending || fileUpload.isUploading}
          className="w-full sm:w-auto h-10 sm:h-9"
        >
          {updateMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Updating...
            </>
          ) : (
            <>
              <CheckCircle className="mr-2 h-4 w-4" />
              Update Creative
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
