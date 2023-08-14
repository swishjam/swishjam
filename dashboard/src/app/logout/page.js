'use client';

import { useEffect } from "react";
import { logUserOut } from "@/components/Auth/AuthProvider";
import { useRouter } from "next/navigation";
import LoadingSpinner from "@/components/LoadingSpinner";


export default function Logout() {
  const router = useRouter();

  useEffect(() => {
    logUserOut().then(() => router.push('/login'));
  }, []);

  return (
    <div className='flex flex-col items-center justify-center h-screen'>
      <div>
        <LoadingSpinner size={8} center={true} />
        <span className='text-lg text-gray-700'>Logging out...</span>
      </div>
    </div>
  )
}