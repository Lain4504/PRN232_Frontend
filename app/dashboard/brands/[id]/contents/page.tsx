import type { Metadata } from "next";
import { ContentsManagement } from "@/components/pages/contents/contents-management";

export const metadata: Metadata = {
  title: "Content Management | AISAM",
  description: "Create and manage your content with AI assistance",
};

interface ContentsPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ContentsPage({ params }: ContentsPageProps) {
  const { id } = await params;
  return <ContentsManagement initialBrandId={id} />;
}
