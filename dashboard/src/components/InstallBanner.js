'use client'

import { useState } from 'react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { DiCode } from 'react-icons/di'
import { AiOutlineCheck } from 'react-icons/ai'
import Modal from '@/components/utils/Modal';
import { CopyToClipboard } from "react-copy-to-clipboard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from '@/components/ui/button'
import { useAuthData } from '@/hooks/useAuthData';

const npmInstall = 'npm install @swishjam/react';
const reactImport = 'import { SwishjamProvider } from \'@swishjam/react\';'
const reactComponent = publicKey => (
  <div>
    <span className='block'>{`<SwishjamProvider apiKey='${publicKey}'>`}</span> 
    <span className='block ml-2'>{'<YourApp />'}</span> 
    <span className='block'>{'</SwishjamProvider>'}</span>
  </div>
)

const CopiableCodeSnippet = ({ snippet, copyContent, className = 'bg-slate-700 text-slate-100', copyPos = 'absolute'}) => {
  const [copyBtnTxt, setcopyBtnTxt] = useState('Copy');
  return (
    <div className={`${copyPos==='absolute' ? 'pr-24':''} relative rounded-xl p-4 break-all font-medium text-sm flex items-center justify-between ${className}`}>
      {snippet}
      <CopyToClipboard
        text={copyContent}
        className={`${copyPos==='absolute' ? 'absolute top-2 right-2':''} px-2.5 py-0.5 ml-8 text-slate-900 !border rounded-lg bg-white inline-flex items-center gap-x-1.5 cursor-pointer hover:text-swishjam`}
        >
        <button onClick={() => { setcopyBtnTxt('Copied!'); setTimeout(() => setcopyBtnTxt('Copy'), 2000) }}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="-ml-0.5 w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
          </svg>
          {copyBtnTxt}
        </button>
      </CopyToClipboard>
    </div>
  )
}

export default function InstallBanner ({ hidden }) {
  const [ isClosed, setIsClosed] = useState()
  const [ viewModal, setViewModal] = useState(false)
  const { workspaceApiKeys } = useAuthData();
 
  if(hidden) return <></>;

  return (
    <>
      <Modal isOpen={viewModal} onClose={() => setViewModal(false)} size="large">
        <div className="sm:flex sm:items-start"> 
          <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-swishjam sm:mx-0 sm:h-10 sm:w-10">
            <DiCode className="h-8 w-8 text-white" aria-hidden="true" />
          </div>
          <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
            <h3 className="text-base font-semibold leading-6 text-gray-900">
              Installation Instructions
            </h3>
            <Tabs defaultValue="react" className="w-full mt-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="react">React</TabsTrigger>
                <TabsTrigger value="cdn">Vanilla Javascript</TabsTrigger>
              </TabsList>
              <TabsContent value="react">
                <p className="text-sm text-gray-500 mt-4 pb-2">
                  <span className='font-medium'>Step 1:</span> Install our package into your app
                </p>
                {/*<span className='font-medium'>Step 1:</span><br />Connect your marketing site into Swishjam to capture top of funnel data about users and link user actiity from your app to docs, blogs, and more*/}
                <CopiableCodeSnippet
                  snippet={npmInstall}
                  copyContent={npmInstall}
                  className='bg-slate-700 text-slate-100 w-full'
                />
                <p className="text-sm text-gray-500 mt-4 pb-2">
                  <span className='font-medium'>Step 2:</span> Import into your _app.js or any pages that you need to capture metrics
                </p>
                <CopiableCodeSnippet
                  snippet={reactImport}
                  copyContent={reactImport}
                  className='bg-slate-700 text-slate-100 w-full mt-2'
                />
                <p className="text-sm text-gray-500 mt-4 pb-2">
                  <span className='font-medium'>Step 3:</span> Wrap your code in this provider <br /><br />
                  <span className='font-medium'>For Your Marketing Sites</span> (homepage, blog, docs, etc)
                </p>
                <CopiableCodeSnippet
                  snippet={reactComponent(workspaceApiKeys['marketing'])}
                  copyContent={reactComponent(workspaceApiKeys['marketing'])}
                  className='bg-slate-700 text-slate-100 w-full mt-2'
                />
                <p className="text-sm text-gray-500 mt-4 pb-2">
                  <span className='font-medium'>For Your App</span> (Product analytics)
                  
                </p>
                <CopiableCodeSnippet
                  snippet={reactComponent(workspaceApiKeys['product'])}
                  copyContent={reactComponent(workspaceApiKeys['product'])}
                  className='bg-slate-700 text-slate-100 w-full mt-2'
                />
                <div className='mt-8 mb-2'>
                  <Button onClick={() => {setViewModal(false);setIsClosed(true)}} className="w-full" variant="outline">
                    <AiOutlineCheck className="h-4 w-4 text-green-600 mr-2" aria-hidden="true" /> Done Integrating 
                  </Button>
                </div>
              </TabsContent> 
              <TabsContent value="cdn">
                <p className="text-sm text-gray-500 mt-4 pb-2">
                  <span className='font-medium'>Step 1:</span> Install Swishjam from the CDN or download the JS 
                </p>
                {/*<span className='font-medium'>Step 1:</span><br />Connect your marketing site into Swishjam to capture top of funnel data about users and link user actiity from your app to docs, blogs, and more*/}
                <CopiableCodeSnippet
                  snippet={npmInstall}
                  copyContent={npmInstall}
                  className='bg-slate-700 text-slate-100 w-full'
                />
                <p className="text-sm text-gray-500 mt-4 pb-2">
                  <span className='font-medium'>Step 2:</span> Import into your _app.js or any pages that you need to capture metrics
                </p>
                <CopiableCodeSnippet
                  snippet={reactImport}
                  copyContent={reactImport}
                  className='bg-slate-700 text-slate-100 w-full mt-2'
                />
                <div className='mt-8 mb-2'>
                  <Button onClick={() => {setViewModal(false);setIsClosed(true)}} className="w-full" variant="outline">
                    <AiOutlineCheck className="h-4 w-4 text-green-600 mr-2" aria-hidden="true" /> Done Integrating 
                  </Button>
                </div>
              </TabsContent> 
            </Tabs> 
            
          </div>
        </div>
      </Modal>
      {!isClosed &&
        <div className="fixed top-0 left-96 right-96 z-[50] h-14 bg-swishjam border-l border-b border-r px-4 py-4 rounded-b-md text-white drop-shadow-md flex">
          <div
            className='flex-auto cursor-pointer'
            onClick={() => setViewModal(true)} 
        >
          Get <span className='underline'>Swishjam installed on your site or app</span>
        </div>
        
        <button
          type="button"
          className="group hover:bg-swishjam-dark rounded-md duration-300 transition "
          onClick={() => setIsClosed(true)}
         >
          <span className="sr-only">Close</span>
          <XMarkIcon className="h-6 w-6" aria-hidden="true" />
        </button>
      </div>}
    </>
  )  
}