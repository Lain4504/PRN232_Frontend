import type { Metadata } from "next";
import { AIContentGenerator } from "@/components/pages/contents/ai-content-generator";

export const metadata: Metadata = {
  title: "AI Content Generator | Team Workspace",
  description: "Generate social media content with AI assistance for your team brands",
};

export default function TeamAIGeneratorPage() {
  return <AIContentGenerator />;
}