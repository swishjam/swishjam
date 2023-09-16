'use client'

import { useEffect, useState } from "react";
import AuthenticatedView from "@/components/Auth/AuthenticatedView"
import { API } from "@/lib/api-client/base";
import { useRouter } from "next/navigation";
import LoadingSpinner from "@/components/LoadingSpinner";

const NewDashboard = () => {
  const router = useRouter();

  useEffect(() => {
    API.post('/api/v1/dashboards', { dashboard: { name: undefined } }).then(({ dashboard }) => {
      router.push(`/dashboards/${dashboard.id}`);
    });
  }, [])

  return (
    <main className="mx-auto max-w-7xl px-4 mt-8 sm:px-6 lg:px-8 mb-8 flex items-center justify-center">
      <LoadingSpinner />
    </main>
  )
}

export default AuthenticatedView(NewDashboard);