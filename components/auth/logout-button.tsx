"use client";

import { useAuth } from "@/lib/contexts/auth-context";
import { LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

interface LogoutButtonProps {
  className?: string;
}

export function LogoutButton({ className }: LogoutButtonProps) {
  const { logout } = useAuth();

  const handleLogout = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      await logout();
      window.location.href = "/auth/login";
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <button
      onClick={handleLogout}
      className={cn("flex items-center gap-2", className)}
    >
      <LogOut className="h-4 w-4" />
      <span>Đăng xuất</span>
    </button>
  );
}
