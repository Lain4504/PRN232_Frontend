import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function VerifyEmailPage() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims) {
    redirect("/auth/login");
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12">
      <div className="max-w-md text-center">
        <h1 className="text-2xl font-semibold mb-2">Email verified</h1>
        <p className="text-muted-foreground">
          Your email has been verified. You can now close this window or go back to the app.
        </p>
      </div>
    </div>
  );
}


