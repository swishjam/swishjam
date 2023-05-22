import { usePopperTooltip } from "react-popper-tooltip";
import { formattedMsOrSeconds } from "@/lib/utils"

export default function Filmstrip({ filmstrip }) {
  return (
    <>
      <div className='flex items-center w-full overflow-x-scroll my-4 px-4'>
        {filmstrip
          ? filmstrip.map(({ image, time }, i) => <FilmstripItem image={image} time={time} key={i} />
          ) : (
            Array.from({ length: 10 }).map((_, i) => (
              <div className='text-center mr-2' key={i}>
                <div className='h-6 w-8 animate-pulse bg-gray-200 rounded mt-2 m-auto' />
                <div className='animate-pulse bg-gray-200 rounded mt-2' style={{ width: '200px', height: '100px' }} />
              </div>
            ))
          )
        }
      </div>
    </>
  )
}

const FilmstripItem = ({ image, time }) => {
  const { getArrowProps, getTooltipProps, setTooltipRef, setTriggerRef, visible } = usePopperTooltip({ placement: 'top' });
  return (
    <>
      <div className='text-center mr-2 hover:outline hover:outline-gray-200 hover:bg-gray-100 p-1' ref={setTriggerRef}>
        <span className='block text-sm text-gray-700'>{formattedMsOrSeconds(time)}</span>
        <img src={image} className='rounded-lg shadow-md border border-gray-100 min-w-[200px]' />
      </div>
      {visible && (
        <div ref={setTooltipRef} {...getTooltipProps({ className: 'z-50' })}>
          <div className='bg-white p-4 border border-gray-100 shadow-md rounded-md flex items-center justify-center'>
            <div>
              <h4 className='block text-lg font-medium text-gray-700 mb-2 text-center'>{formattedMsOrSeconds(time)}</h4>
              <img src={image} className='min-w-[200px]' />
            </div>
          </div>
          <div {...getArrowProps({ className: 'tooltip-arrow' })} />
        </div>
      )}
    </>
  )
}