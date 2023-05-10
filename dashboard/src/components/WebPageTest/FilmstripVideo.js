import { useState, useEffect, useRef } from "react";
import { formattedMsOrSeconds } from "@/lib/utils";
import Dropdown from "../Dropdown";
import { AreaChart, Area, ResponsiveContainer, YAxis } from "recharts";
import { usePopperTooltip } from "react-popper-tooltip";

const ADDITIONAL_MS_TO_VIDEO = 1_000;

export default function FilmstripVideo({ filmstrip, performanceMetrics }) {
  const [currentFilmstripFrameIndex, setCurrentFilmstripFrameIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(0.5);

  const currentFilmstripItem = (filmstrip || [])[currentFilmstripFrameIndex];
  const nextFilmstripItem = (filmstrip || [])[currentFilmstripFrameIndex + 1];

  if (isPlaying && nextFilmstripItem) {
    const msUntilNextFrame = nextFilmstripItem.time - currentFilmstripItem.time;
    setTimeout(() => setCurrentFilmstripFrameIndex(currentFilmstripFrameIndex + 1), msUntilNextFrame / playbackSpeed);
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
                  className='z-30 absolute flex h-full w-full items-center justify-center bg-black text-white text-4xl opacity-25 cursor-pointer hover:opacity-50 hover:text-6xl transition-all duration-200'
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
                filmstrip={filmstrip}
                time={currentFilmstripItem.time}
                duration={filmstrip[filmstrip.length - 1].time + ADDITIONAL_MS_TO_VIDEO}
                playbackSpeed={playbackSpeed}
                performanceMetrics={performanceMetrics}
              />
            </div>
            <div className='grid grid-cols-2 border-t border-gray-200 pt-2'>
              <div className='text-left px-1'>
                <div className='flex items-center'>
                  <div className='h-1 w-1 rounded-full bg-yellow-500 inline-block mr-1' />
                  <span className='inline-block text-xs text-gray-700'>Time to First Byte: {formattedMsOrSeconds(performanceMetrics.TimeToFirstByte)}</span>
                </div>
                <div className='flex items-center'>
                  <div className='h-1 w-1 rounded-full bg-blue-500 inline-block mr-1' />
                  <span className='inline-block text-xs text-gray-700'>First Contentful Paint: {formattedMsOrSeconds(performanceMetrics.FirstContentfulPaint)}</span>
                </div>
                <div className='flex items-center'>
                  <div className='h-1 w-1 rounded-full bg-red-500 inline-block mr-1' />
                  <span className='inline-block text-xs text-gray-700'>Largest Contentful Paint: {formattedMsOrSeconds(performanceMetrics.LargestContentfulPaint)}</span>
                </div>
              </div>
              <div className='flex justify-end items-center px-2'>
                <Dropdown 
                  label='Playback Speed' 
                  options={['0.25x', '0.5x', '0.75x', '1x', '2x']} 
                  selected={'0.5x'} 
                  onSelect={ speed => setPlaybackSpeed(parseFloat(speed.replace('x', ''))) } 
                />
              </div>
            </div>
          </div>
        ) : <div className='w-full h-64 bg-gray-200 animate-pulse rounded-md' />}
    </div>
  )
}

const VideoPlayerProgressionIndicator = ({ filmstrip, time, playbackSpeed, performanceMetrics, isRunning, duration }) => {
  const durationIndicatorRef = useRef(null);
  const intervalRef = useRef(null);

  const percentComplete = time / duration * 100;
  const percentRemaining = 100 - percentComplete;
  const increments = playbackSpeed * 100;

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        const currentTime = parseInt(durationIndicatorRef.current.dataset.time);
        const incrementedTime = currentTime + increments;
        durationIndicatorRef.current.style.width = `${100 - ((incrementedTime / duration) * 100)}%`;
        durationIndicatorRef.current.dataset.time = incrementedTime;
      }, increments / playbackSpeed);
    } else {
      clearInterval(intervalRef.current);
    }
  }, [isRunning])

  return (
    <>
      <div className='w-full h-13 relative'>
        <div className='relative h-10'>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart width={500} height={400} data={filmstrip} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
              <YAxis hide={true} domain={[0, 100]} />
              <Area type='monotone' dataKey='VisuallyComplete' fill="#7487F7" stroke="#7487F7" strokeWidth={1} opacity={0.15} baseValue={0} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <PerformanceMetricIndicator metric='Largest Contentful Paint' value={performanceMetrics.LargestContentfulPaint} duration={duration} color='bg-red-500' />
        <PerformanceMetricIndicator metric='First Contentful Paint' value={performanceMetrics.FirstContentfulPaint} duration={duration} color='bg-blue-500' />
        <PerformanceMetricIndicator metric='Time to First Byte' value={performanceMetrics.TimeToFirstByte} duration={duration} color='bg-yellow-500' />
        <div 
          className='bg-white transition absolute top-0 right-0 z-20 h-13' 
          ref={durationIndicatorRef} 
          data-time={time} 
          style={{ width: `${percentRemaining}%`, height: '3.25rem' }} 
        />
      </div>
    </>
  )
}

const PerformanceMetricIndicator = ({ metric, value, duration, color }) => {
  const { getArrowProps, getTooltipProps, setTooltipRef, setTriggerRef, visible } = usePopperTooltip();
  return (
    <>
      <div
        className={`h-1 ${color}`}
        style={{ width: `${(value / duration) * 100}%` }}
        ref={setTriggerRef}
      />
      {visible && (
        <div ref={setTooltipRef} {...getTooltipProps({ className: 'bg-white shadow-md p-2 rounded-md text-xs' })}>
          {metric}: {formattedMsOrSeconds(value)}
          <div {...getArrowProps({ className: 'popper-arrow' })} />
        </div>
      )}
    </>
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