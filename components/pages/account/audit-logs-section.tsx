"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Shield, User, Key } from "lucide-react";

// Mock data for audit logs
const mockAuditLogs = [
  {
    id: "1",
    action: "Password Updated",
    description: "Your password was successfully updated",
    timestamp: "2024-01-15T10:30:00Z",
    type: "security",
    status: "success",
  },
  {
    id: "2",
    action: "Profile Updated",
    description: "Your profile information was modified",
    timestamp: "2024-01-14T15:45:00Z",
    type: "profile",
    status: "success",
  },
  {
    id: "3",
    action: "Login",
    description: "Successful login from Chrome on Windows",
    timestamp: "2024-01-14T09:20:00Z",
    type: "auth",
    status: "success",
  },
  {
    id: "4",
    action: "Failed Login Attempt",
    description: "Failed login attempt with incorrect password",
    timestamp: "2024-01-13T22:15:00Z",
    type: "security",
    status: "warning",
  },
];

const getActionIcon = (type: string) => {
  switch (type) {
    case "security":
      return <Shield className="h-4 w-4" />;
    case "profile":
      return <User className="h-4 w-4" />;
    case "auth":
      return <Key className="h-4 w-4" />;
    default:
      return <Clock className="h-4 w-4" />;
  }
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case "success":
      return <Badge variant="default" className="bg-green-100 text-green-800">Success</Badge>;
    case "warning":
      return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Warning</Badge>;
    case "error":
      return <Badge variant="destructive">Error</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

export function AuditLogsSection() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>
          Your recent account activity and security events
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {mockAuditLogs.map((log) => (
            <div
              key={log.id}
              className="flex items-start space-x-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex-shrink-0 mt-1">
                {getActionIcon(log.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-foreground">
                    {log.action}
                  </h4>
                  <div className="flex items-center space-x-2">
                    {getStatusBadge(log.status)}
                    <span className="text-xs text-muted-foreground">
                      {new Date(log.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {log.description}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  {new Date(log.timestamp).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
        
        {mockAuditLogs.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No activity logs found</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
