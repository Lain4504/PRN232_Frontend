"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import { SelectPagesPicker } from "@/components/social/select-pages-picker";
import { FacebookLinkButton } from "@/components/auth/facebook-link-button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useState, useEffect, useCallback } from "react";
import { Facebook, Search, Filter, LayoutGrid, List, Plus, Link as LinkIcon } from "lucide-react";
import { SocialAccount, SocialAccountsResponse } from "@/lib/provider/social-types";
import { fetchRest } from "@/lib/custom-api/rest-client";
import { endpoints } from "@/lib/custom-api/endpoints";

export default function AdminDashboard() {
  const { user, isAuthenticated } = useAuth();
  const [openPicker, setOpenPicker] = useState(false);
  const [openNewProject, setOpenNewProject] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [accounts, setAccounts] = useState<SocialAccount[]>([]);

  const loadAccounts = useCallback(async () => {
    if (!user?.id) return;
    try {
      const { data } = await fetchRest<SocialAccountsResponse>(endpoints.socialAccountsByUser(user.id), {
        method: 'GET',
        requireAuth: true
      });

      if (data && data.success) {
        setAccounts(data.data);
      }
    } catch (error) {
      console.error('Error loading accounts:', error);
    }
  }, [user?.id]);

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      loadAccounts();
    }
  }, [isAuthenticated, user?.id, loadAccounts]);

  const filteredAccounts = accounts.filter(account =>
    account.provider.toLowerCase().includes(searchTerm.toLowerCase()) ||
    account.providerUserId?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
      <div className="space-y-6 px-4 py-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-semibold">Brands</h1>
          </div>

          <Dialog open={openNewProject} onOpenChange={setOpenNewProject}>
            <DialogTrigger asChild>
              <Button className="bg-green-600 hover:bg-green-700 text-white">
                <Plus className="h-4 w-4 mr-2" />
                Link page
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Facebook className="h-5 w-5 text-blue-500" />
                  Connect Facebook Account
                </DialogTitle>
                <DialogDescription>
                  Link your Facebook account to create a new brand
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <FacebookLinkButton
                  onSuccess={() => {
                    setOpenNewProject(false);
                    loadAccounts();
                  }}
                  onError={(error) => {
                    console.error('Facebook linking error:', error);
                    alert(`Failed to link Facebook account: ${error}`);
                  }}
                  variant="default"
                  className="w-full"
                />
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search and Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search for a brand"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center border rounded-md">
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="rounded-r-none"
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="rounded-l-none"
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Brands Table/Grid */}
        {viewMode === 'list' ? (
          <div className="border rounded-lg">
            {/* Table Header */}
            <div className="grid grid-cols-5 gap-4 p-4 bg-gray-50 border-b text-sm font-medium text-gray-500 uppercase tracking-wide">
              <div>BRAND</div>
              <div>STATUS</div>
              <div>COMPUTE</div>
              <div>REGION</div>
              <div>CREATED</div>
            </div>

            {/* Table Content */}
            <div className="divide-y">
              {filteredAccounts.length > 0 ? (
                filteredAccounts.map((account) => (
                  <div key={account.id} className="grid grid-cols-5 gap-4 p-4 hover:bg-gray-50 cursor-pointer">
                    <div className="flex items-center">
                      <div>
                        <div className="font-medium">{account.provider}</div>
                        <div className="text-sm text-gray-500">ID: {account.providerUserId}</div>
                      </div>
                    </div>
                    <div>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Active
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">NANO</div>
                    <div className="text-sm text-gray-600">{account.provider === 'facebook' ? 'facebook' : 'global'}</div>
                    <div className="text-sm text-gray-600">
                      {account.createdAt ? new Date(account.createdAt).toLocaleDateString('vi-VN') : 'N/A'}
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-gray-500">
                  {searchTerm ? 'No brands match your search.' : 'No brands found. Create your first brand!'}
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Grid View */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAccounts.length > 0 ? (
              filteredAccounts.map((account) => (
                <Card key={account.id} className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <Facebook className="h-5 w-5 text-blue-500 mr-2" />
                        <h3 className="font-medium">{account.provider}</h3>
                      </div>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Active
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">ID: {account.providerUserId}</p>
                    <p className="text-sm text-gray-600 mb-1">Compute: NANO</p>
                    <p className="text-sm text-gray-600 mb-1">Region: {account.provider === 'facebook' ? 'facebook' : 'global'}</p>
                    <p className="text-sm text-gray-600">
                      Created: {account.createdAt ? new Date(account.createdAt).toLocaleDateString('vi-VN') : 'N/A'}
                    </p>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full p-8 text-center text-gray-500">
                {searchTerm ? 'No projects match your search.' : 'No projects found. Create your first project!'}
              </div>
            )}
          </div>
        )}

        {/* Legacy sections for page linking */}
        {isAuthenticated && user && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LinkIcon className="h-5 w-5 text-blue-500" />
                Liên kết Trang Facebook
              </CardTitle>
              <CardDescription>
                Kết nối tài khoản Facebook và chọn các trang để quản lý
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Chọn trang để liên kết</h4>
                  <p className="text-sm text-gray-600">
                    Sau khi kết nối, chọn các trang Facebook bạn muốn quản lý
                  </p>
                  <Button
                    onClick={() => setOpenPicker(true)}
                    variant="outline"
                    size="sm"
                    className="w-full sm:w-auto"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Chọn trang
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <SelectPagesPicker open={openPicker} onOpenChange={setOpenPicker} onLinked={() => loadAccounts()} />
      </div>
  );
}