'use client';
import { useState } from 'react';
import cn from 'classnames';
import { Field, Form, Formik } from 'formik';
import * as Yup from 'yup';
import Logo from '@components/Logo';
import { useAuth, VIEWS } from '@components/AuthProvider';
import supabase from '@lib/supabase-browser';

const SignUpSchema = Yup.object().shape({
  email: Yup.string().email('Invalid email').required('Required'),
  password: Yup.string().required('Required'),
});

const SignUp = () => {
  const { setView } = useAuth();
  const [ errorMsg, setErrorMsg ] = useState(null);
  const [ successMsg, setSuccessMsg ] = useState(null);

  async function signUp(formData) {
    const { error } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
    });

    if (error) {
      setErrorMsg(error.message);
    } else {
      setSuccessMsg('Success! Please check your email for further instructions.');
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
          <h2 class="text-2xl mb-6 text-gray-900">Sign in to your account</h2> 

          <Formik
            initialValues={{
              email: '',
              password: '',
            }}
            validationSchema={SignInSchema}
            onSubmit={signIn}
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

                <div>{/* password input */}
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <div className="mt-1">
                    <Field
                      className={cn('input', errors.password && touched.password && 'border-red-400')}
                      id="password"
                      name="password"
                      autoComplete="current-password"
                      type="password"
                    />
                    {errors.password && touched.password ? (
                      <div className="text-red-600 mt-1 text-sm text-right">{errors.password}</div>
                    ) : null}
                  </div>
                </div>{/* end password input */}

                <div>
                  <div className="flex items-center justify-between">
                    <div className="text-sm mb-4">
                      <div
                        onClick={() => setView(VIEWS.FORGOTTEN_PASSWORD)}
                        className="font-medium text-swishjam hover:text-swishjam-dark cursor-pointer"
                      >
                        Forgot your password?
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-swishjam hover:bg-swishjam-dark focus:outline-none focus:ring-2 focus:ring-offset-2"
                  >
                    Sign in
                  </button>
                </div>

              </Form>
            )}
          </Formik> 
          {errorMsg && <div className="text-red-600 text-sm text-center">{errorMsg}</div>}

        </div>
      </div>
    
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg">
        <p class="text-sm text-gray-600">
          Don't have an account? <span class="font-medium text-swishjam hover:text-swishjam-dark"><span className="cursor-pointer" onClick={() => setView(VIEWS.SIGN_UP)}>Sign up for free account</span></span>
        </p> 
      </div> 
    
    </div>
  )







  return (
    <div className="card">
      <h2 className="w-full text-center">Create Account</h2>
      <Formik
        initialValues={{
          email: '',
          password: '',
        }}
        validationSchema={SignUpSchema}
        onSubmit={signUp}
      >
        {({ errors, touched }) => (
          <Form className="column w-full">
            <label htmlFor="email">Email</label>
            <Field
              className={cn('input', errors.email && 'bg-red-50')}
              id="email"
              name="email"
              placeholder="jane@acme.com"
              type="email"
            />
            {errors.email && touched.email ? (
              <div className="text-red-600">{errors.email}</div>
            ) : null}

            <label htmlFor="email">Password</label>
            <Field
              className={cn('input', errors.password && touched.password && 'bg-red-50')}
              id="password"
              name="password"
              type="password"
            />
            {errors.password && touched.password ? (
              <div className="text-red-600">{errors.password}</div>
            ) : null}

            <button className="button-inverse w-full" type="submit">
              Submit
            </button>
          </Form>
        )}
      </Formik>
      {errorMsg && <div className="text-red-600">{errorMsg}</div>}
      {successMsg && <div className="text-black">{successMsg}</div>}
      <button
        className="link w-full"
        type="button"
        onClick={() => setView(VIEWS.SIGN_IN)}
      >
        Already have an account? Sign In.
      </button>
    </div>
  );
};

export default SignUp;
