import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardClient } from "@/components/dashboard/dashboard-client";

export default async function AdminDashboard() {
  const supabase = await createClient();

  // Guard this page like the demo: check claims/session server-side
  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims();
  if (claimsError || !claimsData?.claims) {
    redirect("/login");
  }

  // Fetch user for email/id display and for passing userId to client components
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="space-y-6 px-2 sm:px-0">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Bảng điều khiển</h1>
        <p className="text-muted-foreground text-sm sm:text-base">Chào mừng bạn trở lại {user.email ?? ""}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Thông tin người dùng</CardTitle>
          <CardDescription>Chi tiết tài khoản</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <div>
            <span className="font-medium">Email:</span>
            <p className="text-sm text-gray-600">{user.email}</p>
          </div>
          <div>
            <span className="font-medium">User ID:</span>
            <p className="text-sm text-gray-600 font-mono">{user.id}</p>
          </div>
          {/* Roles: add when you store roles in user metadata/claims */}
        </CardContent>
      </Card>

      <DashboardClient userId={user.id} email={user.email} />
    </div>
  );
}
