"use client";

import { Banner } from "@/components/dashboard/banner";
import { Browse } from "@/components/dashboard/browse";
import { useShowcase } from "@/lib/api";
import { useSession } from "@/lib/session";

export default function DashboardPage() {
  const { user } = useSession();
  const { data, isError, refetch } = useShowcase();
  // An email stands in for the name when Clerk has none; do not greet with it.
  const firstName =
    user && !user.name.includes("@") ? user.name.split(/\s+/)[0] : null;

  return (
    <>
      <Banner firstName={firstName} showcase={data} />
      <Browse showcase={data} isError={isError} onRetry={() => refetch()} />
    </>
  );
}
