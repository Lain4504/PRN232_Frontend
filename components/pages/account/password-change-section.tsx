"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Eye, EyeOff, Lock, CheckCircle, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function PasswordChangeSection() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const getPasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  const passwordStrength = getPasswordStrength(newPassword);

  const getStrengthColor = (strength: number) => {
    if (strength <= 2) return "bg-destructive";
    if (strength <= 3) return "bg-warning";
    if (strength <= 4) return "bg-info";
    return "bg-success";
  };

  const getStrengthText = (strength: number) => {
    if (strength <= 2) return "Weak";
    if (strength <= 3) return "Fair";
    if (strength <= 4) return "Good";
    return "Strong";
  };

  const validatePassword = () => {
    const errors: string[] = [];
    
    if (newPassword.length < 8) {
      errors.push("Password must be at least 8 characters");
    }
    if (!/[A-Z]/.test(newPassword)) {
      errors.push("Password must contain at least one uppercase letter");
    }
    if (!/[a-z]/.test(newPassword)) {
      errors.push("Password must contain at least one lowercase letter");
    }
    if (!/[0-9]/.test(newPassword)) {
      errors.push("Password must contain at least one number");
    }
    if (!/[^A-Za-z0-9]/.test(newPassword)) {
      errors.push("Password must contain at least one special character");
    }
    
    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("All fields are required");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New passwords don't match");
      return;
    }

    const validationErrors = validatePassword();
    if (validationErrors.length > 0) {
      setError(validationErrors[0]);
      return;
    }

    setIsLoading(true);

    try {
      const supabase = createClient();
      
      // First, verify current password by attempting to sign in
      const { data: user } = await supabase.auth.getUser();
      if (!user.user?.email) {
        throw new Error("User not found");
      }

      // Update password using Supabase
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        throw error;
      }

      setSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast.success("Password updated successfully!");
    } catch (error: any) {
      console.error("Password update error:", error);
      setError(error.message || "Failed to update password. Please try again.");
      toast.error("Failed to update password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl font-semibold flex items-center gap-2">
          <Lock className="h-5 w-5" />
          Change Password
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Update your password to keep your account secure
        </p>
        <Separator />
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Current Password */}
          <div className="space-y-2">
            <Label htmlFor="currentPassword" className="text-sm font-medium">
              Current Password
            </Label>
            <div className="relative">
              <Input
                id="currentPassword"
                type={showCurrentPassword ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter your current password"
                className="pr-10"
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              >
                {showCurrentPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* New Password */}
          <div className="space-y-2">
            <Label htmlFor="newPassword" className="text-sm font-medium">
              New Password
            </Label>
            <div className="relative">
              <Input
                id="newPassword"
                type={showNewPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter your new password"
                className="pr-10"
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowNewPassword(!showNewPassword)}
              >
                {showNewPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
            
            {/* Password Strength Indicator */}
            {newPassword && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-300 ${getStrengthColor(passwordStrength)}`}
                      style={{ width: `${(passwordStrength / 5) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs font-medium text-muted-foreground">
                    {getStrengthText(passwordStrength)}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-sm font-medium">
              Confirm New Password
            </Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your new password"
                className="pr-10"
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
             {confirmPassword && newPassword && (
               <div className="flex items-center gap-2">
                 {confirmPassword === newPassword ? (
                   <>
                     <CheckCircle className="h-4 w-4 text-success" />
                     <span className="text-xs text-success">Passwords match</span>
                   </>
                 ) : (
                   <>
                     <AlertCircle className="h-4 w-4 text-destructive" />
                     <span className="text-xs text-destructive">Passwords don't match</span>
                   </>
                 )}
               </div>
             )}
          </div>

          {/* Error Alert */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

           {/* Success Alert */}
           {success && (
             <Alert className="border-success bg-success/10 text-success">
               <CheckCircle className="h-4 w-4" />
               <AlertDescription>Password updated successfully!</AlertDescription>
             </Alert>
           )}

          {/* Submit Button */}
          <div className="flex justify-end pt-4">
             <Button 
               type="submit"
               disabled={isLoading || !currentPassword || !newPassword || !confirmPassword}
               className="bg-primary hover:bg-primary/90 text-primary-foreground"
             >
               {isLoading ? "Updating..." : "Update Password"}
             </Button>
          </div>
        </form>

        {/* Password Requirements */}
        <div className="bg-muted/50 rounded-lg p-4 space-y-2">
          <h4 className="text-sm font-medium">Password Requirements:</h4>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• At least 8 characters long</li>
            <li>• Contains uppercase and lowercase letters</li>
            <li>• Contains at least one number</li>
            <li>• Contains at least one special character</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
