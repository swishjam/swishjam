'use client'

//import EditSlackTriggerPage from "@/components/Automations/EventTriggers/EditSlackTriggerView";
import AddEditSlackEventTrigger from "@/components/Automations/EventTriggers/AddEditSlackEventTrigger";
import AddEditResendEventTrigger from "@/components/Automations/EventTriggers/AddEditResendEventTrigger";
import SwishjamAPI from "@/lib/api-client/swishjam-api";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import Link from "next/link";
import { LuArrowLeft } from "react-icons/lu";

export default function EditTriggerPage({ params }) {
  const { id } = params;
  const [eventTrigger, setEventTrigger] = useState();

  useEffect(() => {
    SwishjamAPI.EventTriggers.retrieve(id).then(({ trigger, error }) => {
      console.log(trigger, error) 
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

  const saveTrigger = async (values, onSuccess, onError) => {
    const { trigger, error } = await SwishjamAPI.EventTriggers.update(eventTrigger.id, values);
    if (error) {
      onError(error);
    } else {
      onSuccess(trigger);
    } 
  }

  return (
    <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-8">
      <div className="grid grid-cols-2 mt-8 items-center">
        <div>
          <Link
            className='text-xs text-gray-500 hover:text-gray-600 transition-all hover:underline flex items-center mb-2'
            href="/automations/event-triggers"
          >
            <LuArrowLeft className='inline mr-1' size={12} />
            Back to all Event Triggers 
          </Link>
          <h2 className="text-md font-medium text-gray-700 mb-0">Edit Event Trigger</h2>
        </div>
      </div>
      
      {eventTrigger?.steps?.[0]?.type === 'EventTriggerSteps::Slack' && 
        <AddEditSlackEventTrigger
          onSave={saveTrigger}
          triggerId={eventTrigger.id} 
        />
      }
      {eventTrigger?.steps?.[0]?.type === 'EventTriggerSteps::ResendEmail' && 
        <AddEditResendEventTrigger
          onSave={saveTrigger}
          triggerId={eventTrigger.id} 
          defaultTriggerValues={eventTrigger}
        />
      }

      
      {/* {reportData &&
        <AddEditReport
          onSave={updateReport}
          reportId={id}
          defaultReportValues={reportData}
          className="mt-8"
        />
      } */}
    </main>
  )


}
