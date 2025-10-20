// Mock API functions for AISAM Frontend
// Simulates API calls with delays and localStorage for persistence

import {
  User,
  Brand,
  Product,
  Content,
  SocialIntegration,
  Approval,
  ScheduledPost,
  Post,
  DashboardStats,
  RecentActivity,
  CalendarEvent,
  PerformanceReport,
  SchedulePostForm,
  ContentFilters,
  PostFilters,
  ApiResponse,
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

  async getCurrentUser(): Promise<ApiResponse<User | null>> {
    await delay(300);
    const user = getFromStorage<User | null>('current_user', null);
    return createSuccessResponse(user);
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

};
// Social Integration API
export const socialIntegrationApi = {
  async getSocialIntegrations(brandId?: string): Promise<ApiResponse<SocialIntegration[]>> {
    await delay(800);
    const integrations = getFromStorage<SocialIntegration[]>('social_integrations', []);
    const filteredIntegrations = brandId ? integrations.filter(i => i.brand_id === brandId) : integrations;
    return createSuccessResponse(filteredIntegrations);
  },


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
