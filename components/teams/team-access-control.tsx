'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { 
  Shield, 
  Users, 
  Settings, 
  Lock, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Plus,
  Edit,
  Trash2
} from 'lucide-react';
import { toast } from 'sonner';

interface TeamAccessControlProps {
  teamId: string;
  canManage?: boolean;
}

// Mock data - replace with actual API calls
const mockAccessPolicies = [
  {
    id: '1',
    name: 'Default Team Access',
    description: 'Standard access policy for team members',
    isActive: true,
    rules: [
      { resource: 'team_settings', action: 'read', allowed: true },
      { resource: 'team_settings', action: 'write', allowed: false },
      { resource: 'team_members', action: 'read', allowed: true },
      { resource: 'team_members', action: 'write', allowed: false },
      { resource: 'team_billing', action: 'read', allowed: false },
      { resource: 'team_billing', action: 'write', allowed: false }
    ]
  },
  {
    id: '2',
    name: 'Admin Access Policy',
    description: 'Full access policy for team administrators',
    isActive: true,
    rules: [
      { resource: 'team_settings', action: 'read', allowed: true },
      { resource: 'team_settings', action: 'write', allowed: true },
      { resource: 'team_members', action: 'read', allowed: true },
      { resource: 'team_members', action: 'write', allowed: true },
      { resource: 'team_billing', action: 'read', allowed: true },
      { resource: 'team_billing', action: 'write', allowed: true }
    ]
  }
];

const mockSecuritySettings = {
  requireTwoFactor: false,
  sessionTimeout: 30, // minutes
  allowExternalInvites: true,
  requireApprovalForJoins: false,
  auditLogging: true,
  dataRetention: 90, // days
  ipWhitelist: [],
  allowedDomains: []
};

export function TeamAccessControl({ teamId, canManage = true }: TeamAccessControlProps) {
  const [accessPolicies, setAccessPolicies] = useState(mockAccessPolicies);
  const [securitySettings, setSecuritySettings] = useState(mockSecuritySettings);
  const [createPolicyDialogOpen, setCreatePolicyDialogOpen] = useState(false);
  const [editPolicyDialogOpen, setEditPolicyDialogOpen] = useState(false);
  const [deletePolicyDialogOpen, setDeletePolicyDialogOpen] = useState<string | null>(null);
  const [selectedPolicy, setSelectedPolicy] = useState<{id: string; name: string; description: string; rules: Array<{type: string; value: string}>} | null>(null);
  const [newPolicy, setNewPolicy] = useState({
    name: '',
    description: '',
    rules: [] as Array<{type: string; value: string}>
  });

  const handleCreatePolicy = async () => {
    if (!newPolicy.name.trim()) {
      toast.error('Policy name is required');
      return;
    }

    try {
      // TODO: Replace with actual API call
      const policy = {
        id: Date.now().toString(),
        ...newPolicy,
        isActive: true
      };
      
      setAccessPolicies(prev => [...prev, policy]);
      setCreatePolicyDialogOpen(false);
      setNewPolicy({ name: '', description: '', rules: [] });
      
      toast.success('Access policy created successfully!', {
        description: `The ${newPolicy.name} policy has been created.`,
        duration: 3000,
      });
    } catch (error) {
      toast.error('Failed to create access policy', {
        description: 'Please try again later.',
        duration: 4000,
      });
    }
  };

  const handleEditPolicy = async () => {
    if (!selectedPolicy || !selectedPolicy.name.trim()) {
      toast.error('Policy name is required');
      return;
    }

    try {
      // TODO: Replace with actual API call
      setAccessPolicies(prev => prev.map(policy => 
        policy.id === selectedPolicy.id ? selectedPolicy : policy
      ));
      setEditPolicyDialogOpen(false);
      setSelectedPolicy(null);
      
      toast.success('Access policy updated successfully!', {
        description: `The ${selectedPolicy.name} policy has been updated.`,
        duration: 3000,
      });
    } catch (error) {
      toast.error('Failed to update access policy', {
        description: 'Please try again later.',
        duration: 4000,
      });
    }
  };

  const handleDeletePolicy = async (policyId: string) => {
    try {
      // TODO: Replace with actual API call
      setAccessPolicies(prev => prev.filter(policy => policy.id !== policyId));
      setDeletePolicyDialogOpen(null);
      
      toast.success('Access policy deleted successfully!', {
        description: 'The policy has been removed.',
        duration: 3000,
      });
    } catch (error) {
      toast.error('Failed to delete access policy', {
        description: 'Please try again later.',
        duration: 4000,
      });
    }
  };

  const handleSecuritySettingChange = async (setting: string, value: boolean | string | number) => {
    try {
      // TODO: Replace with actual API call
      setSecuritySettings(prev => ({ ...prev, [setting]: value }));
      
      toast.success('Security setting updated!', {
        description: 'The security setting has been updated.',
        duration: 2000,
      });
    } catch (error) {
      toast.error('Failed to update security setting', {
        description: 'Please try again later.',
        duration: 4000,
      });
    }
  };

  const getResourceIcon = (resource: string) => {
    switch (resource) {
      case 'team_settings':
        return <Settings className="h-4 w-4" />;
      case 'team_members':
        return <Users className="h-4 w-4" />;
      case 'team_billing':
        return <Shield className="h-4 w-4" />;
      default:
        return <Shield className="h-4 w-4" />;
    }
  };

  const getActionColor = (allowed: boolean) => {
    return allowed ? 'text-green-600' : 'text-red-600';
  };

  const getActionIcon = (allowed: boolean) => {
    return allowed ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Access Control & Security</h2>
          <p className="text-muted-foreground">
            Manage team access policies and security settings
          </p>
        </div>
        {canManage && (
          <Button onClick={() => setCreatePolicyDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Policy
          </Button>
        )}
      </div>

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Security Settings
          </CardTitle>
          <CardDescription>
            Configure team security and access controls
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium">Require Two-Factor Authentication</Label>
                <p className="text-sm text-muted-foreground">
                  Require 2FA for all team members
                </p>
              </div>
              <Switch
                checked={securitySettings.requireTwoFactor}
                onCheckedChange={(checked) => handleSecuritySettingChange('requireTwoFactor', checked)}
                disabled={!canManage}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium">Audit Logging</Label>
                <p className="text-sm text-muted-foreground">
                  Log all team activities and changes
                </p>
              </div>
              <Switch
                checked={securitySettings.auditLogging}
                onCheckedChange={(checked) => handleSecuritySettingChange('auditLogging', checked)}
                disabled={!canManage}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium">Allow External Invites</Label>
                <p className="text-sm text-muted-foreground">
                  Allow inviting users from outside the organization
                </p>
              </div>
              <Switch
                checked={securitySettings.allowExternalInvites}
                onCheckedChange={(checked) => handleSecuritySettingChange('allowExternalInvites', checked)}
                disabled={!canManage}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium">Require Approval for Joins</Label>
                <p className="text-sm text-muted-foreground">
                  Require admin approval for new member requests
                </p>
              </div>
              <Switch
                checked={securitySettings.requireApprovalForJoins}
                onCheckedChange={(checked) => handleSecuritySettingChange('requireApprovalForJoins', checked)}
                disabled={!canManage}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Access Policies */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Access Policies
          </CardTitle>
          <CardDescription>
            Define and manage access control policies
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Policy</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Rules</TableHead>
                  {canManage && <TableHead className="text-right">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {accessPolicies.map((policy) => (
                  <TableRow key={policy.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-blue-500" />
                        <span className="font-medium">{policy.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-md">
                      <div className="text-sm text-muted-foreground">
                        {policy.description}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={policy.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                        {policy.isActive ? (
                          <>
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Active
                          </>
                        ) : (
                          <>
                            <XCircle className="h-3 w-3 mr-1" />
                            Inactive
                          </>
                        )}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {policy.rules.length} rules
                      </Badge>
                    </TableCell>
                    {canManage && (
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedPolicy(policy);
                              setEditPolicyDialogOpen(true);
                            }}
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setDeletePolicyDialogOpen(policy.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
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

      {/* Policy Rules Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Policy Rules</CardTitle>
          <CardDescription>
            View detailed access rules for each policy
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {accessPolicies.map((policy) => (
              <div key={policy.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium">{policy.name}</h4>
                  <Badge className={policy.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                    {policy.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {policy.rules.map((rule, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 border rounded">
                      {getResourceIcon(rule.resource)}
                      <span className="text-sm font-medium">{rule.resource}</span>
                      <span className="text-sm text-muted-foreground">{rule.action}</span>
                      <div className={`ml-auto ${getActionColor(rule.allowed)}`}>
                        {getActionIcon(rule.allowed)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Create Policy Dialog */}
      <Dialog open={createPolicyDialogOpen} onOpenChange={setCreatePolicyDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create Access Policy</DialogTitle>
            <DialogDescription>
              Create a new access control policy for your team
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="policyName">Policy Name</Label>
              <Input
                id="policyName"
                placeholder="Enter policy name"
                value={newPolicy.name}
                onChange={(e) => setNewPolicy(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="policyDescription">Description</Label>
              <Textarea
                id="policyDescription"
                placeholder="Enter policy description"
                rows={3}
                value={newPolicy.description}
                onChange={(e) => setNewPolicy(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label>Access Rules</Label>
              <div className="border rounded-lg p-3 max-h-48 overflow-y-auto bg-muted/20">
                <div className="text-sm text-muted-foreground mb-2">
                  Configure access rules for different resources
                </div>
                <div className="grid grid-cols-1 gap-2 text-sm">
                  {['team_settings', 'team_members', 'team_billing'].map((resource) => (
                    <div key={resource} className="space-y-1">
                      <div className="font-medium">{resource.replace('_', ' ')}</div>
                      <div className="flex items-center gap-4 ml-4">
                        <label className="flex items-center gap-2">
                          <input type="checkbox" className="rounded" />
                          <span>Read</span>
                        </label>
                        <label className="flex items-center gap-2">
                          <input type="checkbox" className="rounded" />
                          <span>Write</span>
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => setCreatePolicyDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleCreatePolicy}>
              Create Policy
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Policy Dialog */}
      <Dialog open={editPolicyDialogOpen} onOpenChange={setEditPolicyDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Access Policy</DialogTitle>
            <DialogDescription>
              Update the access control policy
            </DialogDescription>
          </DialogHeader>
          {selectedPolicy && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="editPolicyName">Policy Name</Label>
                <Input
                  id="editPolicyName"
                  value={selectedPolicy.name}
                  onChange={(e) => setSelectedPolicy(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="editPolicyDescription">Description</Label>
                <Textarea
                  id="editPolicyDescription"
                  rows={3}
                  value={selectedPolicy.description}
                  onChange={(e) => setSelectedPolicy(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="editPolicyActive">Active</Label>
                  <p className="text-sm text-muted-foreground">
                    Whether this policy is currently active
                  </p>
                </div>
                <Switch
                  id="editPolicyActive"
                  checked={selectedPolicy.isActive}
                  onCheckedChange={(checked) => setSelectedPolicy(prev => ({ ...prev, isActive: checked }))}
                />
              </div>
            </div>
          )}
          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => setEditPolicyDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleEditPolicy}>
              Update Policy
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletePolicyDialogOpen} onOpenChange={() => setDeletePolicyDialogOpen(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Delete Access Policy
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this access policy? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletePolicyDialogOpen && handleDeletePolicy(deletePolicyDialogOpen)}
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
