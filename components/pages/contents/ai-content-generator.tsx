"use client";

import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  Sparkles,
  Save,
  XCircle,
  Copy,
  Send,
  Bot,
  User,
  Settings,
  Plus,
  MessageSquare,
  Menu,
} from "lucide-react";
import { Brand, Product, ConversationSummary, ConversationDetails, ConversationsResponse } from "@/lib/types/omniadly-types";
import { useAIChat, AdTypes } from "@/hooks/use-ai-chat";
import { api, endpoints } from "@/lib/api";
import { toast } from "sonner";
import { useAuth } from "@/lib/contexts/auth-context";

interface AIContentGeneratorProps {
  initialBrandId?: string;
}

export function AIContentGenerator({ initialBrandId }: AIContentGeneratorProps = {}) {

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
  const aiChatMutation = useAIChat();
  const { session, user } = useAuth(); // Use auth context

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
          // Use session from context instead of re-fetching
          if (!session?.accessToken) {
            console.warn('No active session found');
            // Don't error immediately if loading or just starting, but warn
            // return; // Let it proceed, maybe public brands? Or handle error gracefully
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
              // toast.error('No brands found for your account');
            }
          } else {
            console.error('Failed to load brands:', brandsResponse);
            // Handle silently or specific errors
          }
        } catch (error) {
          console.error('Brands API error:', error);
          toast.error('Failed to load brands from server');
        }

        console.log('Loading conversations from API...');
        try {
          if (session?.accessToken) {
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

    // Only load data if session is available to avoid 401s on initial load for protected routes
    if (session) {
      loadData();
    }
  }, [session]);

  const handleChatBrandChange = (brandId: string) => {
    setForm(prev => ({ ...prev, brand_id: brandId, product_id: '' }));
    const brandProducts = products.filter(p => p.brandId === brandId);
    setProducts(brandProducts);
    updateChatContext(brandId, undefined);
  };

  const handleChatProductChange = (productId: string) => {
    const newValue = productId === "none" ? "" : productId;
    setForm(prev => ({ ...prev, product_id: newValue }));
    updateChatContext(form.brand_id, newValue || undefined);
  };

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

    if (!user?.id) {
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
        userId: user.id,
        profileId: user.id, // Add profileId for the request
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
          // Use session from context instead of fetching 
          if (session?.accessToken) {
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
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex lg:w-72 border-r border-border/40 flex-col bg-muted/20 backdrop-blur-xl">
        <div className="p-6 border-b border-border/40 space-y-4">
          <Badge variant="outline" className="px-3 py-0.5 text-[9px] font-black uppercase tracking-widest bg-primary/5 text-primary border-primary/10">
            Content Engine
          </Badge>
          <Button
            onClick={createNewChatSession}
            className="w-full rounded-2xl h-12 font-bold shadow-lg shadow-primary/10 transition-all hover:scale-[1.02] active:scale-[0.98]"
            size="lg"
          >
            <Plus className="mr-2 h-5 w-5" />
            New Context
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          <div className="px-3 py-2 text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">
            Recent Sessions
          </div>
          {conversations.map((conversation) => (
            <div
              key={conversation.id}
              className={`group cursor-pointer p-4 rounded-2xl transition-all duration-300 flex items-center justify-between border ${currentSession?.id === conversation.id
                ? 'bg-card border-border shadow-sm'
                : 'border-transparent hover:bg-muted/50 hover:border-border/30'
                }`}
              onClick={() => selectConversation(conversation)}
            >
              <div className="flex items-center gap-4 min-w-0 flex-1">
                <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 ${currentSession?.id === conversation.id ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                  }`}>
                  <MessageSquare className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-bold text-foreground truncate uppercase tracking-tight">
                    {conversation.brandName || conversation.title}
                  </div>
                  <div className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5 font-medium">
                    {conversation.lastMessage || `${conversation.messageCount} interactions`}
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteConversation(conversation.id);
                }}
                className="h-8 w-8 rounded-xl opacity-0 group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive transition-all"
              >
                <XCircle className="h-4 w-4" />
              </Button>
            </div>
          ))}

          {conversations.length === 0 && (
            <div className="text-center py-16 px-6">
              <div className="w-16 h-16 bg-muted/50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <MessageSquare className="h-8 w-8 text-muted-foreground/40" />
              </div>
              <h3 className="text-sm font-bold text-foreground mb-2">History is empty</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Your AI content generation history will appear here once you start a new session.
              </p>
            </div>
          )}
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col min-w-0 bg-background relative">
        {/* Decorative Background Elements */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-chart-1/5 rounded-full blur-[100px] pointer-events-none translate-y-1/2 -translate-x-1/4" />

        {/* Header */}
        <header className="h-16 shrink-0 border-b border-border/40 px-6 flex items-center justify-between bg-background/50 backdrop-blur-md relative z-20">
          <div className="flex items-center gap-4">
            <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden rounded-xl">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] p-0 border-r border-border/40">
                <div className="h-full flex flex-col pt-4">
                  <div className="p-4">
                    <Button onClick={createNewChatSession} className="w-full rounded-2xl h-11 font-bold">
                      <Plus className="mr-2 h-4 w-4" /> New Chat
                    </Button>
                  </div>
                  <div className="flex-1 overflow-y-auto px-2">
                    {/* Mobile Conversation List - reuse same logic */}
                  </div>
                </div>
              </SheetContent>
            </Sheet>

            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center shadow-lg shadow-primary/20">
                <Bot className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-base font-bold text-foreground tracking-tight leading-none">Content Architect</h1>
                <p className="text-[10px] uppercase font-black text-muted-foreground/60 tracking-widest mt-1">v4.0 Enterprise AI</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-muted/50 border border-border/40 rounded-full">
              <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">System Active</span>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="rounded-xl border-border/50 hover:bg-muted/50 transition-all font-bold">
                  <Settings className="h-4 w-4 mr-2" />
                  Context
                </Button>
              </DialogTrigger>
              <DialogContent className="rounded-3xl border-border/40 bg-background/95 backdrop-blur-xl">
                <DialogHeader className="pt-4">
                  <DialogTitle className="text-2xl font-bold">Model Context</DialogTitle>
                  <DialogDescription>Optimize outputs by specifying brand and product data.</DialogDescription>
                </DialogHeader>
                <div className="space-y-6 py-8">
                  <div className="space-y-3">
                    <Label className="font-bold text-xs uppercase tracking-widest text-muted-foreground px-1">Brand Identity</Label>
                    <Select value={form.brand_id} onValueChange={handleChatBrandChange}>
                      <SelectTrigger className="rounded-2xl h-12 focus:ring-primary/20 bg-muted/30 border-none">
                        <SelectValue placeholder="Select Identity..." />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl border-border/40">
                        {brands.map((brand) => (
                          <SelectItem key={brand.id} value={brand.id} className="rounded-xl">{brand.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3">
                    <Label className="font-bold text-xs uppercase tracking-widest text-muted-foreground px-1">Target Product</Label>
                    <Select value={form.product_id} onValueChange={handleChatProductChange}>
                      <SelectTrigger className="rounded-2xl h-12 focus:ring-primary/20 bg-muted/30 border-none">
                        <SelectValue placeholder="Global Perspective..." />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl border-border/40">
                        <SelectItem value="none" className="rounded-xl italic">No specific product</SelectItem>
                        {products.map((product) => (
                          <SelectItem key={product.id} value={product.id} className="rounded-xl">{product.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </header>

        {/* Chat Content Container */}
        <div className="flex-1 overflow-y-auto relative z-10 scroll-smooth" ref={chatScrollRef}>
          {!currentSession ? (
            <div className="h-full flex items-center justify-center px-6">
              <div className="text-center max-w-2xl space-y-12">
                <div className="space-y-4">
                  <div className="w-24 h-24 mx-auto bg-primary rounded-3xl flex items-center justify-center shadow-2xl shadow-primary/30 animate-bounce-subtle">
                    <Sparkles className="h-12 w-12 text-primary-foreground fill-current" />
                  </div>
                  <h2 className="text-4xl md:text-5xl font-black tracking-tight text-foreground leading-[1.1]">
                    What can we <br /><span className="text-primary italic">create</span> today?
                  </h2>
                  <p className="text-lg text-muted-foreground max-w-lg mx-auto leading-relaxed">
                    Collaborate with omniadly Intelligence to architect multi-channel campaigns,
                    creative copies, or market strategies.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md mx-auto">
                  <Button variant="outline" className="h-auto p-4 rounded-2xl border-border/50 bg-card/50 hover:bg-muted justify-start group" onClick={() => { setChatInput("Write 5 high-converting headlines for my brand"); createNewChatSession(); }}>
                    <div className="text-left space-y-1">
                      <p className="font-bold text-sm">Headlines</p>
                      <p className="text-[10px] text-muted-foreground uppercase font-black">Conversion Focus</p>
                    </div>
                  </Button>
                  <Button variant="outline" className="h-auto p-4 rounded-2xl border-border/50 bg-card/50 hover:bg-muted justify-start group" onClick={() => { setChatInput("Create a social media strategy for my new product"); createNewChatSession(); }}>
                    <div className="text-left space-y-1">
                      <p className="font-bold text-sm">Strategy</p>
                      <p className="text-[10px] text-muted-foreground uppercase font-black">Strategic Roadmap</p>
                    </div>
                  </Button>
                </div>

                <Button onClick={createNewChatSession} size="lg" className="rounded-full px-12 h-14 text-lg font-bold shadow-2xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all">
                  Initiate Architect
                </Button>
              </div>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto px-6 py-12 md:py-20 space-y-12">
              {currentSession.messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex items-start gap-4 md:gap-6 ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  <div className={`shrink-0 h-10 w-10 md:h-12 md:w-12 rounded-2xl flex items-center justify-center transition-transform hover:scale-110 ${message.role === 'assistant'
                    ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                    : 'bg-muted text-muted-foreground'
                    }`}>
                    {message.role === 'assistant' ? <Bot className="h-6 w-6" /> : <User className="h-6 w-6" />}
                  </div>

                  <div className={`flex flex-col gap-3 min-w-0 max-w-[85%] md:max-w-[75%] ${message.role === 'user' ? 'items-end' : 'items-start'}`}>
                    <div className={`p-5 md:p-6 rounded-2xl shadow-sm backdrop-blur-sm border transition-all duration-300 ${message.role === 'user'
                      ? 'bg-primary/95 text-primary-foreground border-primary/20 rounded-tr-none font-medium text-lg lg:text-xl selection:bg-background/20'
                      : 'bg-card border-border/60 text-foreground rounded-tl-none leading-relaxed text-base md:text-lg'
                      }`}>
                      <p className="whitespace-pre-wrap">{message.content}</p>
                    </div>

                    {message.generation && (
                      <Card className="w-full border-border/40 bg-card/30 backdrop-blur-md rounded-3xl overflow-hidden shadow-sm group hover:shadow-xl transition-all duration-500">
                        <CardContent className="p-8 space-y-6">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:rotate-12 transition-transform">
                                <Sparkles className="h-4 w-4" />
                              </div>
                              <span className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground/60">AI Blueprint Intelligence</span>
                            </div>
                            <Badge variant="outline" className="border-primary/20 text-primary bg-primary/5 uppercase font-bold text-[9px] px-2">Ready</Badge>
                          </div>

                          <div className="p-8 rounded-2xl bg-muted/30 border border-border/30 font-serif italic text-lg lg:text-2xl leading-relaxed text-foreground/90 selection:bg-primary/10">
                            &ldquo;{message.generation.generated_content}&rdquo;
                          </div>

                          <div className="flex gap-4">
                            <Button
                              variant="outline"
                              size="lg"
                              onClick={() => handleCopyContent(message.generation!.generated_content)}
                              className="flex-1 rounded-2xl h-12 font-bold border-border/40 hover:bg-muted hover:text-foreground transition-all"
                            >
                              <Copy className="h-4 w-4 mr-2" />
                              Copy Asset
                            </Button>
                            <Button
                              variant="default"
                              size="lg"
                              onClick={() => handleSaveToLibrary(message.generation!)}
                              className="flex-1 rounded-2xl h-12 font-bold bg-primary text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:scale-[1.02]"
                            >
                              <Save className="h-4 w-4 mr-2" />
                              Sync to Vault
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 px-2 flex items-center gap-2">
                      {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      {message.role === 'assistant' && (
                        <span className="flex items-center gap-1 text-primary">
                          <div className="h-1 w-1 rounded-full bg-primary" /> Multi-Prompt Optimized
                        </span>
                      )}
                    </span>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex gap-4 justify-start">
                  <div className="h-12 w-12 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center animate-pulse">
                    <Bot className="h-6 w-6" />
                  </div>
                  <div className="bg-card border border-border/60 rounded-2xl rounded-tl-none px-6 py-4 flex items-center gap-2">
                    <div className="flex gap-1.5">
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                      <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></div>
                      <div className="w-2 h-2 bg-primary/30 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
                    </div>
                  </div>
                </div>
              )}
              {/* Spacer for input area */}
              <div className="h-32" />
            </div>
          )}
        </div>

        {/* Floating Input Area */}
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 pointer-events-none z-30">
          <div className="max-w-3xl mx-auto w-full pointer-events-auto">
            {currentSession && (
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-chart-2/10 to-primary/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition duration-1000 group-focus-within:opacity-100" />
                <div className="relative bg-card/80 backdrop-blur-2xl border border-border/60 rounded-3xl shadow-2xl p-2 flex items-center gap-2 transition-all duration-500 group-focus-within:border-primary/30 group-focus-within:shadow-primary/5">
                  <div className="pl-4 pr-1 hidden sm:block">
                    <Sparkles className="h-5 w-5 text-primary/40 group-focus-within:text-primary transition-colors" />
                  </div>
                  <Input
                    placeholder="Brief your content requirements here..."
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendChatMessage()}
                    disabled={isTyping}
                    className="flex-1 bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 text-lg py-6 italic font-medium placeholder:text-muted-foreground/40"
                  />
                  <Button
                    onClick={sendChatMessage}
                    disabled={!chatInput.trim() || isTyping}
                    size="icon"
                    className="h-14 w-14 rounded-2xl bg-primary text-primary-foreground shadow-xl shadow-primary/20 transition-all hover:scale-105 active:scale-95 shrink-0"
                  >
                    {isTyping ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/20 border-t-white" />
                    ) : (
                      <Send className="h-6 w-6 ml-0.5" />
                    )}
                  </Button>
                </div>
                <div className="mt-3 text-center">
                  <p className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-[0.3em]">
                    AI Architect can make mistakes. Verify important information.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

