import type { Metadata } from "next";
import { ContentsManagement } from "@/components/pages/contents/contents-management";

export const metadata: Metadata = {
  title: "Content Management | AISAM",
  description: "Create and manage your content with AI assistance",
};

export default function ContentsPage() {
  return <ContentsManagement />;
}
