import { Metadata } from "next";
import PricingContent from "@/components/pages/pricing/pricing-content";

export const metadata: Metadata = {
    title: "AISAM | Tactical Tiers",
    description: "Pricing protocols for AISAM Intelligence Core.",
};

export default function PricingPage() {
    return <PricingContent />;
}
