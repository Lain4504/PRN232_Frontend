import type { Metadata } from "next";
import { ProfileManagement } from "@/components/pages/profile/profile-management";

export const metadata: Metadata = {
  title: "Profile Management | AISAM",
  description: "Manage your profile and account settings",
};

export default function ProfilePage() {
  return <ProfileManagement />;
}