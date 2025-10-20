"use client";

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { FileText } from "lucide-react";
import { 
  ContentResponseDto, 
  CreateContentRequest, 
  UpdateContentRequest 
} from "@/lib/types/aisam-types";
import { ContentCard } from "./content-card";
import { ContentModal } from "./content-modal";

interface ContentListProps {
  contents: ContentResponseDto[];
  onEdit?: (contentId: string, data: UpdateContentRequest) => Promise<void>;
  onCreate?: (data: CreateContentRequest) => Promise<void>;
  onDelete?: (contentId: string) => Promise<void>;
  onSubmit?: (contentId: string) => Promise<void>;
  onPublish?: (contentId: string, integrationId: string) => Promise<void>;
  isProcessing?: boolean;
  emptyMessage?: string;
  emptyDescription?: string;
  brands?: Array<{ id: string; name: string }>;
  products?: Array<{ id: string; name: string; brandId: string }>;
  userId?: string;
}

export function ContentList({
  contents,
  onEdit,
  onCreate,
  onDelete,
  onSubmit,
  onPublish,
  isProcessing = false,
  emptyMessage = "No content found",
  emptyDescription = "There is no content to display",
  brands = [],
  products = [],
  userId = 'current-user-id'
}: ContentListProps) {
  const [selectedContent, setSelectedContent] = useState<ContentResponseDto | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const handleView = (content: ContentResponseDto) => {
    setSelectedContent(content);
    setIsEditing(false);
  };

  const handleEdit = (content: ContentResponseDto) => {
    setSelectedContent(content);
    setIsEditing(true);
  };

  const handleCreate = () => {
    setSelectedContent(null);
    setIsCreating(true);
  };

  const handleCloseModal = () => {
    setSelectedContent(null);
    setIsEditing(false);
    setIsCreating(false);
  };

  const handleSave = async (data: UpdateContentRequest) => {
    if (selectedContent && onEdit) {
      await onEdit(selectedContent.id, data);
      handleCloseModal();
    }
  };

  const handleCreateContent = async (data: CreateContentRequest) => {
    if (onCreate) {
      await onCreate(data);
      handleCloseModal();
    }
  };

  const handleSubmitContent = async (contentId: string) => {
    if (onSubmit) {
      await onSubmit(contentId);
      handleCloseModal();
    }
  };

  const handlePublishContent = async (contentId: string, integrationId: string) => {
    if (onPublish) {
      await onPublish(contentId, integrationId);
      handleCloseModal();
    }
  };

  if (contents.length === 0) {
    return (
      <>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">{emptyMessage}</h3>
              <p className="text-muted-foreground">{emptyDescription}</p>
            </div>
          </CardContent>
        </Card>

        <ContentModal
          content={null}
          isEditing={true}
          open={isCreating}
          onOpenChange={setIsCreating}
          onCreate={handleCreateContent}
          isProcessing={isProcessing}
          brands={brands}
          products={products}
          userId={userId}
        />
      </>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {contents.map((content) => (
          <ContentCard
            key={content.id}
            content={content}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={onDelete}
            onSubmit={onSubmit}
            onPublish={onPublish}
            isProcessing={isProcessing}
          />
        ))}
      </div>

      <ContentModal
        content={selectedContent}
        isEditing={isEditing}
        open={!!selectedContent}
        onOpenChange={(open) => !open && handleCloseModal()}
        onSave={handleSave}
        onCreate={handleCreateContent}
        onSubmit={handleSubmitContent}
        onPublish={handlePublishContent}
        isProcessing={isProcessing}
        brands={brands}
        products={products}
        userId={userId}
      />
    </>
  );
}