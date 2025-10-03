import type { Metadata } from "next";
import { CreateProfileForm } from "@/components/pages/profile/create-profile-form";

export const metadata: Metadata = {
  title: "Create Profile | AISAM",
  description: "Create a new profile for your business or personal use",
};

export default function CreateProfilePage() {
  return <CreateProfileForm />;
}
