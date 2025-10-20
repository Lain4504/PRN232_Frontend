'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { 
  Shield, 
  Plus, 
  Edit, 
  Trash2, 
  Users, 
  Settings,
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { getPermissionsForRole, getPermissionInfo, getAllPermissions } from '@/lib/constants/team-roles';
import { toast } from 'sonner';
import { TeamRole } from '@/lib/types/teams';

interface TeamRoleManagementProps {
  teamId: string;
  canManage?: boolean;
}

// Mock data - replace with actual API calls
const mockRoles = [
  {
    id: '1',
    name: 'Vendor',
    description: 'Full access to all team features and settings',
    permissions: getPermissionsForRole('Vendor'),
    isDefault: false,
    memberCount: 1
  },
  {
    id: '2',
    name: 'Team Leader',
    description: 'Manage team members and content, view analytics',
    permissions: getPermissionsForRole('TeamLeader'),
    isDefault: false,
    memberCount: 2
  },
  {
    id: '3',
    name: 'Copywriter',
    description: 'Create and edit content, submit for approval',
    permissions: getPermissionsForRole('Copywriter'),
    isDefault: true,
    memberCount: 4
  },
  {
    id: '4',
    name: 'Designer',
    description: 'Create visual content and designs',
    permissions: getPermissionsForRole('Designer'),
    isDefault: true,
    memberCount: 3
  }
];

export function TeamRoleManagement({ teamId, canManage = true }: TeamRoleManagementProps) {
  const [roles, setRoles] = useState(mockRoles);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<TeamRole | null>(null);
  const [newRole, setNewRole] = useState({
    name: '',
    description: '',
    permissions: [] as string[],
    isDefault: false
  });

  const allPermissions = getAllPermissions();

  const handleCreateRole = async () => {
    if (!newRole.name.trim()) {
      toast.error('Role name is required');
      return;
    }

    try {
      // TODO: Replace with actual API call
      const role = {
        id: Date.now().toString(),
        ...newRole,
        memberCount: 0
      };
      
      setRoles(prev => [...prev, role]);
      setCreateDialogOpen(false);
      setNewRole({ name: '', description: '', permissions: [], isDefault: false });
      
      toast.success('Role created successfully!', {
        description: `The ${newRole.name} role has been created.`,
        duration: 3000,
      });
    } catch (error) {
      toast.error('Failed to create role', {
        description: 'Please try again later.',
        duration: 4000,
      });
    }
  };

  const handleEditRole = async () => {
    if (!selectedRole || !selectedRole.name.trim()) {
      toast.error('Role name is required');
      return;
    }

    try {
      // TODO: Replace with actual API call
      setRoles(prev => prev.map(role => 
        role.id === selectedRole.id ? selectedRole : role
      ));
      setEditDialogOpen(false);
      setSelectedRole(null);
      
      toast.success('Role updated successfully!', {
        description: `The ${selectedRole.name} role has been updated.`,
        duration: 3000,
      });
    } catch (error) {
      toast.error('Failed to update role', {
        description: 'Please try again later.',
        duration: 4000,
      });
    }
  };

  const handleDeleteRole = async (roleId: string) => {
    try {
      // TODO: Replace with actual API call
      setRoles(prev => prev.filter(role => role.id !== roleId));
      setDeleteDialogOpen(null);
      
      toast.success('Role deleted successfully!', {
        description: 'The role has been removed.',
        duration: 3000,
      });
    } catch (error) {
      toast.error('Failed to delete role', {
        description: 'Please try again later.',
        duration: 4000,
      });
    }
  };

  const togglePermission = (permission: string, isNewRole = false) => {
    if (isNewRole) {
      if (newRole.permissions.includes(permission)) {
        setNewRole(prev => ({
          ...prev,
          permissions: prev.permissions.filter(p => p !== permission)
        }));
      } else {
        setNewRole(prev => ({
          ...prev,
          permissions: [...prev.permissions, permission]
        }));
      }
    } else if (selectedRole) {
      if (selectedRole.permissions.includes(permission)) {
        setSelectedRole(prev => ({
          ...prev,
          permissions: prev.permissions.filter(p => p !== permission)
        }));
      } else {
        setSelectedRole(prev => ({
          ...prev,
          permissions: [...prev.permissions, permission]
        }));
      }
    }
  };

  const getRoleIcon = (roleName: string) => {
    switch (roleName) {
      case 'Vendor':
        return <Shield className="h-4 w-4 text-red-500" />;
      case 'Team Leader':
        return <Users className="h-4 w-4 text-blue-500" />;
      case 'Copywriter':
        return <Edit className="h-4 w-4 text-green-500" />;
      case 'Designer':
        return <Settings className="h-4 w-4 text-purple-500" />;
      default:
        return <Users className="h-4 w-4 text-gray-500" />;
    }
  };

  const canDeleteRole = (role: TeamRole) => {
    return !role.isDefault && role.memberCount === 0;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Role Management</h2>
          <p className="text-muted-foreground">
            Manage team roles and their permissions
          </p>
        </div>
        {canManage && (
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Role
          </Button>
        )}
      </div>

      {/* Roles Table */}
      <Card>
        <CardHeader>
          <CardTitle>Team Roles</CardTitle>
          <CardDescription>
            View and manage team roles and their permissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Role</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Permissions</TableHead>
                  <TableHead>Members</TableHead>
                  <TableHead>Default</TableHead>
                  {canManage && <TableHead className="text-right">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {roles.map((role) => (
                  <TableRow key={role.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getRoleIcon(role.name)}
                        <span className="font-medium">{role.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-md">
                      <div className="text-sm text-muted-foreground">
                        {role.description}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {role.permissions.length} permissions
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>{role.memberCount}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {role.isDefault ? (
                        <Badge variant="default" className="bg-green-100 text-green-800">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Default
                        </Badge>
                      ) : (
                        <Badge variant="outline">
                          <XCircle className="h-3 w-3 mr-1" />
                          Custom
                        </Badge>
                      )}
                    </TableCell>
                    {canManage && (
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedRole(role);
                              setEditDialogOpen(true);
                            }}
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                          {canDeleteRole(role) && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setDeleteDialogOpen(role.id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Create Role Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Create New Role</DialogTitle>
            <DialogDescription>
              Create a new team role with custom permissions
            </DialogDescription>
          </DialogHeader>
          <div className="overflow-y-auto flex-1 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="roleName">Role Name</Label>
              <Input
                id="roleName"
                placeholder="Enter role name"
                value={newRole.name}
                onChange={(e) => setNewRole(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="roleDescription">Description</Label>
              <Textarea
                id="roleDescription"
                placeholder="Enter role description"
                rows={3}
                value={newRole.description}
                onChange={(e) => setNewRole(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="isDefault">Default Role</Label>
                <p className="text-sm text-muted-foreground">
                  Make this the default role for new members
                </p>
              </div>
              <Switch
                id="isDefault"
                checked={newRole.isDefault}
                onCheckedChange={(checked) => setNewRole(prev => ({ ...prev, isDefault: checked }))}
              />
            </div>

            <div className="space-y-2">
              <Label>Permissions</Label>
              <div className="border rounded-lg p-3 max-h-48 overflow-y-auto bg-muted/20">
                <div className="grid grid-cols-1 gap-2 text-sm">
                  {allPermissions.map((permission) => (
                    <label key={permission.id} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newRole.permissions.includes(permission.id)}
                        onChange={() => togglePermission(permission.id, true)}
                        className="rounded"
                      />
                      <div>
                        <div className="font-medium">{permission.label}</div>
                        <div className="text-xs text-muted-foreground">{permission.description}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => setCreateDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateRole}>
              Create Role
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Role Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Edit Role</DialogTitle>
            <DialogDescription>
              Update role information and permissions
            </DialogDescription>
          </DialogHeader>
          {selectedRole && (
            <div className="overflow-y-auto flex-1 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="editRoleName">Role Name</Label>
                <Input
                  id="editRoleName"
                  value={selectedRole.name}
                  onChange={(e) => setSelectedRole(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="editRoleDescription">Description</Label>
                <Textarea
                  id="editRoleDescription"
                  rows={3}
                  value={selectedRole.description}
                  onChange={(e) => setSelectedRole(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="editIsDefault">Default Role</Label>
                  <p className="text-sm text-muted-foreground">
                    Make this the default role for new members
                  </p>
                </div>
                <Switch
                  id="editIsDefault"
                  checked={selectedRole.isDefault}
                  onCheckedChange={(checked) => setSelectedRole(prev => ({ ...prev, isDefault: checked }))}
                />
              </div>

              <div className="space-y-2">
                <Label>Permissions</Label>
                <div className="border rounded-lg p-3 max-h-48 overflow-y-auto bg-muted/20">
                  <div className="grid grid-cols-1 gap-2 text-sm">
                    {allPermissions.map((permission) => (
                      <label key={permission.id} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedRole.permissions.includes(permission.id)}
                          onChange={() => togglePermission(permission.id)}
                          className="rounded"
                        />
                        <div>
                          <div className="font-medium">{permission.label}</div>
                          <div className="text-xs text-muted-foreground">{permission.description}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => setEditDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleEditRole}>
              Update Role
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteDialogOpen} onOpenChange={() => setDeleteDialogOpen(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Delete Role
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this role? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteDialogOpen && handleDeleteRole(deleteDialogOpen)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
