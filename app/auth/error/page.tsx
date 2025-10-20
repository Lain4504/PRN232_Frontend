import { AuthSplitLayout } from "@/components/pages/auth/auth-split-layout";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { XCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ error: string }>;
}) {
  const params = await searchParams;

  return (
    <AuthSplitLayout 
      title="An error occurred" 
      subtitle="Sorry, there was a problem during authentication"
    >
      <div className="text-center space-y-6">
        <div className="flex justify-center">
          <div className="size-16 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
            <XCircle className="size-8 text-red-600 dark:text-red-400" />
          </div>
        </div>
        
        <div className="space-y-4">
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription>
              {params?.error ? (
                <>Error code: {params.error}</>
              ) : (
                <>An unknown error occurred. Please try again.</>
              )}
            </AlertDescription>
          </Alert>

          <p className="text-sm text-muted-foreground">
            Please check your information and try again. If the issue persists, contact support.
          </p>
        </div>

        <div className="space-y-3">
          <Button asChild className="w-full h-12">
            <Link href="/auth/login">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to sign in
            </Link>
          </Button>
          
          <Button variant="outline" asChild className="w-full h-12">
            <Link href="/auth/sign-up">
              Try signing up again
            </Link>
          </Button>
        </div>
      </div>
    </AuthSplitLayout>
  );
}
