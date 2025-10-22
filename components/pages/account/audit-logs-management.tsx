"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Clock, RefreshCw, ChevronDown, Eye } from "lucide-react";

// Mock data for audit logs
const mockAuditLogs = [
  {
    id: 1,
    action: "Create a temporary API key",
    target: {
      project: "Lain4504's Project",
      ref: "ugzbiujqfdwkougvxnsd"
    },
    date: "07 Oct 11:32:45"
  },
  {
    id: 2,
    action: "Create a temporary API key",
    target: {
      project: "Lain4504's Project", 
      ref: "ugzbiujqfdwkougvxnsd"
    },
    date: "07 Oct 11:21:45"
  },
  {
    id: 3,
    action: "Login successful",
    target: {
      project: "Lain4504's Project",
      ref: "system_login"
    },
    date: "07 Oct 10:45:12"
  },
  {
    id: 4,
    action: "Password changed",
    target: {
      project: "Lain4504's Project",
      ref: "password_change"
    },
    date: "06 Oct 14:22:33"
  },
  {
    id: 5,
    action: "API key revoked",
    target: {
      project: "Lain4504's Project",
      ref: "revoked_key_123"
    },
    date: "06 Oct 09:15:44"
  }
];

export function AuditLogsManagement() {
  const [filterProject, setFilterProject] = useState("Projects");
  const [logs] = useState(mockAuditLogs);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const handleRefresh = () => {
    // In a real app, this would fetch fresh data
    console.log("Refreshing audit logs...");
  };

  const handleViewDetails = (logId: number) => {
    // In a real app, this would open a modal or navigate to details
    console.log(`Viewing details for log ${logId}`);
  };

  const toggleSort = () => {
    setSortOrder(prev => prev === "asc" ? "desc" : "asc");
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="space-y-6">
        {/* Header */}
        <div>
        <h1 className="text-3xl font-bold tracking-tight">Audit Logs</h1>
        <p className="text-muted-foreground mt-2">
          View a detailed history of account activities and security events.
        </p>
      </div>

      {/* Filters and Controls */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              {/* Filter by Project */}
              <div className="flex items-center gap-2">
                <Label htmlFor="filter-project" className="text-sm font-medium whitespace-nowrap">
                  Filter by:
                </Label>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 px-3 text-sm"
                  onClick={() => setFilterProject(filterProject === "Projects" ? "All Projects" : "Projects")}
                >
                  {filterProject}
                </Button>
              </div>

              {/* Date Range Picker */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 px-3 text-sm"
                >
                  <Clock className="h-3 w-3 mr-2" />
                  07 Oct, 10:22 - 08 Oct, 10:22
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Log Count */}
              <span className="text-sm text-muted-foreground">
                Viewing {logs.length} logs in total
              </span>

              {/* Refresh Button */}
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-3"
                onClick={handleRefresh}
              >
                <RefreshCw className="h-3 w-3 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Audit Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Activity Log</CardTitle>
          <Separator />
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-medium">Action</TableHead>
                  <TableHead className="font-medium">Target</TableHead>
                  <TableHead className="font-medium">
                    <button
                      onClick={toggleSort}
                      className="flex items-center gap-1 hover:text-foreground transition-colors"
                    >
                      Date
                      <ChevronDown 
                        className={`h-3 w-3 transition-transform ${sortOrder === "asc" ? "rotate-180" : ""}`} 
                      />
                    </button>
                  </TableHead>
                  <TableHead className="w-[100px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs
                  .sort((a, b) => {
                    // Simple date sorting - in real app would parse dates properly
                    return sortOrder === "desc" ? b.id - a.id : a.id - b.id;
                  })
                  .map((log) => (
                    <TableRow key={log.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium">
                        {log.action}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="text-sm font-medium">
                            Project: {log.target.project}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Ref: {log.target.ref}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {log.date}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 px-2 text-xs"
                          onClick={() => handleViewDetails(log.id)}
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          View details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}
