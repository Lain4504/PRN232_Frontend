import type { SubscriptionPlan, Feature } from '@/lib/types/subscription'

// Feature definitions
export const FEATURES: Feature[] = [
  {
    id: 'campaigns',
    name: 'Campaigns',
    description: 'Tạo và quản lý các chiến dịch quảng cáo',
    requiredTier: 'free',
    isEnabled: true,
  },
  {
    id: 'unlimited_campaigns',
    name: 'Unlimited Campaigns',
    description: 'Tạo không giới hạn chiến dịch quảng cáo',
    requiredTier: 'pro',
    isEnabled: false,
    upgradePrompt: 'Nâng cấp lên gói Premium để tạo không giới hạn chiến dịch',
  },
  {
    id: 'advanced_analytics',
    name: 'Phân tích chuyên sâu',
    description: 'Truy cập các báo cáo chi tiết và đề xuất AI chuyên sâu',
    requiredTier: 'pro',
    isEnabled: false,
    upgradePrompt: 'Nâng cấp lên gói Premium để xem phân tích chuyên sâu',
  },
  {
    id: 'team_management',
    name: 'Quản lý nhóm',
    description: 'Thêm thành viên và quản lý quyền hạn',
    requiredTier: 'pro',
    isEnabled: false,
    upgradePrompt: 'Nâng cấp lên gói Premium để quản lý đội ngũ',
  },
  {
    id: 'priority_support',
    name: 'Hỗ trợ ưu tiên',
    description: 'Nhận hỗ trợ kỹ thuật nhanh chóng 24/7',
    requiredTier: 'basic',
    isEnabled: false,
    upgradePrompt: 'Nâng cấp lên gói Plus để được hỗ trợ ưu tiên',
  },
]

// Subscription plans
export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'free',
    name: 'Free',
    tier: 'free',
    price: {
      monthly: 0,
      yearly: 0,
    },
    features: [
      'Lên lịch đăng tự động (5 bài/tháng)',
      'Phân tích đối tượng (độ tuổi, giới tính)',
      'Tối đa 1 nền tảng',
      'Tối đa 1 tài khoản đăng nhập',
    ],
    limits: {
      postsPerMonth: 5,
      aiContentPerDay: 0,
      aiImagesPerDay: 0,
      platforms: 1,
      accounts: 1,
      analysisLevel: 0,
      adBudgetMonthly: 0,
      adCampaigns: 0,
    },
    billingCycle: 'monthly',
    description: 'Bản miễn phí dùng thử các tính năng cơ bản',
  },
  {
    id: 'basic',
    name: 'Plus',
    tier: 'basic',
    price: {
      monthly: 359000,
      yearly: 3590000,
    },
    features: [
      'AI tạo nội dung (2 bài/ngày)',
      'AI tạo hình ảnh (7 hình/ngày)',
      'Lên lịch đăng tự động (30 bài/tháng)',
      'Phân tích hiệu quả quảng cáo',
      'Phân tích số lượng khách hàng tiếp cận',
      'Tối đa 2 nền tảng',
      'Tối đa 3 tài khoản đăng nhập',
    ],
    limits: {
      postsPerMonth: 30,
      aiContentPerDay: 2,
      aiImagesPerDay: 7,
      platforms: 2,
      accounts: 3,
      analysisLevel: 1,
      adBudgetMonthly: 0,
      adCampaigns: 0,
    },
    billingCycle: 'monthly',
    isPopular: true,
    description: 'Nâng cấp với AI hỗ trợ sáng tạo nội dung mạnh mẽ',
  },
  {
    id: 'pro',
    name: 'Premium',
    tier: 'pro',
    price: {
      monthly: 559000,
      yearly: 5590000,
    },
    features: [
      'AI tạo nội dung cao cấp (4 bài/ngày)',
      'AI tạo hình ảnh cao cấp (10 hình/ngày)',
      'Lên lịch đăng tự động (Không giới hạn)',
      'Phân tích chiến lược quảng cáo chuyên sâu',
      'Đề xuất ngân sách quảng cáo hợp lý',
      'Đề xuất nội dung cho tháng tiếp theo',
      'Tối đa 3 nền tảng',
      'Tối đa 5 tài khoản đăng nhập',
    ],
    limits: {
      postsPerMonth: -1,
      aiContentPerDay: 4,
      aiImagesPerDay: 10,
      platforms: 3,
      accounts: 5,
      analysisLevel: 2,
      adBudgetMonthly: 0,
      adCampaigns: 0,
    },
    billingCycle: 'monthly',
    description: 'Giải pháp chuyên nghiệp cho doanh nghiệp tối ưu quảng cáo',
  },
]

// Feature gate configurations
export type FeatureGateConfig = {
  [key: string]: {
    [key: string]: { limit: number; upgradePrompt: string };
  };
};

export const FEATURE_GATES: FeatureGateConfig = {
  campaigns: {
    free: { limit: 1, upgradePrompt: 'Nâng cấp lên gói Plus để tạo thêm chiến dịch' },
    basic: { limit: 10, upgradePrompt: 'Nâng cấp lên gói Premium để tạo không giới hạn' },
    pro: { limit: -1, upgradePrompt: '' },
  },
  teamMembers: {
    free: { limit: 1, upgradePrompt: 'Nâng cấp lên gói Premium để quản lý nhóm' },
    basic: { limit: 1, upgradePrompt: 'Nâng cấp lên gói Premium để quản lý nhóm' },
    pro: { limit: 10, upgradePrompt: '' },
  },
  storage: {
    free: { limit: 1, upgradePrompt: 'Nâng cấp để thêm dung lượng' },
    basic: { limit: 10, upgradePrompt: 'Nâng cấp để thêm dung lượng' },
    pro: { limit: 100, upgradePrompt: '' },
  },
}

// Helper functions
export const getPlanById = (planId: string): SubscriptionPlan | undefined => {
  return SUBSCRIPTION_PLANS.find(plan => plan.id === planId)
}

export const getPlanByTier = (tier: string): SubscriptionPlan | undefined => {
  return SUBSCRIPTION_PLANS.find(plan => plan.tier === tier)
}

export const getFeatureById = (featureId: string): Feature | undefined => {
  return FEATURES.find(feature => feature.id === featureId)
}

export const getFeaturesByTier = (tier: string): Feature[] => {
  return FEATURES.filter(feature => {
    const tierOrder: Record<string, number> = { free: 0, basic: 1, pro: 2 }
    const featureTierOrder = tierOrder[feature.requiredTier] ?? 0
    const currentTierOrder = tierOrder[tier] ?? 0
    return currentTierOrder >= featureTierOrder
  })
}

export const calculateYearlySavings = (monthlyPrice: number, yearlyPrice: number): number => {
  const monthlyTotal = monthlyPrice * 12
  return monthlyTotal - yearlyPrice
}

export const formatPrice = (price: number, currency: string = 'VND'): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency,
  }).format(price)
}
