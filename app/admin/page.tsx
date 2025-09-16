import { DataTable } from "@/components/admin/data-table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Mock data for the data table
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

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Quản lý hệ thống và người dùng
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tổng người dùng
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockUsers.length}</div>
            <p className="text-xs text-muted-foreground">
              +2 so với tháng trước
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Người dùng hoạt động
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockUsers.filter(user => user.status === "Active").length}
            </div>
            <p className="text-xs text-muted-foreground">
              +1 so với tháng trước
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Admin
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockUsers.filter(user => user.role === "Admin").length}
            </div>
            <p className="text-xs text-muted-foreground">
              Không thay đổi
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tỷ lệ hoạt động
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round((mockUsers.filter(user => user.status === "Active").length / mockUsers.length) * 100)}%
            </div>
            <p className="text-xs text-muted-foreground">
              +5% so với tháng trước
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Data Table */}
      <Card>
        <CardHeader>
          <CardTitle>Quản lý người dùng</CardTitle>
          <CardDescription>
            Danh sách tất cả người dùng trong hệ thống
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable data={mockUsers} />
        </CardContent>
      </Card>
    </div>
  );
}
