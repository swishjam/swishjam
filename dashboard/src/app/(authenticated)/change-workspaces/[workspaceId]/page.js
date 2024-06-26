'use client'

import SwishjamAPI from "@/lib/api-client/swishjam-api";
import { useEffect } from "react";
import { setAuthToken } from "@/lib/auth";
import { useSearchParams } from 'next/navigation'
import { swishjam } from "@swishjam/react";
import Logo from "@/components/Logo";

export default function ChangeWorkspaces({ params }) {
  const { workspaceId } = params;
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirectTo')

  useEffect(() => {
    SwishjamAPI.Workspace.updateCurrentWorkspace(workspaceId).then(({ error, auth_token, workspace }) => {
      if (auth_token) {
        setAuthToken(auth_token);
      }
      swishjam.setOrganization(workspace.id, { name: workspace.name, company_url: workspace.company_url });
      window.location.href = redirectTo || '/';
    })
  }, [])

  return (
    <div className='h-screen w-full flex items-center justify-center'>
      <Logo className='h-20 w-20 animate-bounce' />
    </div>
  )
}