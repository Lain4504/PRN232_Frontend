"use client";

import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export function LogoutButton() {
  const supabase = createClient();

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
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
