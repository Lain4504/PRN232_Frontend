import type { Metadata } from "next";
import { SubscriptionManagement } from "@/components/pages/subscription/subscription-management";

export const metadata: Metadata = {
  title: "Subscription Management | AISAM",
  description: "Manage your AISAM subscription and billing information.",
};

export default function SubscriptionPage() {
  return <SubscriptionManagement />;
}