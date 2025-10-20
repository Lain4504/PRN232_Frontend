'use client';

import { useState } from 'react';
import { useCreateTeam } from '@/hooks/use-teams';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Plus, 
  Users, 
  Settings, 
  Bell, 
  Shield,
  CheckCircle
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createTeamSchema, CreateTeamFormData } from '@/lib/validators/team';
import { toast } from 'sonner';

interface TeamCreationFormProps {
  onTeamCreated?: (teamId: string) => void;
  onCancel?: () => void;
}

export function TeamCreationForm({ onTeamCreated, onCancel }: TeamCreationFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { mutateAsync: createTeam } = useCreateTeam();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch
  } = useForm<CreateTeamFormData>({
    resolver: zodResolver(createTeamSchema),
    defaultValues: {
      name: '',
      description: '',
      settings: {
        allowMemberInvites: true,
        requireApprovalForJoins: false,
        defaultRole: 'Member',
        maxMembers: 10,
        allowExternalInvites: true,
        notificationSettings: {
          emailNotifications: true,
          inAppNotifications: true,
          memberJoinNotifications: true,
          roleChangeNotifications: true,
          billingNotifications: true,
        }
      }
    }
  });

  const watchedSettings = watch('settings');

  const onSubmit = async (data: CreateTeamFormData) => {
    setIsSubmitting(true);
    try {
      const createdTeam = await createTeam(data);
      onTeamCreated?.(createdTeam.id);
      
      toast.success('Team created successfully!', {
        description: `The ${data.name} team has been created.`,
        duration: 3000,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An error occurred';
      toast.error('Failed to create team', {
        description: message,
        duration: 4000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
          <Plus className="h-6 w-6 text-primary" />
        </div>
        <h2 className="text-2xl font-bold">Create New Team</h2>
        <p className="text-muted-foreground">
          Set up a new team with custom settings and permissions
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Basic Information
            </CardTitle>
            <CardDescription>
              Enter the basic details for your team
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Team Name *</Label>
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
                placeholder="Enter team description (optional)"
                rows={3}
                {...register('description')}
              />
              {errors.description && (
                <p className="text-sm text-destructive">{errors.description.message}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Team Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Team Settings
            </CardTitle>
            <CardDescription>
              Configure how your team operates
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

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notification Settings
            </CardTitle>
            <CardDescription>
              Configure notification preferences for your team
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
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
          </CardContent>
        </Card>

        {/* Security Notice */}
        <Card className="border-blue-200 bg-blue-50/50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="space-y-1">
                <h4 className="text-sm font-medium text-blue-900">Security & Privacy</h4>
                <p className="text-sm text-blue-700">
                  Your team data is encrypted and secure. You can modify these settings later in the team settings.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                Creating Team...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Create Team
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
