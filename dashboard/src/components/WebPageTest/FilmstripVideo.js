import { useState, useEffect, useRef } from "react";
import { formattedMsOrSeconds } from "@/lib/utils";

const ADDITIONAL_MS_TO_VIDEO = 1_000;

export default function FilmstripVideo({ filmstrip, performanceMetrics }) {
  const [currentFilmstripFrameIndex, setCurrentFilmstripFrameIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(0.5);

  const currentFilmstripItem = (filmstrip || [])[currentFilmstripFrameIndex];
  const nextFilmstripItem = (filmstrip || [])[currentFilmstripFrameIndex + 1];

  if (isPlaying && nextFilmstripItem) {
    const msUntilNextFrame = nextFilmstripItem.time - currentFilmstripItem.time;
    setTimeout(() => {
      setCurrentFilmstripFrameIndex(currentFilmstripFrameIndex + 1);
    }, msUntilNextFrame / playbackSpeed)
  } else if (isPlaying && !nextFilmstripItem) {
    setTimeout(() => setIsPlaying(false), ADDITIONAL_MS_TO_VIDEO / playbackSpeed);
  }

  return (
    <div className='border border-gray-200 pb-4'>
      {filmstrip 
        ? (
          <div className='text-center'>
            <div className='relative'>
              {!isPlaying && (
                <div
                  className='absolute flex h-full w-full items-center justify-center bg-black text-white text-4xl opacity-25 cursor-pointer hover:opacity-50 hover:text-6xl transition-all duration-200'
                  onClick={() => {
                    setCurrentFilmstripFrameIndex(0)
                    setIsPlaying(true)
                  }}
                >
                  ▶️
                </div>
              )}
              {filmstrip.map(({ image }, i) => (
                <img src={image} className={`w-full ${i === currentFilmstripFrameIndex ? '' : 'hidden'}`} key={i} />  
              ))}
              <div className='absolute p-1 text-white top-0 right-0 bg-black opacity-50'>
                <VideoPlayerTimer isRunning={isPlaying} time={currentFilmstripItem.time} playbackSpeed={playbackSpeed} />
              </div>
              <VideoPlayerProgressionIndicator
                isRunning={isPlaying}
                time={currentFilmstripItem.time}
                duration={filmstrip[filmstrip.length - 1].time + ADDITIONAL_MS_TO_VIDEO}
                playbackSpeed={playbackSpeed}
                performanceMetrics={performanceMetrics}
              />
            </div>
            <div className='flex items-center justify-center mt-4 grid grid-cols-5 gap-x-4 mt-10 px-2'>
              {[0.25, 0.5, 0.75, 1, 2].map(speed => (
                <div
                  className={`cursor-pointer px-4 py-1 text-sm rounded-md text-gray-700 hover:bg-gray-100 hover:text-gray-900 ${playbackSpeed === speed ? 'bg-gray-200' : ''}`}
                  onClick={() => setPlaybackSpeed(speed)}
                  key={speed}
                >
                  {speed}x
                </div>
              ))}
            </div>
          </div>
        ) : <div className='w-full h-64 bg-gray-200 animate-pulse rounded-md' />}
    </div>
  )
}

const VideoPlayerProgressionIndicator = ({ time, playbackSpeed, performanceMetrics, isRunning, duration }) => {
  const durationIndicatorRef = useRef(null);
  const intervalRef = useRef(null);

  const percentComplete = time / duration * 100;
  const increments = playbackSpeed * 100;

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        const currentTime = parseInt(durationIndicatorRef.current.dataset.time);
        const incrementedTime = currentTime + increments;
        durationIndicatorRef.current.style.width = `${(incrementedTime / duration) * 100}%`;
        durationIndicatorRef.current.dataset.time = incrementedTime;
      }, increments / playbackSpeed);
    } else {
      clearInterval(intervalRef.current);
    }
  }, [isRunning])

  return (
    <div className='w-full h-6 relative'>
      <div className='absolute top-0 h-full w-1 bg-blue-500 z-10' style={{ left: `${(performanceMetrics.TimeToFirstByte / duration) * 100}%` }} />
      <div className='absolute top-6 text-gray-700 text-xs' style={{ left: `${(performanceMetrics.TimeToFirstByte / duration) * 100 - 2.5}%` }}>
        TTFB<br/>{formattedMsOrSeconds(performanceMetrics.TimeToFirstByte)}
      </div>
      <div className='absolute top-0 h-full w-1 bg-yellow-500 z-10' style={{ left: `${(performanceMetrics.FirstContentfulPaint / duration) * 100}%` }} />
      <div className='absolute top-6 text-gray-700 text-xs' style={{ left: `${(performanceMetrics.FirstContentfulPaint / duration) * 100 - 2.5}%` }}>
        FCP<br/>{formattedMsOrSeconds(performanceMetrics.FirstContentfulPaint)}
      </div>
      <div className='absolute top-0 h-full w-1 bg-red-500 z-10' style={{ left: `${(performanceMetrics.LargestContentfulPaint / duration) * 100}%` }} />
      <div className='absolute top-6 text-gray-700 text-xs' style={{ left: `${(performanceMetrics.LargestContentfulPaint / duration) * 100 - 2.5}%` }}>
        LCP<br/>{formattedMsOrSeconds(performanceMetrics.LargestContentfulPaint)}
      </div>
      <div 
        className='bg-swishjam h-full transition' 
        ref={durationIndicatorRef} 
        data-time={time} 
        style={{ width: `${percentComplete}%` }} 
      />
    </div>
  )
}

const VideoPlayerTimer = ({ time, playbackSpeed, isRunning }) => {
  const timerRef = useRef(null);
  const intervalRef = useRef(null);
  const increments = playbackSpeed * 100;
  
  const formattedTime = time => time > 999 ? `${parseFloat(time / 1_000).toFixed(2)}s` : `${parseFloat(time).toFixed(0)}ms`; 

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        const currentTime = parseInt(timerRef.current.dataset.time);
        const incrementedTime = currentTime + increments;
        timerRef.current.innerText = formattedTime(incrementedTime);
        timerRef.current.dataset.time = incrementedTime;
      }, increments / playbackSpeed);
    } else {
      clearInterval(intervalRef.current);
    }
  }, [isRunning])

  return (
    <>
      <h4 className='block text-md font-medium' ref={timerRef} data-time={time}>
        {formattedTime(time)}
      </h4>
    </>
  )
}