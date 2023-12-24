'use client';

import { useEffect } from "react";
import { logUserOut } from "@/lib/auth";
// import { useRouter } from "next/navigation";
import LoadingSpinner from "@/components/LoadingSpinner";
import { useSearchParams } from "next/navigation";



export default function Logout() {
  const searchParams = useSearchParams();
  const return_url = searchParams.get('return_url');

  useEffect(() => {
    logUserOut().then(() => {
      if (return_url) {
        window.location.href = `/login?return_url=${return_url}`
      } else {
        window.location.href = '/login';
      }
    });
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