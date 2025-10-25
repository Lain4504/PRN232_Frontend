"use client";

import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  Sparkles,
  Save,
  XCircle,
  Copy,
  Send,
  Bot,
  User,
  Plus,
  Menu,
  MessageSquare,
  Settings,
} from "lucide-react";
import { Brand, Product, ConversationSummary, ConversationDetails, ConversationsResponse } from "@/lib/types/aisam-types";
import { useAIChat, AdTypes } from "@/hooks/use-ai-chat";
import { api, endpoints } from "@/lib/api";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

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
  conversationId?: string;
  messages: ChatMessage[];
  created_at: string;
  updated_at: string;
}

interface AIContentGeneratorProps {
  initialBrandId?: string;
}

export function AIContentGenerator({ initialBrandId }: AIContentGeneratorProps = {}) {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [, setGenerations] = useState<AIContentGeneration[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState<string>('');
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const aiChatMutation = useAIChat();

  const [form, setForm] = useState<GenerationForm>({
    brand_id: initialBrandId || '',
    product_id: '',
    prompt: '',
    style_context: '',
    ad_type: 'text_only',
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

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
        }

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

  const createNewChatSession = () => {
    const newSession: ChatSession = {
      id: Date.now().toString(),
      brand_id: form.brand_id || undefined,
      product_id: form.product_id || undefined,
      conversationId: undefined, // Clear conversationId for new session
      messages: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setCurrentSession(newSession);
    setSidebarOpen(false);
  };

  const sendChatMessage = async () => {
    if (!chatInput.trim()) return;

    if (!currentSession) {
      createNewChatSession();
      return;
    }

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
    setChatInput('');
    setIsTyping(true);

    try {
      const requestData = {
        userId: session.user.id,
        brandId: currentSession.brand_id || null,
        productId: currentSession.product_id || null,
        adType: AdTypes.TextOnly,
        message: chatInput,
        conversationId: currentSession.conversationId || null,
      };

      console.log('Sending AI chat request:', requestData);

      const response = await aiChatMutation.mutateAsync(requestData);

      console.log('AI chat response:', response);

      if (response.success && response.data?.conversationId) {
        const sessionWithConversationId = {
          ...updatedSession,
          id: response.data.conversationId,
          conversationId: response.data.conversationId,
        };
        setCurrentSession(sessionWithConversationId);

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

          setGenerations(prev => [generation, ...prev]);
        } else {
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

        toast.success('AI response received');
      } else {
        throw new Error(response.error?.errorMessage || 'Failed to get AI response');
      }
    } catch (error) {
      console.error('Failed to generate chat response:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to generate response');

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
    } finally {
      setIsTyping(false);
    }
  };

  const selectConversation = async (conversation: ConversationSummary) => {
    try {
      const response = await api.get<ConversationDetails>(
        endpoints.conversationById(conversation.id)
      );

      if (response.success && response.data) {
        const chatSession: ChatSession = {
          id: response.data.id,
          brand_id: response.data.brandId || undefined,
          product_id: response.data.productId || undefined,
          conversationId: response.data.id, // Set conversationId to the conversation ID
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
              generated_content: '',
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
        if (response.data.brandId) {
          setForm(prev => ({ ...prev, brand_id: response.data.brandId! }));
        }
        if (response.data.productId) {
          setForm(prev => ({ ...prev, product_id: response.data.productId! }));
        }
        setSidebarOpen(false);
      } else {
        toast.error('Failed to load conversation');
      }
    } catch (error) {
      console.error('Failed to load conversation:', error);
      toast.error('Failed to load conversation details');
    }
  };

  const deleteConversation = async (conversationId: string) => {
    try {
      const response = await api.delete(endpoints.conversationById(conversationId));

      if (response.success) {
        setConversations(prev => prev.filter(c => c.id !== conversationId));

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
      const response = await api.post(endpoints.contents(), {
        prompt: generation.prompt,
        brand_id: generation.brand_id,
        product_id: generation.product_id,
        style_context: generation.style_context,
        ad_type: 'text_only',
        generated_content: generation.generated_content,
        image_url: undefined,
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

  const handleSettingsConfirm = () => {
    setForm(prev => ({
      ...prev,
      brand_id: selectedBrand,
      product_id: selectedProduct,
    }));
    setSettingsOpen(false);
    toast.success('Settings updated successfully');
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="space-y-4 text-center">
          <Skeleton className="h-12 w-12 rounded-full mx-auto" />
          <Skeleton className="h-4 w-48 mx-auto" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-white dark:bg-gray-900">
      {/* Sidebar - Desktop: ChatGPT-style layout */}
      <aside className="hidden lg:flex lg:w-64 border-r bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-col h-screen w-full">
          {/* New Chat Button at Top */}
          <div className="p-4 border-b">
            <Button
              onClick={createNewChatSession}
              className="w-full justify-start bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700"
              variant="outline"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Chat
            </Button>
          </div>

          {/* Chat History */}
          <div className="flex-1 overflow-y-auto p-2">
            {conversations.map((conversation) => (
              <div
                key={conversation.id}
                onClick={() => selectConversation(conversation)}
                className={`cursor-pointer p-3 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 mb-1 flex items-center justify-between ${currentSession?.id === conversation.id ? 'bg-gray-200 dark:bg-gray-700' : ''
                  }`}
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <MessageSquare className="h-4 w-4 text-gray-500 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium truncate text-gray-900 dark:text-gray-100">
                      {conversation.brandName || conversation.title}
                    </div>
                    <div className="text-xs text-gray-500 line-clamp-1">
                      {conversation.lastMessage || `${conversation.messageCount} messages`}
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteConversation(conversation.id);
                  }}
                  className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 hover:bg-gray-300 dark:hover:bg-gray-600"
                >
                  <XCircle className="h-4 w-4" />
                </Button>
              </div>
            ))}

            {conversations.length === 0 && (
              <div className="text-center py-8">
                <MessageSquare className="h-10 w-10 text-gray-400 mx-auto mb-3" />
                <p className="text-sm text-gray-500 mb-4">No conversations yet</p>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col min-w-0 h-screen">
        {/* Header - Simplified ChatGPT style */}
        <header className="border-b px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Mobile Menu Button */}
            <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0">
                <div className="flex flex-col h-full">
                  {/* New Chat Button */}
                  <div className="p-4 border-b relative pr-12">
                    {/* add right padding on the container so the sheet close icon (X) can sit in the padding area without overlapping the button */}
                    <Button
                      onClick={() => {
                        createNewChatSession();
                        setSidebarOpen(false);
                      }}
                      className="w-full justify-start"
                      variant="outline"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      New Chat
                    </Button>
                  </div>

                  {/* Chat History */}
                  <div className="flex-1 overflow-y-auto p-2">
                    {conversations.map((conversation) => (
                      <div
                        key={conversation.id}
                        onClick={() => {
                          selectConversation(conversation);
                          setSidebarOpen(false);
                        }}
                        className={`cursor-pointer p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 mb-1 flex items-center justify-between ${currentSession?.id === conversation.id ? 'bg-gray-100 dark:bg-gray-700' : ''
                          }`}
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <MessageSquare className="h-4 w-4 text-gray-500 flex-shrink-0" />
                          <div className="min-w-0 flex-1">
                            <div className="text-sm font-medium truncate">
                              {conversation.brandName || conversation.title}
                            </div>
                            <div className="text-xs text-gray-500 line-clamp-1">
                              {conversation.lastMessage || `${conversation.messageCount} messages`}
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteConversation(conversation.id);
                          }}
                          className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}

                    {conversations.length === 0 && (
                      <div className="text-center py-8">
                        <MessageSquare className="h-10 w-10 text-gray-400 mx-auto mb-3" />
                        <p className="text-sm text-gray-500 mb-4">No conversations yet</p>
                      </div>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>

            <h1 className="text-lg font-semibold">AI Content Generator</h1>
          </div>

          {/* Settings Button */}
          <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon">
                <Settings className="h-5 w-5" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Chat Settings</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="brand" className="text-right">
                    Brand
                  </Label>
                  <Select value={selectedBrand} onValueChange={setSelectedBrand}>
                    <SelectTrigger className="col-span-3">
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
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="product" className="text-right">
                    Product
                  </Label>
                  <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select a product" />
                    </SelectTrigger>
                    <SelectContent>
                      {products
                        .filter((product) => !selectedBrand || product.brandId === selectedBrand)
                        .map((product) => (
                          <SelectItem key={product.id} value={product.id}>
                            {product.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setSettingsOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSettingsConfirm}>
                  Confirm
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </header>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto min-h-0" ref={chatScrollRef}>
          {!currentSession ? (
            <div className="h-full flex items-center justify-center px-4">
              <div className="text-center max-w-md space-y-4 sm:space-y-6">
                <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                  <Bot className="h-8 w-8 sm:h-10 sm:w-10 text-primary" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-xl sm:text-2xl font-bold">Start a new conversation</h2>
                  <p className="text-sm sm:text-base text-muted-foreground">
                    Describe your content needs and I&apos;ll help you create engaging social media posts
                  </p>
                </div>
                <Button onClick={createNewChatSession} size="lg" className="w-full sm:w-auto">
                  <Sparkles className="mr-2 h-5 w-5" />
                  Start Chatting
                </Button>
              </div>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto space-y-4 sm:space-y-6">
              {currentSession.messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-2 sm:gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {message.role === 'assistant' && (
                    <Avatar className="h-7 w-7 sm:h-8 sm:w-8 flex-shrink-0">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        <Bot className="h-3 w-3 sm:h-4 sm:w-4" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div className={`flex flex-col gap-1 sm:gap-2 max-w-[85%] sm:max-w-[80%] ${message.role === 'user' ? 'items-end' : 'items-start'}`}>
                    <div
                      className={`rounded-2xl px-3 py-2 sm:px-4 sm:py-3 ${message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                        }`}
                    >
                      <p className="text-sm sm:text-base whitespace-pre-wrap break-words leading-relaxed">{message.content}</p>
                    </div>
                    {message.generation && (
                      <Card className="w-full">
                        <CardContent className="p-3 sm:p-4 space-y-3">
                          <div className="flex items-center gap-2">
                            <Sparkles className="h-4 w-4 text-primary" />
                            <span className="text-xs font-medium text-muted-foreground">Generated Content</span>
                          </div>
                          <p className="text-sm sm:text-base leading-relaxed">{message.generation.generated_content}</p>
                          <div className="flex gap-2 flex-wrap">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleCopyContent(message.generation!.generated_content)}
                              className="flex-1 sm:flex-none"
                            >
                              <Copy className="h-3 w-3 mr-1" />
                              Copy
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleSaveToLibrary(message.generation!)}
                              className="flex-1 sm:flex-none"
                            >
                              <Save className="h-3 w-3 mr-1" />
                              Save
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                  {message.role === 'user' && (
                    <Avatar className="h-7 w-7 sm:h-8 sm:w-8 flex-shrink-0">
                      <AvatarFallback>
                        <User className="h-3 w-3 sm:h-4 sm:w-4" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
              {isTyping && (
                <div className="flex gap-2 sm:gap-3 justify-start">
                  <Avatar className="h-7 w-7 sm:h-8 sm:w-8">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      <Bot className="h-3 w-3 sm:h-4 sm:w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="bg-muted rounded-2xl px-3 py-2 sm:px-4 sm:py-3">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Chat Input */}
        {currentSession && (
          <div className="border-t bg-white dark:bg-gray-900">
            <div className="max-w-4xl mx-auto p-4">
              <div className="relative">
                <Textarea
                  placeholder="Message AI Content Generator..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      sendChatMessage();
                    }
                  }}
                  disabled={isTyping}
                  className="min-h-[48px] max-h-[200px] resize-none pr-12 field-sizing-content text-left align-middle"
                />
                <Button
                  onClick={sendChatMessage}
                  disabled={!chatInput.trim() || isTyping}
                  size="sm"
                  className="absolute bottom-2 right-4 h-8 w-8 p-0 bg-black hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-200 rounded-full"
                >
                  <Send className="h-4 w-4 text-white dark:text-black" />
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-2 text-center">
                AI Content Generator can make mistakes. Consider checking important information.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
