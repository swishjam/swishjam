'use client'

import { useEffect } from "react";
import SwishjamAPI from "@/lib/api-client/swishjam-api";
import { useRouter } from "next/navigation";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function NewDashboard() {
  const router = useRouter();

  useEffect(() => {
    SwishjamAPI.Dashboards.create({ name: undefined }).then(({ dashboard }) => {
      router.push(`/dashboards/${dashboard.id}`);
    });
  }, [])

  return (
    <main className="mx-auto max-w-7xl px-4 mt-8 sm:px-6 lg:px-8 mb-8 h-screen flex items-center justify-center">
      <LoadingSpinner size={10} />
    </main>
  )
}