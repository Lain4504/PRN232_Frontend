"use client";

import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  Image as ImageIcon,
  Type,
  Maximize2
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
    generated_image_url?: string;
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
    adTypeRequested?: number;
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
  const [selectedAdType, setSelectedAdType] = useState<number>(AdTypes.TextOnly);

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
      adTypeRequested: selectedAdType
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
        adType: selectedAdType,
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
            generated_content: response.data.generatedContent || '',
            generated_image_url: response.data.generatedImageUrl || undefined,
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
              generated_content: msg.generatedText || '',
              generated_image_url: msg.generatedImageUrl || undefined,
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
      // AdTypeEnum: TextOnly = 0, ImageText = 1, VideoText = 2
      const adTypeValue = generation.generated_image_url ? 1 : 0;

      const response = await api.post(endpoints.contents(), {
        brandId: generation.brand_id,
        productId: generation.product_id,
        styleDescription: generation.style_context,
        adType: adTypeValue,
        textContent: generation.generated_image_url ? "" : generation.generated_content,
        imageUrl: generation.generated_image_url,
      });

      if (response.success) {
        toast.success('Đã lưu vào kho nội dung!');
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.error('Failed to save content:', error);
      toast.error('Lưu thất bại');
    }
  };

  const handleCopyContent = async (content: string) => {
    // Check if content is an image URL
    if (content.startsWith('http') && (content.match(/\.(jpeg|jpg|gif|png)$/) || content.includes('image.pollinations.ai'))) {
      try {
        const response = await fetch(content);
        const blob = await response.blob();

        await navigator.clipboard.write([
          new ClipboardItem({
            [blob.type]: blob
          })
        ]);
        toast.success('Đã sao chép ảnh vào bộ nhớ tạm!');
        return;
      } catch (error) {
        console.error('Failed to copy image:', error);
        // Fallback to copying URL if image copy fails
        navigator.clipboard.writeText(content);
        toast.info('Không thể sao chép ảnh trực tiếp. Đã sao chép đường dẫn ảnh!');
        return;
      }
    }

    // Default text copy behavior
    try {
      await navigator.clipboard.writeText(content);
      toast.success('Đã sao chép nội dung!');
    } catch (error) {
      toast.error('Không thể sao chép nội dung');
    }
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
      <aside className="hidden lg:flex lg:w-72 border-r border-border/40 dark:border-slate-800/40 flex-col bg-muted/20 dark:bg-slate-900/50 backdrop-blur-xl">
        <div className="p-6 border-b border-border/40 space-y-4">
          <Badge variant="outline" className="px-2 py-0.5 text-[8px] font-black uppercase tracking-widest bg-primary/5 text-primary border-primary/10">
            AISAM Content
          </Badge>
          <Button
            onClick={createNewChatSession}
            className="w-full rounded-2xl h-12 font-bold shadow-lg shadow-primary/10 transition-all hover:scale-[1.02] active:scale-[0.98]"
            size="lg"
          >
            <Plus className="mr-2 h-5 w-5" />
            Hội thoại mới
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          <div className="px-3 py-2 text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">
            Phiên gần đây
          </div>
          {conversations.map((conversation) => (
            <div
              key={conversation.id}
              className={`group cursor-pointer p-4 rounded-2xl transition-all duration-300 flex items-center justify-between border ${currentSession?.id === conversation.id
                ? 'bg-card dark:bg-slate-800 border-border dark:border-slate-700 shadow-sm'
                : 'border-transparent hover:bg-muted/50 dark:hover:bg-slate-800/50 hover:border-border/30 dark:hover:border-slate-700/30'
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
                    {conversation.lastMessage || `${conversation.messageCount} tương tác`}
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
              <h3 className="text-sm font-bold text-foreground mb-2">Lịch sử trống</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Lịch sử tạo nội dung AI của bạn sẽ xuất hiện ở đây sau khi bạn bắt đầu một phiên mới.
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
        <header className="h-14 shrink-0 border-b border-border/40 dark:border-slate-800/40 px-4 md:px-6 flex items-center justify-between bg-background/50 backdrop-blur-md relative z-20">
          <div className="flex items-center gap-4">
            <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden rounded-xl">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[85vw] max-w-[320px] p-0 border-r border-border/40 dark:border-slate-800/40 bg-background/95 dark:bg-slate-900/95 backdrop-blur-3xl">
                <SheetHeader className="p-6 border-b border-border/40">
                  <SheetTitle className="text-left text-sm font-black uppercase tracking-widest text-primary">Lịch sử hội thoại</SheetTitle>
                </SheetHeader>
                <div className="h-full flex flex-col">
                  <div className="p-4 border-b border-border/10">
                    <Button onClick={createNewChatSession} className="w-full rounded-2xl h-12 font-bold shadow-lg shadow-primary/10">
                      <Plus className="mr-2 h-5 w-5" /> Chat mới
                    </Button>
                  </div>
                  <div className="flex-1 overflow-y-auto p-2 space-y-2">
                    {conversations.map((conversation) => (
                      <div
                        key={conversation.id}
                        className={`group cursor-pointer p-3 rounded-2xl transition-all flex items-center justify-between border ${currentSession?.id === conversation.id
                          ? 'bg-primary/5 border-primary/20'
                          : 'border-transparent hover:bg-muted/50'
                          }`}
                        onClick={() => {
                          selectConversation(conversation);
                          setSidebarOpen(false);
                        }}
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${currentSession?.id === conversation.id ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                            }`}>
                            <MessageSquare className="h-5 w-5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-xs font-bold truncate uppercase tracking-tight">
                              {conversation.brandName || conversation.title}
                            </div>
                            <div className="text-[10px] text-muted-foreground line-clamp-1 font-medium italic">
                              {conversation.lastMessage || "Chưa có nội dung"}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    {conversations.length === 0 && (
                      <div className="text-center py-10 opacity-40">
                        <MessageSquare className="h-8 w-8 mx-auto mb-2" />
                        <p className="text-[10px] font-bold uppercase tracking-widest">Trống</p>
                      </div>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>

            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center shadow-lg shadow-primary/20 dark:shadow-primary/40">
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
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Hệ thống hoạt động</span>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="rounded-xl border-border/50 hover:bg-muted/50 transition-all font-bold">
                  <Settings className="h-4 w-4 mr-2" />
                  Bối cảnh
                </Button>
              </DialogTrigger>
              <DialogContent className="rounded-3xl border-border/40 dark:border-slate-800 bg-background/95 dark:bg-slate-900/95 backdrop-blur-xl overflow-hidden shadow-2xl">
                <DialogHeader className="pt-4">
                  <DialogTitle className="text-2xl font-bold">Bối cảnh mô hình</DialogTitle>
                  <DialogDescription>Tối ưu hóa đầu ra bằng cách chỉ định dữ liệu thương hiệu và sản phẩm.</DialogDescription>
                </DialogHeader>
                <div className="space-y-6 py-8">
                  <div className="space-y-3">
                    <Label className="font-bold text-xs uppercase tracking-widest text-muted-foreground px-1">Thương hiệu</Label>
                    <Select value={form.brand_id} onValueChange={handleChatBrandChange}>
                      <SelectTrigger className="rounded-2xl h-12 focus:ring-primary/20 bg-muted/30 border-none">
                        <SelectValue placeholder="Chọn thương hiệu..." />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl border-border/40">
                        {brands.map((brand) => (
                          <SelectItem key={brand.id} value={brand.id} className="rounded-xl">{brand.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3">
                    <Label className="font-bold text-xs uppercase tracking-widest text-muted-foreground px-1">Sản phẩm mục tiêu</Label>
                    <Select value={form.product_id} onValueChange={handleChatProductChange}>
                      <SelectTrigger className="rounded-2xl h-12 focus:ring-primary/20 bg-muted/30 border-none">
                        <SelectValue placeholder="Toàn cầu..." />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl border-border/40">
                        <SelectItem value="none" className="rounded-xl italic">Không chọn sản phẩm</SelectItem>
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
        <div className="flex-1 overflow-y-auto relative z-10 scroll-smooth pb-32" ref={chatScrollRef}>
          {!currentSession ? (
            <div className="h-full flex items-center justify-center px-4">
              <div className="text-center max-w-2xl space-y-8 md:space-y-12 py-10">
                <div className="space-y-4 md:space-y-6">
                  <div className="w-20 h-20 md:w-24 md:h-24 mx-auto bg-primary dark:bg-primary rounded-3xl flex items-center justify-center shadow-2xl shadow-primary/30 dark:shadow-primary/50 animate-bounce-subtle">
                    <Sparkles className="h-10 w-10 md:h-12 md:w-12 text-primary-foreground fill-current" />
                  </div>
                  <h2 className="text-3xl md:text-5xl font-black tracking-tight text-foreground leading-[1.1] px-4">
                    Hôm nay chúng ta sẽ <br /><span className="text-primary italic">sáng tạo</span> gì?
                  </h2>
                  <p className="text-sm md:text-lg text-muted-foreground max-w-lg mx-auto leading-relaxed px-6">
                    Hợp tác với AI Architect để thiết kế các chiến dịch đa kênh,
                    nội dung sáng tạo hoặc chiến thuật tiếp cận thị trường.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 max-w-md mx-auto px-4">
                  <Button variant="outline" className="h-auto p-4 rounded-2xl border-border/50 bg-card/50 hover:bg-muted justify-start group transition-all" onClick={() => { setChatInput("Viết 5 tiêu đề chuyển đổi cao cho thương hiệu của tôi"); createNewChatSession(); }}>
                    <div className="text-left space-y-1">
                      <p className="font-bold text-sm">Tiêu đề</p>
                      <p className="text-[9px] md:text-[10px] text-muted-foreground uppercase font-black tracking-widest">Tập trung chuyển đổi</p>
                    </div>
                  </Button>
                  <Button variant="outline" className="h-auto p-4 rounded-2xl border-border/50 bg-card/50 hover:bg-muted justify-start group transition-all" onClick={() => { setChatInput("Tạo chiến lược mạng xã hội cho sản phẩm mới"); createNewChatSession(); }}>
                    <div className="text-left space-y-1">
                      <p className="font-bold text-sm">Chiến lược</p>
                      <p className="text-[9px] md:text-[10px] text-muted-foreground uppercase font-black tracking-widest">Lộ trình chiến lược</p>
                    </div>
                  </Button>
                </div>

                <Button onClick={createNewChatSession} size="lg" className="rounded-full px-10 md:px-12 h-12 md:h-14 md:text-lg font-black uppercase tracking-widest bg-slate-900 dark:bg-primary hover:bg-slate-800 dark:hover:bg-primary/90 text-white shadow-2xl shadow-slate-200 dark:shadow-primary/20 hover:scale-105 active:scale-95 transition-all">
                  Bắt đầu sáng tạo
                </Button>
              </div>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto px-4 py-6 md:py-10 space-y-6 md:space-y-8">
              {currentSession.messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex items-start gap-3 md:gap-6 ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  <div className={`shrink-0 h-9 w-9 md:h-12 md:w-12 rounded-xl md:rounded-2xl flex items-center justify-center transition-transform hover:scale-110 ${message.role === 'assistant'
                    ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                    : 'bg-muted text-muted-foreground'
                    }`}>
                    {message.role === 'assistant' ? <Bot className="h-5 w-5 md:h-6 md:w-6" /> : <User className="h-5 w-5 md:h-6 md:w-6" />}
                  </div>

                  <div className={`flex flex-col gap-1.5 min-w-0 max-w-[85%] sm:max-w-[75%] ${message.role === 'user' ? 'items-end' : 'items-start'}`}>
                    <div className={`px-4 py-3 rounded-2xl shadow-sm border transition-all duration-300 ${message.role === 'user'
                      ? 'bg-primary text-primary-foreground border-primary/20 rounded-tr-none font-medium text-sm sm:text-base'
                      : 'bg-muted/30 dark:bg-slate-800/30 border-border/60 dark:border-slate-700/60 text-foreground dark:text-slate-100 rounded-tl-none leading-relaxed text-sm sm:text-base'
                      }`}>
                      <p className="whitespace-pre-wrap">{message.content}</p>
                    </div>

                    {message.generation && (
                      <Card className="w-full border-border/40 dark:border-slate-800 bg-card/30 dark:bg-slate-800/30 backdrop-blur-md rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-500">
                        <CardContent className="p-4 md:p-6 space-y-3 md:space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="size-6 md:size-7 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:rotate-12 transition-transform">
                                <Sparkles className="h-3.5 w-3.5" />
                              </div>
                              <span className="text-[8px] md:text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">TRÍ TUỆ NHÂN TẠO</span>
                            </div>
                            <Badge variant="outline" className="border-primary/20 text-primary bg-primary/5 uppercase font-black text-[7px] px-1.5 py-0 rounded-md">LIVE</Badge>
                          </div>

                          <div className="p-4 md:p-6 rounded-xl bg-muted/30 dark:bg-slate-900/50 border border-border/30 dark:border-slate-800/30 font-serif italic text-sm md:text-lg leading-relaxed text-foreground/90 dark:text-slate-200 selection:bg-primary/10">
                            &ldquo;{message.generation.generated_content}&rdquo;
                          </div>

                          {message.generation.generated_image_url && (
                            <div className="relative group/img overflow-hidden rounded-xl border border-border/40 shadow-lg aspect-square w-full max-w-sm mx-auto bg-muted">
                              <img
                                src={message.generation.generated_image_url}
                                alt="AI Generated Content"
                                className="w-full h-full object-cover transition-transform duration-700 group-hover/img:scale-105"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover/img:opacity-100 transition-opacity duration-300 flex items-end p-4">
                                <Button variant="secondary" size="sm" className="h-8 rounded-lg font-bold backdrop-blur-md bg-white/10 border-white/20 text-white" onClick={() => window.open(message.generation!.generated_image_url, '_blank')}>
                                  <Maximize2 className="h-3.5 w-3.5 mr-1.5" /> Xem ảnh
                                </Button>
                              </div>
                            </div>
                          )}

                          <div className="flex flex-col sm:flex-row gap-2 md:gap-3">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                if (message.generation?.generated_image_url) {
                                  handleCopyContent(message.generation.generated_image_url);
                                } else {
                                  handleCopyContent(message.generation!.generated_content);
                                }
                              }}
                              className="flex-1 rounded-xl h-10 font-black uppercase tracking-widest text-[10px] border-border/40 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-400 dark:text-slate-500 hover:bg-muted dark:hover:bg-slate-800 transition-all"
                            >
                              <Copy className="h-3.5 w-3.5 mr-2" />
                              Sao chép
                            </Button>
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => handleSaveToLibrary(message.generation!)}
                              className="flex-1 rounded-xl h-10 font-black uppercase tracking-widest text-[10px] bg-slate-900 dark:bg-primary text-white shadow-sm transition-all hover:scale-[1.02]"
                            >
                              <Save className="h-3.5 w-3.5 mr-2" />
                              Lưu dữ liệu
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 px-2 flex items-center gap-2">
                      {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      {message.role === 'assistant' && (
                        <span className="flex items-center gap-1 text-primary">
                          <div className="h-1 w-1 rounded-full bg-primary" /> ĐÃ TỐI ƯU
                        </span>
                      )}
                    </span>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex gap-3 md:gap-4 justify-start">
                  <div className="h-9 w-9 md:h-12 md:w-12 rounded-xl md:rounded-2xl bg-primary text-primary-foreground flex items-center justify-center animate-pulse shadow-lg shadow-primary/20">
                    <Bot className="h-5 w-5 md:h-6 md:w-6" />
                  </div>
                  <div className="bg-card dark:bg-slate-800 border border-border/60 dark:border-slate-700/60 rounded-2xl rounded-tl-none px-5 py-3 md:px-6 md:py-4 flex items-center gap-2">
                    <div className="flex gap-1.5">
                      <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                      <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></div>
                      <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-primary/30 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
                    </div>
                  </div>
                </div>
              )}
              {/* Spacer for input area */}
              <div className="h-40 md:h-48" />
            </div>
          )}
        </div>

        {/* Floating Input Area */}
        <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 lg:p-10 pointer-events-none z-30">
          <div className="max-w-3xl mx-auto w-full pointer-events-auto">
            {currentSession && (
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-chart-2/10 to-primary/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition duration-1000 group-focus-within:opacity-100" />
                <div className="relative bg-card/90 dark:bg-slate-900/90 backdrop-blur-2xl border border-border/60 dark:border-slate-800/60 rounded-3xl shadow-2xl p-1.5 md:p-2 flex flex-col items-stretch gap-2 transition-all duration-500 group-focus-within:border-primary/30 group-focus-within:shadow-primary/5">
                  <div className="flex items-end w-full gap-2 px-1">
                    <div className="pb-3 pl-2 hidden sm:block">
                      <Sparkles className="h-5 w-5 text-primary/40 group-focus-within:text-primary transition-colors" />
                    </div>

                    <div className="flex bg-muted/50 rounded-2xl p-1 gap-1 border border-border/40">
                      <Button
                        variant={selectedAdType === AdTypes.TextOnly ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setSelectedAdType(AdTypes.TextOnly)}
                        className={`h-9 px-3 rounded-xl transition-all ${selectedAdType === AdTypes.TextOnly ? 'bg-primary text-primary-foreground shadow-lg' : 'text-muted-foreground dark:text-slate-500 hover:bg-muted dark:hover:bg-slate-800'}`}
                      >
                        <Type className="size-4 sm:mr-2" />
                        <span className="text-[10px] font-black uppercase tracking-widest hidden lg:inline">Văn bản</span>
                      </Button>
                      <Button
                        variant={selectedAdType === AdTypes.Image ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setSelectedAdType(AdTypes.Image)}
                        className={`h-9 px-3 rounded-xl transition-all ${selectedAdType === AdTypes.Image ? 'bg-primary text-primary-foreground shadow-lg' : 'text-muted-foreground dark:text-slate-500 hover:bg-muted dark:hover:bg-slate-800'}`}
                      >
                        <ImageIcon className="size-4 sm:mr-2" />
                        <span className="text-[10px] font-black uppercase tracking-widest hidden lg:inline">Hình ảnh</span>
                      </Button>
                    </div>

                    <div className="flex-1 flex items-center min-w-0">
                      <Textarea
                        placeholder="Hỏi gì đó..."
                        value={chatInput}
                        onChange={(e) => {
                          setChatInput(e.target.value);
                          // Auto-resize
                          e.target.style.height = 'auto';
                          e.target.style.height = `${Math.min(e.target.scrollHeight, 200)}px`;
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            sendChatMessage();
                            // Reset height
                            if (e.currentTarget) {
                              e.currentTarget.style.height = 'auto';
                            }
                          }
                        }}
                        disabled={isTyping}
                        rows={1}
                        className="flex-1 bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 text-sm md:text-base py-3 resize-none min-h-[44px] max-h-[200px] font-medium text-slate-900 dark:text-white placeholder:text-muted-foreground/40 dark:placeholder:text-slate-700 scrollbar-hide"
                      />
                    </div>

                    <Button
                      onClick={() => {
                        sendChatMessage();
                        // Reset height of textarea if we can find it
                        const textarea = document.querySelector('textarea');
                        if (textarea) textarea.style.height = 'auto';
                      }}
                      disabled={!chatInput.trim() || isTyping}
                      size="icon"
                      className="size-10 md:size-12 rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95 shrink-0 mb-1"
                    >
                      {isTyping ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/20 border-t-white" />
                      ) : (
                        <Send className="h-4 w-4 md:h-5 md:w-5" />
                      )}
                    </Button>
                  </div>
                </div>
                <div className="mt-4 text-center hidden md:block">
                  <p className="text-[10px] font-bold text-muted-foreground/30 uppercase tracking-[0.4em]">
                    Artificial Intelligence Architecture Core v4.0.5
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

