import { Metadata } from "next";
import { Header } from "@/components/layout/header";
import DocsContent from "@/components/pages/docs/docs-content";

export const metadata: Metadata = {
    title: "AISAM | Documentation",
    description: "Comprehensive guides and specialized tutorials for the AISAM platform.",
};

export default function DocsPage() {
    return <DocsContent />;
}
