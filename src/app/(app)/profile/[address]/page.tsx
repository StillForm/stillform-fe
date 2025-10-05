import { ProfileView } from "@/components/pages/profile-view";
import { notFound } from "next/navigation";

interface ProfilePageProps {
  params: Promise<{ address: `0x${string}` }>;
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const address = (await params).address;
  if (!address) {
    notFound();
  }

  console.log("address", address);

  return <ProfileView address={address} />;
}
