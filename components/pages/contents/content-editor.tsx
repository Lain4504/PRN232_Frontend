"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Save,
  Eye,
  ArrowLeft,
  Upload,
  X,
  Image as ImageIcon,
  Video,
  Type,
  Smartphone,
  Monitor,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { brandApi, productApi, contentApi } from "@/lib/mock-api";
import { Brand, Product, Content } from "@/lib/types/aisam-types";
import { toast } from "sonner";
import Link from "next/link";

interface ContentEditorProps {
  contentId?: string;
  onSave?: (content: Content) => void;
  onCancel?: () => void;
}

interface EditorForm {
  brand_id: string;
  product_id?: string;
  ad_type: 'image_text' | 'video_text' | 'text_only';
  title: string;
  text_content?: string;
  style_context_character?: string;
  image?: File;
  video?: File;
}

export function ContentEditor({ contentId, onSave, onCancel }: ContentEditorProps) {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [existingContent, setExistingContent] = useState<Content | null>(null);

  const [form, setForm] = useState<EditorForm>({
    brand_id: '',
    product_id: '',
    ad_type: 'text_only',
    title: '',
    text_content: '',
    style_context_character: '',
  });

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        // Load brands
        const brandsResponse = await brandApi.getBrands();
        if (brandsResponse.success) {
          setBrands(brandsResponse.data);
        }

        // Load products
        const productsResponse = await productApi.getProducts();
        if (productsResponse.success) {
          setProducts(productsResponse.data);
        }

        // Load existing content if editing
        if (contentId) {
          const contentsResponse = await contentApi.getContents();
          if (contentsResponse.success) {
            const content = contentsResponse.data.find(c => c.id === contentId);
            if (content) {
              setExistingContent(content);
              setForm({
                brand_id: content.brand_id,
                product_id: content.product_id || '',
                ad_type: content.ad_type,
                title: content.title,
                text_content: content.text_content || '',
                style_context_character: content.style_context_character || '',
              });

              if (content.image_url) {
                setImagePreview(content.image_url);
              }
              if (content.video_url) {
                setVideoPreview(content.video_url);
              }
            }
          }
        }
      } catch (error) {
        console.error('Failed to load data:', error);
        toast.error('Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [contentId]);

  // Auto-save functionality
  useEffect(() => {
    if (!form.title && !form.text_content) return;

    const autoSave = async () => {
      setAutoSaveStatus('saving');
      try {
        // Simulate auto-save delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        setAutoSaveStatus('saved');
        setTimeout(() => setAutoSaveStatus('idle'), 2000);
      } catch (error) {
        setAutoSaveStatus('error');
        setTimeout(() => setAutoSaveStatus('idle'), 2000);
      }
    };

    const timeoutId = setTimeout(autoSave, 2000);
    return () => clearTimeout(timeoutId);
  }, [form.title, form.text_content, form.style_context_character]);

  const handleBrandChange = (brandId: string) => {
    setForm(prev => ({ ...prev, brand_id: brandId, product_id: '' }));
    // Filter products by selected brand
    const brandProducts = products.filter(p => p.brand_id === brandId);
    setProducts(brandProducts);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setForm(prev => ({ ...prev, image: file }));
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVideoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setForm(prev => ({ ...prev, video: file }));
      const reader = new FileReader();
      reader.onload = (e) => {
        setVideoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setForm(prev => ({ ...prev, image: undefined }));
    setImagePreview(null);
  };

  const removeVideo = () => {
    setForm(prev => ({ ...prev, video: undefined }));
    setVideoPreview(null);
  };

  const handleSave = async () => {
    if (!form.brand_id || !form.title.trim()) {
      toast.error('Please select a brand and enter a title');
      return;
    }

    try {
      setSaving(true);

      const contentData = {
        brand_id: form.brand_id,
        product_id: form.product_id || undefined,
        ad_type: form.ad_type,
        title: form.title,
        text_content: form.text_content,
        style_context_character: form.style_context_character,
        image: form.image,
        video: form.video,
      };

      let response;
      if (contentId) {
        response = await contentApi.updateContent(contentId, contentData);
      } else {
        response = await contentApi.createContent(contentData);
      }

      if (response.success) {
        toast.success(`Content ${contentId ? 'updated' : 'created'} successfully!`);
        onSave?.(response.data);
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.error('Failed to save content:', error);
      toast.error('Failed to save content');
    } finally {
      setSaving(false);
    }
  };

  const getAutoSaveIcon = () => {
    switch (autoSaveStatus) {
      case 'saving':
        return <Clock className="h-3 w-3 animate-spin text-muted-foreground" />;
      case 'saved':
        return <CheckCircle className="h-3 w-3 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-3 w-3 text-red-500" />;
      default:
        return null;
    }
  };

  const getAutoSaveText = () => {
    switch (autoSaveStatus) {
      case 'saving':
        return 'Saving...';
      case 'saved':
        return 'Auto-saved';
      case 'error':
        return 'Save failed';
      default:
        return '';
    }
  };

  if (loading) {
    return (
      <div className="flex-1 space-y-6 p-6 bg-background">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading content editor...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-6 bg-background">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/contents">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Contents
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {contentId ? 'Edit Content' : 'Create Content'}
            </h1>
            <p className="text-muted-foreground">
              {contentId ? 'Modify your content details' : 'Create new content for your social media campaigns'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {getAutoSaveIcon()}
          <span className="text-sm text-muted-foreground">{getAutoSaveText()}</span>
          <Button variant="outline" onClick={onCancel || (() => window.history.back())}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                {contentId ? 'Update' : 'Save'} Content
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Editor Form */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Content Details</CardTitle>
              <CardDescription>
                Fill in the basic information for your content
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="brand">Brand *</Label>
                  <Select value={form.brand_id} onValueChange={handleBrandChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a brand" />
                    </SelectTrigger>
                    <SelectContent>
                      {brands.map((brand) => (
                        <SelectItem key={brand.id} value={brand.id}>
                          {brand.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="product">Product (Optional)</Label>
                  <Select value={form.product_id} onValueChange={(value) => setForm(prev => ({ ...prev, product_id: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a product" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">No specific product</SelectItem>
                      {products.map((product) => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="ad_type">Content Type</Label>
                <Select value={form.ad_type} onValueChange={(value: 'image_text' | 'video_text' | 'text_only') => setForm(prev => ({ ...prev, ad_type: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text_only">
                      <div className="flex items-center gap-2">
                        <Type className="h-4 w-4" />
                        Text Only
                      </div>
                    </SelectItem>
                    <SelectItem value="image_text">
                      <div className="flex items-center gap-2">
                        <ImageIcon className="h-4 w-4" />
                        Image + Text
                      </div>
                    </SelectItem>
                    <SelectItem value="video_text">
                      <div className="flex items-center gap-2">
                        <Video className="h-4 w-4" />
                        Video + Text
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  placeholder="Enter a compelling title for your content"
                  value={form.title}
                  onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Content Text</Label>
                <Textarea
                  id="content"
                  placeholder="Write your content here. Be engaging and authentic..."
                  value={form.text_content}
                  onChange={(e) => setForm(prev => ({ ...prev, text_content: e.target.value }))}
                  rows={6}
                />
                <p className="text-sm text-muted-foreground">
                  {form.text_content?.length || 0} characters
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="style">Style & Context (Optional)</Label>
                <Input
                  id="style"
                  placeholder="e.g., Professional, fun, energetic, informative..."
                  value={form.style_context_character}
                  onChange={(e) => setForm(prev => ({ ...prev, style_context_character: e.target.value }))}
                />
              </div>
            </CardContent>
          </Card>

          {/* Media Upload */}
          {(form.ad_type === 'image_text' || form.ad_type === 'video_text') && (
            <Card>
              <CardHeader>
                <CardTitle>Media</CardTitle>
                <CardDescription>
                  Upload {form.ad_type === 'image_text' ? 'an image' : 'a video'} for your content
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {form.ad_type === 'image_text' ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <Button variant="outline" asChild>
                        <label className="cursor-pointer">
                          <Upload className="mr-2 h-4 w-4" />
                          Upload Image
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                          />
                        </label>
                      </Button>
                      {imagePreview && (
                        <Button variant="outline" size="sm" onClick={removeImage}>
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    {imagePreview && (
                      <div className="relative">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-full max-w-md h-auto rounded-lg border"
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <Button variant="outline" asChild>
                        <label className="cursor-pointer">
                          <Upload className="mr-2 h-4 w-4" />
                          Upload Video
                          <input
                            type="file"
                            accept="video/*"
                            onChange={handleVideoUpload}
                            className="hidden"
                          />
                        </label>
                      </Button>
                      {videoPreview && (
                        <Button variant="outline" size="sm" onClick={removeVideo}>
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    {videoPreview && (
                      <div className="relative">
                        <video
                          src={videoPreview}
                          controls
                          className="w-full max-w-md h-auto rounded-lg border"
                        />
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Preview Panel */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Preview
              </CardTitle>
              <CardDescription>
                See how your content will look on social media
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="mobile" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="mobile">
                    <Smartphone className="h-4 w-4 mr-2" />
                    Mobile
                  </TabsTrigger>
                  <TabsTrigger value="desktop">
                    <Monitor className="h-4 w-4 mr-2" />
                    Desktop
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="mobile" className="space-y-4">
                  <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 max-w-sm mx-auto">
                    <div className="bg-white dark:bg-gray-900 rounded-lg p-3 shadow-sm">
                      {imagePreview && (
                        <img
                          src={imagePreview}
                          alt="Content preview"
                          className="w-full h-32 object-cover rounded mb-3"
                        />
                      )}
                      {videoPreview && (
                        <video
                          src={videoPreview}
                          className="w-full h-32 object-cover rounded mb-3"
                        />
                      )}
                      <h4 className="font-semibold text-sm mb-2">{form.title || 'Your Title'}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {form.text_content || 'Your content text will appear here...'}
                      </p>
                      <div className="flex items-center gap-2 mt-3 text-xs text-gray-500">
                        <Calendar className="h-3 w-3" />
                        <span>Just now</span>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="desktop" className="space-y-4">
                  <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
                    <div className="bg-white dark:bg-gray-900 rounded-lg p-4 shadow-sm max-w-md">
                      {imagePreview && (
                        <img
                          src={imagePreview}
                          alt="Content preview"
                          className="w-full h-40 object-cover rounded mb-3"
                        />
                      )}
                      {videoPreview && (
                        <video
                          src={videoPreview}
                          className="w-full h-40 object-cover rounded mb-3"
                        />
                      )}
                      <h4 className="font-semibold mb-2">{form.title || 'Your Title'}</h4>
                      <p className="text-gray-600 dark:text-gray-400">
                        {form.text_content || 'Your content text will appear here...'}
                      </p>
                      <div className="flex items-center gap-2 mt-3 text-xs text-gray-500">
                        <Calendar className="h-3 w-3" />
                        <span>Just now</span>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Content Status */}
          {existingContent && (
            <Card>
              <CardHeader>
                <CardTitle>Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Badge variant={
                    existingContent.status === 'draft' ? 'secondary' :
                    existingContent.status === 'pending_approval' ? 'outline' :
                    existingContent.status === 'approved' ? 'default' :
                    existingContent.status === 'published' ? 'default' : 'destructive'
                  }>
                    {existingContent.status.replace('_', ' ')}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Last updated: {new Date(existingContent.updated_at).toLocaleString()}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}