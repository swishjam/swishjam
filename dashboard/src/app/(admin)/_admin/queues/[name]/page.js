'use client'

import LoadingSpinner from "@/components/LoadingSpinner";
import Pagination from "@/components/Pagination/Pagination";
import { Button } from "@/components/ui/button";
import JsonEditor from "@/components/utils/JsonEditor";
import Modal from "@/components/utils/Modal";
import useConfirmationModal from "@/hooks/useConfirmationModal";
import SwishjamAPI from "@/lib/api-client/swishjam-api";
import { prettyDateTime } from "@/lib/utils/timeHelpers";
import { RefreshCcw, TrashIcon, WrenchIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function Queue({ params }) {
  const { name } = params;
  const { displayConfirmation } = useConfirmationModal();

  const [workspaceForDisplayedRecord, setWorkspaceForDisplayedRecord] = useState();
  const [currentPage, setCurrentPage] = useState(1);
  const [displayRecord, setDisplayRecord] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const [formalQueueName, setFormalQueueName] = useState();
  const [recordsInQueue, setRecordsInQueue] = useState();
  const [queueDescription, setQueueDescription] = useState();
  const [queueSize, setQueueSize] = useState();
  const [totalNumPages, setTotalNumPages] = useState();

  const isEventsQueue = [
    "capture_endpoint_ingestion_queue",
    "capture_endpoint_ingestion_dead_letter_queue",
    "events_to_prepare_ingestion_queue",
    "events_to_prepare_ingestion_dead_letter_queue",
    "prepared_events_ingestion_queue",
    "prepared_events_ingestion_dead_letter_queue",
  ].includes(formalQueueName)

  const fetchRecords = ({ page = 1, limit = 25 } = {}) => {
    setIsLoading(true)
    setRecordsInQueue()
    setQueueSize()
    SwishjamAPI.Admin.Queues.retrieve(name, { page, limit }).then(({ name, description, records, total_pages, total_count }) => {
      setIsLoading(false)
      setFormalQueueName(name)
      setRecordsInQueue(records);
      setQueueDescription(description);
      setQueueSize(total_count);
      setTotalNumPages(total_pages);
    })
  }

  useEffect(() => {
    fetchRecords({ page: currentPage })
  }, [currentPage])

  useEffect(() => {
    if (displayRecord) {
      SwishjamAPI.Admin.ApiKeys.workspaceForPublicKey(displayRecord.swishjam_api_key).then(setWorkspaceForDisplayedRecord)
    }
  }, [displayRecord])

  const retryRecord = recordJson => {
    setIsLoading(true)
    SwishjamAPI.Admin.Queues.retryRecord(name, recordJson).then(response => {
      setIsLoading(false)
      if (response.error) {
        toast.error('Failed to retry record', {
          description: response.error,
          duration: 10_000,
        })
      } else {
        setDisplayRecord()
        if (response.num_failed_records > 0) {
          fetchRecords({ page: currentPage })
          toast.error('The retry attempt for this record was unsucccessful.', {
            description: <>
              <span className='block'>This likely means the event payload is invalid, or there is an outstanding error happening during ingestion. This record was removed from the ${name} queue, but a new one was most likely (definitely?) re-enqueued.</span>
            </>,
            duration: 20_000,
          })
        } else if (response.num_successful_records > 0) {
          toast.success(`Successfully retried record.`, { duration: 10_000 })
          setRecordsInQueue(recordsInQueue.filter(r => JSON.stringify(r) !== JSON.stringify(recordJson)))
          setQueueSize(queueSize - response.num_successful_records)
        }
      }
    })
  }

  const retryAllRecordsInQueue = () => {
    setIsLoading(true)
    SwishjamAPI.Admin.Queues.retryAllRecordsInQueue(name).then(response => {
      setIsLoading(false)
      if (response.error) {
        toast.error('Failed to retry all records in queue', {
          description: response.error,
          duration: 10_000,
        })
      } else {
        if (response.num_failed_records > 0) {
          toast.error(`The retry attempt for this record was unsucccessful. This likely means the event payload is invalid, or there is an outstanding error happening during ingestion. This recordw as removed from the ${name} queue, but a new one was most likely (definitely?) re-enqueued.`, { duration: 10_000 })
        } else if (response.num_successful_records > 0) {
          toast.success(`Successfully retried ${response.num_successful_records} records.`, { duration: 10_000 })
          setRecordsInQueue([])
          setQueueSize(0)
        }
      }
    })
  }

  const removeSpecificRecordFromQueue = recordJson => {
    setIsLoading(true)
    SwishjamAPI.Admin.Queues.removeRecordFromQueue(name, recordJson).then(response => {
      setIsLoading(false)
      if (response.error) {
        toast.error('Failed to remove record from queue', {
          description: response.error,
          duration: 10_000,
        })
      } else {
        if (response.num_records_removed > 0) {
          toast.success(`Successfully removed ${record.num_records_removed} records from queue.`, { duration: 10_000 })
          setDisplayRecord()
          setRecordsInQueue(recordsInQueue.filter(r => JSON.stringify(r) !== JSON.stringify(recordJson)))
          setQueueSize(queueSize - 1)
        } else {
          toast.error(`Failed to remove record from queue.`, { duration: 10_000 })
        }
      }
    })
  }

  const flushEntireQueue = () => {
    setIsLoading(true)
    SwishjamAPI.Admin.Queues.flushEntireQueue(name).then(response => {
      setIsLoading(false)
      if (response.error) {
        toast.error('Failed to clear queue', {
          description: response.error,
          duration: 10_000,
        })
      } else {
        setRecordsInQueue([])
        setQueueSize(0)
        toast.success(`Successfully flushed ${response.num_records_removed} records from ${name} queue.`, { duration: 10_000 })
      }
    })
  }

  return (
    <main className='w-screen h-screen px-8 py-8'>
      <div className='w-full grid grid-cols-2 mb-8 space-x-8'>
        <div>
          <h1 className='text-lg text-gray-700'>{name} - {queueSize} records in queue</h1>
          <h2 className='text-sm text-gray-500'>{queueDescription}</h2>
        </div>
        <div className='flex items-center justify-end space-x-4'>
          <Button
            variant='outline'
            className='transition-colors hover:text-swishjam'
            disabled={isLoading}
            onClick={() => fetchRecords({ page: currentPage })}
          >
            <RefreshCcw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
          <Button
            variant='outline'
            className='transition-colors hover:text-swishjam'
            disabled={isLoading}
            onClick={() => {
              displayConfirmation({
                title: `Retry all ${queueSize} records in ${formalQueueName}?`,
                body: `This will enqueue a background job and attempt to retry all records in the queue.`,
                callback: retryAllRecordsInQueue,
              })
            }}
          >
            {isLoading
              ? <LoadingSpinner size={4} className='mr-2' />
              : <WrenchIcon className='h-4 w-4 mr-2' />}
            Retry all {queueSize === undefined ? <span className='w-4 h-6 bg-gray-200 animate-pulse' /> : queueSize} records
          </Button>
          <Button
            variant='outline'
            className='transition-colors hover:text-red-500'
            disabled={isLoading}
            onClick={() => {
              displayConfirmation({
                title: `Clear ${queueSize} records from ${formalQueueName}?`,
                body: `This action cannot be undone, we will no longer be able to retry these events.`,
                callback: flushEntireQueue,
              })
            }}
          >
            {isLoading
              ? <LoadingSpinner size={4} className='mr-2' />
              : <TrashIcon className='h-4 w-4 mr-2' />}
            Flush Queue
          </Button>
        </div>
      </div>
      {displayRecord && (
        <Modal
          title={`${displayRecord.name}: ${displayRecord.uuid}`}
          onClose={() => setDisplayRecord(null)}
          size='x-large'
        >
          <h2 className="text-sm text-gray-600">Workspace: <span className='font-semibold'>{workspaceForDisplayedRecord?.name}</span></h2>
          <h2 className='text-sm text-gray-600'>Event: <span className='font-semibold'>{displayRecord.name}</span></h2>
          <h2 className='text-sm text-gray-600'>Occurred at(?): <span className='font-semibold'>{displayRecord.occurred_at && prettyDateTime(parseFloat(displayRecord.occurred_at) * 1_000)}</span></h2>
          <h2 className='text-sm text-gray-600'>Ingested at(?): <span className='font-semibold'>{displayRecord.ingested_at && prettyDateTime(parseFloat(displayRecord.ingested_at) * 1_000)}</span></h2>
          <h2 className='text-sm text-red-600'>
            Ingestion error: <span className='font-semibold'>{displayRecord.dlq_data?.errored_at && prettyDateTime(displayRecord.dlq_data?.errored_at)}: {displayRecord.dlq_data?.error_message}</span>
          </h2>
          <div className='mt-2'>
            <JsonEditor json={displayRecord} readonly={true} />
          </div>
          <div className='mt-8 border-t border-gray-200 py-4 flex justify-between'>
            <Button
              variant='outline'
              className='transition-colors hover:text-red-500'
              disabled={isLoading}
              onClick={() => removeSpecificRecordFromQueue(displayRecord)}>
              {isLoading
                ? <LoadingSpinner size={4} className='mr-2' />
                : <TrashIcon className='h-4 w-4 mr-2' />}
              Remove from {name} Queue
            </Button>
            <Button
              variant='outline'
              className='transition-colors hover:text-swishjam'
              disabled={isLoading}
              onClick={() => retryRecord(displayRecord)}
            >
              {isLoading
                ? <LoadingSpinner size={4} className='mr-2' />
                : <WrenchIcon className='h-4 w-4 mr-2' />}
              Retry
            </Button>
          </div>
        </Modal>
      )}
      {recordsInQueue === undefined
        ? (
          Array.from({ length: 10 }).map((_, i) => (
            <div className='h-20 w-full bg-gray-200 animate-pulse rounded-sm m-2' key={i} />
          ))
        ) : (
          <>
            {recordsInQueue.map((record, i) => (
              <div
                key={i}
                onClick={() => setDisplayRecord(record)}
                className='w-full px-8 py-4 bg-white border border-zinc-200 shadow-sm rounded-sm m-2 text-sm cursor-pointer transition-colors hover:bg-gray-50'>
                {isEventsQueue && (
                  <>
                    <h3 className='text-md font-bold'>{record.name}</h3>
                    {record.dlq_data && (
                      <h3 className='text-md text-red-600 font-bold'>{record.dlq_data.errored_at && prettyDateTime(record.dlq_data.errored_at)}: {record.dlq_data.error_message}</h3>
                    )}
                    <h4 className='text-md'>API Key? {record.swishjam_api_key}</h4>
                    <h4 className='text-md'>Occurred at: {record.occurred_at && prettyDateTime(parseFloat(record.occurred_at) * 1000)}</h4>
                    <h4 className='text-md'>(Tried to) ingest at: {record.ingested_at && prettyDateTime(parseFloat(record.ingested_at) * 1000)}</h4>
                  </>
                )}
                <div className='text-sm mt-2'>
                  {JSON.stringify(record)}
                </div>
              </div>
            ))}
            {totalNumPages > 1 && (
              <div className='w-full pb-4 border-t-0 border border-gray-200 bg-white rounded-sm m-2'>
                <Pagination
                  currentPage={currentPage}
                  lastPageNum={totalNumPages}
                  onNewPageSelected={setCurrentPage}
                />
              </div>
            )}
          </>
        )}
    </main>
  )
}