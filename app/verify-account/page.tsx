"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function Home() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    let mounted = true;

    async function check() {
      try {
        const { data } = await supabase.auth.getSession();
        if (!mounted) return;
        const hasSession = !!data.session;
        setIsAuthenticated(hasSession);
        router.replace(hasSession ? "/dashboard" : "/login");
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    check();

    return () => {
      mounted = false;
    };
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <h1 className="text-2xl font-bold">Đang kiểm tra đăng nhập...</h1>
    </div>
  );
}