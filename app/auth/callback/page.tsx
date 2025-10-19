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
      }: { data: { session: { access_token: string } | null } | null; error: { message: string } | null } = 
      await supabase.auth.getSession(); 
      
      if (data?.session) { 
        router.replace("/dashboard"); 
      } else { 
        router.replace("/login"); 
      } 
    }; processLogin(); 
  }, [router]); 
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-6">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Processing sign-in...</h1>
          <p className="text-muted-foreground mt-2">Please wait while we complete your authentication</p>
        </div>
      </div>
    </div>
  );
}