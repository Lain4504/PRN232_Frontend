'use client';

import { useEffect, useState } from 'react';
import { ProfileCard } from '@/components/profile/profile-card';
import { UserResponseDto } from '@/lib/types/user';
import { api, endpoints } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
// import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ProfilePage() {
  const [user, setUser] = useState<UserResponseDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get<UserResponseDto>(endpoints.userProfile());
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch user profile');
      }
      
      setUser(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra khi tải thông tin profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-96" />
        </div>
        
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Skeleton className="h-16 w-16 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="space-y-4">
          <div>
            <h1 className="text-3xl font-bold">Profile</h1>
            <p className="text-muted-foreground">Thông tin cá nhân của bạn</p>
          </div>
          
          <div className="relative w-full rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
            <AlertCircle className="h-4 w-4 absolute left-4 top-4" />
            <div className="flex items-center justify-between pl-7">
              <span>{error}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchProfile}
                className="ml-4"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Thử lại
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto p-6">
        <div className="space-y-4">
          <div>
            <h1 className="text-3xl font-bold">Profile</h1>
            <p className="text-muted-foreground">Thông tin cá nhân của bạn</p>
          </div>
          
          <div className="relative w-full rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-yellow-800">
            <AlertCircle className="h-4 w-4 absolute left-4 top-4" />
            <div className="pl-7">
              Không tìm thấy thông tin profile
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Profile</h1>
            <p className="text-muted-foreground">Thông tin cá nhân của bạn</p>
          </div>
          <Button
            variant="outline"
            onClick={fetchProfile}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Làm mới
          </Button>
        </div>
        
        <ProfileCard user={user} />
      </div>
    </div>
  );
}
