import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import Link from "next/link";

export default async function VerifyEmailPage() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims) {
    redirect("/auth/login");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-6">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight">Email verified!</h1>
          <p className="text-muted-foreground text-lg mt-2">Your account has been successfully activated</p>
        </div>
        
        <div className="text-center space-y-6">
          <div className="flex justify-center">
            <div className="size-16 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
              <CheckCircle className="size-8 text-green-600 dark:text-green-400" />
            </div>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Congratulations!</h3>
            <p className="text-muted-foreground">
              Your email has been successfully verified. You can close this window 
              or return to the app to continue.
            </p>
          </div>

          <div className="space-y-3">
            <Button asChild className="w-full h-12">
              <Link href="/dashboard">
                Continue to Dashboard
              </Link>
            </Button>
            
            <Button variant="outline" asChild className="w-full h-12">
              <Link href="/auth/login">
                Back to sign in
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}


