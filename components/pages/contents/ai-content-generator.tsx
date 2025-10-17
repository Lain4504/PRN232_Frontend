"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  Wand2,
  Save,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  Copy,
  Download,
  AlertCircle,
} from "lucide-react";
import { brandApi, productApi, contentApi } from "@/lib/mock-api";
import { Brand, Product } from "@/lib/types/aisam-types";
import { toast } from "sonner";

// Types for AI content generation
interface AIContentGeneration {
  id: string;
  prompt: string;
  brand_id: string;
  product_id?: string;
  style_context: string;
  generated_content: string;
  status: 'pending' | 'completed' | 'failed';
  created_at: string;
  brand_name?: string;
  product_name?: string;
}

interface GenerationForm {
  brand_id: string;
  product_id?: string;
  prompt: string;
  style_context: string;
  ad_type: 'image_text' | 'video_text' | 'text_only';
}

export function AIContentGenerator() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [generations, setGenerations] = useState<AIContentGeneration[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [selectedGeneration, setSelectedGeneration] = useState<AIContentGeneration | null>(null);

  const [form, setForm] = useState<GenerationForm>({
    brand_id: '',
    product_id: '',
    prompt: '',
    style_context: '',
    ad_type: 'text_only',
  });

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

        // Load previous generations (mock data for now)
        setGenerations([
          {
            id: '1',
            prompt: 'Create an engaging post about our new eco-friendly water bottles',
            brand_id: 'brand-1',
            product_id: 'product-1',
            style_context: 'Professional, informative, environmentally conscious',
            generated_content: '🌍 Going green has never been easier! Introducing our new eco-friendly water bottles, made from 100% recycled materials. Stay hydrated while helping the planet. #SustainableLiving #EcoFriendly',
            status: 'completed',
            created_at: new Date().toISOString(),
            brand_name: 'EcoLife',
            product_name: 'Eco Bottle',
          },
          {
            id: '2',
            prompt: 'Promote our summer sale with fun and energetic tone',
            brand_id: 'brand-2',
            style_context: 'Fun, energetic, youthful',
            generated_content: '☀️ SUMMER SALE ALERT! 🔥 Get ready to heat up your wardrobe with our amazing deals! Up to 50% off on all summer essentials. Don\'t miss out, shop now! 🏖️',
            status: 'completed',
            created_at: new Date(Date.now() - 86400000).toISOString(),
            brand_name: 'Fashion Forward',
          },
        ]);
      } catch (error) {
        console.error('Failed to load data:', error);
        toast.error('Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleBrandChange = (brandId: string) => {
    setForm(prev => ({ ...prev, brand_id: brandId, product_id: '' }));
    // Filter products by selected brand
    const brandProducts = products.filter(p => p.brand_id === brandId);
    setProducts(brandProducts);
  };

  const handleGenerate = async () => {
    if (!form.brand_id || !form.prompt.trim()) {
      toast.error('Please select a brand and enter a prompt');
      return;
    }

    try {
      setGenerating(true);

      // Simulate AI generation delay
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Mock AI response
      const mockContent = generateMockContent(form);

      const newGeneration: AIContentGeneration = {
        id: Date.now().toString(),
        prompt: form.prompt,
        brand_id: form.brand_id,
        product_id: form.product_id,
        style_context: form.style_context,
        generated_content: mockContent,
        status: 'completed',
        created_at: new Date().toISOString(),
        brand_name: brands.find(b => b.id === form.brand_id)?.name,
        product_name: form.product_id ? products.find(p => p.id === form.product_id)?.name : undefined,
      };

      setGenerations(prev => [newGeneration, ...prev]);
      setSelectedGeneration(newGeneration);
      toast.success('Content generated successfully!');

      // Reset form
      setForm(prev => ({
        ...prev,
        prompt: '',
        style_context: '',
      }));
    } catch (error) {
      console.error('Failed to generate content:', error);
      toast.error('Failed to generate content');
    } finally {
      setGenerating(false);
    }
  };

  const generateMockContent = (formData: GenerationForm): string => {
    const brand = brands.find(b => b.id === formData.brand_id);
    const product = formData.product_id ? products.find(p => p.id === formData.product_id) : null;

    const templates = {
      text_only: [
        `✨ Discover the magic of ${brand?.name}! ${formData.prompt} #Innovation #Quality`,
        `🚀 ${brand?.name} presents: ${formData.prompt}. Experience excellence today!`,
        `🌟 Transform your experience with ${brand?.name}. ${formData.prompt} #Premium #Lifestyle`,
      ],
      image_text: [
        `📸 Stunning visuals meet exceptional quality! ${brand?.name}'s ${product?.name || 'latest creation'}: ${formData.prompt} #VisualStorytelling`,
        `🎨 Beauty in every detail. ${brand?.name} brings you ${formData.prompt}. See the difference!`,
        `🖼️ Picture perfect! ${brand?.name} showcases ${formData.prompt} in our latest collection.`,
      ],
      video_text: [
        `🎥 Watch and be amazed! ${brand?.name} unveils ${formData.prompt}. Don't miss this!`,
        `📹 Motion meets emotion. ${brand?.name}'s dynamic presentation: ${formData.prompt} #VideoContent`,
        `🎬 Lights, camera, action! ${brand?.name} stars in ${formData.prompt}. Watch now!`,
      ],
    };

    const templateList = templates[formData.ad_type];
    return templateList[Math.floor(Math.random() * templateList.length)];
  };

  const handleSaveToLibrary = async (generation: AIContentGeneration) => {
    try {
      const response = await contentApi.saveGeneratedContent({
        prompt: generation.prompt,
        brand_id: generation.brand_id,
        product_id: generation.product_id,
        style_context: generation.style_context,
        ad_type: 'text_only', // Default to text_only, could be enhanced
        generated_content: generation.generated_content,
        image_url: undefined, // Could be enhanced for image/video content
      });

      if (response.success) {
        toast.success('Content saved to library successfully!');
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.error('Failed to save content:', error);
      toast.error('Failed to save content');
    }
  };

  const handleCopyContent = (content: string) => {
    navigator.clipboard.writeText(content);
    toast.success('Content copied to clipboard!');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="flex-1 space-y-6 p-6 bg-background">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading AI Content Generator...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-6 bg-background">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Sparkles className="h-8 w-8 text-primary" />
            AI Content Generator
          </h1>
          <p className="text-muted-foreground">
            Generate engaging social media content with Google Gemini AI
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Generation Form */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wand2 className="h-5 w-5" />
                Generate New Content
              </CardTitle>
              <CardDescription>
                Describe your brand, product, and desired messaging style
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
                    <SelectItem value="text_only">Text Only</SelectItem>
                    <SelectItem value="image_text">Image + Text</SelectItem>
                    <SelectItem value="video_text">Video + Text</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="prompt">Content Prompt *</Label>
                <Textarea
                  id="prompt"
                  placeholder="Describe what you want the AI to create. Be specific about the message, tone, and key points you want to convey..."
                  value={form.prompt}
                  onChange={(e) => setForm(prev => ({ ...prev, prompt: e.target.value }))}
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="style">Style & Context (Optional)</Label>
                <Input
                  id="style"
                  placeholder="e.g., Professional, fun, energetic, informative, promotional..."
                  value={form.style_context}
                  onChange={(e) => setForm(prev => ({ ...prev, style_context: e.target.value }))}
                />
              </div>

              <Button
                onClick={handleGenerate}
                disabled={generating || !form.brand_id || !form.prompt.trim()}
                className="w-full"
                size="lg"
              >
                {generating ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Generating Content...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate with AI
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Generated Content Display */}
          {selectedGeneration && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    Generated Content
                  </CardTitle>
                  <Badge variant="secondary" className="flex items-center gap-1">
                    {getStatusIcon(selectedGeneration.status)}
                    {selectedGeneration.status}
                  </Badge>
                </div>
                <CardDescription>
                  Created {new Date(selectedGeneration.created_at).toLocaleString()}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm whitespace-pre-wrap">{selectedGeneration.generated_content}</p>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleCopyContent(selectedGeneration.generated_content)}>
                    <Copy className="mr-2 h-4 w-4" />
                    Copy
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                  <Button size="sm" onClick={() => handleSaveToLibrary(selectedGeneration)}>
                    <Save className="mr-2 h-4 w-4" />
                    Save to Library
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Generation History */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Generation History</CardTitle>
              <CardDescription>
                Your recent AI content generations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {generations.map((generation) => (
                  <div
                    key={generation.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedGeneration?.id === generation.id ? 'bg-primary/5 border-primary' : 'hover:bg-muted/50'
                    }`}
                    onClick={() => setSelectedGeneration(generation)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(generation.status)}
                        <span className="text-sm font-medium">{generation.brand_name}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(generation.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                      {generation.prompt}
                    </p>
                    {generation.product_name && (
                      <Badge variant="outline" className="text-xs">
                        {generation.product_name}
                      </Badge>
                    )}
                  </div>
                ))}

                {generations.length === 0 && (
                  <div className="text-center py-8">
                    <Sparkles className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                      No generations yet. Create your first AI content!
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Tips Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                AI Generation Tips
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm">
                <strong>Be specific:</strong> Include details about tone, target audience, and key messages.
              </div>
              <div className="text-sm">
                <strong>Use context:</strong> Mention your brand personality and unique selling points.
              </div>
              <div className="text-sm">
                <strong>Specify format:</strong> Choose the right content type for your platform.
              </div>
              <div className="text-sm">
                <strong>Review & edit:</strong> AI content is a starting point - customize for your voice.
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}