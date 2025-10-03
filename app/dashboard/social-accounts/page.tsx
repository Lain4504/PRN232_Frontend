import type { Metadata } from "next";
import { SocialAccountsManagement } from "@/components/pages/social-accounts/social-accounts-management";

export const metadata: Metadata = {
  title: "Social Accounts | AISAM",
  description: "Connect and manage your social media accounts",
};

export default function SocialAccountsPage() {
  return <SocialAccountsManagement />;
}
