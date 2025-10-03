import type { Metadata } from "next";
import { CalendarManagement } from "@/components/pages/calendar/calendar-management";

export const metadata: Metadata = {
  title: "Content Calendar | AISAM",
  description: "Schedule and manage your content publishing",
};

export default function CalendarPage() {
  return <CalendarManagement />;
}
