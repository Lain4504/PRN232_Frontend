import { DataTable } from "@/components/admin/data-table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

// Mock data for users
const mockUsers = [
  {
    id: "1",
    name: "John Doe",
    email: "john.doe@example.com",
    role: "Admin",
    status: "Active",
    createdAt: "2024-01-15",
    lastLogin: "2024-01-20",
  },
  {
    id: "2", 
    name: "Jane Smith",
    email: "jane.smith@example.com",
    role: "User",
    status: "Active",
    createdAt: "2024-01-16",
    lastLogin: "2024-01-19",
  },
  {
    id: "3",
    name: "Bob Johnson",
    email: "bob.johnson@example.com",
    role: "Moderator",
    status: "Inactive",
    createdAt: "2024-01-17",
    lastLogin: "2024-01-18",
  },
  {
    id: "4",
    name: "Alice Brown",
    email: "alice.brown@example.com",
    role: "User",
    status: "Active",
    createdAt: "2024-01-18",
    lastLogin: "2024-01-20",
  },
  {
    id: "5",
    name: "Charlie Wilson",
    email: "charlie.wilson@example.com",
    role: "Admin",
    status: "Active",
    createdAt: "2024-01-19",
    lastLogin: "2024-01-20",
  },
];

export default function UsersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Quản lý người dùng</h1>
        <p className="text-muted-foreground">
          Quản lý tất cả người dùng trong hệ thống
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách người dùng</CardTitle>
          <CardDescription>
            Xem và quản lý thông tin người dùng
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable data={mockUsers} />
        </CardContent>
      </Card>
    </div>
  );
}
