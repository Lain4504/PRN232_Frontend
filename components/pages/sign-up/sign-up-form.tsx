"use client";

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { useState } from "react";

export function SignUpForm({
                             className,
                             ...props
                           }: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    if (password !== repeatPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/verify-email`,
        },
      });
      if (error) throw error;
      setSuccessOpen(true);
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
      <div className={cn("flex flex-col gap-6", className)} {...props}>
        {/* Desktop Dialog */}
        <div className="hidden md:block">
          <Dialog open={successOpen} onOpenChange={setSuccessOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Đăng ký thành công</DialogTitle>
                <DialogDescription>
                  Vui lòng kiểm tra email để xác nhận tài khoản của bạn.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button onClick={() => setSuccessOpen(false)}>Đã hiểu</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        {/* Mobile Drawer */}
        <div className="md:hidden">
          <Drawer open={successOpen} onOpenChange={setSuccessOpen}>
            <DrawerContent>
              <DrawerHeader>
                <DrawerTitle>Đăng ký thành công</DrawerTitle>
                <DrawerDescription>
                  Vui lòng kiểm tra email để xác nhận tài khoản của bạn.
                </DrawerDescription>
              </DrawerHeader>
              <DrawerFooter>
                <Button onClick={() => setSuccessOpen(false)}>Đóng</Button>
              </DrawerFooter>
            </DrawerContent>
          </Drawer>
        </div>
        <div className="space-y-3">
          <Button variant="outline" className="w-full justify-start">
            Continue with Google
          </Button>
          <div className="relative py-2 text-center text-sm text-muted-foreground">
            <span className="px-2 bg-background relative z-10">or</span>
            <div className="absolute left-0 right-0 top-1/2 h-px bg-border" />
          </div>
        </div>
        <Card className="bg-transparent border-0 shadow-none">
          <CardHeader>
            <CardTitle className="text-2xl">Sign up</CardTitle>
            <CardDescription>Create a new account</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignUp}>
              <div className="flex flex-col gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                      id="email"
                      type="email"
                      placeholder="m@example.com"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <div className="flex items-center">
                    <Label htmlFor="password">Password</Label>
                  </div>
                  <Input
                      id="password"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <div className="flex items-center">
                    <Label htmlFor="repeat-password">Repeat Password</Label>
                  </div>
                  <Input
                      id="repeat-password"
                      type="password"
                      required
                      value={repeatPassword}
                      onChange={(e) => setRepeatPassword(e.target.value)}
                  />
                </div>
                {error && <p className="text-sm text-destructive">{error}</p>}
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Creating an account..." : "Sign up"}
                </Button>
              </div>
              <div className="mt-4 text-center text-sm">
                Already have an account?{" "}
                <Link href="/auth/login" className="underline underline-offset-4">
                  Login
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
  );
}
