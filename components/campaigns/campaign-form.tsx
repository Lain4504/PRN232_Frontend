"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createCampaignSchema, CreateCampaignFormData } from "@/lib/validators/campaign-schemas";
import { CAMPAIGN_OBJECTIVES } from "@/lib/types/campaigns";
import { useBrands } from "@/hooks/use-brands";
import { useCreateCampaign, useUpdateCampaign } from "@/hooks/use-campaigns";
import { useGetSocialAccounts, useGetAdAccounts } from "@/hooks/use-social-accounts";
import { AdCampaignResponse } from "@/lib/types/campaigns";
import { SocialAccountDto, AdAccountDto } from "@/lib/types/aisam-types";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { format } from "date-fns";

interface CampaignFormProps {
  mode: "create" | "edit";
  campaign?: AdCampaignResponse;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  isDrawer?: boolean;
}

export function CampaignForm({
  mode,
  campaign,
  open,
  onOpenChange,
  onSuccess,
  isDrawer = false,
}: CampaignFormProps) {
  const { data: brands = [] } = useBrands();
  const { data: socialAccounts = [] } = useGetSocialAccounts();
  const createCampaignMutation = useCreateCampaign();
  const updateCampaignMutation = useUpdateCampaign();

  // State for step management
  const [currentStep, setCurrentStep] = React.useState(1);
  const [selectedSocialAccountId, setSelectedSocialAccountId] = React.useState<string>("");
  
  // Get ad accounts for selected social account
  const { data: adAccounts = [] } = useGetAdAccounts(selectedSocialAccountId);

  const form = useForm<CreateCampaignFormData>({
    resolver: zodResolver(createCampaignSchema),
    defaultValues: {
      brandId: campaign?.brandId || "",
      adAccountId: campaign?.adAccountId || "",
      name: campaign?.name || "",
      objective: (campaign?.objective as string) || "",
      budget: campaign?.budget || 0,
      startDate: campaign?.startDate ? format(new Date(campaign.startDate), "yyyy-MM-dd") : "",
      endDate: campaign?.endDate ? format(new Date(campaign.endDate), "yyyy-MM-dd") : "",
    },
  });

  const isLoading = createCampaignMutation.isPending || updateCampaignMutation.isPending;

  const onSubmit = async (data: CreateCampaignFormData) => {
    try {
      if (mode === "create") {
        await createCampaignMutation.mutateAsync(data);
      } else if (campaign) {
        await updateCampaignMutation.mutateAsync({
          id: campaign.id,
          ...data,
        });
      }
      
      form.reset();
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error("Failed to save campaign:", error);
    }
  };

  const handleClose = () => {
    form.reset();
    setCurrentStep(1);
    setSelectedSocialAccountId("");
    onOpenChange(false);
  };

  const handleNextStep = () => {
    if (currentStep === 1 && selectedSocialAccountId) {
      setCurrentStep(2);
    }
  };

  const handlePrevStep = () => {
    if (currentStep === 2) {
      setCurrentStep(1);
    }
  };

  const handleSocialAccountSelect = (socialAccountId: string) => {
    setSelectedSocialAccountId(socialAccountId);
  };

  const formContent = (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Step Indicator */}
        <div className="flex items-center justify-center space-x-4 mb-6">
          <div className={`flex items-center space-x-2 ${currentStep >= 1 ? 'text-primary' : 'text-muted-foreground'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              currentStep >= 1 ? 'bg-primary text-primary-foreground' : 'bg-muted'
            }`}>
              1
            </div>
            <span className="text-sm font-medium">Social Account</span>
          </div>
          <div className="w-8 h-px bg-border"></div>
          <div className={`flex items-center space-x-2 ${currentStep >= 2 ? 'text-primary' : 'text-muted-foreground'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              currentStep >= 2 ? 'bg-primary text-primary-foreground' : 'bg-muted'
            }`}>
              2
            </div>
            <span className="text-sm font-medium">Campaign Details</span>
          </div>
        </div>

        {/* Step 1: Social Account Selection */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Select Social Account</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Choose a social media account to create campaigns for. This will determine which ad accounts are available.
              </p>
            </div>
            
            <div className="grid gap-3">
              {socialAccounts.map((account) => {
                const isSelected = selectedSocialAccountId === account.id;
                const getProviderIcon = (provider: string) => {
                  switch (provider.toLowerCase()) {
                    case 'facebook': return '📘';
                    case 'instagram': return '📷';
                    case 'tiktok': return '🎵';
                    default: return '🌐';
                  }
                };
                
                return (
                  <button
                    key={account.id}
                    type="button"
                    onClick={() => handleSocialAccountSelect(account.id)}
                    className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                      isSelected 
                        ? 'border-primary bg-primary/5 shadow-sm' 
                        : 'border-border hover:border-primary/50 hover:bg-muted/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{getProviderIcon(account.provider)}</div>
                      <div>
                        <div className="font-medium capitalize">{account.provider}</div>
                        <div className="text-sm text-muted-foreground">
                          {account.providerUserId ? `ID: ${account.providerUserId}` : 'Connected'}
                        </div>
                      </div>
                      {isSelected && (
                        <div className="ml-auto">
                          <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                            <div className="w-2 h-2 rounded-full bg-white"></div>
                          </div>
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {socialAccounts.length === 0 && (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">No social accounts connected</p>
                <p className="text-sm text-muted-foreground">
                  Please connect a social media account first to create campaigns.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Step 2: Campaign Details */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Campaign Details</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Configure your campaign settings and budget.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {/* Campaign Name */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Campaign Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter campaign name"
                        {...field}
                        disabled={isLoading}
                        className="h-10 sm:h-9"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Brand Selection */}
              <FormField
                control={form.control}
                name="brandId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Brand</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={isLoading}
                    >
                      <FormControl>
                        <SelectTrigger className="h-10 sm:h-9">
                          <SelectValue placeholder="Select a brand" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {brands.map((brand) => (
                          <SelectItem key={brand.id} value={brand.id}>
                            {brand.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Ad Account Selection */}
              <FormField
                control={form.control}
                name="adAccountId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ad Account</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={isLoading}
                    >
                      <FormControl>
                        <SelectTrigger className="h-10 sm:h-9">
                          <SelectValue placeholder="Select ad account" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {adAccounts.map((adAccount) => (
                          <SelectItem key={adAccount.id} value={adAccount.id}>
                            <div className="flex flex-col">
                              <span>{adAccount.name}</span>
                              <span className="text-xs text-muted-foreground">
                                {adAccount.accountId} • {adAccount.currency}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Available ad accounts from your selected social account
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Campaign Objective */}
              <FormField
                control={form.control}
                name="objective"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Campaign Objective</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={isLoading}
                    >
                      <FormControl>
                        <SelectTrigger className="h-10 sm:h-9">
                          <SelectValue placeholder="Select objective" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {CAMPAIGN_OBJECTIVES.map((objective) => (
                          <SelectItem key={objective} value={objective}>
                            {objective.replace(/_/g, ' ')}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Budget */}
              <FormField
                control={form.control}
                name="budget"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Budget ($)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0.01"
                        max="1000000"
                        placeholder="0.00"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        disabled={isLoading}
                        className="h-10 sm:h-9"
                      />
                    </FormControl>
                    <FormDescription>
                      Daily budget for this campaign
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Start Date */}
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        {...field}
                        disabled={isLoading}
                        className="h-10 sm:h-9"
                      />
                    </FormControl>
                    <FormDescription>
                      When the campaign should start (optional)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* End Date */}
              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Date</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        {...field}
                        disabled={isLoading}
                        className="h-10 sm:h-9"
                      />
                    </FormControl>
                    <FormDescription>
                      When the campaign should end (optional)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        {!isDrawer && (
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <div className="flex gap-2 w-full sm:w-auto">
              {currentStep === 2 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePrevStep}
                  disabled={isLoading}
                  className="flex-1 sm:flex-none"
                >
                  Previous
                </Button>
              )}
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isLoading}
                className="flex-1 sm:flex-none"
              >
                Cancel
              </Button>
            </div>
            
            {currentStep === 1 ? (
              <Button
                type="button"
                onClick={handleNextStep}
                disabled={!selectedSocialAccountId || isLoading}
                className="w-full sm:w-auto"
              >
                Next
              </Button>
            ) : (
              <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
                {isLoading && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {mode === "create" ? "Create Campaign" : "Update Campaign"}
              </Button>
            )}
          </DialogFooter>
        )}

        {/* Drawer Navigation Buttons */}
        {isDrawer && (
          <div className="flex gap-2 pt-4 border-t">
            {currentStep === 2 && (
              <Button
                type="button"
                variant="outline"
                onClick={handlePrevStep}
                disabled={isLoading}
                className="flex-1"
              >
                Previous
              </Button>
            )}
            {currentStep === 1 ? (
              <Button
                type="button"
                onClick={handleNextStep}
                disabled={!selectedSocialAccountId || isLoading}
                className="flex-1"
              >
                Next
              </Button>
            ) : (
              <Button type="submit" disabled={isLoading} className="flex-1">
                {isLoading && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {mode === "create" ? "Create Campaign" : "Update Campaign"}
              </Button>
            )}
          </div>
        )}
      </form>
    </Form>
  );

  if (isDrawer) {
    return formContent;
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto w-[95vw] sm:w-full">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Create New Campaign" : "Edit Campaign"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Set up a new advertising campaign with your target audience and budget."
              : "Update your campaign settings and configuration."}
          </DialogDescription>
        </DialogHeader>
        {formContent}
      </DialogContent>
    </Dialog>
  );
}
