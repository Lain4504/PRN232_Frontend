import type { Metadata } from "next";
import DashboardContent from "@/components/pages/dashboard/dashboard-content";

export const metadata: Metadata = {
  title: "Bảng điều khiển | AISAM",
  description: "Tổng quan hoạt động, tổ chức, người dùng và báo cáo của bạn.",
  openGraph: {
    title: "Bảng điều khiển | AISAM",
    description: "Tổng quan hoạt động, tổ chức, người dùng và báo cáo của bạn.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Bảng điều khiển | AISAM",
    description: "Tổng quan hoạt động, tổ chức, người dùng và báo cáo của bạn.",
  },
};

export default function AdminDashboard() {
  return <DashboardContent />;
}