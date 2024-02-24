'use client'

import { Button } from "@/components/ui/button";
import Modal from "@/components/utils/Modal";
import useConfirmationModal from "@/hooks/useConfirmationModal";
import SwishjamAPI from "@/lib/api-client/swishjam-api";
import { prettyDateTime } from "@/lib/utils/timeHelpers";
import { RefreshCcw, TrashIcon } from "lucide-react";
import { useEffect, useState } from "react";

export default function Queue({ params }) {
  const { name } = params;
  const { displayConfirmation } = useConfirmationModal();

  const [currentPage, setCurrentPage] = useState(1);
  const [displayRecord, setDisplayRecord] = useState();
  const [formalQueueName, setFormalQueueName] = useState();
  const [recordsInQueue, setRecordsInQueue] = useState();
  const [queueDescription, setQueueDescription] = useState();
  const [queueSize, setQueueSize] = useState();

  const isEventsQueue = [
    "capture_endpoint_ingestion_queue",
    "capture_endpoint_ingestion_dead_letter_queue",
    "events_to_prepare_ingestion_queue",
    "events_to_prepare_ingestion_dead_letter_queue",
    "prepared_events_ingestion_queue",
    "prepared_events_ingestion_dead_letter_queue",
  ].includes(formalQueueName)

  useEffect(() => {
    SwishjamAPI.Admin.Queues.retrieve(name, { page: 1, limit: 100 }).then(({ name, description, records, total_pages, total_count }) => {
      setFormalQueueName(name)
      setRecordsInQueue(records);
      setQueueDescription(description);
      setQueueSize(total_count);
    })
  }, [])

  return (
    <main className='w-screen h-screen px-8 py-8'>
      <div className='w-full flex justify-between mb-8'>
        <div>
          <h1 className='text-lg text-gray-700'>{name} - {queueSize} records</h1>
          <h2 className='text-sm text-gray-500'>{queueDescription}</h2>
        </div>
        <div className='flex flex-col items-end'>
          <Button variant='swishjam'>
            <RefreshCcw className='h-4 w-4 inline-block mr-2' />
            Retry all {queueSize} records
          </Button>
          <Button
            variant='destructive'
            className='mt-4'
            onClick={() => {
              displayConfirmation({
                title: `Clear ${queueSize} records from ${formalQueueName}?`,
                body: `This action cannot be undone, we will no longer be able to retry these events.`,
              })
            }}
          >
            <TrashIcon className='h-4 w-4 inline-block mr-2' />
            Clear Queue
          </Button>
        </div>
      </div>
      {displayRecord && (
        <Modal onClose={() => setDisplayRecord(null)} size='x-large'>
          <pre className='overflow-scroll'>{JSON.stringify(displayRecord, null, 2)}</pre>
        </Modal>
      )}
      {recordsInQueue?.map(record => (
        <div
          onClick={() => setDisplayRecord(record)}
          className='w-full px-8 py-4 bg-white border border-zinc-200 shadow-sm rounded-sm m-2 text-sm cursor-pointer transition-colors hover:bg-gray-50'>
          {isEventsQueue && (
            <>
              <h3 className='text-md font-bold'>{record.name}</h3>
              <h4 className='text-md'>API Key? {record.swishjam_api_key}</h4>
              <h4 className='text-md'>Occurred at: {record.occurred_at && prettyDateTime(record.occurred_at)}</h4>
              <h4 className='text-md'>(Tried to) ingest at: {record.ingested_at && prettyDateTime(record.ingested_at)}</h4>
            </>
          )}
          <div className='text-sm mt-2'>
            {JSON.stringify(record)}
          </div>
        </div>
      ))}
    </main>
  )
}