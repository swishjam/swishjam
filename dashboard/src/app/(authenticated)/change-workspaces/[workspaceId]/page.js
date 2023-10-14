'use client'

import SwishjamAPI from "@/lib/api-client/swishjam-api";
import { useEffect } from "react";
import { setAuthToken } from "@/lib/auth";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function ChangeWorkspaces({ params }) {
  const { workspaceId } = params;

  useEffect(() => {
    SwishjamAPI.Workspace.updateCurrentWorkspace(workspaceId).then(({ error, auth_token }) => {
      if (auth_token) {
        setAuthToken(auth_token);
      }
      window.location.href = '/';
    })
  }, [])

  return (
    <div className='h-screen w-full flex items-center justify-center'>
      <LoadingSpinner size={10} />
    </div>
  )
}