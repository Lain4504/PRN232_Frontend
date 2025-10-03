import type { Metadata } from "next";
import { PostsManagement } from "@/components/pages/posts/posts-management";

export const metadata: Metadata = {
  title: "Posts Management | AISAM",
  description: "View and manage your published posts",
};

export default function PostsPage() {
  return <PostsManagement />;
}
