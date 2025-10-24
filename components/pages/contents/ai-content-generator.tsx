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
import { contentApi } from "@/lib/mock-api";
import { Brand, Product, ConversationSummary, ConversationDetails, ConversationsResponse } from "@/lib/types/aisam-types";
import { useAIChat, AdTypes } from "@/hooks/use-ai-chat";
import { api, endpoints } from "@/lib/api";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { useCanUseAI } from "@/hooks/use-subscription";
import { UpgradePrompt } from "@/components/subscription/upgrade-prompt";

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
  const canUseAI = useCanUseAI();

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

  // Conversation management state
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [loadingConversations, setLoadingConversations] = useState(false);

  // AI Chat hook
  const aiChatMutation = useAIChat();

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

        // Load products from real API (no auth required)
        console.log('Loading products from API...');
        try {
          const productsResponse = await api.get<{
            data: Product[];
            totalCount: number;
            page: number;
            pageSize: number;
            totalPages: number;
            hasNextPage: boolean;
            hasPreviousPage: boolean;
          }>('/products?page=1&pageSize=1000', { requireAuth: false });
          console.log('Products response:', productsResponse);
          if (productsResponse.success && productsResponse.data) {
            console.log('Setting products:', productsResponse.data.data);
            setProducts(productsResponse.data.data);
          } else {
            console.error('Failed to load products:', productsResponse);
          }
        } catch (error) {
          console.error('Products API error:', error);
        }

        // Load brands from real API (requires auth)
        console.log('Loading brands from API...');
        try {
          const supabase = createClient();
          const { data: { session }, error: sessionError } = await supabase.auth.getSession();
          console.log('Supabase session:', session);
          console.log('Session error:', sessionError);

          if (!session?.access_token) {
            console.warn('No active session found');
            toast.error('Please log in to load brands');
            return;
          }

          const brandsResponse = await api.get<{
            data: Brand[];
            totalCount: number;
            page: number;
            pageSize: number;
            totalPages: number;
            hasNextPage: boolean;
            hasPreviousPage: boolean;
          }>('/brands?page=1&pageSize=1000');
          console.log('Brands response:', brandsResponse);
          if (brandsResponse.success && brandsResponse.data) {
            console.log('Raw brands response:', brandsResponse);
            console.log('Brands data:', brandsResponse.data);
            const brandsData = brandsResponse.data.data || [];
            console.log('Setting brands:', brandsData);
            setBrands(brandsData);
            console.log('Brands state updated:', brandsData.length, 'brands');
            if (brandsData.length > 0) {
              toast.success(`Loaded ${brandsData.length} brands successfully`);
            } else {
              toast.error('No brands found for your account');
            }
          } else {
            console.error('Failed to load brands:', brandsResponse);
            // If brands fail due to auth, show a message
            if (brandsResponse.statusCode === 401 || brandsResponse.statusCode === 403) {
              console.warn('Brands require authentication - user may not be logged in');
              toast.error('Authentication required to load brands');
            } else {
              toast.error('Failed to load brands');
            }
          }
        } catch (error) {
          console.error('Brands API error:', error);
          toast.error('Failed to load brands from server');
        }

        // Load conversations from backend
        console.log('Loading conversations from API...');
        try {
          const supabase = createClient();
          const { data: { session } } = await supabase.auth.getSession();

          if (session?.access_token) {
            const conversationsResponse = await api.get<ConversationsResponse>(
              `${endpoints.conversations()}?page=1&pageSize=50&sortBy=updatedAt&sortDescending=true`
            );
            console.log('Conversations response:', conversationsResponse);
            if (conversationsResponse.success && conversationsResponse.data) {
              console.log('Setting conversations:', conversationsResponse.data.data);
              setConversations(conversationsResponse.data.data);
            } else {
              console.error('Failed to load conversations:', conversationsResponse);
            }
          } else {
            console.warn('No session available for conversations');
          }
        } catch (error) {
          console.error('Conversations API error:', error);
          // Don't show error for conversations as it's not critical
        }

        // Load previous generations (will be empty initially)
        setGenerations([]);
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

  const handleChatBrandChange = (brandId: string) => {
    setForm(prev => ({ ...prev, brand_id: brandId, product_id: '' }));
    // Filter products by selected brand
    const brandProducts = products.filter(p => p.brandId === brandId);
    setProducts(brandProducts);

    // Update current session if exists
    updateChatContext(brandId, undefined);
  };

  const handleChatProductChange = (productId: string) => {
    const newValue = productId === "none" ? "" : productId;
    setForm(prev => ({ ...prev, product_id: newValue }));

    // Update current session if exists
    updateChatContext(form.brand_id, newValue || undefined);
  };

  // Removed handleGenerate function - now using AI chat for content generation

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

  const updateChatContext = (brandId?: string, productId?: string) => {
    if (currentSession) {
      setCurrentSession(prev => prev ? {
        ...prev,
        brand_id: brandId,
        product_id: productId
      } : null);
    }
  };

  const sendChatMessage = async () => {
    if (!chatInput.trim()) return;

    if (!currentSession) {
      createNewChatSession();
      return;
    }

    // Get current user ID
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user?.id) {
      toast.error('User not authenticated');
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
      // Call real AI API - match backend expected format
      const requestData = {
        userId: session.user.id,
        brandId: currentSession.brand_id || null,
        productId: currentSession.product_id || null,
        adType: AdTypes.TextOnly, // Default to text-only for chat
        message: chatInput,
        // conversationId: currentSession.id, // Remove conversationId for now as backend expects null
      };

      console.log('Sending AI chat request:', requestData);

      const response = await aiChatMutation.mutateAsync(requestData);

      console.log('AI chat response:', response);

      // Update conversation list if this is a new conversation
      if (response.success && response.data?.conversationId) {
        // Update current session with the conversation ID from backend
        const sessionWithConversationId = {
          ...updatedSession,
          id: response.data.conversationId, // Use backend conversation ID
        };
        setCurrentSession(sessionWithConversationId);

        // Refresh conversations list to include the new/updated conversation
        try {
          const supabase = createClient();
          const { data: { session } } = await supabase.auth.getSession();

          if (session?.access_token) {
            const conversationsResponse = await api.get<ConversationsResponse>(
              `${endpoints.conversations()}?page=1&pageSize=50&sortBy=updatedAt&sortDescending=true`
            );
            if (conversationsResponse.success && conversationsResponse.data) {
              setConversations(conversationsResponse.data.data);
            }
          }
        } catch (error) {
          console.error('Failed to refresh conversations:', error);
        }
      }

      if (response.success && response.data) {
        let aiMessage: ChatMessage;

        if (response.data.isContentGenerated && response.data.generatedContent) {
          // Content was generated - create generation object
          const generation: AIContentGeneration = {
            id: response.data.aiGenerationId || Date.now().toString(),
            prompt: chatInput,
            brand_id: currentSession.brand_id || '',
            product_id: currentSession.product_id,
            style_context: '',
            generated_content: response.data.generatedContent,
            status: 'completed',
            created_at: new Date().toISOString(),
            brand_name: brands.find(b => b.id === currentSession.brand_id)?.name,
            product_name: currentSession.product_id ? products.find(p => p.id === currentSession.product_id)?.name : undefined,
          };

          aiMessage = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: response.data.response,
            timestamp: new Date().toISOString(),
            generation: generation,
          };

          // Add to generations list
          setGenerations(prev => [generation, ...prev]);
        } else {
          // Chat-only response
          aiMessage = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: response.data.response,
            timestamp: new Date().toISOString(),
          };
        }

        const finalSession = {
          ...updatedSession,
          messages: [...updatedSession.messages, aiMessage],
          updated_at: new Date().toISOString(),
        };

        setCurrentSession(finalSession);
        setChatSessions(prev => prev.map(s => s.id === finalSession.id ? finalSession : s));

        toast.success('AI response received');
      } else {
        throw new Error(response.error?.errorMessage || 'Failed to get AI response');
      }
    } catch (error) {
      console.error('Failed to generate chat response:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to generate response');

      // Add error message to chat
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error while processing your request. Please try again.',
        timestamp: new Date().toISOString(),
      };

      const finalSession = {
        ...updatedSession,
        messages: [...updatedSession.messages, errorMessage],
        updated_at: new Date().toISOString(),
      };

      setCurrentSession(finalSession);
      setChatSessions(prev => prev.map(s => s.id === finalSession.id ? finalSession : s));
    } finally {
      setIsTyping(false);
    }
  };

  const selectChatSession = async (session: ChatSession) => {
    setCurrentSession(session);
  };

  const selectConversation = async (conversation: ConversationSummary) => {
    try {
      setLoadingConversations(true);

      // Load full conversation details with messages
      const response = await api.get<ConversationDetails>(
        endpoints.conversationById(conversation.id)
      );

      if (response.success && response.data) {
        // Convert backend conversation to frontend chat session format
        const chatSession: ChatSession = {
          id: response.data.id,
          brand_id: response.data.brandId || undefined,
          product_id: response.data.productId || undefined,
          messages: response.data.messages.map(msg => ({
            id: msg.id,
            role: msg.senderType === 'User' ? 'user' : 'assistant',
            content: msg.message,
            timestamp: msg.createdAt,
            generation: msg.aiGenerationId ? {
              id: msg.aiGenerationId,
              prompt: msg.message,
              brand_id: response.data.brandId || '',
              product_id: response.data.productId || undefined,
              style_context: '',
              generated_content: '', // Would need to fetch from content API
              status: 'completed',
              created_at: msg.createdAt,
              brand_name: response.data.brandName || undefined,
              product_name: response.data.productName || undefined,
            } : undefined
          })),
          created_at: response.data.createdAt,
          updated_at: response.data.updatedAt,
        };

        setCurrentSession(chatSession);
        // Update form context to match the conversation
        if (response.data.brandId) {
          setForm(prev => ({ ...prev, brand_id: response.data.brandId! }));
        }
        if (response.data.productId) {
          setForm(prev => ({ ...prev, product_id: response.data.productId! }));
        }
      } else {
        toast.error('Failed to load conversation');
      }
    } catch (error) {
      console.error('Failed to load conversation:', error);
      toast.error('Failed to load conversation details');
    } finally {
      setLoadingConversations(false);
    }
  };

  const deleteConversation = async (conversationId: string) => {
    try {
      const response = await api.delete(endpoints.conversationById(conversationId));

      if (response.success) {
        // Remove from conversations list
        setConversations(prev => prev.filter(c => c.id !== conversationId));

        // If current session is the deleted conversation, clear it
        if (currentSession?.id === conversationId) {
          setCurrentSession(null);
        }

        toast.success('Conversation deleted successfully');
      } else {
        toast.error('Failed to delete conversation');
      }
    } catch (error) {
      console.error('Failed to delete conversation:', error);
      toast.error('Failed to delete conversation');
    }
  };

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [currentSession?.messages]);


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

  // Show upgrade prompt if user doesn't have AI access
  if (!canUseAI) {
    return (
      <div className="flex-1 space-y-6 p-6 bg-background">
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
        </div>

        <UpgradePrompt
          title="Unlock AI Content Generation"
          description="Get unlimited access to our AI assistant that helps you create engaging social media content tailored to your brand."
          feature="AI Content Generation"
        />
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
            <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-4" ref={chatScrollRef}>
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
              </div>

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
                    onValueChange={handleChatBrandChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a brand" />
                    </SelectTrigger>
                    <SelectContent>
                      {brands.length === 0 ? (
                        <div className="p-2 text-sm text-muted-foreground">
                          No brands available - please start the backend API
                        </div>
                      ) : (
                        brands.map((brand) => (
                          <SelectItem key={brand.id} value={brand.id}>
                            {brand.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="chat_product">Product (Optional)</Label>
                  <Select
                    value={form.product_id}
                    onValueChange={handleChatProductChange}
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

              {/* Current Chat Context Display */}
              {(form.brand_id || form.product_id) && (
                <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                  <h4 className="text-sm font-medium mb-2">Current Chat Context:</h4>
                  <div className="flex flex-wrap gap-2">
                    {form.brand_id && (
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <span className="text-xs">Brand:</span>
                        {brands.find(b => b.id === form.brand_id)?.name}
                      </Badge>
                    )}
                    {form.product_id && form.product_id !== "none" && (
                      <Badge variant="outline" className="flex items-center gap-1">
                        <span className="text-xs">Product:</span>
                        {products.find(p => p.id === form.product_id)?.name}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    AI will use this context to generate more relevant content for your brand and products.
                  </p>
                </div>
              )}
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
                {conversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      currentSession?.id === conversation.id ? 'bg-primary/5 border-primary' : 'hover:bg-muted/50'
                    }`}
                    onClick={() => selectConversation(conversation)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Bot className="h-4 w-4" />
                        <span className="text-sm font-medium">
                          {conversation.brandName || conversation.title}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          {new Date(conversation.updatedAt).toLocaleDateString()}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteConversation(conversation.id);
                          }}
                          className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {conversation.lastMessage || `${conversation.messageCount} messages`}
                    </p>
                    {conversation.productName && (
                      <Badge variant="outline" className="text-xs mt-1">
                        {conversation.productName}
                      </Badge>
                    )}
                  </div>
                ))}

                {conversations.length === 0 && (
                  <div className="text-center py-8">
                    <Bot className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                      No conversations yet. Start your first chat!
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