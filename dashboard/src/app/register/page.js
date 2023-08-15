'use client';

import { useEffect, useState } from 'react';
import cn from 'classnames';
import { Field, Form, Formik } from 'formik';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import * as Yup from 'yup';
import Logo from '@components/Logo';
import LoadingSpinner from '@components/LoadingSpinner';
import { signUserUp, useAuthData } from '@components/AuthProvider';

const SignUpSchema = Yup.object().shape({
  email: Yup.string().email('Invalid email').required('Required'),
  organizationName: Yup.string().required('Required'),
  organizationUrl: Yup.string().required('Required'),
  password: Yup.string().required('Required'),
});

export default function SignUp() {
  const { isLoggedIn } = useAuthData();
  const router = useRouter();
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isLoggedIn !== null && isLoggedIn) {
      router.push('/');
    }
  }, [isLoggedIn])

  async function signUp(formData) {
    setLoading(true);
    const { token, user, organization, error } = await signUserUp(formData);
    debugger;
    setLoading(false);
    if (error) {
      setErrorMsg(error);
    } else {
      router.push('/');
      console.log('Got a user and token???', user, token);
    }
  }

  return (
    <div className="flex min-h-full flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg">
        <div className="mx-auto w-52">
          <Logo className="h-12 inline-block" words={true} />
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg">
        <div className="bg-white py-8 px-4 sm:border sm:rounded-lg sm:px-10 shadow-sm">
          <h2 className="text-2xl mb-6 text-gray-900">Register</h2>

          <Formik
            initialValues={{
              email: '',
              organizationName: '',
              organizationUrl: '',
              password: '',
            }}
            validationSchema={SignUpSchema}
            onSubmit={signUp}
          >
            {({ errors, touched }) => (
              <Form className="space-y-6">
                <div> {/* Email input */}
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email address
                  </label>
                  <div className="mt-1">
                    <Field
                      className={cn('input', errors.email && touched.email && 'border-red-400')}
                      id="email"
                      name="email"
                      placeholder="Email address"
                      type="email"
                    />
                    {errors.email && touched.email ? (
                      <div className="text-red-600 mt-1 text-sm text-right">{errors.email}</div>
                    ) : null}
                  </div>
                </div>{/* End Email input */}

                <div> {/* Company Name input */}
                  <label htmlFor="company" className="block text-sm font-medium text-gray-700">
                    Company Name
                  </label>
                  <div className="mt-1">
                    <Field
                      className={cn('input', errors.organizationName && touched.organizationName && 'border-red-400')}
                      id="organizationName"
                      name="organizationName"
                      placeholder="Company Name"
                      type="text"
                    />
                    {errors.organizationName && touched.organizationName ? (
                      <div className="text-red-600 mt-1 text-sm text-right">{errors.organizationName}</div>
                    ) : null}
                  </div>
                </div>{/* End Company Name input */}

                <div>
                  <label htmlFor="company" className="block text-sm font-medium text-gray-700">
                    Company URL
                  </label>
                  <div className="mt-1">
                    <div
                      className={`flex w-full rounded-md border px-1 py-1 text-base text-gray-900 placeholder-gray-500 shadow-sm focus:border-swishjam focus:ring-swishjam ${errors.organizationUrl && touched.organizationUrl ? 'border-red-400' : 'border-gray-300'}`}
                    >
                      <span className="flex select-none items-center pl-3 py-0.5 text-gray-500 sm:text-sm">https://</span>
                      <Field
                        className="block flex-1 border-0 bg-transparent pl-1 py-0.5 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                        id="organizationUrl"
                        name="organizationUrl"
                        placeholder="google.com"
                        type="text"
                      />
                    </div>
                    {errors.organizationUrl && touched.organizationUrl ? (
                      <div className="text-red-600 mt-1 text-sm text-right">{errors.organizationUrl}</div>
                    ) : null}
                  </div>
                </div>

                <div>{/* password input */}
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <div className="mt-1">
                    <Field
                      className={cn('input', errors.password && touched.password && 'border-red-400')}
                      id="password"
                      name="password"
                      autoComplete="new-password"
                      type="password"
                    />
                    {errors.password && touched.password ? (
                      <div className="text-red-600 mt-1 text-sm text-right">{errors.password}</div>
                    ) : null}
                  </div>
                </div>

                <div>
                  <button
                    type="submit"
                    className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 ${loading ? 'bg-gray-400' : 'bg-swishjam hover:bg-swishjam-dark'}`}
                    disabled={loading}
                  >
                    {loading ? <div className="h-6"><LoadingSpinner size={6} color='white' /></div> : 'Register'}
                  </button>
                </div>

              </Form>
            )}
          </Formik>
          {errorMsg && <div className="text-red-600 text-sm text-center mt-2">{errorMsg}</div>}
          {successMsg && <div className="text-black">{successMsg}</div>}

        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg">
        <p className="text-sm text-gray-600">
          Already have an account? <span className="font-medium text-swishjam hover:text-swishjam-dark"><Link href="/">Sign in</Link></span>
        </p>
      </div>

    </div>
  )
};