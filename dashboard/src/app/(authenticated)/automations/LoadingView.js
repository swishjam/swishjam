import LoadingSpinner from "@/components/LoadingSpinner";

export default function LoadingView() {
  return (
      <div>
        <div className="flex items-center justify-between">
          <h2 className="text-md font-medium text-gray-700 mb-0">Reports</h2>
          <button
            type="submit"
            className={`ml-2 flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 bg-gray-400`}
            disabled={true}
          >
            Add Report
          </button>
        </div>
        <div className="mx-auto h-5 w-5 mt-32">
          <LoadingSpinner className="mx-auto"/>
        </div>  
      </div>
  )
}