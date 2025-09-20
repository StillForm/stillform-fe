import { ProfileView } from "@/components/pages/profile-view";
import { profileSummary } from "@/data/mock-data";
import { notFound } from "next/navigation";

interface ProfilePageProps {
  params: Promise<{ handle: string }>;
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { handle } = await params;
  if (handle !== profileSummary.handle) {
    notFound();
  }

  return <ProfileView />;
}
