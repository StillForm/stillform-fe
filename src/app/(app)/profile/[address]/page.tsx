import { ProfileView } from "@/components/pages/profile-view";
import { profileSummary } from "@/data/mock-data";
import { notFound } from "next/navigation";

interface ProfilePageProps {
  params: Promise<{ address: `0x${string}` }>;
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const res = await params;
  // if (address !== profileSummary.handle) {
  //   notFound();
  // }

  console.log("res", res);

  return <ProfileView address={res.address} />;
}
