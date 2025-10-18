"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Target,
  ArrowLeft,
  Edit,
  Calendar,
  Package,
  FileText,
  Users,
  Lightbulb
} from "lucide-react";
import { Brand, Profile } from "@/lib/types/aisam-types";
import { toast } from "sonner";
import { useBrand } from "@/hooks/use-brands";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BrandModal } from "@/components/brands/brand-modal";

interface BrandDetailsProps {
  brandId: string;
}

export function BrandDetails({ brandId }: BrandDetailsProps) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const router = useRouter();

  // Hooks
  const { data: brand, isLoading: loading, error } = useBrand(brandId);

  useEffect(() => {
    if (error) {
      toast.error('Brand not found');
      router.push('/dashboard/brands');
    }
  }, [error, router]);

  if (loading) {
    return (
      <div className="flex-1 space-y-6 p-6 bg-background">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!brand) {
    return (
      <div className="flex-1 space-y-6 p-6 bg-background">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-muted-foreground">Brand not found</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-6 bg-background">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.back()}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{brand.name}</h1>
            <p className="text-muted-foreground">
              Brand details and information
            </p>
          </div>
        </div>
        <BrandModal mode="edit" brand={brand} onSuccess={() => window.location.reload()}>
          <Button>
            <Edit className="mr-2 h-4 w-4" />
            Edit Brand
          </Button>
        </BrandModal>
      </div>

      <div className="max-w-4xl mx-auto space-y-6">
        {/* Brand Overview */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                {brand.logo_url ? (
                  <AvatarImage src={brand.logo_url} alt={brand.name} />
                ) : (
                  <AvatarFallback>
                    <Target className="h-8 w-8" />
                  </AvatarFallback>
                )}
              </Avatar>
              <div>
                <CardTitle className="text-2xl">{brand.name}</CardTitle>
                <CardDescription>
                  {profile ? (profile.company_name || profile.profile_type) : 'No profile linked'}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {brand.description && (
              <div>
                <h3 className="font-medium mb-2">Description</h3>
                <p className="text-muted-foreground">{brand.description}</p>
              </div>
            )}

            {brand.slogan && (
              <div className="p-4 bg-muted rounded-lg">
                <h3 className="font-medium mb-2 flex items-center gap-2">
                  <Lightbulb className="h-4 w-4" />
                  Slogan
                </h3>
                <p className="italic">&ldquo;{brand.slogan}&rdquo;</p>
              </div>
            )}

            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>Created {new Date(brand.created_at).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>Updated {new Date(brand.updated_at).toLocaleDateString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Brand Strategy */}
        {(brand.usp || brand.target_audience) && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Brand Strategy
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {brand.usp && (
                <div>
                  <h3 className="font-medium mb-2">Unique Selling Proposition</h3>
                  <p className="text-muted-foreground">{brand.usp}</p>
                </div>
              )}

              {brand.target_audience && (
                <div>
                  <h3 className="font-medium mb-2">Target Audience</h3>
                  <p className="text-muted-foreground">{brand.target_audience}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Manage products and content for this brand
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <Button variant="outline" asChild className="h-auto p-4">
                <Link href={`/dashboard/products?brand=${brand.id}`}>
                  <div className="flex items-center gap-3">
                    <Package className="h-6 w-6" />
                    <div className="text-left">
                      <div className="font-medium">Manage Products</div>
                      <div className="text-sm text-muted-foreground">
                        Add and edit products for this brand
                      </div>
                    </div>
                  </div>
                </Link>
              </Button>

              <Button variant="outline" asChild className="h-auto p-4">
                <Link href={`/dashboard/contents?brand=${brand.id}`}>
                  <div className="flex items-center gap-3">
                    <FileText className="h-6 w-6" />
                    <div className="text-left">
                      <div className="font-medium">Manage Content</div>
                      <div className="text-sm text-muted-foreground">
                        Create and manage content for this brand
                      </div>
                    </div>
                  </div>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}