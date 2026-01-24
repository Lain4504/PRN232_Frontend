import { AccountSidebar } from "@/components/layout/account-sidebar";
import { AccountMobileNav } from "@/components/layout/account-mobile-nav";
import { ProfileHeader } from "@/components/layout/profile-header";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token");

  if (!token) {
    redirect("/auth/login");
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <ProfileHeader />

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
