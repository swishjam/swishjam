'use client';

import { ArrowsPointingInIcon } from '@heroicons/react/24/outline';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import EnlargableDataVisualizationContext from '@/contexts/EnlargableDataVisualizationContext';
import { InfoIcon, SlidersHorizontalIcon } from 'lucide-react';
import SettingsDropdown from '@/components/DataVisualizations/utils/SettingsDropdown';
import { useRef, useState } from 'react';
import useSheet from '@/hooks/useSheet';
import { Tooltipable } from '@/components/ui/tooltip';
import DataVisualizationSettingsProvider from './DataVisualizationSettingsProvider';

const EnlargedDataVisualization = ({
  openSheetWithContent,
  collapseComponent,
  enlargedDataVisualizationRef,
  dataVisualizationDetailsToEnlarge,
  dataVisualizationIsEnlarged
}) => (
  <Card
    className={`${dataVisualizationIsEnlarged ? 'group fixed z-[49] flex flex-col group bg-white shadow-lg transition-all duration-1000 m-auto top-0 left-0 right-0 bottom-0 overflow-y-scroll' : 'hidden'}`}
    ref={enlargedDataVisualizationRef}
  >
    <CardHeader className="space-y-0 pb-2">
      <CardTitle className="text-sm font-medium cursor-default">
        <div className='flex justify-between items-center'>
          <div className='flex items-center gap-x-1'>
            {dataVisualizationDetailsToEnlarge?.title}
            {dataVisualizationDetailsToEnlarge?.DocumentationContent && (
              <a
                onClick={() => openSheetWithContent({ title: dataVisualizationDetailsToEnlarge?.title, content: dataVisualizationDetailsToEnlarge?.DocumentationContent })}
                className='cursor-pointer text-gray-500 hover:text-gray-700 transition-all rounded-full hover:bg-gray-100 p-1'
              >
                <InfoIcon className='h-3 w-3' />
              </a>
            )}
          </div>
          <div className='flex justify-end flex-shrink gap-x-1'>
            {dataVisualizationDetailsToEnlarge?.QueryDetails && (
              <Tooltipable content={dataVisualizationDetailsToEnlarge.QueryDetails}>
                <div className='group-hover:opacity-100 opacity-0 flex items-center justify-center duration-300 transition text-gray-500 hover:bg-gray-100 rounded-md'>
                  <SlidersHorizontalIcon className='h-4 w-4 m-1 text-gray-500' />
                </div>
              </Tooltipable>
            )}
            <button
              onClick={collapseComponent}
              className='p-1 flex items-center justify-center outline-0 ring-0 duration-300 transition text-gray-500 cursor-pointer hover:bg-gray-100 rounded-md'
            >
              <ArrowsPointingInIcon className='outline-0 ring-0 h-5 w-5 text-gray-500 cursor-pointer' />
            </button>
            {dataVisualizationDetailsToEnlarge?.AdditionalHeaderActions}
            {dataVisualizationDetailsToEnlarge?.includeSettingsDropdown && <SettingsDropdown options={dataVisualizationDetailsToEnlarge?.settings} />}
          </div>
        </div>
      </CardTitle>
      {dataVisualizationDetailsToEnlarge?.subtitle && <h2 className='text-xs text-gray-500 w-fit'>{dataVisualizationDetailsToEnlarge.subtitle}</h2>}
    </CardHeader>
    <CardContent className='flex-1 min-h-0 h-full mt-2 flex flex-col'>
      {dataVisualizationDetailsToEnlarge?.children}
    </CardContent>
  </Card>
)

const EnlargableDataVisualizationProvider = ({ children }) => {
  const { openSheetWithContent } = useSheet();

  const [dataVisualizationIsEnlarged, setdataVisualizationIsEnlarged] = useState(false);
  const [dataVisualizationDetailsToEnlarge, setDataVisualizationDetailsToEnlarge] = useState(null);

  const enlargedDataVisualizationRef = useRef();
  const backdropRef = useRef();
  const placeholderElRef = useRef();

  const enlargeDataVisualization = content => {
    if (!content) throw new Error('You must pass a component to enlargeDataVisualization()');
    window.document.body.style.overflow = 'hidden';
    setdataVisualizationIsEnlarged(true);
    setDataVisualizationDetailsToEnlarge(content);
    const { width, height, top, left } = content.el.getBoundingClientRect();
    const scrollY = window.scrollY || window.pageYOffset || document.documentElement.scrollTop;
    const scrollX = window.scrollX || window.pageXOffset || document.documentElement.scrollLeft;

    enlargedDataVisualizationRef.current.style.width = `${width}px`;
    enlargedDataVisualizationRef.current.style.height = `${height}px`;
    enlargedDataVisualizationRef.current.style.top = `${top}px`;
    enlargedDataVisualizationRef.current.style.left = `${left}px`;

    placeholderElRef.current.style.width = `${width}px`;
    placeholderElRef.current.style.height = `${height}px`;
    placeholderElRef.current.style.top = `${top + scrollY}px`;
    placeholderElRef.current.style.left = `${left + scrollX}px`;

    setTimeout(() => {
      // enlargedDataVisualizationRef.current.classList.add('top-1/2', 'left-1/2', 'transform', '-translate-x-1/2', '-translate-y-1/2')
      enlargedDataVisualizationRef.current.style.top = null;
      enlargedDataVisualizationRef.current.style.left = null;
      setTimeout(() => {
        enlargedDataVisualizationRef.current.classList.add('w-[95vw]', 'h-[95vh]')
        enlargedDataVisualizationRef.current.style.width = null;
        enlargedDataVisualizationRef.current.style.height = null;
      }, 700)
    }, 10)
  }

  const collapseComponent = () => {
    const { width, height, top, left } = dataVisualizationDetailsToEnlarge.el.getBoundingClientRect();

    window.document.body.style.overflow = 'auto';
    enlargedDataVisualizationRef.current.style.width = `${width}px`;
    enlargedDataVisualizationRef.current.style.height = `${height}px`;
    setTimeout(() => {
      backdropRef.current.classList.remove('opacity-50');
      backdropRef.current.classList.add('opacity-0');
      enlargedDataVisualizationRef.current.classList.remove('transform', 'top-1/2', 'left-1/2', '-translate-x-1/2', '-translate-y-1/2')
      enlargedDataVisualizationRef.current.style.top = `${top}px`;
      enlargedDataVisualizationRef.current.style.left = `${left}px`;
      setTimeout(() => {
        placeholderElRef.current.style.width = null;
        placeholderElRef.current.style.height = null;
        placeholderElRef.current.style.top = null;
        placeholderElRef.current.style.left = null;
        setdataVisualizationIsEnlarged(false);
        setDataVisualizationDetailsToEnlarge(null);
      }, 800)
    }, 700)
  }

  return (
    <EnlargableDataVisualizationContext.Provider value={{
      dataVisualizationIsEnlarged,
      dataVisualizationDetailsToEnlarge,
      enlargeDataVisualization,
      updateEnlargableDataVisualization: setDataVisualizationDetailsToEnlarge
    }}>
      <div
        onClick={collapseComponent}
        className={`transition-opacity duration-700 ${dataVisualizationIsEnlarged ? 'fixed top-0 left-0 right-0 bottom-0 z-[48] bg-black cursor-pointer opacity-50' : 'opacity-0'}`}
        ref={backdropRef}
      />
      <Card
        className={`placeholder-el ${dataVisualizationIsEnlarged ? 'absolute bg-white z-[45]' : 'hidden'}`}
        style={{ backgroundImage: 'repeating-linear-gradient(45deg, rgb(229 231 235), rgb(229 231 235) 5px, rgba(255,255,255,0.5) 5px, rgba(255,255,255,0.5) 12px)' }}
        ref={placeholderElRef}
      />

      <DataVisualizationSettingsProvider settings={dataVisualizationDetailsToEnlarge?.settings}>
        <EnlargedDataVisualization
          openSheetWithContent={openSheetWithContent}
          collapseComponent={collapseComponent}
          enlargedDataVisualizationRef={enlargedDataVisualizationRef}
          dataVisualizationDetailsToEnlarge={dataVisualizationDetailsToEnlarge}
          dataVisualizationIsEnlarged={dataVisualizationIsEnlarged}
        />
      </DataVisualizationSettingsProvider>
      {children}
    </EnlargableDataVisualizationContext.Provider>
  );
}

export { EnlargableDataVisualizationProvider };
export default EnlargableDataVisualizationProvider;