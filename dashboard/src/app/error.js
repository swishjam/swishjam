'use client'

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";
import Logo from "@/components/Logo";

export default function CustomError({ error, reset }) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <div className='h-screen w-screen flex items-center justify-center'>
      <div className="text-center">
        <Logo className="h-12 inline-block" words={true} center={true} />
        <h5 className='text-gray-700 text-2xl mt-2'>Well that's embarassing.</h5>
        <h5 className='text-gray-700 text-md'>We're working on a fix as we speak.</h5>
        <button
          className="inline-flex items-center mt-4 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-swishjam hover:bg-swishjam-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-swishjam"
          onClick={reset}
        >
          Let's try this again
        </button>
      </div>
    </div>
  );
}