"use client";

import React, { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Upload, X, Loader2 } from "lucide-react";
import { useCreateCreative, useCreateCreativeFromFacebookPost, useFacebookPosts } from "@/hooks/use-creatives";
import type { CreateAdCreativeFromContentRequest } from "@/lib/types/creatives";
import { Input as UIInput } from "@/components/ui/input";
import { createCreativeSchema, type CreateCreativeFormData } from "@/lib/validators/creative-schemas";
import { CREATIVE_TYPES } from "@/lib/types/creatives";
import { toast } from "sonner";
import { useContentsByBrand } from "@/hooks/use-contents";
import { ContentStatusEnum } from "@/lib/types/aisam-types";
import { useGetAdAccounts, useGetSocialAccounts } from "@/hooks/use-social-accounts";
import { useBrands } from "@/hooks/use-brands";
import type { SocialAccountDto, AdAccountDto, ContentResponseDto } from "@/lib/types/aisam-types";

interface CreativeUploadProps {
  adSetId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export function CreativeUpload({ adSetId, onSuccess, onCancel }: CreativeUploadProps) {
  const [flow, setFlow] = useState<'fromContent' | 'fromFacebookPost'>('fromContent');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [adAccountId, setAdAccountId] = useState<string>("");
  const [contentId, setContentId] = useState<string>("");
  const [callToAction, setCallToAction] = useState<string>("");
  const [linkUrl, setLinkUrl] = useState<string>("");
  const [selectedSocialAccountId, setSelectedSocialAccountId] = useState<string>("");
  const [facebookPostId, setFacebookPostId] = useState<string>("");
  
  const createFromContent = useCreateCreative();
  const createFromFacebookPost = useCreateCreativeFromFacebookPost();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    // remove reset to avoid unused var warning
  } = useForm<CreateCreativeFormData>({
    resolver: zodResolver(createCreativeSchema),
      defaultValues: {
      adSetId,
      name: "",
      type: "IMAGE",
      content: "",
      tags: [],
    }
  });

  const watchedType = watch("type");

  // Brand -> Approved contents for selection
  const [selectedBrandId, setSelectedBrandId] = useState<string>("");
  const { data: brands = [] } = useBrands();
  const contentsByBrand = useContentsByBrand(selectedBrandId || undefined, { status: ContentStatusEnum.Approved, page: 1, pageSize: 50, sortBy: "createdAt", sortDescending: true });
  const approvedContents = useMemo(() => {
    // useContentsByBrand returns ApiPaginatedResponse<ContentResponseDto>
    // Structure: { data: ContentResponseDto[], totalCount, page, ... }
    const data = contentsByBrand?.data;
    if (!data || !Array.isArray(data)) return [];
    return data;
  }, [contentsByBrand]);

  // Fetch social accounts and ad accounts for selection
  const { data: socialAccounts = [] } = useGetSocialAccounts();
  const { data: adAccounts = [] } = useGetAdAccounts(selectedSocialAccountId);
  
  // Fetch Facebook posts when brand is selected
  const { data: facebookPosts = [], isLoading: isLoadingPosts } = useFacebookPosts(selectedBrandId || undefined);

  // Common CTA options
  const CTA_OPTIONS = [
    "SHOP_NOW",
    "LEARN_MORE",
    "SIGN_UP",
    "SUBSCRIBE",
    "GET_OFFER",
    "CONTACT_US",
    "APPLY_NOW",
    "BOOK_NOW",
    "DOWNLOAD",
    "GET_QUOTE",
    "REGISTER_NOW",
    "BUY_NOW",
  ] as const;

  // File upload handlers removed: not used in current flows

  const addTag = () => {
    if (tagInput.trim() && !selectedTags.includes(tagInput.trim())) {
      const newTags = [...selectedTags, tagInput.trim()];
      setSelectedTags(newTags);
      setValue("tags", newTags);
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    const newTags = selectedTags.filter(tag => tag !== tagToRemove);
    setSelectedTags(newTags);
    setValue("tags", newTags);
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === "Enter") {
      event.preventDefault();
      addTag();
    }
  };

  const onSubmit = async (data: CreateCreativeFormData) => {
    try {
      console.log("Form submitted with data:", data);
      console.log("Flow:", flow);
      console.log("Form errors:", errors);
      
      if (flow === 'fromContent') {
        if (!selectedBrandId) {
          toast.error("Please select a brand");
          return;
        }
        if (!contentId) {
          toast.error("Please select content");
          return;
        }
        if (!adAccountId) {
          toast.error("Please select an ad account");
          return;
        }
        const payload: CreateAdCreativeFromContentRequest = {
          contentId: contentId,
          adAccountId: adAccountId,
          adName: data.name,
          callToAction: callToAction || undefined,
          linkUrl: linkUrl || undefined,
        };
        await createFromContent.mutateAsync(payload);
        toast.success("Creative created successfully");
        onSuccess();
      } else if (flow === 'fromFacebookPost') {
        if (!selectedBrandId) {
          toast.error("Please select a brand");
          return;
        }
        if (!adAccountId) {
          toast.error("Please select an ad account");
          return;
        }
        if (!facebookPostId) {
          toast.error("Please enter Facebook Post ID");
          return;
        }
        await createFromFacebookPost.mutateAsync({
          brandId: selectedBrandId,
          adAccountId,
          facebookPostId,
          callToAction: callToAction || undefined,
          linkUrl: linkUrl || undefined,
          adName: data.name || undefined,
        });
        toast.success("Creative created successfully");
        onSuccess();
      }
    } catch (error) {
      console.error("Create creative error:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to create creative";
      toast.error(errorMessage);
    }
  };

  // File requirements removed: not used in current flows

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Creative Type Selection */}
      <div className="space-y-2">
        <Label htmlFor="type">Creative Type *</Label>
        <Select
          value={watchedType || ""}
          onValueChange={(value) => {
            setValue("type", value as 'IMAGE' | 'VIDEO' | 'CAROUSEL' | 'TEXT' | 'GIF' | 'STORY');
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select creative type" />
          </SelectTrigger>
          <SelectContent>
          {CREATIVE_TYPES.map((type) => (
            <SelectItem key={type.value} value={type.value}>
                <div className="flex items-center gap-2">
                  {type.label}
                  <span className="text-xs text-muted-foreground">
                    - {type.description}
                  </span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.type && (
          <p className="text-sm text-destructive">{errors.type.message}</p>
        )}
      </div>

      {/* File Upload (removed for this flow; creatives are created from content or Facebook post) */}

      {/* Flow Selector */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <Button type="button" variant={flow === 'fromContent' ? 'default' : 'outline'} onClick={() => setFlow('fromContent')}>From Approved Content</Button>
        <Button type="button" variant={flow === 'fromFacebookPost' ? 'default' : 'outline'} onClick={() => setFlow('fromFacebookPost')}>From Facebook Post</Button>
      </div>

      {/* Flow-specific fields */}
      {/* From Content flow */}
      {flow === 'fromContent' && (
      <>
      {/* Brand, Content and Ad Account context (required for from-content flow) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Brand select */}
        <div className="space-y-2">
          <Label htmlFor="brandId">Brand *</Label>
          <Select value={selectedBrandId} onValueChange={(v) => { setSelectedBrandId(v); setContentId(""); }}>
            <SelectTrigger>
              <SelectValue placeholder="Select brand" />
            </SelectTrigger>
            <SelectContent>
              {Array.isArray(brands) && (brands as Array<{ id: string; name: string }>).map((b) => (
                <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Content select (from brand's approved contents) */}
        <div className="space-y-2">
          <Label htmlFor="contentId">Content *</Label>
          <Select value={contentId} onValueChange={setContentId} disabled={!selectedBrandId}>
            <SelectTrigger>
              <SelectValue placeholder={selectedBrandId ? "Select approved content" : "Select brand first"} />
            </SelectTrigger>
            <SelectContent>
              {approvedContents.map((c: ContentResponseDto) => (
                <SelectItem key={c.id} value={c.id}>
                  <div className="flex flex-col">
                    <span className="truncate max-w-[220px]">{c.title || c.id}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Ad account select (pick social account then ad account) */}
        <div className="space-y-2">
          <Label htmlFor="socialAccount">Social Account</Label>
          <Select value={selectedSocialAccountId} onValueChange={(v) => { setSelectedSocialAccountId(v); setAdAccountId(""); }}>
            <SelectTrigger>
              <SelectValue placeholder="Select social account" />
            </SelectTrigger>
            <SelectContent>
              {socialAccounts.map((sa: SocialAccountDto) => (
                <SelectItem key={sa.id} value={sa.id}>
                  <div className="flex items-center gap-2">
                    <span className="capitalize">{sa.provider}</span>
                    <span className="text-xs text-muted-foreground">{sa.providerUserId || sa.id}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Label htmlFor="adAccountId">Ad Account *</Label>
          <Select value={adAccountId} onValueChange={setAdAccountId}>
            <SelectTrigger>
              <SelectValue placeholder={selectedSocialAccountId ? "Select ad account" : "Select social account first"} />
            </SelectTrigger>
            <SelectContent>
              {adAccounts.map((aa: AdAccountDto) => (
                <SelectItem key={aa.id} value={aa.id}>
                  <div className="flex flex-col">
                    <span>{aa.name}</span>
                    <span className="text-xs text-muted-foreground">{aa.accountId} • {aa.currency}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      </>
      )}

      {/* From Facebook Post flow */}
      {flow === 'fromFacebookPost' && (
      <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Brand select */}
        <div className="space-y-2">
          <Label htmlFor="brandId">Brand *</Label>
          <Select value={selectedBrandId} onValueChange={(v) => { setSelectedBrandId(v); }}>
            <SelectTrigger>
              <SelectValue placeholder="Select brand" />
            </SelectTrigger>
            <SelectContent>
              {Array.isArray(brands) && (brands as Array<{ id: string; name: string }>).map((b) => (
                <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Social account and ad account */}
        <div className="space-y-2">
          <Label htmlFor="socialAccount">Social Account</Label>
          <Select value={selectedSocialAccountId} onValueChange={(v) => { setSelectedSocialAccountId(v); setAdAccountId(""); }}>
            <SelectTrigger>
              <SelectValue placeholder="Select social account" />
            </SelectTrigger>
            <SelectContent>
              {socialAccounts.map((sa: SocialAccountDto) => (
                <SelectItem key={sa.id} value={sa.id}>
                  <div className="flex items-center gap-2">
                    <span className="capitalize">{sa.provider}</span>
                    <span className="text-xs text-muted-foreground">{sa.providerUserId || sa.id}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Label htmlFor="adAccountId">Ad Account *</Label>
          <Select value={adAccountId} onValueChange={setAdAccountId}>
            <SelectTrigger>
              <SelectValue placeholder={selectedSocialAccountId ? "Select ad account" : "Select social account first"} />
            </SelectTrigger>
            <SelectContent>
              {adAccounts.map((aa: AdAccountDto) => (
                <SelectItem key={aa.id} value={aa.id}>
                  <div className="flex flex-col">
                    <span>{aa.name}</span>
                    <span className="text-xs text-muted-foreground">{aa.accountId} • {aa.currency}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="facebookPostId">Facebook Post ID *</Label>
          {selectedBrandId ? (
            <Select value={facebookPostId} onValueChange={setFacebookPostId} disabled={!selectedBrandId}>
              <SelectTrigger>
                <SelectValue placeholder={selectedBrandId ? (isLoadingPosts ? "Loading posts..." : "Select Facebook post") : "Select brand first"} />
              </SelectTrigger>
              <SelectContent>
                {isLoadingPosts ? (
                  <SelectItem value="loading" disabled>Loading posts...</SelectItem>
                ) : facebookPosts.length === 0 ? (
                  <SelectItem value="empty" disabled>No posts found</SelectItem>
                ) : (
                  facebookPosts.map((post) => (
                    <SelectItem key={post.id} value={post.id}>
                      <div className="flex flex-col">
                        <span className="truncate max-w-[200px]">{post.message || post.id}</span>
                        <span className="text-xs text-muted-foreground">
                          {post.type || 'Unknown'} • {new Date(post.createdTime).toLocaleDateString()}
                        </span>
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          ) : (
            <UIInput id="facebookPostId" placeholder="Select brand first" value={facebookPostId} onChange={(e) => setFacebookPostId(e.target.value)} disabled />
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="linkUrl">Link URL</Label>
          <UIInput id="linkUrl" placeholder="https://example.com" value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} />
        </div>
      </div>
      </>
      )}

      {/* Creative Name */}
      <div className="space-y-2">
        <Label htmlFor="name">Creative Name *</Label>
        <Input
          id="name"
          {...register("name")}
          placeholder="Enter creative name"
        />
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name.message}</p>
        )}
      </div>

      {/* CTA (applies to both flows) and Link (also in FB section) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="cta">Call To Action</Label>
          <Select value={callToAction} onValueChange={setCallToAction}>
            <SelectTrigger>
              <SelectValue placeholder="Select call to action" />
            </SelectTrigger>
            <SelectContent>
              {CTA_OPTIONS.map((cta) => (
                <SelectItem key={cta} value={cta}>{cta.replace(/_/g, " ")}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {flow === 'fromContent' && (
          <div className="space-y-2">
            <Label htmlFor="linkUrl">Link URL</Label>
            <UIInput id="linkUrl" placeholder="https://example.com" value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} />
          </div>
        )}
      </div>

      {/* Content (for TEXT type) */}
      {watchedType === 'TEXT' && (
        <div className="space-y-2">
          <Label htmlFor="content">Content *</Label>
          <Textarea
            id="content"
            {...register("content")}
            placeholder="Enter creative content"
            rows={6}
          />
          {errors.content && (
            <p className="text-sm text-destructive">{errors.content.message}</p>
          )}
        </div>
      )}

      {/* Tags */}
      <div className="space-y-2">
        <Label>Tags</Label>
        <div className="flex gap-2">
          <Input
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Add a tag"
            maxLength={50}
          />
          <Button type="button" variant="outline" onClick={addTag}>
            Add
          </Button>
        </div>
        {selectedTags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {selectedTags.map((tag) => (
              <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                {tag}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => removeTag(tag)}
                />
              </Badge>
            ))}
          </div>
        )}
        {errors.tags && (
          <p className="text-sm text-destructive">{errors.tags.message}</p>
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={createFromContent.isPending || createFromFacebookPost.isPending}
        >
          {(createFromContent.isPending || createFromFacebookPost.isPending) ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Create Creative
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
