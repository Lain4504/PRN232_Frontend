'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { 
  Mail, 
  UserPlus, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  RefreshCw,
  Trash2,
  Search
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { inviteMemberSchema, InviteMemberFormData } from '@/lib/validators/team';
import { getInvitationStatusColor, getInvitationStatusLabel, formatRelativeTime } from '@/lib/utils/teams';
import { toast } from 'sonner';

interface TeamInvitationSystemProps {
  teamId: string;
  canManage?: boolean;
}

// Mock data - replace with actual API calls
const mockInvitations = [
  {
    id: '1',
    email: 'john.doe@example.com',
    role: 'Copywriter',
    status: 'pending' as const,
    invitedBy: 'admin@example.com',
    invitedAt: '2024-12-19T10:00:00Z',
    expiresAt: '2024-12-26T10:00:00Z'
  },
  {
    id: '2',
    email: 'jane.smith@example.com',
    role: 'Designer',
    status: 'accepted' as const,
    invitedBy: 'admin@example.com',
    invitedAt: '2024-12-18T14:30:00Z',
    expiresAt: '2024-12-25T14:30:00Z'
  },
  {
    id: '3',
    email: 'mike.johnson@example.com',
    role: 'Marketer',
    status: 'expired' as const,
    invitedBy: 'admin@example.com',
    invitedAt: '2024-12-10T09:15:00Z',
    expiresAt: '2024-12-17T09:15:00Z'
  }
];

export function TeamInvitationSystem({ teamId, canManage = true }: TeamInvitationSystemProps) {
  const [invitations, setInvitations] = useState(mockInvitations);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch
  } = useForm<InviteMemberFormData>({
    resolver: zodResolver(inviteMemberSchema)
  });

  const selectedRole = watch('role');

  const filteredInvitations = invitations.filter(invitation => {
    const matchesSearch = invitation.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         invitation.role.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || invitation.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleInviteMember = async (data: InviteMemberFormData) => {
    try {
      // TODO: Replace with actual API call
      const newInvitation = {
        id: Date.now().toString(),
        email: data.email,
        role: data.role,
        status: 'pending' as const,
        invitedBy: 'current-user@example.com',
        invitedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days from now
      };

      setInvitations(prev => [newInvitation, ...prev]);
      setInviteDialogOpen(false);
      reset();
      
      toast.success('Invitation sent successfully!', {
        description: `An invitation has been sent to ${data.email}`,
        duration: 3000,
      });
    } catch (error) {
      toast.error('Failed to send invitation', {
        description: 'Please try again later.',
        duration: 4000,
      });
    }
  };

  const handleResendInvitation = async (invitationId: string) => {
    try {
      // TODO: Replace with actual API call
      setInvitations(prev => prev.map(inv => 
        inv.id === invitationId 
          ? { ...inv, invitedAt: new Date().toISOString(), expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() }
          : inv
      ));
      
      toast.success('Invitation resent successfully!', {
        description: 'The invitation has been resent with a new expiration date.',
        duration: 3000,
      });
    } catch (error) {
      toast.error('Failed to resend invitation', {
        description: 'Please try again later.',
        duration: 4000,
      });
    }
  };

  const handleDeleteInvitation = async (invitationId: string) => {
    try {
      // TODO: Replace with actual API call
      setInvitations(prev => prev.filter(inv => inv.id !== invitationId));
      setDeleteDialogOpen(null);
      
      toast.success('Invitation deleted successfully!', {
        description: 'The invitation has been removed.',
        duration: 3000,
      });
    } catch (error) {
      toast.error('Failed to delete invitation', {
        description: 'Please try again later.',
        duration: 4000,
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'accepted':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'expired':
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const isExpired = (expiresAt: string) => {
    return new Date(expiresAt) < new Date();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Team Invitations</h2>
          <p className="text-muted-foreground">
            Manage team member invitations and track their status
          </p>
        </div>
        {canManage && (
          <Button onClick={() => setInviteDialogOpen(true)}>
            <UserPlus className="h-4 w-4 mr-2" />
            Send Invitation
          </Button>
        )}
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Invitations</CardTitle>
          <CardDescription>
            View and manage all team invitations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by email or role..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="accepted">Accepted</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Invitations Table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Invited By</TableHead>
                  <TableHead>Invited At</TableHead>
                  <TableHead>Expires At</TableHead>
                  {canManage && <TableHead className="text-right">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvitations.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={canManage ? 7 : 6} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <Mail className="h-8 w-8" />
                        <div>No invitations found</div>
                        {searchQuery && (
                          <div className="text-sm">Try adjusting your search criteria</div>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredInvitations.map((invitation) => (
                    <TableRow key={invitation.id}>
                      <TableCell className="font-medium">{invitation.email}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{invitation.role}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(invitation.status)}
                          <Badge className={getInvitationStatusColor(invitation.status)}>
                            {getInvitationStatusLabel(invitation.status)}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {invitation.invitedBy}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatRelativeTime(invitation.invitedAt)}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {isExpired(invitation.expiresAt) ? (
                          <span className="text-red-500">Expired</span>
                        ) : (
                          formatRelativeTime(invitation.expiresAt)
                        )}
                      </TableCell>
                      {canManage && (
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            {invitation.status === 'pending' && !isExpired(invitation.expiresAt) && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleResendInvitation(invitation.id)}
                              >
                                <RefreshCw className="h-4 w-4 mr-1" />
                                Resend
                              </Button>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setDeleteDialogOpen(invitation.id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Invite Member Dialog */}
      <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Invite Team Member</DialogTitle>
            <DialogDescription>
              Send an invitation to join your team
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(handleInviteMember)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="colleague@example.com"
                {...register('email')}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select onValueChange={(value) => setValue('role', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Copywriter">Copywriter</SelectItem>
                  <SelectItem value="Designer">Designer</SelectItem>
                  <SelectItem value="Marketer">Marketer</SelectItem>
                  <SelectItem value="TeamLeader">Team Leader</SelectItem>
                  <SelectItem value="Vendor">Vendor</SelectItem>
                </SelectContent>
              </Select>
              {errors.role && (
                <p className="text-sm text-destructive">{errors.role.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Personal Message (Optional)</Label>
              <Textarea
                id="message"
                placeholder="Add a personal message to the invitation..."
                rows={3}
                {...register('message')}
              />
              {errors.message && (
                <p className="text-sm text-destructive">{errors.message.message}</p>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setInviteDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Sending...' : 'Send Invitation'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteDialogOpen} onOpenChange={() => setDeleteDialogOpen(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Invitation</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this invitation? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteDialogOpen && handleDeleteInvitation(deleteDialogOpen)}
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
