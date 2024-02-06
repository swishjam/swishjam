'use client'

import NewSlackTriggerView from "@/components/EventTriggers/NewSlackTriggerView";
import ResendEmailView from "@/components/EventTriggers/ResendEmailView";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function NewTriggerPage() {
  const searchParams = useSearchParams();
  const [triggerType, setTriggerType] = useState();

  useEffect(() => {
    setTriggerType(searchParams.get('type'));
  }, [searchParams.get('type')])

  switch (triggerType) {
    case 'Slack':
      return <NewSlackTriggerView />
    case 'ResendEmail':
      return <ResendEmailView />
    default:
      return '404'
  }
}