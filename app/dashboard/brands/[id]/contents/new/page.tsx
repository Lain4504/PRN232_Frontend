import type { Metadata } from "next";
import { AIContentGenerator } from "@/components/pages/contents/ai-content-generator";

export const metadata: Metadata = {
  title: "AI Content Generator | AISAM",
  description: "Generate social media content with AI assistance",
};

interface NewContentPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function NewContentPage({ params }: NewContentPageProps) {
  const { id } = await params;
  return <AIContentGenerator initialBrandId={id} />;
}