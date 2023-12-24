'use client'

import SwishjamAPI from "@/lib/api-client/swishjam-api";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import LoadingSpinner from "@/components/LoadingSpinner";
import { toast } from "sonner";

export default function GithubAuthPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const installationId = searchParams.get('installation_id');

  useEffect(() => {
    SwishjamAPI.Integrations.create({
      type: 'Integrations::Github',
      config: { installation_id: installationId },
      enabled: true,
    }).then(({ error }) => {
      if (error) {
        toast.error('An error occurred.', {
          description: error,
          duration: 10_000,
        })
      } else {
        router.push('/integrations?success=true&newSource=Github')
      }
    })
  }, []);

  return (
    <div className='h-screen w-full flex items-center justify-center'>
      <div className='text-center'>
        <LoadingSpinner center={true} size={10} />
        <div className='text-2xl mt-2'>Connecting Github...</div>
      </div>
    </div>
  );
}