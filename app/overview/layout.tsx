
import type { Metadata } from "next";
import ProfileLayout from "@/components/layout/profile-layout";

export const metadata: Metadata = {
  title: "Profile Management | AISAM",
  description: "Manage your profiles and team memberships.",
};

export default function ProfilesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ProfileLayout showSidebar={true}>{children}</ProfileLayout>;
}
