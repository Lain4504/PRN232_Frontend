'use client';

import { useState, useEffect } from 'react';
import { useUpdateTeamMember } from '@/hooks/use-teams';
import { TeamMemberResponseDto } from '@/lib/types/aisam-types';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useIsMobile } from '@/hooks/use-mobile';
import { AlertCircle, User } from 'lucide-react';
import { getPermissionsForRole, getPermissionInfo } from '@/lib/constants/team-roles';
import { toast } from 'sonner';

interface EditMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teamId: string;
  member: TeamMemberResponseDto | null;
}

export function EditMemberDialog({ open, onOpenChange, teamId, member }: EditMemberDialogProps) {
  const [role, setRole] = useState('');
  const [permissions, setPermissions] = useState<string[]>([]);
  const [isActive, setIsActive] = useState(true);
  const [showPermissions, setShowPermissions] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { mutateAsync: updateMember, isPending: updating } = useUpdateTeamMember(teamId, member?.id || '');

  // Initialize form data when member changes
  useEffect(() => {
    if (member) {
      setRole(member.role || '');
      setPermissions(member.permissions || []);
      setIsActive(member.isActive);
      setError(null);
    }
  }, [member]);

  // Auto-update permissions when role changes
  useEffect(() => {
    if (role) {
      const rolePermissions = getPermissionsForRole(role);
      setPermissions(rolePermissions);
    }
  }, [role]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!member) {
      setError('No member selected');
      return;
    }

    try {
      await updateMember({
        role,
        permissions,
        isActive
      });

      onOpenChange(false);
      toast.success('Member updated successfully!', {
        description: 'The member information has been updated.',
        duration: 3000,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An error occurred';
      setError('Could not update member. ' + message);
    }
  };

  const togglePermission = (permission: string) => {
    if (permissions.includes(permission)) {
      setPermissions(permissions.filter(p => p !== permission));
    } else {
      setPermissions([...permissions, permission]);
    }
  };

  const isMobile = useIsMobile();

  if (!member) {
    return null;
  }

  const content = (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Member Info Display */}
      <div className="space-y-4 p-4 bg-muted/20 rounded-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
            <User className="h-5 w-5 text-primary" />
          </div>
          <div>
            <div className="font-medium">{member.userEmail}</div>
            <div className="text-sm text-muted-foreground">
              Joined {new Date(member.joinedAt).toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>

      {/* Role Selection */}
      <div className="space-y-2">
        <Label htmlFor="role">Role</Label>
        <Select value={role} onValueChange={setRole}>
          <SelectTrigger>
            <SelectValue placeholder="Select role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Copywriter">Copywriter</SelectItem>
            <SelectItem value="Designer">Designer</SelectItem>
            <SelectItem value="Marketer">Marketer</SelectItem>
            <SelectItem value="TeamLeader">Team Leader</SelectItem>
            <SelectItem value="Vendor">Vendor</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          Permissions will be automatically updated based on the selected role
        </p>
      </div>

      {/* Active Status */}
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label htmlFor="isActive">Active Status</Label>
          <p className="text-sm text-muted-foreground">
            Whether this member is active in the team
          </p>
        </div>
        <Switch
          id="isActive"
          checked={isActive}
          onCheckedChange={setIsActive}
        />
      </div>

      {/* Permissions */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <Label className="text-sm font-medium">Permissions</Label>
          <Button 
            type="button" 
            variant="ghost" 
            size="sm" 
            className="h-8 text-xs" 
            onClick={() => setShowPermissions(!showPermissions)}
          >
            {showPermissions ? 'Hide' : 'Show'} permissions
          </Button>
        </div>

        {permissions.length > 0 && (
          <div className="text-sm text-muted-foreground mb-2">
            Selected {permissions.length} permissions for role &#34;{role}&#34;
          </div>
        )}

        {showPermissions && (
          <div className="border rounded-lg p-3 max-h-48 overflow-y-auto bg-muted/20">
            <div className="text-xs mb-2 p-2 rounded bg-background/50 border">
              These permissions are automatically assigned based on the role. You can customize them.
            </div>
            <TooltipProvider>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {getPermissionsForRole(role).map((permission) => {
                  const info = getPermissionInfo(permission);
                  return (
                    <Tooltip key={permission}>
                      <TooltipTrigger asChild>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <Checkbox
                            checked={permissions.includes(permission)}
                            onCheckedChange={() => togglePermission(permission)}
                          />
                          <span className="truncate">
                            {info?.label || permission}
                          </span>
                        </label>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{info?.description || permission}</p>
                      </TooltipContent>
                    </Tooltip>
                  );
                })}
              </div>
            </TooltipProvider>
            <div className="mt-3 flex gap-2">
              <Button 
                type="button" 
                variant="ghost" 
                size="sm" 
                className="h-8 text-xs" 
                onClick={() => setPermissions(getPermissionsForRole(role).slice())}
              >
                Select all
              </Button>
              <Button 
                type="button" 
                variant="ghost" 
                size="sm" 
                className="h-8 text-xs" 
                onClick={() => setPermissions([])}
              >
                Deselect all
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/5 border border-destructive/20">
          <AlertCircle className="h-4 w-4 text-destructive" />
          <div className="text-sm text-destructive">{error}</div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-end gap-2 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => onOpenChange(false)}
          size="sm"
          className="w-full md:w-auto h-8 text-xs"
        >
          Cancel
        </Button>
        <Button type="submit" disabled={updating || !role} size="sm" className="w-full md:w-auto h-8 text-xs">
          {updating ? 'Updating...' : 'Update Member'}
        </Button>
      </div>
    </form>
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="max-h-[90vh] flex flex-col">
          <DrawerHeader className="flex-shrink-0 text-left">
            <DrawerTitle>Edit Team Member</DrawerTitle>
            <DrawerDescription>
              Update member role, permissions, and status.
            </DrawerDescription>
          </DrawerHeader>
          <div className="px-4 overflow-y-auto flex-1">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Member Info Display */}
              <div className="space-y-4 p-4 bg-muted/20 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-medium">{member.userEmail}</div>
                    <div className="text-sm text-muted-foreground">
                      Joined {new Date(member.joinedAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>

              {/* Role Selection */}
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select value={role} onValueChange={setRole}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Copywriter">Copywriter</SelectItem>
                    <SelectItem value="Designer">Designer</SelectItem>
                    <SelectItem value="Marketer">Marketer</SelectItem>
                    <SelectItem value="TeamLeader">Team Leader</SelectItem>
                    <SelectItem value="Vendor">Vendor</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Permissions will be automatically updated based on the selected role
                </p>
              </div>

              {/* Active Status */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="isActive">Active Status</Label>
                  <p className="text-sm text-muted-foreground">
                    Whether this member is active in the team
                  </p>
                </div>
                <Switch
                  id="isActive"
                  checked={isActive}
                  onCheckedChange={setIsActive}
                />
              </div>

              {/* Permissions */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-sm font-medium">Permissions</Label>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 text-xs" 
                    onClick={() => setShowPermissions(!showPermissions)}
                  >
                    {showPermissions ? 'Hide' : 'Show'} permissions
                  </Button>
                </div>

                {permissions.length > 0 && (
                  <div className="text-sm text-muted-foreground mb-2">
                    Selected {permissions.length} permissions for role &#34;{role}&#34;
                  </div>
                )}

                {showPermissions && (
                  <div className="border rounded-lg p-3 max-h-48 overflow-y-auto bg-muted/20">
                    <div className="text-xs mb-2 p-2 rounded bg-background/50 border">
                      These permissions are automatically assigned based on the role. You can customize them.
                    </div>
                    <TooltipProvider>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        {getPermissionsForRole(role).map((permission) => {
                          const info = getPermissionInfo(permission);
                          return (
                            <Tooltip key={permission}>
                              <TooltipTrigger asChild>
                                <label className="flex items-center gap-2 cursor-pointer">
                                  <Checkbox
                                    checked={permissions.includes(permission)}
                                    onCheckedChange={() => togglePermission(permission)}
                                  />
                                  <span className="truncate">
                                    {info?.label || permission}
                                  </span>
                                </label>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{info?.description || permission}</p>
                              </TooltipContent>
                            </Tooltip>
                          );
                        })}
                      </div>
                    </TooltipProvider>
                    <div className="mt-3 flex gap-2">
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 text-xs" 
                        onClick={() => setPermissions(getPermissionsForRole(role).slice())}
                      >
                        Select all
                      </Button>
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 text-xs" 
                        onClick={() => setPermissions([])}
                      >
                        Deselect all
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Error Display */}
              {error && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/5 border border-destructive/20">
                  <AlertCircle className="h-4 w-4 text-destructive" />
                  <div className="text-sm text-destructive">{error}</div>
                </div>
              )}
            </form>
          </div>
          <DrawerFooter className="flex-shrink-0 pt-2">
            <div className="space-y-2">
              <Button 
                onClick={handleSubmit} 
                disabled={updating || !role} 
                className="w-full"
              >
                {updating ? 'Updating...' : 'Update Member'}
              </Button>
              <DrawerClose asChild>
                <Button variant="outline" className="w-full">Cancel</Button>
              </DrawerClose>
            </div>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>Edit Team Member</DialogTitle>
          <DialogDescription>
            Update member role, permissions, and status.
          </DialogDescription>
        </DialogHeader>
        <div className="overflow-y-auto flex-1">
          {content}
        </div>
      </DialogContent>
    </Dialog>
  );
}
