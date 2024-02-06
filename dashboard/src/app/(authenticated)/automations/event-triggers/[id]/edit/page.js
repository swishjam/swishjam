'use client'

import EditSlackTriggerPage from "@/components/EventTriggers/EditSlackTriggerView";
import SwishjamAPI from "@/lib/api-client/swishjam-api";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function EditTriggerPage({ params }) {
  const { id } = params;
  const [eventTrigger, setEventTrigger] = useState();

  useEffect(() => {
    SwishjamAPI.EventTriggers.retrieve(id).then(({ trigger, error }) => {
      if (error) {
        toast.error("An error occurred retrieving the event trigger, please try again", {
          description: error,
          duration: 10_000,
        });
        return;
      } else {
        setEventTrigger(trigger);
      }
    })
  }, [id])

  if (eventTrigger?.steps?.[0]?.type === 'EventTriggerSteps::Slack') {
    return <EditSlackTriggerPage eventTrigger={eventTrigger} />
  } else if (eventTrigger?.type === 'ResendEmail') {
    // return <EditResendEmailTriggerPage eventTrigger={eventTrigger} />
  }
}
