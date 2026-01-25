import { Metadata } from "next";
import BlogContent from "@/components/pages/blog/blog-content";

export const metadata: Metadata = {
    title: "AISAM | Insights & Blog",
    description: "Latest news, updates, and marketing analysis from the AISAM team.",
};

export default function BlogPage() {
    return <BlogContent />;
}
