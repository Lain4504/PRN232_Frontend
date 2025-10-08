import { AccountSidebar } from "@/components/layout/account-sidebar";
import { AccountMobileNav } from "@/components/layout/account-mobile-nav";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <DashboardHeader user={user} />
      
      {/* Mobile Navigation - Visible on mobile only */}
      <AccountMobileNav />
      
      {/* Main Content Area with Sidebar */}
      <div className="flex flex-1 overflow-hidden">
        {/* Account Sidebar - Hidden on mobile, visible on larger screens */}
        <div className="hidden lg:flex flex-col h-full">
          <AccountSidebar />
        </div>
        
        {/* Page Content */}
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
