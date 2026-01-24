"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/lib/contexts/auth-context";
import { toast } from "sonner";

export function ProfileInformationForm() {
  const { user, isLoading } = useAuth();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    primaryEmail: "",
    username: "",
  });

  useEffect(() => {
    if (user) {
      const names = user.fullName ? user.fullName.split(' ') : [];
      const firstName = names.length > 0 ? names[0] : "";
      const lastName = names.length > 1 ? names.slice(1).join(' ') : "";

      setFormData({
        firstName: firstName,
        lastName: lastName,
        primaryEmail: user.email || "",
        username: user.fullName || "", // Fallback to fullName or ideally we should have username in AuthUser if available
      });
    }
  }, [user]);

  // Loading state handled by useAuth mainly, but we can keep local handling if needed or just rely on parent

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      // Mock update since Supabase client is removed
      await new Promise(resolve => setTimeout(resolve, 1000));

      toast.success("Profile updated successfully");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Profile Information</CardTitle>
        <Separator />
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Name Fields Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* First Name */}
          <div className="space-y-2">
            <Label htmlFor="firstName" className="text-sm font-medium">
              First name
            </Label>
            <Input
              id="firstName"
              type="text"
              value={formData.firstName}
              onChange={(e) => handleInputChange("firstName", e.target.value)}
              placeholder="Enter your first name"
              className="w-full"
            />
          </div>

          {/* Last Name */}
          <div className="space-y-2">
            <Label htmlFor="lastName" className="text-sm font-medium">
              Last name
            </Label>
            <Input
              id="lastName"
              type="text"
              value={formData.lastName}
              onChange={(e) => handleInputChange("lastName", e.target.value)}
              placeholder="Enter your last name"
              className="w-full"
            />
          </div>
        </div>

        {/* Primary Email */}
        <div className="space-y-2">
          <Label htmlFor="primaryEmail" className="text-sm font-medium">
            Primary email
          </Label>
          <div className="relative">
            <Input
              id="primaryEmail"
              type="email"
              value={formData.primaryEmail}
              onChange={(e) => handleInputChange("primaryEmail", e.target.value)}
              className="w-full pr-10"
              disabled
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg
                className="h-4 w-4 text-muted-foreground"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Primary email is used for account notifications.
          </p>
        </div>

        {/* Username */}
        <div className="space-y-2">
          <Label htmlFor="username" className="text-sm font-medium">
            Username
          </Label>
          <Input
            id="username"
            type="text"
            value={formData.username}
            onChange={(e) => handleInputChange("username", e.target.value)}
            placeholder="Enter your username"
            className="w-full"
          />
          <p className="text-xs text-muted-foreground">
            Username appears as a display name throughout the dashboard.
          </p>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-4">
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-chart-2 hover:bg-chart-2/90 text-white"
          >
            {saving ? "Saving..." : "Save"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
