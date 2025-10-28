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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useCreativePreview } from "@/hooks/use-creative";
import { useCreateCreativeFromFacebookPost } from "@/hooks/use-creatives";
import type { CreateAdCreativeFromFacebookPostRequest } from "@/lib/types/creatives";

interface AdFormProps {
  adSetId: string;
  ad?: AdResponse;
  onSuccess?: (ad: AdResponse) => void;
  onCancel?: () => void;
}

export function AdForm({ adSetId, ad, onSuccess, onCancel }: AdFormProps) {
  const [selectedCreativeId, setSelectedCreativeId] = useState<string | undefined>(ad?.creativeId);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [adFormat, setAdFormat] = useState<string>('DESKTOP_FEED_STANDARD');
  const { data: previewHtml, isLoading: previewLoading, refetch: refetchPreview } = useCreativePreview(selectedCreativeId || '', adFormat);
  const createCreativeFromPost = useCreateCreativeFromFacebookPost();
  const [fbPostBrandId, setFbPostBrandId] = useState('');
  const [fbPostAdAccountId, setFbPostAdAccountId] = useState('');
  const [fbPostId, setFbPostId] = useState('');
  const [fbPostCta, setFbPostCta] = useState('');
  const [fbPostLink, setFbPostLink] = useState('');
  const [fbPostAdName, setFbPostAdName] = useState('');

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

      {/* Create Creative from Facebook Post (inline) */}
      <div className="rounded-md border p-4 space-y-3">
        <div className="text-sm font-medium">Create Creative from Facebook Post</div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <Label htmlFor="brandId" className="text-xs">Brand ID</Label>
            <Input id="brandId" value={fbPostBrandId} onChange={(e) => setFbPostBrandId(e.target.value)} placeholder="Brand UUID" />
          </div>
          <div>
            <Label htmlFor="adAccountId" className="text-xs">Ad Account ID</Label>
            <Input id="adAccountId" value={fbPostAdAccountId} onChange={(e) => setFbPostAdAccountId(e.target.value)} placeholder="act_... or numeric" />
          </div>
          <div>
            <Label htmlFor="facebookPostId" className="text-xs">Facebook Post ID</Label>
            <Input id="facebookPostId" value={fbPostId} onChange={(e) => setFbPostId(e.target.value)} placeholder="<PAGE_ID>_<POST_ID>" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <Label htmlFor="cta" className="text-xs">Call To Action</Label>
            <Input id="cta" value={fbPostCta} onChange={(e) => setFbPostCta(e.target.value)} placeholder="SHOP_NOW | LEARN_MORE | ..." />
          </div>
          <div>
            <Label htmlFor="linkUrl" className="text-xs">Link URL</Label>
            <Input id="linkUrl" value={fbPostLink} onChange={(e) => setFbPostLink(e.target.value)} placeholder="https://example.com" />
          </div>
          <div>
            <Label htmlFor="adName" className="text-xs">Ad Name</Label>
            <Input id="adName" value={fbPostAdName} onChange={(e) => setFbPostAdName(e.target.value)} placeholder="Optional name" />
          </div>
        </div>
        <div className="flex justify-end">
          <Button type="button" variant="secondary" disabled={createCreativeFromPost.isPending}
            onClick={async () => {
              try {
                const payload: CreateAdCreativeFromFacebookPostRequest = {
                  brandId: fbPostBrandId,
                  adAccountId: fbPostAdAccountId,
                  facebookPostId: fbPostId,
                  callToAction: fbPostCta || undefined,
                  linkUrl: fbPostLink || undefined,
                  adName: fbPostAdName || undefined,
                };
                const creative = await createCreativeFromPost.mutateAsync(payload);
                setSelectedCreativeId(creative.id);
                toast.success('Creative created from Facebook post');
              } catch (e) {
                toast.error('Failed to create creative from Facebook post');
                console.error(e);
              }
            }}
          >
            {createCreativeFromPost.isPending ? 'Creating...' : 'Create Creative and Use'}
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 pt-2">
        {/* Preview controls */}
        <div className="mr-auto flex items-center gap-2">
          <Label htmlFor="adFormat">Preview format</Label>
          <select id="adFormat" className="border rounded px-2 py-1" value={adFormat} onChange={(e) => setAdFormat(e.target.value)}>
            <option value="DESKTOP_FEED_STANDARD">Desktop Feed</option>
            <option value="MOBILE_FEED_STANDARD">Mobile Feed</option>
            <option value="RIGHT_COLUMN_STANDARD">Right Column</option>
            <option value="FACEBOOK_STORY_MOBILE">Facebook Story</option>
            <option value="INSTAGRAM_EXPLORE_GRID_HOME">IG Explore Home</option>
            <option value="INSTAGRAM_SEARCH_CHAIN">IG Search Results</option>
          </select>
          <Button type="button" variant="secondary" disabled={!selectedCreativeId} onClick={async () => { await refetchPreview(); setIsPreviewOpen(true); }}>
            Preview
          </Button>
        </div>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting}>
          {ad ? "Save Changes" : "Create Ad"}
        </Button>
      </div>

      {/* Preview Modal */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Ad Preview</DialogTitle>
          </DialogHeader>
          <div className="min-h-[240px]">
            {previewLoading ? (
              <div className="py-10 text-center text-muted-foreground">Loading preview…</div>
            ) : previewHtml ? (
              <div dangerouslySetInnerHTML={{ __html: previewHtml }} />
            ) : (
              <div className="py-10 text-center text-destructive">Failed to load preview</div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </form>
  );
}


