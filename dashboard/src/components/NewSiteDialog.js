'use client';
import { useState, Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import cn from 'classnames';
import { Field, Form, Formik } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '@components/AuthProvider';
import LoadingSpinner from '@components/LoadingSpinner';
import supabase from '@lib/supabase-browser';

const CreateProjectSchema = Yup.object().shape({
  name: Yup.string().required('Required')
});

export default function NewProjectDialog({ isOpen, onClose, onComplete}) {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const { user, userOrg, projects, setProjects, updateCurrentProject } = useAuth();

  const createProject = async (formData, { resetForm }) => {
    setLoading(true);
    const newProject = await supabase.from('projects').insert({
      name: formData.name,
      created_by: user.id,
      organization_id: userOrg.id 
    }).select()
    const { data, error } = newProject; 
    if(error) {
      setLoading(false);
      setErrorMsg(error.message);
    } else {
      await fetch('/api/instrumentation/create', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ projectKey: data[0].public_id }) 
      });
      setProjects([...projects, data[0]]);
      updateCurrentProject(data[0]); 
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
                    Create a project 
                  </Dialog.Title>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Create a project to track your website performance.
                    </p>
                  </div>


                  <Formik
                    initialValues={{
                      name: '',
                    }}
                    validationSchema={CreateProjectSchema}
                    onSubmit={createProject}
                  >
                    {({ errors, touched }) => (
                      <Form className="space-y-6">
                        <div className='mt-4'> {/* Name input */}
                          <label htmlFor="url" className="block text-sm font-medium text-gray-700">
                            Project Name 
                          </label>
                          <div className="mt-1">
                            <Field
                              className={cn('input', errors.email && touched.email && 'border-red-400')}
                              id="name"
                              name="name"
                              placeholder="Swishjam"
                              type="text"
                            />
                            {errors.name && touched.name ? (
                              <div className="text-red-600 mt-1 text-sm text-right">{errors.email}</div>
                            ) : null}
                          </div>
                        </div>{/* End Name input */}

                        <div className="">
                          <button
                            type="submit"
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-swishjam hover:bg-swishjam-dark focus:outline-none focus:ring-2 focus:ring-offset-2"
                          >
                            {loading ? <div className="h-6"><LoadingSpinner size={6} color='white' /></div> : 'Create Project'}
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