import type { Metadata } from "next";
import { AIContentGenerator } from "@/components/pages/contents/ai-content-generator";

export const metadata: Metadata = {
  title: "AI Content Generator | AISAM",
  description: "Generate social media content with AI assistance",
};

export default function NewContentPage() {
  return <AIContentGenerator />;
}