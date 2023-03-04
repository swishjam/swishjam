'use client';
import { useState, Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import cn from 'classnames';
import { Field, Form, Formik } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '@components/AuthProvider';
import LoadingSpinner from '@components/LoadingSpinner';
import supabase from '@lib/supabase-browser';

const CreateSiteSchema = Yup.object().shape({
  url: Yup.string().required('Required')
});

export default function NewSiteDialog({ isOpen, onClose, onComplete, organizationId}) {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const { allSites, setAllSites, setCurrentSite } = useAuth();

  const createSite = async (formData, { resetForm }) => {
    console.log(formData) 
    setLoading(true);
    const newSite = await supabase.from('sites').insert({
      url: formData.url,
      organization_id: organizationId
    }).select()
    const { data, error } = newSite; 
    if(error) {
      setLoading(false);
      setErrorMsg(error.message);
    } else {
      setAllSites([...allSites, data[0]]);
      setCurrentSite(data[0]); 
      setLoading(false);
      resetForm(); 
      onComplete(data);
    }
  }

  return (
    <>
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={() => onClose()}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-start justify-center pt-24 p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900"
                  >
                    Create a site to track
                  </Dialog.Title>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      more copy goes here! Create a site to track your website performance.
                    </p>
                  </div>


                  <Formik
                    initialValues={{
                      url: '',
                    }}
                    validationSchema={CreateSiteSchema}
                    onSubmit={createSite}
                  >
                    {({ errors, touched }) => (
                      <Form className="space-y-6">
                        <div> {/* URL input */}
                          <label htmlFor="url" className="block text-sm font-medium text-gray-700">
                            Site URL
                          </label>
                          <div className="mt-1">
                            <Field
                              className={cn('input', errors.email && touched.email && 'border-red-400')}
                              id="url"
                              name="url"
                              placeholder="https://useswishjam.com"
                              type="url"
                            />
                            {errors.email && touched.email ? (
                              <div className="text-red-600 mt-1 text-sm text-right">{errors.email}</div>
                            ) : null}
                          </div>
                        </div>{/* End URL input */}

                        <div className="">
                          <button
                            type="submit"
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-swishjam hover:bg-swishjam-dark focus:outline-none focus:ring-2 focus:ring-offset-2"
                          >
                            {loading ? <div className="h-6"><LoadingSpinner size={6} color='white' /></div> : 'Sign In'}
                          </button>
                        </div>

                      </Form>
                    )}
                  </Formik>
                  {errorMsg && <div className="text-red-600 text-sm text-center mt-4">{errorMsg}</div>}
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  )

}