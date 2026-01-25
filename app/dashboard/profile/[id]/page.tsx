import type { Metadata } from "next";
import { ProfileDetail } from "@/components/pages/profile/profile-detail";

export const metadata: Metadata = {
  title: "Profile Detail | omniadly",
  description: "View profile details",
};

export default function ProfileDetailPage() {
  return <ProfileDetail />;
}


