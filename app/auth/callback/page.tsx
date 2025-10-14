"use client";
import { useEffect } from "react"; 
import { useRouter } from "next/navigation"; 
import { createClient } from "@/lib/supabase/client"; 

export default function AuthCallbackPage() { 
  const router = useRouter(); 
  
  useEffect(() => { 
    const processLogin = async () => { 
      const supabase = createClient(); 
      
      const { 
        data,
        error,
      }: { data: { session: { access_token: string } | null } | null; error: { message: string } | null } = 
      await supabase.auth.getSession(); 
      
      if (data?.session) { 
        router.replace("/dashboard"); 
      } else { 
        router.replace("/login"); 
      } 
    }; processLogin(); 
  }, [router]); 
  return <p>Đang xử lý đăng nhập Google...</p>; 
}