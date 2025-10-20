import { FeatureGateWrapper } from '@/components/subscription/feature-gate-wrapper'
import { EnhancedReportsPage } from '@/components/analytics/enhanced-reports-page'

function AnalyticsContent() {
  return <EnhancedReportsPage />
}

export default function AnalyticsPage() {
  return (
    <FeatureGateWrapper
      featureId="advanced_analytics"
      upgradePromptTitle="Advanced Analytics"
      upgradePromptDescription="Get detailed insights and performance metrics with advanced analytics features."
      upgradePromptVariant="card"
    >
      <AnalyticsContent />
    </FeatureGateWrapper>
  )
}
