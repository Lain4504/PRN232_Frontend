// Mock API functions for AISAM Frontend
// Simulates API calls with delays and localStorage for persistence

import {
  User,
  Profile,
  Brand,
  Product,
  Content,
  SocialAccount,
  SocialIntegration,
  Approval,
  ScheduledPost,
  Post,
  PerformanceMetrics,
  DashboardStats,
  RecentActivity,
  CalendarEvent,
  PerformanceReport,
  CreateProfileForm,
  CreateBrandForm,
  CreateProductForm,
  CreateContentForm,
  CreateSocialIntegrationForm,
  SchedulePostForm,
  ContentFilters,
  ProductFilters,
  PostFilters,
  ApiResponse,
  PaginatedResponse
} from './types/aisam-types';

// Utility functions
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// AI Content Generation Helpers
const generateTextOnlyContent = (prompt: string, brand?: Brand | null, product?: Product | null, styleContext?: string): string => {
  const templates = [
    `✨ ${brand?.name || 'Your Brand'} presents: ${prompt}. ${styleContext ? `In a ${styleContext} style.` : ''} #Innovation #Quality`,
    `🚀 Discover the power of ${brand?.name || 'excellence'}: ${prompt}. ${product?.name ? `Featuring ${product.name}.` : ''} Experience the difference!`,
    `🌟 Transform your experience with ${brand?.name || 'our brand'}. ${prompt}. ${styleContext || 'Professional and engaging'}. #Premium #Lifestyle`,
    `💫 ${brand?.name || 'We'} bring you: ${prompt}. ${product?.name ? `Showcasing ${product.name}.` : ''} Elevate your standards today!`,
    `🎯 Excellence redefined: ${brand?.name || 'Our brand'} delivers ${prompt}. ${styleContext ? `With a ${styleContext} approach.` : ''} #Leadership #Quality`
  ];
  return templates[Math.floor(Math.random() * templates.length)];
};

const generateImageTextContent = (prompt: string, brand?: Brand | null, product?: Product | null, styleContext?: string): string => {
  const templates = [
    `📸 Stunning visuals meet exceptional quality! ${brand?.name || 'Our brand'} showcases ${prompt}. ${product?.name ? `Featuring ${product.name}.` : ''} See the difference! #VisualStorytelling`,
    `🎨 Beauty in every detail. ${brand?.name || 'We'} present ${prompt} in our latest collection. ${styleContext ? `Captured in ${styleContext} style.` : ''} #Aesthetic #Quality`,
    `🖼️ Picture perfect! ${brand?.name || 'Our brand'} brings you ${prompt}. ${product?.name ? `Highlighting ${product.name}.` : ''} Experience excellence visually.`,
    `📷 Capturing excellence: ${brand?.name || 'We'} unveil ${prompt}. ${styleContext || 'Professional photography'} that tells your story. #VisualExcellence`,
    `🌈 Colors of success! ${brand?.name || 'Our brand'} demonstrates ${prompt} through stunning imagery. ${product?.name ? `Showcasing ${product.name}.` : ''} #VisualImpact`
  ];
  return templates[Math.floor(Math.random() * templates.length)];
};

const generateVideoTextContent = (prompt: string, brand?: Brand | null, product?: Product | null, styleContext?: string): string => {
  const templates = [
    `🎥 Watch and be amazed! ${brand?.name || 'Our brand'} unveils ${prompt}. ${product?.name ? `Featuring ${product.name}.` : ''} Don't miss this! #VideoContent`,
    `📹 Motion meets emotion. ${brand?.name || 'We'} bring ${prompt} to life. ${styleContext ? `In ${styleContext} style.` : ''} Watch now! #Dynamic #Engaging`,
    `🎬 Lights, camera, action! ${brand?.name || 'Our brand'} stars in ${prompt}. ${product?.name ? `Showcasing ${product.name}.` : ''} Experience the magic!`,
    `📺 Visual storytelling at its finest: ${brand?.name || 'We'} present ${prompt}. ${styleContext || 'Cinematic quality'} that captivates. #VideoExcellence`,
    `🎪 Experience the spectacle! ${brand?.name || 'Our brand'} delivers ${prompt} through compelling video. ${product?.name ? `Highlighting ${product.name}.` : ''} #Entertainment #Quality`
  ];
  return templates[Math.floor(Math.random() * templates.length)];
};

const getFromStorage = <T>(key: string, defaultValue: T): T => {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
  } catch {
    return defaultValue;
  }
};

const saveToStorage = <T>(key: string, value: T): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Failed to save to localStorage:', error);
  }
};

// Mock API responses
const createSuccessResponse = <T>(data: T, message: string = 'Success'): ApiResponse<T> => ({
  data,
  message,
  success: true
});

const createErrorResponse = (message: string): ApiResponse<null> => ({
  data: null,
  message,
  success: false
});

// Authentication API
export const authApi = {
  async login(email: string, password: string): Promise<ApiResponse<{ user: User; token: string }>> {
    await delay(1000);

    // Mock validation
    if (email === 'john.doe@example.com' && password === 'password123') {
      const user: User = {
        id: 'user-1',
        email: 'john.doe@example.com',
        first_name: 'John',
        last_name: 'Doe',
        phone: '+1234567890',
        role: 'user',
        created_at: '2024-01-15T10:00:00Z',
        updated_at: '2024-01-15T10:00:00Z'
      };

      const token = 'mock_jwt_token_' + Date.now();
      saveToStorage('auth_token', token);
      saveToStorage('current_user', user);

      return createSuccessResponse({ user, token }, 'Login successful');
    }

    return {
      data: null as unknown as { user: User; token: string },
      message: 'Invalid email or password',
      success: false
    };
  },

  async register(userData: {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    phone?: string;
  }): Promise<ApiResponse<{ user: User; token: string }>> {
    await delay(1200);

    // Mock validation
    if (userData.email && userData.password && userData.first_name && userData.last_name) {
      const user: User = {
        id: 'user-' + Date.now(),
        email: userData.email,
        first_name: userData.first_name,
        last_name: userData.last_name,
        phone: userData.phone,
        role: 'user',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const token = 'mock_jwt_token_' + Date.now();
      saveToStorage('auth_token', token);
      saveToStorage('current_user', user);

      return createSuccessResponse({ user, token }, 'Account created successfully');
    }

    return {
      data: null as unknown as { user: User; token: string },
      message: 'Missing required fields',
      success: false
    };
  },

  async logout(): Promise<ApiResponse<null>> {
    await delay(500);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('current_user');
    return createSuccessResponse(null, 'Logged out successfully');
  },

  async getCurrentUser(): Promise<ApiResponse<User | null>> {
    await delay(300);
    const user = getFromStorage<User | null>('current_user', null);
    return createSuccessResponse(user);
  }
};

// Profile API
export const profileApi = {
  async getProfiles(userId: string): Promise<ApiResponse<Profile[]>> {
    await delay(800);
    const profiles = getFromStorage<Profile[]>('profiles', []);
    const userProfiles = profiles.filter(p => p.user_id === userId);
    return createSuccessResponse(userProfiles);
  },

  async createProfile(userId: string, formData: CreateProfileForm): Promise<ApiResponse<Profile>> {
    await delay(1000);

    const profile: Profile = {
      id: 'profile-' + Date.now(),
      user_id: userId,
      profile_type: formData.profile_type,
      company_name: formData.company_name,
      bio: formData.bio,
      avatar_url: formData.avatar ? URL.createObjectURL(formData.avatar) : undefined,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const profiles = getFromStorage<Profile[]>('profiles', []);
    profiles.push(profile);
    saveToStorage('profiles', profiles);

    return createSuccessResponse(profile, 'Profile created successfully');
  },

  async updateProfile(id: string, formData: Partial<CreateProfileForm>): Promise<ApiResponse<Profile>> {
    await delay(1000);

    const profiles = getFromStorage<Profile[]>('profiles', []);
    const index = profiles.findIndex(p => p.id === id);

    if (index === -1) {
      return {
        data: null as unknown as Profile,
        message: 'Profile not found',
        success: false
      };
    }

    profiles[index] = {
      ...profiles[index],
      ...formData,
      updated_at: new Date().toISOString()
    };

    saveToStorage('profiles', profiles);
    return createSuccessResponse(profiles[index], 'Profile updated successfully');
  }
};

// Brand API
export const brandApi = {
  async getBrands(profileId?: string): Promise<ApiResponse<Brand[]>> {
    await delay(800);
    const brands = getFromStorage<Brand[]>('brands', []);
    const filteredBrands = profileId ? brands.filter(b => b.profile_id === profileId) : brands;
    return createSuccessResponse(filteredBrands);
  },

  async createBrand(formData: CreateBrandForm): Promise<ApiResponse<Brand>> {
    await delay(1000);

    const brand: Brand = {
      id: 'brand-' + Date.now(),
      profile_id: formData.profile_id,
      name: formData.name,
      description: formData.description,
      logo_url: formData.logo ? URL.createObjectURL(formData.logo) : undefined,
      slogan: formData.slogan,
      usp: formData.usp,
      target_audience: formData.target_audience,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const brands = getFromStorage<Brand[]>('brands', []);
    brands.push(brand);
    saveToStorage('brands', brands);

    return createSuccessResponse(brand, 'Brand created successfully');
  },

  async updateBrand(id: string, formData: Partial<CreateBrandForm>): Promise<ApiResponse<Brand>> {
    await delay(1000);

    const brands = getFromStorage<Brand[]>('brands', []);
    const index = brands.findIndex(b => b.id === id);

    if (index === -1) {
      return {
        data: null as unknown as Brand,
        message: 'Brand not found',
        success: false
      };
    }

    brands[index] = {
      ...brands[index],
      ...formData,
      updated_at: new Date().toISOString()
    };

    saveToStorage('brands', brands);
    return createSuccessResponse(brands[index], 'Brand updated successfully');
  },

  async deleteBrand(id: string): Promise<ApiResponse<null>> {
    await delay(800);

    const brands = getFromStorage<Brand[]>('brands', []);
    const filteredBrands = brands.filter(b => b.id !== id);
    saveToStorage('brands', filteredBrands);

    return createSuccessResponse(null, 'Brand deleted successfully');
  }
};

// Product API
export const productApi = {
  async getProducts(filters?: ProductFilters): Promise<ApiResponse<Product[]>> {
    await delay(800);
    let products = getFromStorage<Product[]>('products', []);

    if (filters?.brand_id) {
      products = products.filter(p => p.brand_id === filters.brand_id);
    }

    if (filters?.search) {
      const searchLower = filters.search.toLowerCase();
      products = products.filter(p =>
        p.name.toLowerCase().includes(searchLower) ||
        p.description?.toLowerCase().includes(searchLower)
      );
    }

    return createSuccessResponse(products);
  },

  async createProduct(formData: CreateProductForm): Promise<ApiResponse<Product>> {
    await delay(1200);

    const product: Product = {
      id: 'product-' + Date.now(),
      brand_id: formData.brand_id,
      name: formData.name,
      description: formData.description,
      price: formData.price,
      images: formData.images ? formData.images.map(img => URL.createObjectURL(img)) : [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const products = getFromStorage<Product[]>('products', []);
    products.push(product);
    saveToStorage('products', products);

    return createSuccessResponse(product, 'Product created successfully');
  },

  async updateProduct(id: string, formData: Partial<CreateProductForm>): Promise<ApiResponse<Product>> {
    await delay(1000);

    const products = getFromStorage<Product[]>('products', []);
    const index = products.findIndex(p => p.id === id);

    if (index === -1) {
      return {
        data: null as unknown as Product,
        message: 'Product not found',
        success: false
      };
    }

    const { images, ...formDataWithoutImages } = formData;

    const updateData: Partial<Product> = {
      ...formDataWithoutImages,
      updated_at: new Date().toISOString()
    };

    // Convert File[] to string[] if images are provided
    if (images) {
      updateData.images = images.map(img => URL.createObjectURL(img));
    }

    products[index] = {
      ...products[index],
      ...updateData
    };

    saveToStorage('products', products);
    return createSuccessResponse(products[index], 'Product updated successfully');
  },

  async deleteProduct(id: string): Promise<ApiResponse<null>> {
    await delay(800);

    const products = getFromStorage<Product[]>('products', []);
    const filteredProducts = products.filter(p => p.id !== id);
    saveToStorage('products', filteredProducts);

    return createSuccessResponse(null, 'Product deleted successfully');
  }
};

// Content API
export const contentApi = {
  async getContents(filters?: ContentFilters): Promise<ApiResponse<Content[]>> {
    await delay(800);
    let contents = getFromStorage<Content[]>('contents', []);

    if (filters?.brand_id) {
      contents = contents.filter(c => c.brand_id === filters.brand_id);
    }

    if (filters?.product_id) {
      contents = contents.filter(c => c.product_id === filters.product_id);
    }

    if (filters?.status) {
      contents = contents.filter(c => c.status === filters.status);
    }

    if (filters?.ad_type) {
      contents = contents.filter(c => c.ad_type === filters.ad_type);
    }

    if (filters?.search) {
      const searchLower = filters.search.toLowerCase();
      contents = contents.filter(c =>
        c.title.toLowerCase().includes(searchLower) ||
        c.text_content?.toLowerCase().includes(searchLower)
      );
    }

    return createSuccessResponse(contents);
  },

  async createContent(formData: CreateContentForm): Promise<ApiResponse<Content>> {
    await delay(1200);

    const content: Content = {
      id: 'content-' + Date.now(),
      brand_id: formData.brand_id,
      product_id: formData.product_id,
      ad_type: formData.ad_type,
      title: formData.title,
      text_content: formData.text_content,
      style_context_character: formData.style_context_character,
      image_url: formData.image ? URL.createObjectURL(formData.image) : undefined,
      video_url: formData.video ? URL.createObjectURL(formData.video) : undefined,
      status: 'draft',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const contents = getFromStorage<Content[]>('contents', []);
    contents.push(content);
    saveToStorage('contents', contents);

    return createSuccessResponse(content, 'Content created successfully');
  },

  async updateContent(id: string, formData: Partial<CreateContentForm>): Promise<ApiResponse<Content>> {
    await delay(1000);

    const contents = getFromStorage<Content[]>('contents', []);
    const index = contents.findIndex(c => c.id === id);

    if (index === -1) {
      return {
        data: null as unknown as Content,
        message: 'Content not found',
        success: false
      };
    }

    contents[index] = {
      ...contents[index],
      ...formData,
      updated_at: new Date().toISOString()
    };

    saveToStorage('contents', contents);
    return createSuccessResponse(contents[index], 'Content updated successfully');
  },

  async submitForApproval(id: string): Promise<ApiResponse<Content>> {
    await delay(800);

    const contents = getFromStorage<Content[]>('contents', []);
    const index = contents.findIndex(c => c.id === id);

    if (index === -1) {
      return {
        data: null as unknown as Content,
        message: 'Content not found',
        success: false
      };
    }

    contents[index].status = 'pending_approval';
    contents[index].updated_at = new Date().toISOString();

    saveToStorage('contents', contents);

    // Create approval record
    const approvals = getFromStorage<Approval[]>('approvals', []);
    const approval: Approval = {
      id: 'approval-' + Date.now(),
      content_id: id,
      approver_id: 'user-1', // Mock approver
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    approvals.push(approval);
    saveToStorage('approvals', approvals);

    return createSuccessResponse(contents[index], 'Content submitted for approval');
  },

<<<<<<< HEAD
  async generateAIContent(prompt: string, brandId?: string, productId?: string, styleContext?: string, adType?: string): Promise<ApiResponse<{ text: string; image?: string }>> {
    await delay(3000); // Simulate AI processing time

    // Mock AI response with more sophisticated content generation
    const brand = brandId ? getFromStorage<Brand[]>('brands', []).find(b => b.id === brandId) : null;
    const product = productId ? getFromStorage<Product[]>('products', []).find(p => p.id === productId) : null;

    let generatedText = '';

    if (adType === 'text_only') {
      generatedText = generateTextOnlyContent(prompt, brand, product, styleContext);
    } else if (adType === 'image_text') {
      generatedText = generateImageTextContent(prompt, brand, product, styleContext);
    } else if (adType === 'video_text') {
      generatedText = generateVideoTextContent(prompt, brand, product, styleContext);
    } else {
      generatedText = `✨ ${brand?.name || 'Your Brand'} presents: ${prompt}. Experience excellence today! #Innovation #Quality`;
    }

=======
  async generateAIContent(prompt: string): Promise<ApiResponse<{ text: string; image?: string }>> {
    await delay(2000); // Simulate AI processing time

    // Mock AI response
>>>>>>> eb2ee3a871cf49fb4f327263f4b5bacdf3088fdf
    const aiResponse = {
      text: generatedText,
      image: adType === 'image_text' || adType === 'video_text' ? 'https://via.placeholder.com/800x600?text=AI+Generated+Image' : undefined
    };

    return createSuccessResponse(aiResponse, 'AI content generated successfully');
  },

  async saveGeneratedContent(generationData: {
    prompt: string;
    brand_id: string;
    product_id?: string;
    style_context: string;
    ad_type: string;
    generated_content: string;
    image_url?: string;
  }): Promise<ApiResponse<Content>> {
    await delay(1000);

    const content: Content = {
      id: 'content-' + Date.now(),
      brand_id: generationData.brand_id,
      product_id: generationData.product_id,
      ad_type: generationData.ad_type as 'image_text' | 'video_text' | 'text_only',
      title: `AI Generated: ${generationData.prompt.substring(0, 50)}...`,
      text_content: generationData.generated_content,
      style_context_character: generationData.style_context,
      image_url: generationData.image_url,
      status: 'draft',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const contents = getFromStorage<Content[]>('contents', []);
    contents.push(content);
    saveToStorage('contents', contents);

    return createSuccessResponse(content, 'Content saved to library successfully');
  }
};

// Social Account API
export const socialAccountApi = {
  async getSocialAccounts(userId: string): Promise<ApiResponse<SocialAccount[]>> {
    await delay(800);
    const accounts = getFromStorage<SocialAccount[]>('social_accounts', []);
    const userAccounts = accounts.filter(a => a.user_id === userId);
    return createSuccessResponse(userAccounts);
  },

  async connectAccount(platform: string, accountData: Record<string, unknown>): Promise<ApiResponse<SocialAccount>> {
    await delay(1500); // Simulate OAuth flow

    const account: SocialAccount = {
      id: 'social-' + Date.now(),
      user_id: accountData.user_id as string,
      platform: platform as 'facebook' | 'instagram' | 'tiktok' | 'twitter' | 'linkedin',
      account_id: accountData.account_id as string,
      account_name: accountData.account_name as string,
      access_token: accountData.access_token as string,
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const accounts = getFromStorage<SocialAccount[]>('social_accounts', []);
    accounts.push(account);
    saveToStorage('social_accounts', accounts);

    return createSuccessResponse(account, 'Account connected successfully');
  },

  async disconnectAccount(id: string): Promise<ApiResponse<null>> {
    await delay(800);

    const accounts = getFromStorage<SocialAccount[]>('social_accounts', []);
    const filteredAccounts = accounts.filter(a => a.id !== id);
    saveToStorage('social_accounts', filteredAccounts);

    return createSuccessResponse(null, 'Account disconnected successfully');
  }
};

// Social Integration API
export const socialIntegrationApi = {
  async getSocialIntegrations(brandId?: string): Promise<ApiResponse<SocialIntegration[]>> {
    await delay(800);
    const integrations = getFromStorage<SocialIntegration[]>('social_integrations', []);
    const filteredIntegrations = brandId ? integrations.filter(i => i.brand_id === brandId) : integrations;
    return createSuccessResponse(filteredIntegrations);
  },

  async createSocialIntegration(formData: CreateSocialIntegrationForm): Promise<ApiResponse<SocialIntegration>> {
    await delay(1000);

    const integration: SocialIntegration = {
      id: 'integration-' + Date.now(),
      brand_id: formData.brand_id,
      social_account_id: formData.social_account_id,
      platform: 'facebook', // Mock platform
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const integrations = getFromStorage<SocialIntegration[]>('social_integrations', []);
    integrations.push(integration);
    saveToStorage('social_integrations', integrations);

    return createSuccessResponse(integration, 'Social integration created successfully');
  }
};

// Approval API
export const approvalApi = {
  async getApprovals(): Promise<ApiResponse<Approval[]>> {
    await delay(800);
    const approvals = getFromStorage<Approval[]>('approvals', []);
    return createSuccessResponse(approvals);
  },

  async approveContent(approvalId: string, notes?: string): Promise<ApiResponse<Content>> {
    await delay(1000);

    const approvals = getFromStorage<Approval[]>('approvals', []);
    const approvalIndex = approvals.findIndex(a => a.id === approvalId);

    if (approvalIndex === -1) {
      return {
        data: null as unknown as Content,
        message: 'Approval not found',
        success: false
      };
    }

    approvals[approvalIndex].status = 'approved';
    approvals[approvalIndex].notes = notes;
    approvals[approvalIndex].updated_at = new Date().toISOString();

    // Update content status
    const contents = getFromStorage<Content[]>('contents', []);
    const contentIndex = contents.findIndex(c => c.id === approvals[approvalIndex].content_id);

    if (contentIndex !== -1) {
      contents[contentIndex].status = 'approved';
      contents[contentIndex].updated_at = new Date().toISOString();
      saveToStorage('contents', contents);
    }

    saveToStorage('approvals', approvals);

    return createSuccessResponse(contents[contentIndex], 'Content approved successfully');
  },

  async rejectContent(approvalId: string, notes: string): Promise<ApiResponse<Content>> {
    await delay(1000);

    const approvals = getFromStorage<Approval[]>('approvals', []);
    const approvalIndex = approvals.findIndex(a => a.id === approvalId);

    if (approvalIndex === -1) {
      return {
        data: null as unknown as Content,
        message: 'Approval not found',
        success: false
      };
    }

    approvals[approvalIndex].status = 'rejected';
    approvals[approvalIndex].notes = notes;
    approvals[approvalIndex].updated_at = new Date().toISOString();

    // Update content status
    const contents = getFromStorage<Content[]>('contents', []);
    const contentIndex = contents.findIndex(c => c.id === approvals[approvalIndex].content_id);

    if (contentIndex !== -1) {
      contents[contentIndex].status = 'rejected';
      contents[contentIndex].updated_at = new Date().toISOString();
      saveToStorage('contents', contents);
    }

    saveToStorage('approvals', approvals);

    return createSuccessResponse(contents[contentIndex], 'Content rejected');
  }
};

// Calendar API
export const calendarApi = {
  async getCalendarEvents(month?: string): Promise<ApiResponse<CalendarEvent[]>> {
    await delay(800);
    const events = getFromStorage<CalendarEvent[]>('calendar_events', []);
    return createSuccessResponse(events);
  },

  async schedulePost(formData: SchedulePostForm): Promise<ApiResponse<ScheduledPost>> {
    await delay(1000);

    const scheduledPost: ScheduledPost = {
      id: 'scheduled-' + Date.now(),
      content_id: formData.content_id,
      social_integration_id: formData.social_integration_id,
      scheduled_date: formData.scheduled_date,
      timezone: formData.timezone,
      status: 'scheduled',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const scheduledPosts = getFromStorage<ScheduledPost[]>('scheduled_posts', []);
    scheduledPosts.push(scheduledPost);
    saveToStorage('scheduled_posts', scheduledPosts);

    return createSuccessResponse(scheduledPost, 'Post scheduled successfully');
  }
};

// Post API
export const postApi = {
  async getPosts(filters?: PostFilters): Promise<ApiResponse<Post[]>> {
    await delay(800);
    let posts = getFromStorage<Post[]>('posts', []);

    if (filters?.social_integration_id) {
      posts = posts.filter(p => p.social_integration_id === filters.social_integration_id);
    }

    if (filters?.status) {
      posts = posts.filter(p => p.status === filters.status);
    }

    return createSuccessResponse(posts);
  },

  async publishPost(contentId: string, socialIntegrationId: string): Promise<ApiResponse<Post>> {
    await delay(1500); // Simulate publishing time

    const post: Post = {
      id: 'post-' + Date.now(),
      content_id: contentId,
      social_integration_id: socialIntegrationId,
      external_post_id: 'ext_' + Date.now(),
      published_at: new Date().toISOString(),
      status: 'published',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const posts = getFromStorage<Post[]>('posts', []);
    posts.push(post);
    saveToStorage('posts', posts);

    return createSuccessResponse(post, 'Post published successfully');
  }
};

// Dashboard API
export const dashboardApi = {
  async getDashboardStats(): Promise<ApiResponse<DashboardStats>> {
    await delay(800);

    const brands = getFromStorage<Brand[]>('brands', []);
    const products = getFromStorage<Product[]>('products', []);
    const contents = getFromStorage<Content[]>('contents', []);
    const posts = getFromStorage<Post[]>('posts', []);
    const approvals = getFromStorage<Approval[]>('approvals', []);
    const scheduledPosts = getFromStorage<ScheduledPost[]>('scheduled_posts', []);

    const stats: DashboardStats = {
      total_brands: brands.length,
      total_products: products.length,
      total_contents: contents.length,
      total_posts: posts.length,
      pending_approvals: approvals.filter(a => a.status === 'pending').length,
      scheduled_posts: scheduledPosts.filter(s => s.status === 'scheduled').length
    };

    return createSuccessResponse(stats);
  },

  async getRecentActivities(): Promise<ApiResponse<RecentActivity[]>> {
    await delay(800);
    const activities = getFromStorage<RecentActivity[]>('recent_activities', []);
    return createSuccessResponse(activities);
  }
};

// Reports API
export const reportsApi = {
  async getPerformanceReport(period: string): Promise<ApiResponse<PerformanceReport>> {
    await delay(1000);

    // Mock performance data
    const report: PerformanceReport = {
      period,
      total_impressions: 125000,
      total_engagement: 5000,
      total_clicks: 1000,
      average_ctr: 0.8,
      average_cpc: 0.45,
      chart_data: [
        { date: '2024-01-01', impressions: 10000, engagement: 400, clicks: 80, ctr: 0.8 },
        { date: '2024-01-02', impressions: 12000, engagement: 480, clicks: 96, ctr: 0.8 },
        { date: '2024-01-03', impressions: 15000, engagement: 600, clicks: 120, ctr: 0.8 },
        { date: '2024-01-04', impressions: 11000, engagement: 440, clicks: 88, ctr: 0.8 },
        { date: '2024-01-05', impressions: 13000, engagement: 520, clicks: 104, ctr: 0.8 },
        { date: '2024-01-06', impressions: 14000, engagement: 560, clicks: 112, ctr: 0.8 },
        { date: '2024-01-07', impressions: 16000, engagement: 640, clicks: 128, ctr: 0.8 }
      ]
    };

    return createSuccessResponse(report);
  }
};
