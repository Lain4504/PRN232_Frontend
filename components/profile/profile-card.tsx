'use client';

import { UserResponseDto } from '@/lib/types/user';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar, Mail, Users } from 'lucide-react';

interface ProfileCardProps {
  user: UserResponseDto;
}

export function ProfileCard({ user }: ProfileCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getInitials = (email: string) => {
    return email.charAt(0).toUpperCase();
  };

  return (
    <div className="space-y-6">
      {/* Main Profile Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Thông tin cá nhân
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src="" alt={user.email} />
              <AvatarFallback className="text-lg">
                {getInitials(user.email)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-lg font-semibold">{user.email}</h3>
              <p className="text-sm text-muted-foreground">User ID: {user.id}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                <strong>Email:</strong> {user.email}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                <strong>Ngày tạo:</strong> {formatDate(user.createdAt)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Social Accounts Card */}
      <Card>
        <CardHeader>
          <CardTitle>Tài khoản liên kết</CardTitle>
        </CardHeader>
        <CardContent>
          {user.socialAccounts.length > 0 ? (
            <div className="space-y-3">
              {user.socialAccounts.map((account) => (
                <div
                  key={account.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={account.avatarUrl} alt={account.name || account.provider} />
                      <AvatarFallback>
                        {account.name ? account.name.charAt(0).toUpperCase() : account.provider.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{account.name || account.email || 'N/A'}</p>
                      <p className="text-sm text-muted-foreground">
                        {account.email && account.email !== user.email ? account.email : ''}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="secondary" className="capitalize">
                      {account.provider}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">
                      Liên kết: {formatDate(account.linkedAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Chưa có tài khoản xã hội nào được liên kết</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
