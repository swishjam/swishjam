'use client'

import { useEffect } from "react";
import SwishjamAPI from "@/lib/api-client/swishjam-api";
import { useRouter } from "next/navigation";
import Logo from "@/components/Logo";

export default function NewDashboard() {
  const router = useRouter();

  useEffect(() => {
    SwishjamAPI.Dashboards.create({ name: undefined }).then(({ dashboard }) => {
      router.push(`/dashboards/${dashboard.id}`);
    });
  }, [])

  return (
    <div className='h-screen w-full flex items-center justify-center'>
      <Logo className='h-20 w-20 animate-bounce' />
    </div>
  )
}