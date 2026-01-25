import { Metadata } from "next";
import BlogContent from "@/components/pages/blog/blog-content";

export const metadata: Metadata = {
    title: "omniadly | Insights & Blog",
    description: "Latest news, updates, and marketing analysis from the omniadly team.",
};

export default function BlogPage() {
    return <BlogContent />;
}
