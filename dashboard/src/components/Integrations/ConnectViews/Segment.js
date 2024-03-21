import { Button } from "@/components/ui/button"
import CopiableText from "@/components/utils/CopiableText"
import Link from "next/link"
import LoadingSpinner from "@/components/LoadingSpinner"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import SwishjamAPI from "@/lib/api-client/swishjam-api"
import { toast } from "sonner"
import { useState } from "react"

export default function SegmentConnectionView({ onNewIntegration, onClose }) {
  const [dataSource, setDataSource] = useState('product');
  const [integrationId, setIntegrationId] = useState()
  const [isLoading, setIsLoading] = useState(false)
  const [privateKey, setPrivateKey] = useState()

  const createIntegration = async () => {
    setIsLoading(true)
    const { integration, private_key, error } = await SwishjamAPI.Integrations.create({
      type: 'Integrations::Segment',
      enabled: true,
      config: { for_data_source: dataSource },
      returnPrivateKey: true,
    })
    setIsLoading(false)
    if (error) {
      toast.error('Failed to create Segment integration.', { description: error, duration: 10_000 });
    } else {
      onNewIntegration({ name: 'Segment', ...integration });
      setPrivateKey(private_key);
      setIntegrationId(integration.id);
    }
  }

  const steps = [
    <>Create a new <span className='italic font-semibold'>Webhook (Actions)</span> Destination in the Segment Destinations catalog by following this <Link href='https://app.segment.com/swishjam/destinations/catalog/actions-webhook' target='_blank' className='underline text-blue-700 hover:text-blue-900'>this link</Link>.</>,
    <>Select the source as whatever source type you have deployed to your site (most of the time, this is the <span className='italic font-semibold'>Javascript</span> source) and click <div className='inline-block ml-1  text-white p-2 rounded text-sm cursor-default' style={{ backgroundColor: 'rgb(51, 102, 255)' }}>Next</div>.</>,
    <>Name your new Webhook Destination (ie: <span className='italic font-semibold'>Swishjam</span>), select <span className='italic font-semibold'>Fill in settings manually</span> from the dropdown, and click <div className='inline-block ml-1  text-white p-2 rounded text-sm cursor-default' style={{ backgroundColor: 'rgb(51, 102, 255)' }}>Create destination</div>.</>,
    <>
      <div>Copy your Swishjam private key for your Segment integration below and paste it in the <span className='italic font-semibold'>Shared Secret</span> input field in your new destination's settings tab and click <div className='inline-block ml-1  text-white p-2 rounded text-sm cursor-default' style={{ backgroundColor: 'rgb(51, 102, 255)' }}>Save Changes</div>.</div>
      <div>Private Key: <CopiableText className='italic font-semibold mt-2' value={privateKey} /></div>
    </>,
    <>Navigate to the <span className='italic font-semibold'>Mappings</span> tab for your new destination, click <div className='inline-block ml-1 text-white p-2 rounded text-sm cursor-default' style={{ backgroundColor: 'rgb(51, 102, 255)' }}>+ New Mapping</div>, and select the <span className='italic font-semibold'>Send</span> action.</>,
    <>In the first step, add three conditions for <span className='italic font-semibold'>Event Type is Track</span>, <span className='italic font-semibold'>Event Type is Identify</span>, <span className='italic font-semibold'>Event Type is Group</span>, and <span className='italic font-semibold'>Event Type is Group</span>. Ensure <span className='italic font-semibold'>any of the following conditions are true</span> is selected.</>,
    <>
      Skip to step 3
      <ul className='list-disc ml-6'>
        <li>
          Paste the following url in the <span className='italic font-semibold'>URL</span> field:
          <div className='my-2'>
            <CopiableText value={`https://capture.swishjam.com/api/v1/webhooks/segment/${integrationId}`} includeIcon={true}>
              <div style={{ maxWidth: '20rem' }} className='inline-block italic font-semibold truncate bg-gray-200 px-1 py-0.5 rounded'>
                https://capture.swishjam.com/api/v1/webhooks/segment/{integrationId}
              </div>
            </CopiableText>
          </div>
        </li>
        <li>Select <span className="italic font-semibold">POST</span> as the <span className='italic font-semibold'>Method</span>.</li>
        <li>Input <span className='italic font-semibold'>"50"</span> as the <span className='italic font-semibold'>Batch Size</span>.</li>
        <li>Keep <div className='inline-block mx-1 px-1 text-xs py-0.5 rounded italic bg-gray-200 text-gray-700 font-semibold'>$event</div> as the <span className='italic font-semibold'>Data</span> option.</li>
        <li>Select <span className='italic font-semibold'>Yes</span> for <span className='italic font-semibold'>Enable Batching?</span>.</li>
      </ul>
      <span className='mt-2'>And click <div className='inline-block ml-1 text-white p-2 rounded text-sm cursor-default' style={{ backgroundColor: 'rgb(51, 102, 255)' }}>Save</div>.</span>
    </>,
    <>Ensure the new Mapping is toggled to <span className='italic font-semibold'>enabled</span>.</>,
    <>Your Segment integration is now complete, watch as your Segment data begins to flow into Swishjam.</>
  ]

  if (privateKey && integrationId) {
    return (
      <div className="flow-root max-w-xl">
        <h3 className="mb-2 text-md text-gray-600">Follow the below steps in your Segment account in order to add the Swishjam destination:</h3>
        <ul role="list">
          {steps.map((step, i) => (
            <li key={i}>
              <div className="relative py-4 px-1 hover:bg-gray-100 rounded">
                {i !== steps.length - 1
                  ? <span className="absolute left-5 top-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" />
                  : null
                }
                <div className="relative flex space-x-3">
                  <div className='flex items-center'>
                    <span className='h-8 w-8 rounded-full flex items-center justify-center bg-gray-200 text-sm ring-1 ring-white'>
                      {i + 1}
                    </span>
                  </div>
                  <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                    <div>
                      <p className="text-sm text-gray-700">
                        {step}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
        <div className='flex justify-end items-center mt-4'>
          <Button variant='swishjam' onClick={onClose}>Done</Button>
        </div>
      </div>
    )
  } else {
    return (
      <>
        <div className='flex items-center grid-cols-2'>
          <div className="flex-shrink">
            <h3 className="text-sm font-semibold text-gray-900">Select your Data Source:</h3>
            <h4 className='text-xs text-gray-600'>Swishjam populates your dashboards and reports based on your selected data source.</h4>
          </div>
          <Select className='flex-grow' onValueChange={setDataSource} defaultValue={dataSource}>
            <SelectTrigger className="w-[240px]">
              <SelectValue placeholder="Data Source">
                {dataSource === 'product' && 'Product Analytics'}
                {dataSource === 'marketing' && 'Web Analytics'}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className='w-[360px]'>
              <SelectGroup>
                <SelectItem value="product" label='Product Analytics'>
                  <div className='flex flex-col space-y-2'>
                    <span className='text-md font-semibold'>Product Analytics</span>
                    <span className='text-xs'>The data you will be sending from Segment should be associated to Swishjam's product analytics.</span>
                  </div>
                </SelectItem>
                <SelectItem value="marketing" label='Web Analytics'>
                  <div className='flex flex-col space-y-2'>
                    <span className='text-md font-semibold'>Web Analytics</span>
                    <span className='text-xs'>The data you will be sending from Segment should be associated to Swishjam's web analytics.</span>
                  </div>
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <Button className='w-full mt-4' variant='swishjam' onClick={createIntegration} disabled={isLoading}>
          {isLoading && <LoadingSpinner color='white' className='mr-2 inline-block' />}
          Add Segment Data Source
        </Button>
      </>
    )
  }
}