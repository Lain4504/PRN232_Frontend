"use client"

import React, { useState } from 'react'
import { TeamContentList } from '@/components/teams/team-content-list'
import { ContentModal } from '@/components/contents/content-modal'
import { Button } from '@/components/ui/button'
import { Bot, FileText } from 'lucide-react'
import { useParams } from 'next/navigation'
import { CreateContentRequest, ContentResponseDto, UpdateContentRequest } from '@/lib/types/aisam-types'
import { useTeamBrands } from '@/hooks/use-team-brands'
import { useProducts } from '@/hooks/use-products'
import { useCreateTeamContent } from '@/hooks/use-team-content'
import { useUpdateContent, useSubmitContent, usePublishContent } from '@/hooks/use-contents'
import { toast } from 'sonner'

export default function TeamContentsPage() {
  const params = useParams()
  const teamId = params.teamId as string
  const [isContentModalOpen, setIsContentModalOpen] = useState(false)
  const [selectedContent, setSelectedContent] = useState<ContentResponseDto | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  
  // Load team brands
  const { data: teamBrands = [], isLoading: brandsLoading } = useTeamBrands(teamId)
  
  // Load products for all team brands
  const { data: allProducts = [] } = useProducts()
  
  // Filter products by team brands
  const teamProducts = allProducts.filter(product => 
    teamBrands.some(brand => brand.id === product.brandId)
  )

  // API hooks
  const createContentMutation = useCreateTeamContent(teamId)
  const updateContentMutation = useUpdateContent(selectedContent?.id || '')
  const submitContentMutation = useSubmitContent(selectedContent?.id || '')
  const publishContentMutation = usePublishContent(selectedContent?.id || '')

  const handleCreateManual = () => {
    setSelectedContent(null)
    setIsEditing(false)
    setIsContentModalOpen(true)
  }

  const handleCreateWithAI = () => {
    // Navigate to AI content creation page
    window.location.href = `/team/${teamId}/contents/new`
  }

  const handleEditContent = (content: ContentResponseDto) => {
    setSelectedContent(content)
    setIsEditing(true)
    setIsContentModalOpen(true)
  }

  const handleViewContent = (content: ContentResponseDto) => {
    setSelectedContent(content)
    setIsEditing(false)
    setIsContentModalOpen(true)
  }

  const handleSaveContent = async (data: UpdateContentRequest) => {
    try {
      if (selectedContent) {
        await updateContentMutation.mutateAsync(data)
        toast.success('Content updated successfully')
        setIsContentModalOpen(false)
      }
    } catch (error) {
      console.error('Error updating content:', error)
      toast.error('Failed to update content')
    }
  }

  const handleCreateContent = async (data: CreateContentRequest) => {
    try {
      await createContentMutation.mutateAsync(data)
      toast.success('Content created successfully')
      setIsContentModalOpen(false)
    } catch (error) {
      console.error('Error creating content:', error)
      toast.error('Failed to create content')
    }
  }

  const handleSubmitContent = async (contentId: string) => {
    try {
      await submitContentMutation.mutateAsync()
      toast.success('Content submitted for approval')
    } catch (error) {
      console.error('Error submitting content:', error)
      toast.error('Failed to submit content for approval')
    }
  }

  const handlePublishContent = async (contentId: string, integrationId: string) => {
    try {
      await publishContentMutation.mutateAsync(integrationId)
      toast.success('Content published successfully')
    } catch (error) {
      console.error('Error publishing content:', error)
      toast.error('Failed to publish content')
    }
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="space-y-6 lg:space-y-8 p-4 lg:p-6 xl:p-8 bg-background">
        {/* Header */}
        <div className="space-y-3">
          <div>
            <h1 className="text-2xl font-bold">Team Content</h1>
            <p className="text-muted-foreground">
              Manage content for your team
            </p>
          </div>
        </div>

        {/* Content Management */}
        <div className="space-y-6">
          {/* Create Content Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              onClick={handleCreateManual}
              variant="outline"
              className="flex items-center justify-center gap-2 w-full sm:w-auto"
            >
              <FileText className="h-4 w-4" />
              Create Manual Content
            </Button>
            <Button 
              onClick={handleCreateWithAI}
              className="flex items-center justify-center gap-2 w-full sm:w-auto"
            >
              <Bot className="h-4 w-4" />
              Create with AI
            </Button>
          </div>
          
          {/* Content List Component */}
          <TeamContentList 
            onEdit={handleEditContent}
            onView={handleViewContent}
          />
        </div>

        {/* Content Modal */}
        <ContentModal
          content={selectedContent}
          isEditing={isEditing}
          open={isContentModalOpen}
          onOpenChange={setIsContentModalOpen}
          onSave={handleSaveContent}
          onCreate={handleCreateContent}
          onSubmit={handleSubmitContent}
          onPublish={handlePublishContent}
          isProcessing={createContentMutation.isPending || updateContentMutation.isPending || submitContentMutation.isPending || publishContentMutation.isPending}
          brands={teamBrands.map(brand => ({ id: brand.id, name: brand.name }))}
          products={teamProducts.map(product => ({ 
            id: product.id, 
            name: product.name, 
            brandId: product.brandId 
          }))}
          userId="current-user-id" // TODO: Get from auth context
        />
      </div>
    </div>
  )
}

