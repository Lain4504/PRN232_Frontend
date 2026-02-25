"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Lock, CheckCircle } from "lucide-react";
import { useUpdatePassword } from "@/hooks/use-auth";

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type PasswordFormData = z.infer<typeof passwordSchema>;

export function UpdatePasswordForm() {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const updatePasswordMutation = useUpdatePassword();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  });

  const newPassword = watch("newPassword");

  const getPasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  const passwordStrength = getPasswordStrength(newPassword || "");

  const onSubmit = async (data: PasswordFormData) => {
    try {
      await updatePasswordMutation.mutateAsync({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
        confirmPassword: data.confirmPassword,
      });
      reset();
    } catch (_error) {
      // Error is handled by the mutation
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Current Password */}
      <div className="space-y-2">
        <Label htmlFor="currentPassword">Current Password</Label>
        <div className="relative">
          <Input
            id="currentPassword"
            type={showCurrentPassword ? "text" : "password"}
            placeholder="Enter your current password"
            {...register("currentPassword")}
            className="pr-10"
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
        {errors.currentPassword && (
          <p className="text-sm text-destructive">{errors.currentPassword.message}</p>
        )}
      </div>

      {/* New Password */}
      <div className="space-y-2">
        <Label htmlFor="newPassword">New Password</Label>
        <div className="relative">
          <Input
            id="newPassword"
            type={showNewPassword ? "text" : "password"}
            placeholder="Enter your new password"
            {...register("newPassword")}
            className="pr-10"
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
        {errors.newPassword && (
          <p className="text-sm text-destructive">{errors.newPassword.message}</p>
        )}

        {/* Password Strength Indicator */}
        {newPassword && (
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <div className="flex space-x-1">
                {[1, 2, 3, 4, 5].map((level) => (
                  <div
                    key={level}
                    className={`h-1.5 w-full rounded-full ${level <= passwordStrength
                      ? passwordStrength <= 2
                        ? "bg-destructive"
                        : passwordStrength <= 3
                          ? "bg-amber-500"
                          : "bg-emerald-500"
                      : "bg-muted"
                      }`}
                  />
                ))}
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                {passwordStrength <= 2
                  ? "Yếu"
                  : passwordStrength <= 3
                    ? "Trung bình"
                    : "Mạnh"}
              </span>
            </div>

            {/* Password Requirements */}
            <div className="space-y-1.5 pt-2">
              <div className="flex items-center gap-2 text-[11px]">
                <CheckCircle
                  className={`size-3 ${newPassword?.length >= 8 ? "text-emerald-500" : "text-muted-foreground/40"}`}
                />
                <span className={newPassword?.length >= 8 ? "text-foreground font-medium" : "text-muted-foreground"}>Tối thiểu 8 ký tự</span>
              </div>
              <div className="flex items-center gap-2 text-[11px]">
                <CheckCircle
                  className={`size-3 ${/[A-Z]/.test(newPassword || "") ? "text-emerald-500" : "text-muted-foreground/40"}`}
                />
                <span className={/[A-Z]/.test(newPassword || "") ? "text-foreground font-medium" : "text-muted-foreground"}>Một chữ cái viết hoa</span>
              </div>
              <div className="flex items-center gap-2 text-[11px]">
                <CheckCircle
                  className={`size-3 ${/[a-z]/.test(newPassword || "") ? "text-emerald-500" : "text-muted-foreground/40"}`}
                />
                <span className={/[a-z]/.test(newPassword || "") ? "text-foreground font-medium" : "text-muted-foreground"}>Một chữ cái viết thường</span>
              </div>
              <div className="flex items-center gap-2 text-[11px]">
                <CheckCircle
                  className={`size-3 ${/[0-9]/.test(newPassword || "") ? "text-emerald-500" : "text-muted-foreground/40"}`}
                />
                <span className={/[0-9]/.test(newPassword || "") ? "text-foreground font-medium" : "text-muted-foreground"}>Một con số</span>
              </div>
              <div className="flex items-center gap-2 text-[11px]">
                <CheckCircle
                  className={`size-3 ${/[^A-Za-z0-9]/.test(newPassword || "") ? "text-emerald-500" : "text-muted-foreground/40"}`}
                />
                <span className={/[^A-Za-z0-9]/.test(newPassword || "") ? "text-foreground font-medium" : "text-muted-foreground"}>Một ký tự đặc biệt</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Confirm Password */}
      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm New Password</Label>
        <div className="relative">
          <Input
            id="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Confirm your new password"
            {...register("confirmPassword")}
            className="pr-10"
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
        {errors.confirmPassword && (
          <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
        )}
      </div>

      {/* Submit Button */}
      <div className="flex justify-end gap-3 pt-4">
        <Link href="/account/me">
          <Button
            type="button"
            variant="outline"
            disabled={isSubmitting}
          >
            Hủy
          </Button>
        </Link>
        <Button
          type="submit"
          disabled={isSubmitting || updatePasswordMutation.isPending}
          className="min-w-[140px]"
        >
          {isSubmitting || updatePasswordMutation.isPending ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2" />
              Đang cập nhật...
            </>
          ) : (
            <>
              <Lock className="mr-2 h-4 w-4" />
              Cập nhật mật khẩu
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
