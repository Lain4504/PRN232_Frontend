"use client";

import React from "react";
import { ActionsDropdown } from "./actions-dropdown";
import { Edit, Trash2, Eye, Package, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./card";
import { CustomTable } from "./custom-table";
import { ColumnDef } from "@tanstack/react-table";

interface DemoData {
  id: string;
  name: string;
  description: string;
  status: string;
  created: string;
}

const demoData: DemoData[] = [
  {
    id: "1",
    name: "Sample Brand A",
    description: "A premium lifestyle brand",
    status: "Active",
    created: "2024-01-15",
  },
  {
    id: "2", 
    name: "Sample Brand B",
    description: "Tech innovation company",
    status: "Active",
    created: "2024-01-20",
  },
  {
    id: "3",
    name: "Sample Brand C", 
    description: "Sustainable fashion brand",
    status: "Inactive",
    created: "2024-01-25",
  },
];

export function ActionsDropdownDemo() {
  const handleEdit = (id: string) => {
    console.log("Edit clicked for:", id);
  };

  const handleDelete = (id: string) => {
    console.log("Delete clicked for:", id);
  };

  const handleView = (id: string) => {
    console.log("View clicked for:", id);
  };

  const columns: ColumnDef<DemoData>[] = [
    {
      accessorKey: "name",
      header: "Name",
    },
    {
      accessorKey: "description", 
      header: "Description",
    },
    {
      accessorKey: "status",
      header: "Status",
    },
    {
      accessorKey: "created",
      header: "Created",
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const actions = [
          {
            label: "View Details",
            icon: <Eye className="h-4 w-4" />,
            onClick: () => handleView(row.original.id),
          },
          {
            label: "View Products",
            icon: <Package className="h-4 w-4" />,
            onClick: () => console.log("View Products clicked for:", row.original.id),
          },
          {
            label: "Manage Content",
            icon: <FileText className="h-4 w-4" />,
            onClick: () => console.log("Manage Content clicked for:", row.original.id),
          },
          {
            label: "Edit",
            icon: <Edit className="h-4 w-4" />,
            onClick: () => handleEdit(row.original.id),
          },
          {
            label: "Delete",
            icon: <Trash2 className="h-4 w-4" />,
            onClick: () => handleDelete(row.original.id),
            variant: "destructive" as const,
          },
        ];

        return <ActionsDropdown actions={actions} />;
      },
    },
  ];

  return (
    <div className="p-8 space-y-6">
      <h2 className="text-2xl font-bold">Actions Dropdown Demo</h2>
      
      <Card>
        <CardHeader>
          <CardTitle>Table with Actions Dropdown</CardTitle>
        </CardHeader>
        <CardContent>
          <CustomTable 
            columns={columns} 
            data={demoData}
            pageSize={10}
          />
        </CardContent>
      </Card>
    </div>
  );
}