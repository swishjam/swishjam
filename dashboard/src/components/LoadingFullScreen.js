import LoadingSpinner from '@components/LoadingSpinner'

export default function LoadingFullScreen () {

  return (
    <div>
      <div className="flex h-screen">
        <div className="m-auto">
          <LoadingSpinner color="swishjam" size="8" />
        </div>
      </div>
    </div>

  )  
}