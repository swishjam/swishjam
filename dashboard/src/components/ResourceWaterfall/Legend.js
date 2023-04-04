import RequestColorIndicator from "./RequestColorIndicator"

export default function Legend() {
  return (
    <>
      <div className='flex justify-between'>
        <RequestColorIndicator title='Waiting' bgColor='bg-gray-300' />
        <RequestColorIndicator title='DNS Lookup' bgColor='bg-teal-700' />
        <RequestColorIndicator title='TCP' bgColor='bg-orange-500' />
        <RequestColorIndicator title='SSL' bgColor='bg-purple-500' />
        <RequestColorIndicator title='Request' bgColor='bg-blue-500' />
        <RequestColorIndicator title='Response' bgColor='bg-red-400' />
      </div>
      <div className='flex justify-between mb-2'>
        <RequestColorIndicator title='LCP' bgColor='border-red-500' dashed={true} />
        <RequestColorIndicator title='TTFB' bgColor='border-blue-600' dashed={true} />
        <RequestColorIndicator title='FCP' bgColor='border-green-600' dashed={true} />
        <RequestColorIndicator title='DOM Complete' bgColor='border-purple-700' dashed={true} />
        <RequestColorIndicator title='DOM Content Loaded' bgColor='border-orange-300' dashed={true} />
        <RequestColorIndicator title='DOM Interactive' bgColor='border-pink-400' dashed={true} />
        <RequestColorIndicator title='Load' bgColor='border-yellow-700' dashed={true} />
      </div>
    </>
  )
}