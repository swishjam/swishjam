'use client';

import { ArrowsPointingInIcon } from '@heroicons/react/24/outline';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import EnlargableDashboardComponentContext from '@/contexts/EnlargableDashboardComponentContext';
import { InfoIcon } from 'lucide-react';
import SettingsDropdown from '@/components/Dashboards/Components/SettingsDropdown';
import { useRef, useState } from 'react';
import useSheet from '@/hooks/useSheet';

const EnlargableDashboardComponentProvider = ({ children }) => {
  const { openSheetWithContent } = useSheet();

  const [componentIsEnlarged, setComponentIsEnlarged] = useState(false);
  const [componentDetailsToEnlarge, setComponentDetailsToEnlarge] = useState(null);

  const enlargedComponentRef = useRef();
  const backdropRef = useRef();
  const placeholderElRef = useRef();

  const enlargeComponent = content => {
    if (!content) throw new Error('You must pass a component to enlargeComponent()');
    setComponentIsEnlarged(true);
    setComponentDetailsToEnlarge(content);
    const { width, height, top, left } = content.el.getBoundingClientRect();
    const scrollY = window.scrollY || window.pageYOffset || document.documentElement.scrollTop;
    const scrollX = window.scrollX || window.pageXOffset || document.documentElement.scrollLeft;

    enlargedComponentRef.current.style.width = `${width}px`;
    enlargedComponentRef.current.style.height = `${height}px`;
    enlargedComponentRef.current.style.top = `${top}px`;
    enlargedComponentRef.current.style.left = `${left}px`;

    placeholderElRef.current.style.width = `${width}px`;
    placeholderElRef.current.style.height = `${height}px`;
    placeholderElRef.current.style.top = `${top + scrollY}px`;
    placeholderElRef.current.style.left = `${left + scrollX}px`;

    setTimeout(() => {
      enlargedComponentRef.current.classList.add('top-1/2', 'left-1/2', 'transform', '-translate-x-1/2', '-translate-y-1/2')
      enlargedComponentRef.current.style.top = null;
      enlargedComponentRef.current.style.left = null;
      setTimeout(() => {
        enlargedComponentRef.current.classList.add('w-[90vw]')
        enlargedComponentRef.current.style.width = null;
        enlargedComponentRef.current.style.height = null;
      }, 700)
    }, 10)
  }

  const collapseComponent = () => {
    const { width, height, top, left } = componentDetailsToEnlarge.el.getBoundingClientRect();

    enlargedComponentRef.current.style.width = `${width}px`;
    enlargedComponentRef.current.style.height = `${height}px`;
    setTimeout(() => {
      backdropRef.current.classList.remove('opacity-50');
      backdropRef.current.classList.add('opacity-0');
      enlargedComponentRef.current.classList.remove('transform', 'top-1/2', 'left-1/2', '-translate-x-1/2', '-translate-y-1/2')
      enlargedComponentRef.current.style.top = `${top}px`;
      enlargedComponentRef.current.style.left = `${left}px`;
      setTimeout(() => {
        placeholderElRef.current.style.width = null;
        placeholderElRef.current.style.height = null;
        placeholderElRef.current.style.top = null;
        placeholderElRef.current.style.left = null;
        setComponentIsEnlarged(false);
        setComponentDetailsToEnlarge(null);
      }, 800)
    }, 700)
  }

  return (
    <EnlargableDashboardComponentContext.Provider value={{
      componentIsEnlarged,
      componentDetailsToEnlarge,
      enlargeComponent,
      updateComponent: setComponentDetailsToEnlarge
    }}>
      <div
        onClick={collapseComponent}
        className={`transition-opacity duration-700 ${componentIsEnlarged ? 'fixed top-0 left-0 right-0 bottom-0 z-[48] bg-black cursor-pointer opacity-50' : 'opacity-0'}`}
        ref={backdropRef}
      />
      <Card
        className={`placeholder-el ${componentIsEnlarged ? 'absolute bg-white z-[45]' : 'hidden'}`}
        style={{ backgroundImage: 'repeating-linear-gradient(45deg, rgb(229 231 235), rgb(229 231 235) 5px, rgba(255,255,255,0.5) 5px, rgba(255,255,255,0.5) 12px)' }}
        ref={placeholderElRef}
      />
      <Card
        className={`${componentIsEnlarged ? 'group fixed z-[49] bg-white shadow-lg transition-all duration-1000' : 'hidden'}`}
        ref={enlargedComponentRef}
      >
        <CardHeader className="space-y-0 pb-2">
          <CardTitle className="text-sm font-medium cursor-default">
            <div className='flex justify-between items-center'>
              <div className='flex items-center gap-x-1'>
                {componentDetailsToEnlarge?.title}
                {componentDetailsToEnlarge?.DocumentationContent && (
                  <a
                    onClick={() => openSheetWithContent({ title: componentDetailsToEnlarge?.title, content: componentDetailsToEnlarge?.DocumentationContent })}
                    className='cursor-pointer text-gray-500 hover:text-gray-700 transition-all rounded-full hover:bg-gray-100 p-1'
                  >
                    <InfoIcon className='h-3 w-3' />
                  </a>
                )}
              </div>
              <div className='flex justify-end flex-shrink gap-x-1'>
                <button
                  onClick={collapseComponent}
                  className='p-1 flex items-center justify-center outline-0 ring-0 duration-300 transition text-gray-500 cursor-pointer hover:bg-gray-100 rounded-md'
                >
                  <ArrowsPointingInIcon className='outline-0 ring-0 h-5 w-5 text-gray-500 cursor-pointer' />
                </button>
                {componentDetailsToEnlarge?.AdditionalHeaderActions}
                {componentDetailsToEnlarge?.includeSettingsDropdown && componentDetailsToEnlarge?.settings && <SettingsDropdown options={componentDetailsToEnlarge?.settings} />}
              </div>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {componentDetailsToEnlarge?.children}
        </CardContent>
      </Card>
      {children}
    </EnlargableDashboardComponentContext.Provider>
  );
}

export { EnlargableDashboardComponentProvider };
export default EnlargableDashboardComponentProvider;