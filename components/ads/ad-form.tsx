"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createAdSchema, type CreateAdFormData } from "@/lib/validators/ad-schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateAd, useUpdateAd } from "@/hooks/use-ads";
import type { AdResponse } from "@/lib/types/ads";
import { toast } from "sonner";
import { CreativeSelector } from "@/components/ads/creative-selector";

interface AdFormProps {
  adSetId: string;
  ad?: AdResponse;
  onSuccess?: (ad: AdResponse) => void;
  onCancel?: () => void;
}

export function AdForm({ adSetId, ad, onSuccess, onCancel }: AdFormProps) {
  const [selectedCreativeId, setSelectedCreativeId] = useState<string | undefined>(ad?.creativeId);

  const form = useForm<CreateAdFormData>({
    resolver: zodResolver(createAdSchema),
    defaultValues: {
      adSetId,
      name: ad?.name || "",
      creativeId: ad?.creativeId || "",
      targeting: ad?.targeting,
      schedule: ad?.schedule,
    },
  });

  const createMutation = useCreateAd();
  const updateMutation = useUpdateAd(ad?.id || "");

  const onSubmit = async (values: CreateAdFormData) => {
    try {
      const payload = { ...values, creativeId: selectedCreativeId || values.creativeId };
      const result = ad
        ? await updateMutation.mutateAsync({ name: payload.name, creativeId: payload.creativeId, targeting: payload.targeting, schedule: payload.schedule })
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
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Ad Name</Label>
        <Input id="name" placeholder="Enter ad name" {...form.register("name")} />
        {form.formState.errors.name && (
          <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label>Creative</Label>
        <CreativeSelector adSetId={adSetId} value={selectedCreativeId} onChange={setSelectedCreativeId} />
        {form.formState.errors.creativeId && (
          <p className="text-sm text-destructive">{form.formState.errors.creativeId.message}</p>
        )}
      </div>

      <div className="flex items-center justify-end gap-2 pt-2">
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


