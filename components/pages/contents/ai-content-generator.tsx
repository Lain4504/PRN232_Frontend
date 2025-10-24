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
  Menu,
  MessageSquare,
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
  const [generations, setGenerations] = useState<AIContentGeneration[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
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
        profileId: session.user.id, // Add profileId for the request
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
        <aside className="hidden lg:flex lg:w-80 xl:w-96 border-r flex-col">
          <div className="p-4 border-b">
            <Button
                onClick={createNewChatSession}
                className="w-full"
                size="lg"
            >
              <Plus className="mr-2 h-4 w-4" />
              New Chat
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {conversations.map((conversation) => (
                <Card
                    key={conversation.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                        currentSession?.id === conversation.id ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => selectConversation(conversation)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <MessageSquare className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <span className="text-sm font-medium truncate">
                      {conversation.brandName || conversation.title}
                    </span>
                      </div>
                      <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteConversation(conversation.id);
                          }}
                          className="h-6 w-6 p-0 flex-shrink-0"
                      >
                        <XCircle className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {conversation.lastMessage || `${conversation.messageCount} messages`}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs text-muted-foreground">
                    {new Date(conversation.updatedAt).toLocaleDateString()}
                  </span>
                      {conversation.productName && (
                          <Badge variant="outline" className="text-xs">
                            {conversation.productName}
                          </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
            ))}

             {conversations.length === 0 && (
                 <div className="text-center py-12 flex flex-col items-center justify-center h-full">
                   <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                     <MessageSquare className="h-8 w-8 text-muted-foreground" />
                   </div>
                   <h3 className="text-lg font-semibold mb-2">No conversations yet</h3>
                   <p className="text-sm text-muted-foreground mb-6 max-w-sm">
                     Start chatting with AI to create engaging social media content
                   </p>
                   <Button
                       onClick={() => {
                         createNewChatSession();
                         setSidebarOpen(false);
                       }}
                       className="w-full max-w-xs"
                       size="lg"
                   >
                     <Plus className="h-4 w-4 mr-2" />
                     Start Your First Chat
                   </Button>
                 </div>
             )}
          </div>
        </aside>

        {/* Main Chat Area */}
        <main className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <header className="border-b p-3 sm:p-4 flex items-center justify-between gap-2 sm:gap-4">
            <div className="flex items-center gap-3">
              {/* Mobile Chat History Drawer */}
              <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="lg:hidden">
                    <MessageSquare className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                 <SheetContent side="bottom" className="h-[80vh] p-0 overflow-hidden flex flex-col">
                   <SheetHeader className="p-4 border-b flex-shrink-0">
                     <SheetTitle className="text-base sm:text-lg flex items-center gap-2">
                       <MessageSquare className="h-5 w-5" />
                       Chat History
                     </SheetTitle>
                   </SheetHeader>
                   <div className="p-4 border-b flex-shrink-0">
                     <Button
                         onClick={() => {
                           createNewChatSession();
                           setSidebarOpen(false); // Close drawer after creating new chat
                         }}
                         className="w-full h-11"
                         size="lg"
                     >
                       <Plus className="mr-2 h-4 w-4" />
                       New Chat
                     </Button>
                   </div>
                   <div className="overflow-y-auto p-3 sm:p-4 space-y-2 flex-1 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                    {conversations.map((conversation) => (
                        <Card
                            key={conversation.id}
                            className={`cursor-pointer transition-all hover:shadow-md ${
                                currentSession?.id === conversation.id ? 'ring-2 ring-primary' : ''
                            }`}
                            onClick={() => {
                              selectConversation(conversation);
                              setSidebarOpen(false); // Close drawer after selecting conversation
                            }}
                        >
                           <CardContent className="p-3 sm:p-4">
                             <div className="flex items-start justify-between mb-2">
                               <div className="flex items-center gap-2 min-w-0 flex-1">
                                 <MessageSquare className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                 <span className="text-sm font-medium truncate">
                               {conversation.brandName || conversation.title}
                             </span>
                               </div>
                               <Button
                                   variant="ghost"
                                   size="sm"
                                   onClick={(e) => {
                                     e.stopPropagation();
                                     deleteConversation(conversation.id);
                                   }}
                                   className="h-8 w-8 p-0 flex-shrink-0 touch-manipulation"
                               >
                                 <XCircle className="h-4 w-4" />
                               </Button>
                             </div>
                             <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                               {conversation.lastMessage || `${conversation.messageCount} messages`}
                             </p>
                             <div className="flex items-center justify-between">
                               <span className="text-xs text-muted-foreground">
                                 {new Date(conversation.updatedAt).toLocaleDateString()}
                               </span>
                               {conversation.productName && (
                                   <Badge variant="outline" className="text-xs">
                                     {conversation.productName}
                                   </Badge>
                               )}
                             </div>
                           </CardContent>
                        </Card>
                     ))}
                     
                     {conversations.length === 0 && (
                         <div className="text-center py-8">
                           <MessageSquare className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                           <p className="text-sm text-muted-foreground mb-4">
                             No conversations yet
                           </p>
                           <Button
                               variant="outline"
                               size="sm"
                               onClick={() => {
                                 createNewChatSession();
                                 setSidebarOpen(false);
                               }}
                               className="w-full"
                           >
                             <Plus className="h-4 w-4 mr-2" />
                             Start Your First Chat
                           </Button>
                         </div>
                     )}
                   </div>
                 </SheetContent>
              </Sheet>

               <div className="flex items-center gap-2 min-w-0 flex-1">
                 <Sparkles className="h-5 w-5 text-primary flex-shrink-0" />
                 <h1 className="text-base sm:text-lg font-semibold truncate">AI Content Generator</h1>
               </div>
            </div>

            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="flex-shrink-0">
                  <Settings className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Settings</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="w-[95vw] max-w-md mx-auto">
                <DialogHeader>
                  <DialogTitle>Chat Context Settings</DialogTitle>
                  <DialogDescription>
                    Configure your brand and product context for better AI responses
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="brand">Brand</Label>
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
                              No brands available
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
                    <Label htmlFor="product">Product (Optional)</Label>
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

                  {(form.brand_id || form.product_id) && (
                      <div className="p-3 bg-muted rounded-lg space-y-2">
                        <p className="text-sm font-medium">Current Context:</p>
                        <div className="flex flex-wrap gap-2">
                          {form.brand_id && (
                              <Badge variant="secondary">
                                {brands.find(b => b.id === form.brand_id)?.name}
                              </Badge>
                          )}
                          {form.product_id && form.product_id !== "none" && (
                              <Badge variant="outline">
                                {products.find(p => p.id === form.product_id)?.name}
                              </Badge>
                          )}
                        </div>
                      </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          </header>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-4" ref={chatScrollRef}>
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
                              className={`rounded-2xl px-3 py-2 sm:px-4 sm:py-3 ${
                                  message.role === 'user'
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
              <div className="border-t p-3 sm:p-4">
                <div className="max-w-3xl mx-auto">
                  <div className="flex gap-2">
                    <Input
                        placeholder="Type your message..."
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendChatMessage()}
                        disabled={isTyping}
                        className="flex-1 text-base sm:text-sm"
                    />
                    <Button
                        onClick={sendChatMessage}
                        disabled={!chatInput.trim() || isTyping}
                        size="icon"
                        className="flex-shrink-0 h-10 w-10 sm:h-9 sm:w-9"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
          )}
        </main>
      </div>
  );
}
