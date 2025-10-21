'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Shield, 
  Search, 
  Download,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Lock,
  User,
  Settings,
  CreditCard,
  Calendar,
} from 'lucide-react';
import { formatDate, formatRelativeTime } from '@/lib/utils/teams';

interface TeamSecurityAuditProps {
  teamId: string;
  canView?: boolean;
}

// Mock data - replace with actual API calls
const mockAuditLogs = [
  {
    id: '1',
    timestamp: '2024-12-19T10:30:00Z',
    userId: 'user-1',
    userEmail: 'admin@example.com',
    action: 'login_success',
    resource: 'team_access',
    details: { ip: '192.168.1.100', userAgent: 'Mozilla/5.0...' },
    severity: 'info',
    status: 'success'
  },
  {
    id: '2',
    timestamp: '2024-12-19T09:15:00Z',
    userId: 'user-2',
    userEmail: 'member@example.com',
    action: 'permission_denied',
    resource: 'team_billing',
    details: { attemptedAction: 'read', reason: 'insufficient_permissions' },
    severity: 'warning',
    status: 'denied'
  },
  {
    id: '3',
    timestamp: '2024-12-19T08:45:00Z',
    userId: 'user-1',
    userEmail: 'admin@example.com',
    action: 'security_setting_changed',
    resource: 'team_security',
    details: { setting: 'requireTwoFactor', oldValue: false, newValue: true },
    severity: 'info',
    status: 'success'
  },
  {
    id: '4',
    timestamp: '2024-12-18T16:30:00Z',
    userId: 'unknown',
    userEmail: 'unknown@example.com',
    action: 'login_failed',
    resource: 'team_access',
    details: { ip: '192.168.1.200', reason: 'invalid_credentials' },
    severity: 'warning',
    status: 'failed'
  },
  {
    id: '5',
    timestamp: '2024-12-18T14:20:00Z',
    userId: 'user-3',
    userEmail: 'manager@example.com',
    action: 'data_export',
    resource: 'team_data',
    details: { exportType: 'member_list', recordCount: 25 },
    severity: 'info',
    status: 'success'
  },
  {
    id: '6',
    timestamp: '2024-12-18T12:10:00Z',
    userId: 'user-1',
    userEmail: 'admin@example.com',
    action: 'access_policy_created',
    resource: 'team_security',
    details: { policyName: 'Restricted Access', policyId: 'policy-123' },
    severity: 'info',
    status: 'success'
  }
];

export function TeamSecurityAudit({ teamId, canView = true }: TeamSecurityAuditProps) {
  const [auditLogs] = useState(mockAuditLogs);
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [actionFilter, setActionFilter] = useState<string>('all');

  if (!canView) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Access Denied</h3>
            <p className="text-muted-foreground">You don&apos;t have permission to view security audit logs.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch = searchQuery === '' || 
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.resource.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesSeverity = severityFilter === 'all' || log.severity === severityFilter;
    const matchesAction = actionFilter === 'all' || log.action === actionFilter;
    
    return matchesSearch && matchesSeverity && matchesAction;
  });

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'info':
        return <CheckCircle className="h-4 w-4 text-blue-600" />;
      default:
        return <CheckCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'info':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failed':
      case 'denied':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <CheckCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'failed':
      case 'denied':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'login_success':
      case 'login_failed':
        return <User className="h-4 w-4" />;
      case 'permission_denied':
        return <Lock className="h-4 w-4" />;
      case 'security_setting_changed':
        return <Settings className="h-4 w-4" />;
      case 'data_export':
        return <Download className="h-4 w-4" />;
      case 'access_policy_created':
        return <Shield className="h-4 w-4" />;
      default:
        return <Shield className="h-4 w-4" />;
    }
  };

  const getResourceIcon = (resource: string) => {
    switch (resource) {
      case 'team_access':
        return <User className="h-4 w-4" />;
      case 'team_security':
        return <Shield className="h-4 w-4" />;
      case 'team_billing':
        return <CreditCard className="h-4 w-4" />;
      case 'team_data':
        return <Settings className="h-4 w-4" />;
      default:
        return <Shield className="h-4 w-4" />;
    }
  };

  const handleExport = () => {
    // TODO: Implement actual export functionality
    console.log('Exporting audit logs...');
  };

  const criticalLogs = auditLogs.filter(log => log.severity === 'critical').length;
  const warningLogs = auditLogs.filter(log => log.severity === 'warning').length;
  const totalLogs = auditLogs.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Security Audit Log</h2>
          <p className="text-muted-foreground">
            Monitor security events and access attempts
          </p>
        </div>
        <Button variant="outline" onClick={handleExport}>
          <Download className="h-4 w-4 mr-2" />
          Export Logs
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{criticalLogs}</div>
                <div className="text-sm text-muted-foreground">Critical Events</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{warningLogs}</div>
                <div className="text-sm text-muted-foreground">Warnings</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Shield className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{totalLogs}</div>
                <div className="text-sm text-muted-foreground">Total Events</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Audit Logs</CardTitle>
          <CardDescription>
            View and filter security audit events
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search audit logs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severities</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
                <SelectItem value="info">Info</SelectItem>
              </SelectContent>
            </Select>
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                <SelectItem value="login_success">Login Success</SelectItem>
                <SelectItem value="login_failed">Login Failed</SelectItem>
                <SelectItem value="permission_denied">Permission Denied</SelectItem>
                <SelectItem value="security_setting_changed">Security Setting Changed</SelectItem>
                <SelectItem value="data_export">Data Export</SelectItem>
                <SelectItem value="access_policy_created">Access Policy Created</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Audit Logs Table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Event</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Resource</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <Shield className="h-8 w-8" />
                        <div>No audit logs found</div>
                        {searchQuery && (
                          <div className="text-sm">Try adjusting your search criteria</div>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getActionIcon(log.action)}
                          <div>
                            <div className="font-medium">{log.action.replace('_', ' ')}</div>
                            {log.details && (
                              <div className="text-sm text-muted-foreground">
                                {Object.entries(log.details).map(([key, value]) => (
                                  <span key={key}>
                                    {key}: {String(value)}
                                  </span>
                                )).join(', ')}
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{log.userEmail}</div>
                          <div className="text-sm text-muted-foreground">{log.userId}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getResourceIcon(log.resource)}
                          <span className="text-sm">{log.resource.replace('_', ' ')}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getSeverityColor(log.severity)}>
                          <div className="flex items-center gap-1">
                            {getSeverityIcon(log.severity)}
                            {log.severity.charAt(0).toUpperCase() + log.severity.slice(1)}
                          </div>
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(log.status)}>
                          <div className="flex items-center gap-1">
                            {getStatusIcon(log.status)}
                            {log.status.charAt(0).toUpperCase() + log.status.slice(1)}
                          </div>
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          <div>
                            <div>{formatDate(log.timestamp)}</div>
                            <div className="text-xs">{formatRelativeTime(log.timestamp)}</div>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Recent Security Events */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Security Events</CardTitle>
          <CardDescription>
            Latest security-related activities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {auditLogs.slice(0, 5).map((log) => (
              <div key={log.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    {getActionIcon(log.action)}
                  </div>
                  <div>
                    <div className="font-medium">{log.action.replace('_', ' ')}</div>
                    <div className="text-sm text-muted-foreground">
                      {log.userEmail} • {log.resource.replace('_', ' ')}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <Badge className={getSeverityColor(log.severity)}>
                    {log.severity.charAt(0).toUpperCase() + log.severity.slice(1)}
                  </Badge>
                  <div className="text-sm text-muted-foreground mt-1">
                    {formatRelativeTime(log.timestamp)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
