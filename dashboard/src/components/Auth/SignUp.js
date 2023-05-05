'use client';
import { useEffect, useState } from 'react';
import cn from 'classnames';
import { Field, Form, Formik } from 'formik';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import * as Yup from 'yup';
import Logo from '@components/Logo';
import LoadingSpinner from '@components/LoadingSpinner';
import { useAuth } from '@components/AuthProvider';
import supabase from '@lib/supabase-browser';

const SignUpSchema = Yup.object().shape({
  email: Yup.string().email('Invalid email').required('Required'),
  company: Yup.string().required('Required'),
  password: Yup.string().required('Required'),
});

const SignUp = () => {
  const { session, setUserOrg } = useAuth();
  const router = useRouter();
  const [ errorMsg, setErrorMsg ] = useState(null);
  const [ successMsg, setSuccessMsg ] = useState(null);
  const [ loading, setLoading ] = useState(false); 

  useEffect(() => {
    if (session?.user && !loading) {
        router.push('/');
    }
  }, [session])

  async function signUp(formData) {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signUp({ email: formData.email, password: formData.password });
      const { user } = data;

      if (error) throw error;
      const newUser = await supabase.from('users').insert({ id: user.id, email: user.email });
      if (newUser.error) throw newUser.error;

      const newOrg = await supabase.from('organizations').insert({ name: formData.company, owner_uuid: user.id }).select();
      if (newOrg.error) throw newOrg.error;

      const newOrgConnection = await supabase.from('organization_users').insert({ organization_id: newOrg.data[0].id, user_id: user.id });
      if (newOrgConnection.error) throw newOrg.error;

      setUserOrg(newOrg.data[0]);
      router.push('/');
    } catch (error) {
      console.error('Sign Up Error', error);
      setLoading(false);
      setErrorMsg(error.message);
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
              company: '',
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
                      className={cn('input', errors.company && touched.company && 'border-red-400')}
                      id="company"
                      name="company"
                      placeholder="Company Name"
                      type="text"
                    />
                    {errors.company && touched.company ? (
                      <div className="text-red-600 mt-1 text-sm text-right">{errors.company}</div>
                    ) : null}
                  </div>
                </div>{/* End Company Name input */}

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
                </div>{/* end password input */}

                <div>
                  <button
                    type="submit"
                    className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 ${loading ? 'bg-gray-400' : 'bg-swishjam hover:bg-swishjam-dark' }`}
                    disabled={loading}
                  >
                    {loading ? <div className="h-6"><LoadingSpinner size={6} color='white'/></div> : 'Register'} 
                  </button>
                </div>

              </Form>
            )}
          </Formik> 
          {errorMsg && <div className="text-red-600 text-sm text-center">{errorMsg}</div>}
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

export default SignUp;