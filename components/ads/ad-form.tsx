"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createAdSchema, type CreateAdFormData } from "@/lib/validators/ad-schemas";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreateAd, useUpdateAd } from "@/hooks/use-ads";
import type { AdResponse } from "@/lib/types/ads";
import { toast } from "sonner";
import { CreativeSelector } from "@/components/ads/creative-selector";
import { useAdSets } from "@/hooks/use-ad-sets";
 

interface AdFormProps {
  campaignId: string;
  adSetId: string;
  ad?: AdResponse;
  onSuccess?: (ad: AdResponse) => void;
  onCancel?: () => void;
}

export function AdForm({ campaignId, adSetId, ad, onSuccess, onCancel }: AdFormProps) {
  const [selectedCreativeId, setSelectedCreativeId] = useState<string | undefined>(ad?.creativeId);
  const [selectedAdSetId, setSelectedAdSetId] = useState<string>(adSetId);


  const form = useForm<CreateAdFormData>({
    resolver: zodResolver(createAdSchema),
    defaultValues: {
      adSetId: selectedAdSetId,
      creativeId: ad?.creativeId || "",
    },
  });

  const createMutation = useCreateAd();
  const updateMutation = useUpdateAd(ad?.id || "");

  // Sync selectedCreativeId with form field when it changes externally
  useEffect(() => {
    if (selectedCreativeId) {
      form.setValue('creativeId', selectedCreativeId, { shouldValidate: true });
    }
  }, [selectedCreativeId]);

  // Fetch ad sets for campaign and sync selected Ad Set to form
  const { data: adSetsData } = useAdSets({ campaignId, page: 1, pageSize: 100 });
  const adSets = adSetsData?.data || [];

  useEffect(() => {
    if (selectedAdSetId) {
      form.setValue('adSetId', selectedAdSetId, { shouldValidate: true });
    }
  }, [selectedAdSetId]);

  // Handle creative selection change
  const handleCreativeChange = (creativeId: string) => {
    setSelectedCreativeId(creativeId);
    form.setValue('creativeId', creativeId, { shouldValidate: true });
  };

  const onSubmit = async (values: CreateAdFormData) => {
    try {
      const payload = { adSetId: selectedAdSetId || values.adSetId, creativeId: selectedCreativeId || values.creativeId };
      const result = ad
        ? await updateMutation.mutateAsync({ creativeId: payload.creativeId })
        : await createMutation.mutateAsync(payload);
      toast.success(ad ? "Ad updated" : "Ad created");
      onSuccess?.(result);
    } catch (e) {
      toast.error("Failed to submit ad form");
      console.error(e);
    }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <Label>Ad Set</Label>
        <Select value={selectedAdSetId} onValueChange={(v) => setSelectedAdSetId(v)}>
          <SelectTrigger>
            <SelectValue placeholder="Select an ad set" />
          </SelectTrigger>
          <SelectContent>
            {adSets.map((s) => (
              <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {form.formState.errors.adSetId && (
          <p className="text-sm text-destructive">{form.formState.errors.adSetId.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label>Creative</Label>
        {/* Don't pass adSetId - get all creatives instead */}
        <CreativeSelector value={selectedCreativeId} onChange={handleCreativeChange} />
        {form.formState.errors.creativeId && (
          <p className="text-sm text-destructive">{form.formState.errors.creativeId.message}</p>
        )}
      </div>

      <div className="flex items-center justify-end gap-2 pt-4 border-t">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting}>
          {ad ? "Save Changes" : "Create Ad"}
        </Button>
      </div>
    </form>
  );
}


