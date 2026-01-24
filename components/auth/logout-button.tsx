"use client";

import { useAuth } from "@/lib/contexts/auth-context";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export function LogoutButton() {
  const { logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <Link href="/auth/login">
      <Button onClick={handleLogout} variant="link" size="sm">
        <LogOut className="h-4 w-4 mr-2" />
        Đăng xuất
      </Button>
    </Link>
  );
}
