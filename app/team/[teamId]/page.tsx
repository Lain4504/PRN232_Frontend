import type { Metadata } from "next";
import { TeamDashboardOverview } from "@/components/teams/team-dashboard-overview";

export const metadata: Metadata = {
  title: "Team Dashboard | AISAM",
  description: "Team management and collaboration dashboard.",
};

export default function TeamDashboardPage() {
  return <TeamDashboardOverview />;
}
