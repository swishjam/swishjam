import { useEffect, useState, useRef } from "react";
import Modal from "@/components/utils/Modal";
import { usePopperTooltip } from "react-popper-tooltip";
import { formattedMsOrSeconds } from "@/lib/utils"
import { VideoCameraIcon } from "@heroicons/react/24/outline";

const filledInFilmstrip = filmstrip => {
  const filmstripObject = {};
  filmstrip.forEach(({ time, image, VisuallyComplete }) => filmstripObject[parseFloat(time)] = { time, image, VisuallyComplete } );
  
  const sortedFilmstripTimestamps = Object.keys(filmstripObject).map(ts => parseFloat(ts)).sort((a, b) => parseFloat(a.time) - parseFloat(b.time));
  const maxTs = sortedFilmstripTimestamps[sortedFilmstripTimestamps.length - 1];
  for (let i = 0; i <= maxTs; i += 500) {
    if (!filmstripObject[i]) {
      const closestTs = sortedFilmstripTimestamps.find((ts, j) => i >= ts && i < sortedFilmstripTimestamps[j + 1]);
      filmstripObject[i] = { ...filmstripObject[closestTs], time: i };
    }
  }
  return Object.values(filmstripObject);
}

export default function Filmstrip({ filmstrip, performanceMetrics, includeVideoPlayer = true }) {
  const [displayVideoModal, setDisplayVideoModal] = useState(false);
  const formattedFilmstrip = filmstrip && filledInFilmstrip(filmstrip);

  return (
    <>
      {includeVideoPlayer && (
        <span 
          className='block text-sm text-gray-700 mb-2 px-4 cursor-pointer hover:underline flex items-center'
          onClick={() => setDisplayVideoModal(true)}
        >
          Play video <VideoCameraIcon className='ml-1 h-3 w-3 text-gray-700 inline-block' />
        </span>
      )}
      {displayVideoModal && (
        <VideoPlayerModal 
          filmstrip={formattedFilmstrip} 
          performanceMetrics={performanceMetrics} 
          onClose={() => setDisplayVideoModal(false)} 
        />
      )}
      <div className='flex items-center w-full overflow-x-scroll mb-4 px-4'>
        {filmstrip
          ? formattedFilmstrip.map(({ image, time }, i) => <FilmstripItem image={image} time={time} key={i} />
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
        <div ref={setTooltipRef} {...getTooltipProps()}>
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

const VideoPlayerModal = ({ filmstrip, performanceMetrics, onClose }) => {
  const [currentFilmstripFrameIndex, setCurrentFilmstripFrameIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);

  const currentFilmstripItem = filmstrip[currentFilmstripFrameIndex];
  const nextFilmstripItem = filmstrip[currentFilmstripFrameIndex + 1];

  if (isPlaying && nextFilmstripItem) {
    const msUntilNextFrame = nextFilmstripItem.time - currentFilmstripItem.time;
    setTimeout(() => {
      setCurrentFilmstripFrameIndex(currentFilmstripFrameIndex + 1);
    }, msUntilNextFrame / playbackSpeed)
  } else if (isPlaying && !nextFilmstripItem) {
    setIsPlaying(false);
  }

  return (
    <>
      <Modal 
        isOpen={true}
        onClose={onClose}
        content={(
          <div className='flex justify-center items-center m-4'>
            <div className='text-center'>
              <div className='relative'>
                {!isPlaying && (
                  <div
                    className='absolute flex h-full w-full items-center justify-center bg-black text-white text-4xl opacity-25 rounded-lg cursor-pointer hover:opacity-50 hover:text-6xl transition-all duration-200'
                    onClick={() => {
                      setCurrentFilmstripFrameIndex(0)
                      setIsPlaying(true)
                    }}
                  >
                    ▶️
                  </div>
                )}
                <img src={currentFilmstripItem.image} className='rounded-lg shadow-md border border-gray-100 min-w-[400px]' />
              </div>
              <VideoPlayerTimer 
                isRunning={isPlaying} 
                time={currentFilmstripItem.time} 
                duration={filmstrip[filmstrip.length - 1].time} 
                playbackSpeed={playbackSpeed}
                performanceMetrics={performanceMetrics}
              />
              <div className='flex items-center justify-center mt-4 grid grid-cols-5 gap-x-4'>
                {[0.25, 0.5, 0.75, 1, 2].map(speed => (
                  <div 
                    className={`cursor-pointer px-4 py-1 text-sm rounded-md text-gray-700 hover:bg-gray-200 hover:text-gray-900 ${playbackSpeed === speed ? 'bg-gray-200' : ''}`} 
                    onClick={() => setPlaybackSpeed(speed)}
                    key={speed}
                  >
                    {speed}x
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      />
    </>    
  )
}

const VideoPlayerTimer = ({ time, playbackSpeed, performanceMetrics, isRunning, duration, increments = 25 }) => {
  const percentComplete = time / duration * 100;
  const timerRef = useRef(null);
  const durationIndicatorRef = useRef(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        const currentTime = parseInt(timerRef.current.dataset.time);
        timerRef.current.innerText = formattedMsOrSeconds(currentTime + increments);
        timerRef.current.dataset.time = currentTime + increments;
        durationIndicatorRef.current.style.width = `${(currentTime / duration) * 100}%`;
      }, increments / playbackSpeed);
    } else {
      clearInterval(intervalRef.current);
    }
  }, [isRunning])

  return (
    <>
      <div className='w-full h-6 m-1 rounded relative'>
        <div className='absolute top-0 h-full w-1 bg-blue-500 z-10' style={{ left: `${(performanceMetrics.TimeToFirstByte / duration) * 100}%` }} />
        <div className='absolute top-6 text-gray-700 text-sm' style={{ left: `${(performanceMetrics.TimeToFirstByte / duration) * 100}%` }}>
          TTFB
        </div>
        <div className='absolute top-0 h-full w-1 bg-yellow-500 z-10' style={{ left: `${(performanceMetrics.FirstContentfulPaint / duration) * 100}%` }} />
        <div className='absolute top-6 text-gray-700 text-sm' style={{ left: `${(performanceMetrics.FirstContentfulPaint / duration) * 100}%` }}>
          FCP
        </div>
        <div className='absolute top-0 h-full w-1 bg-yellow-500 z-10' style={{ left: `${(performanceMetrics.LargestContentfulPaint / duration) * 100}%` }} />
        <div className='absolute top-6 text-gray-700 text-sm' style={{ left: `${(performanceMetrics.LargestContentfulPaint / duration) * 100}%` }}>
          LCP
        </div>
        <div className='bg-swishjam h-full rounded' ref={durationIndicatorRef} style={{ width: `${percentComplete}%` }} />
      </div>
      <h4 className='block text-md font-medium' ref={timerRef} data-time={time}>
        {formattedMsOrSeconds(time)}
      </h4>
    </>
  )
}