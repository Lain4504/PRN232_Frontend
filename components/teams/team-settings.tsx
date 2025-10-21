'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { 
  Settings, 
  Users, 
  Bell, 
  Shield, 
  Trash2, 
  Save, 
  AlertTriangle,
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { updateTeamSchema, UpdateTeamFormData } from '@/lib/validators/team';
import { toast } from 'sonner';

interface TeamSettingsProps {
  teamId: string;
  canManage?: boolean;
}

// Mock data - replace with actual API calls
const mockTeamSettings = {
  name: 'Marketing Team',
  description: 'Our main marketing team responsible for content creation and social media management.',
  allowMemberInvites: true,
  requireApprovalForJoins: false,
  defaultRole: 'Member',
  maxMembers: 25,
  allowExternalInvites: true,
  notificationSettings: {
    emailNotifications: true,
    inAppNotifications: true,
    memberJoinNotifications: true,
    roleChangeNotifications: true,
    billingNotifications: true,
  }
};

export function TeamSettings({ teamId, canManage = true }: TeamSettingsProps) {
  const [settings, setSettings] = useState(mockTeamSettings);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch
  } = useForm<UpdateTeamFormData>({
    resolver: zodResolver(updateTeamSchema),
    defaultValues: {
      name: settings.name,
      description: settings.description,
      settings: {
        allowMemberInvites: settings.allowMemberInvites,
        requireApprovalForJoins: settings.requireApprovalForJoins,
        defaultRole: settings.defaultRole,
        maxMembers: settings.maxMembers,
        allowExternalInvites: settings.allowExternalInvites,
        notificationSettings: settings.notificationSettings
      }
    }
  });

  const watchedSettings = watch('settings');

  const handleSaveSettings = async (data: UpdateTeamFormData) => {
    setIsSaving(true);
    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      setSettings(prev => ({
        ...prev,
        name: data.name || prev.name,
        description: data.description || prev.description,
        ...data.settings
      }));
      
      toast.success('Settings saved successfully!', {
        description: 'Your team settings have been updated.',
        duration: 3000,
      });
    } catch (error) {
      toast.error('Failed to save settings', {
        description: 'Please try again later.',
        duration: 4000,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteTeam = async () => {
    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      toast.success('Team deleted successfully!', {
        description: 'The team has been permanently removed.',
        duration: 3000,
      });
      
      setDeleteDialogOpen(false);
      // TODO: Redirect to teams list or dashboard
    } catch (error) {
      toast.error('Failed to delete team', {
        description: 'Please try again later.',
        duration: 4000,
      });
    }
  };

  const handleResetSettings = () => {
    reset({
      name: settings.name,
      description: settings.description,
      settings: {
        allowMemberInvites: settings.allowMemberInvites,
        requireApprovalForJoins: settings.requireApprovalForJoins,
        defaultRole: settings.defaultRole,
        maxMembers: settings.maxMembers,
        allowExternalInvites: settings.allowExternalInvites,
        notificationSettings: settings.notificationSettings
      }
    });
  };

  if (!canManage) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Access Denied</h3>
            <p className="text-muted-foreground">You don&#39;t have permission to manage team settings.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Team Settings</h2>
          <p className="text-muted-foreground">
            Configure your team&#39;s settings and preferences
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleResetSettings}>
            Reset
          </Button>
          <Button onClick={handleSubmit(handleSaveSettings)} disabled={isSaving}>
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit(handleSaveSettings)} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Basic Information
            </CardTitle>
            <CardDescription>
              Update your team&#39;s basic information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Team Name</Label>
              <Input
                id="name"
                placeholder="Enter team name"
                {...register('name')}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Enter team description"
                rows={3}
                {...register('description')}
              />
              {errors.description && (
                <p className="text-sm text-destructive">{errors.description.message}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Member Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Member Management
            </CardTitle>
            <CardDescription>
              Configure how members can join and be managed
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="allowMemberInvites">Allow Member Invites</Label>
                <p className="text-sm text-muted-foreground">
                  Allow team members to invite new members
                </p>
              </div>
              <Switch
                id="allowMemberInvites"
                checked={watchedSettings?.allowMemberInvites || false}
                onCheckedChange={(checked) => setValue('settings.allowMemberInvites', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="requireApprovalForJoins">Require Approval for Joins</Label>
                <p className="text-sm text-muted-foreground">
                  Require admin approval for new member requests
                </p>
              </div>
              <Switch
                id="requireApprovalForJoins"
                checked={watchedSettings?.requireApprovalForJoins || false}
                onCheckedChange={(checked) => setValue('settings.requireApprovalForJoins', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="allowExternalInvites">Allow External Invites</Label>
                <p className="text-sm text-muted-foreground">
                  Allow inviting users who are not yet registered
                </p>
              </div>
              <Switch
                id="allowExternalInvites"
                checked={watchedSettings?.allowExternalInvites || false}
                onCheckedChange={(checked) => setValue('settings.allowExternalInvites', checked)}
              />
            </div>

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="defaultRole">Default Role</Label>
              <Select
                value={watchedSettings?.defaultRole || 'Member'}
                onValueChange={(value) => setValue('settings.defaultRole', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select default role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Member">Member</SelectItem>
                  <SelectItem value="Copywriter">Copywriter</SelectItem>
                  <SelectItem value="Designer">Designer</SelectItem>
                  <SelectItem value="Marketer">Marketer</SelectItem>
                  <SelectItem value="TeamLeader">Team Leader</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxMembers">Maximum Members</Label>
              <Input
                id="maxMembers"
                type="number"
                min="1"
                max="100"
                value={watchedSettings?.maxMembers || 10}
                onChange={(e) => setValue('settings.maxMembers', parseInt(e.target.value))}
              />
              <p className="text-sm text-muted-foreground">
                Maximum number of members allowed in this team
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
            </CardTitle>
            <CardDescription>
              Configure notification preferences for your team
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="emailNotifications">Email Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Send notifications via email
                </p>
              </div>
              <Switch
                id="emailNotifications"
                checked={watchedSettings?.notificationSettings?.emailNotifications || false}
                onCheckedChange={(checked) => setValue('settings.notificationSettings.emailNotifications', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="inAppNotifications">In-App Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Show notifications within the application
                </p>
              </div>
              <Switch
                id="inAppNotifications"
                checked={watchedSettings?.notificationSettings?.inAppNotifications || false}
                onCheckedChange={(checked) => setValue('settings.notificationSettings.inAppNotifications', checked)}
              />
            </div>

            <Separator />

            <div className="space-y-4">
              <h4 className="text-sm font-medium">Specific Notifications</h4>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="memberJoinNotifications">Member Join Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Notify when new members join the team
                  </p>
                </div>
                <Switch
                  id="memberJoinNotifications"
                  checked={watchedSettings?.notificationSettings?.memberJoinNotifications || false}
                  onCheckedChange={(checked) => setValue('settings.notificationSettings.memberJoinNotifications', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="roleChangeNotifications">Role Change Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Notify when member roles are changed
                  </p>
                </div>
                <Switch
                  id="roleChangeNotifications"
                  checked={watchedSettings?.notificationSettings?.roleChangeNotifications || false}
                  onCheckedChange={(checked) => setValue('settings.notificationSettings.roleChangeNotifications', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="billingNotifications">Billing Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Notify about billing and subscription changes
                  </p>
                </div>
                <Switch
                  id="billingNotifications"
                  checked={watchedSettings?.notificationSettings?.billingNotifications || false}
                  onCheckedChange={(checked) => setValue('settings.notificationSettings.billingNotifications', checked)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Danger Zone
            </CardTitle>
            <CardDescription>
              Irreversible and destructive actions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-destructive">Delete Team</Label>
                <p className="text-sm text-muted-foreground">
                  Permanently delete this team and all its data. This action cannot be undone.
                </p>
              </div>
              <Button
                variant="destructive"
                onClick={() => setDeleteDialogOpen(true)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Team
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Delete Team
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this team? This action cannot be undone and will permanently remove:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>All team members and their data</li>
                <li>All team settings and configurations</li>
                <li>All team activity logs</li>
                <li>All associated billing information</li>
              </ul>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteTeam}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Team
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
