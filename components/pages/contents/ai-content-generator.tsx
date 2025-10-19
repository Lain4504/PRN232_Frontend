"use client";

import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
  Send,
  Bot,
  User,
  Settings,
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

// Chat message types
interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  generation?: AIContentGeneration;
}

interface ChatSession {
  id: string;
  brand_id?: string;
  product_id?: string;
  messages: ChatMessage[];
  created_at: string;
  updated_at: string;
}

export function AIContentGenerator() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [generations, setGenerations] = useState<AIContentGeneration[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [selectedGeneration, setSelectedGeneration] = useState<AIContentGeneration | null>(null);

  // Chat state
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatScrollRef = useRef<HTMLDivElement>(null);

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
    const brandProducts = products.filter(p => p.brandId === brandId);
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

  // Chat functions
  const createNewChatSession = () => {
    const newSession: ChatSession = {
      id: Date.now().toString(),
      brand_id: form.brand_id || undefined,
      product_id: form.product_id || undefined,
      messages: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setChatSessions(prev => [newSession, ...prev]);
    setCurrentSession(newSession);
  };

  const sendChatMessage = async () => {
    if (!chatInput.trim()) return;

    if (!currentSession) {
      createNewChatSession();
      return;
    }

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: chatInput,
      timestamp: new Date().toISOString(),
    };

    const updatedSession = {
      ...currentSession,
      messages: [...currentSession.messages, userMessage],
      updated_at: new Date().toISOString(),
    };

    setCurrentSession(updatedSession);
    setChatSessions(prev => prev.map(s => s.id === updatedSession.id ? updatedSession : s));
    setChatInput('');
    setIsTyping(true);

    try {
      // Simulate AI response delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Generate AI content based on chat message
      const mockContent = generateMockContent({
        brand_id: currentSession.brand_id || '',
        product_id: currentSession.product_id,
        prompt: chatInput,
        style_context: '',
        ad_type: 'text_only',
      });

      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Here's a content suggestion based on your request:\n\n${mockContent}`,
        timestamp: new Date().toISOString(),
        generation: {
          id: Date.now().toString(),
          prompt: chatInput,
          brand_id: currentSession.brand_id || '',
          product_id: currentSession.product_id,
          style_context: '',
          generated_content: mockContent,
          status: 'completed',
          created_at: new Date().toISOString(),
          brand_name: brands.find(b => b.id === currentSession.brand_id)?.name,
          product_name: currentSession.product_id ? products.find(p => p.id === currentSession.product_id)?.name : undefined,
        },
      };

      const finalSession = {
        ...updatedSession,
        messages: [...updatedSession.messages, aiMessage],
        updated_at: new Date().toISOString(),
      };

      setCurrentSession(finalSession);
      setChatSessions(prev => prev.map(s => s.id === finalSession.id ? finalSession : s));

      // Add to generations list
      setGenerations(prev => [aiMessage.generation!, ...prev]);
    } catch (error) {
      console.error('Failed to generate chat response:', error);
      toast.error('Failed to generate response');
    } finally {
      setIsTyping(false);
    }
  };

  const selectChatSession = (session: ChatSession) => {
    setCurrentSession(session);
  };

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [currentSession?.messages]);

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
            Chat with AI to generate engaging social media content
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={createNewChatSession}
            className="flex items-center gap-2"
          >
            <Settings className="h-4 w-4" />
            New Chat
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Chat Interface */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="h-[600px] flex flex-col">
            <CardHeader className="flex-shrink-0">
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5" />
                AI Content Assistant
              </CardTitle>
              <CardDescription>
                Chat with AI to generate and refine your social media content
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col p-0">
              {/* Chat Messages */}
              <ScrollArea className="flex-1 p-4" ref={chatScrollRef}>
                <div className="space-y-4">
                  {currentSession?.messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      {message.role === 'assistant' && (
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-primary text-primary-foreground">
                            <Bot className="h-4 w-4" />
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <div
                        className={`max-w-[70%] rounded-lg px-4 py-2 ${
                          message.role === 'user'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                        {message.generation && (
                          <div className="mt-3 p-3 bg-background/50 rounded border">
                            <p className="text-xs text-muted-foreground mb-2">Generated Content:</p>
                            <p className="text-sm">{message.generation.generated_content}</p>
                            <div className="flex gap-2 mt-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleCopyContent(message.generation!.generated_content)}
                              >
                                <Copy className="h-3 w-3 mr-1" />
                                Copy
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleSaveToLibrary(message.generation!)}
                              >
                                <Save className="h-3 w-3 mr-1" />
                                Save
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                      {message.role === 'user' && (
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>
                            <User className="h-4 w-4" />
                          </AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  ))}
                  {isTyping && (
                    <div className="flex gap-3 justify-start">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          <Bot className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="bg-muted rounded-lg px-4 py-2">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    </div>
                  )}
                  {!currentSession && (
                    <div className="text-center py-8">
                      <Bot className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">Start a conversation</h3>
                      <p className="text-muted-foreground mb-4">
                        Describe your content needs and I'll help you create engaging social media posts.
                      </p>
                      <Button onClick={createNewChatSession}>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Start Chat
                      </Button>
                    </div>
                  )}
                </div>
              </ScrollArea>

              {/* Chat Input */}
              {currentSession && (
                <div className="flex-shrink-0 p-4 border-t">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Describe the content you want to create..."
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
                      disabled={isTyping}
                    />
                    <Button
                      onClick={sendChatMessage}
                      disabled={!chatInput.trim() || isTyping}
                      size="icon"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Brand/Product Selection for Chat Context */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Chat Context
              </CardTitle>
              <CardDescription>
                Set your brand and product context for better AI suggestions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="chat_brand">Brand</Label>
                  <Select
                    value={form.brand_id}
                    onValueChange={(value) => {
                      handleBrandChange(value);
                      if (currentSession) {
                        setCurrentSession(prev => prev ? { ...prev, brand_id: value } : null);
                      }
                    }}
                  >
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
                  <Label htmlFor="chat_product">Product (Optional)</Label>
                  <Select
                    value={form.product_id}
                    onValueChange={(value) => {
                      const newValue = value === "none" ? "" : value;
                      setForm(prev => ({ ...prev, product_id: newValue }));
                      if (currentSession) {
                        setCurrentSession(prev => prev ? { ...prev, product_id: newValue } : null);
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a product" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No specific product</SelectItem>
                      {products.map((product) => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
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

        {/* Chat Sessions & Generation History */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Chat Sessions</CardTitle>
              <CardDescription>
                Your AI conversations and content generations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {chatSessions.map((session) => (
                  <div
                    key={session.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      currentSession?.id === session.id ? 'bg-primary/5 border-primary' : 'hover:bg-muted/50'
                    }`}
                    onClick={() => selectChatSession(session)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Bot className="h-4 w-4" />
                        <span className="text-sm font-medium">
                          {session.brand_id ? brands.find(b => b.id === session.brand_id)?.name : 'General Chat'}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(session.updated_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {session.messages.length} messages
                    </p>
                    {session.product_id && (
                      <Badge variant="outline" className="text-xs mt-1">
                        {products.find(p => p.id === session.product_id)?.name}
                      </Badge>
                    )}
                  </div>
                ))}

                {chatSessions.length === 0 && (
                  <div className="text-center py-8">
                    <Bot className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                      No chat sessions yet. Start your first conversation!
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Generations</CardTitle>
              <CardDescription>
                Your recent AI content generations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {generations.slice(0, 5).map((generation) => (
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
                      No generations yet. Chat with AI to create content!
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