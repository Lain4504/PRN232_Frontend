"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Target, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye,
  Calendar,
  Package,
  FileText
} from "lucide-react";
import { authApi, brandApi, profileApi } from "@/lib/mock-api";
import { User as UserType, Brand, Profile } from "@/lib/types/aisam-types";
import { toast } from "sonner";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function BrandsManagement() {
  const router = useRouter();
  const [user, setUser] = useState<UserType | null>(null);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Get current user
        const userResponse = await authApi.getCurrentUser();
        if (userResponse.success && userResponse.data) {
          setUser(userResponse.data);
          
          // Get user's profiles
          const profilesResponse = await profileApi.getProfiles(userResponse.data.id);
          if (profilesResponse.success) {
            setProfiles(profilesResponse.data);
          }
          
          // Get brands
          const brandsResponse = await brandApi.getBrands();
          if (brandsResponse.success) {
            setBrands(brandsResponse.data);
          }
        }
      } catch (error) {
        console.error('Failed to load brands data:', error);
        toast.error('Failed to load brands data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Refresh brands data when component mounts (useful when navigating back)
  useEffect(() => {
    const refreshBrands = async () => {
      try {
        const brandsResponse = await brandApi.getBrands();
        if (brandsResponse.success) {
          setBrands(brandsResponse.data);
        }
      } catch (error) {
        console.error('Failed to refresh brands data:', error);
      }
    };

    // Refresh brands on component mount
    refreshBrands();
  }, []);

  const filteredBrands = brands.filter(brand =>
    brand.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    brand.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteBrand = async (brandId: string) => {
    if (!confirm('Are you sure you want to delete this brand? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await brandApi.deleteBrand(brandId);
      if (response.success) {
        setBrands(brands.filter(b => b.id !== brandId));
        toast.success('Brand deleted successfully');
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.error('Failed to delete brand:', error);
      toast.error('Failed to delete brand');
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex-1 space-y-8 p-6 lg:p-8 bg-background">
        <div className="space-y-6">
          <div className="space-y-4">
            <div>
              <div className="h-10 w-64 mb-3 bg-muted animate-pulse rounded" />
              <div className="h-5 w-80 bg-muted animate-pulse rounded" />
            </div>
            <div className="flex items-center gap-4">
              <div className="h-8 w-32 bg-muted animate-pulse rounded" />
              <div className="h-8 w-28 bg-muted animate-pulse rounded" />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-40 bg-muted animate-pulse rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Main UI
  const totalBrands = brands.length;
  const totalProfiles = profiles.length;

  return (
    <div className="w-full max-w-full overflow-x-hidden">
      <div className="space-y-6 lg:space-y-8 p-4 lg:p-6 xl:p-8 bg-background">
        {/* Header */}
        <div className="space-y-3 lg:space-y-6">
          <div>
            <h1 className="text-2xl lg:text-3xl xl:text-4xl font-bold tracking-tight text-foreground">
              Brands
            </h1>
            <p className="text-sm lg:text-base xl:text-lg text-muted-foreground mt-2 max-w-2xl">
              Manage your brands and their assets in one place.
            </p>
          </div>
          {/* Stats */}
          <div className="flex flex-wrap items-center gap-2 lg:gap-4">
            <div className="flex items-center gap-2 px-3 py-2 bg-muted/50 rounded-lg border text-xs lg:text-sm">
              <Target className="h-3 w-3 lg:h-4 lg:w-4 text-muted-foreground flex-shrink-0" />
              <span className="font-medium">{totalBrands}</span>
              <span className="text-muted-foreground">Brands</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 bg-muted/50 rounded-lg border text-xs lg:text-sm">
              <span className="font-medium">{totalProfiles}</span>
              <span className="text-muted-foreground">Profiles</span>
            </div>
          </div>
        </div>

        {/* Create Brand Card */}
        <Card className="border border-primary/20">
          <CardContent className="p-3">
            <div className="flex items-center gap-2 mb-2">
              <Plus className="h-4 w-4 text-primary" />
              <h3 className="text-base font-semibold">Create New Brand</h3>
            </div>
            <p className="text-xs text-muted-foreground mb-3">
              Add a new brand to start managing its products and content.
            </p>
            <Button asChild size="sm" className="w-full sm:w-auto h-8 text-xs">
              <Link href="/dashboard/brands/new">
                <Plus className="mr-1 h-3 w-3" />
                Create Brand
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Search and Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search brands..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Badge variant="secondary">
                {filteredBrands.length} brand{filteredBrands.length !== 1 ? 's' : ''}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Brands List/Grid */}
        {filteredBrands.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredBrands.map((brand) => {
              const profile = brand.profile_id ? profiles.find(p => p.id === brand.profile_id) : null;
              return (
                <Card key={brand.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12">
                          {brand.logo_url ? (
                            <AvatarImage src={brand.logo_url} alt={brand.name} />
                          ) : (
                            <AvatarFallback>
                              <Target className="h-6 w-6" />
                            </AvatarFallback>
                          )}
                        </Avatar>
                        <div>
                          <CardTitle className="text-lg">{brand.name}</CardTitle>
                          <CardDescription>
                            {profile ? (profile.company_name || profile.profile_type) : 'No profile linked'}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/dashboard/brands/${brand.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/dashboard/brands/${brand.id}/edit`}>
                            <Edit className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDeleteBrand(brand.id)}
                          className="text-destructive hover:text-destructive/80"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {brand.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {brand.description}
                      </p>
                    )}
                    {brand.slogan && (
                      <div className="p-3 bg-muted rounded-lg">
                        <p className="text-sm font-medium italic">&ldquo;{brand.slogan}&rdquo;</p>
                      </div>
                    )}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{new Date(brand.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" asChild className="flex-1">
                        <Link href={`/dashboard/products?brand=${brand.id}`}>
                          <Package className="mr-2 h-4 w-4" />
                          Products
                        </Link>
                      </Button>
                      <Button variant="outline" size="sm" asChild className="flex-1">
                        <Link href={`/dashboard/contents?brand=${brand.id}`}>
                          <FileText className="mr-2 h-4 w-4" />
                          Contents
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  {searchTerm ? 'No brands found' : 'No brands yet'}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm 
                    ? 'Try adjusting your search terms'
                    : 'Create your first brand to get started with AISAM'
                  }
                </p>
                {!searchTerm && (
                  <Button asChild>
                    <Link href="/dashboard/brands/new">
                      <Plus className="mr-2 h-4 w-4" />
                      Create Your First Brand
                    </Link>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Help Section */}
        <Card className="border border-blue-200 dark:border-blue-800">
          <CardContent className="p-3">
            <div className="flex items-start gap-2">
              <Target className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-blue-900 dark:text-blue-100 text-xs mb-1">
                  About Brand Management
                </h3>
                <p className="text-xs text-blue-800 dark:text-blue-200 leading-relaxed">
                  Managing your brands helps AISAM organize your products and content efficiently. You can add, edit, or remove brands at any time.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
