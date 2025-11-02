import { useSocialIntegrations } from "@/hooks/use-social-integrations";
import { toast } from "sonner";

export interface UseContentPublishOptions {
  brandId?: string;
  contentId: string;
  onPublish: (contentId: string, integrationId: string) => Promise<void>;
  disabled?: boolean;
}

export function useContentPublish({
  brandId,
  contentId,
  onPublish,
  disabled = false,
}: UseContentPublishOptions) {
  // Get social integrations for the content's brand
  const { data: integrations = [], isLoading: integrationsLoading } = useSocialIntegrations(brandId);

  const handlePublish = async () => {
    if (disabled || !onPublish) return;

    // Check if integrations are available
    if (integrationsLoading) {
      toast.error('Loading integrations...');
      return;
    }

    if (integrations.length === 0) {
      toast.error('No social integrations available for this brand. Please set up an integration first.');
      return;
    }

    // Use the first available integration
    const integrationId = integrations[0].id;
    if (!integrationId) {
      toast.error('Invalid integration ID');
      return;
    }

    try {
      await onPublish(contentId, integrationId);
    } catch (error) {
      console.error('Failed to publish content:', error);
      toast.error('Failed to publish content');
      throw error;
    }
  };

  return {
    handlePublish,
    integrations,
    integrationsLoading,
    canPublish: !integrationsLoading && integrations.length > 0 && !disabled,
  };
}

