import LoadingSpinner from '@components/LoadingSpinner'

export default function LoadingFullScreen () {

  return (
    <div>
      <div className="flex h-screen">
        <div className="m-auto">
          <LoadingSpinner size="8" />
        </div>
      </div>
    </div>

  )  
}