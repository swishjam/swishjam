'use client';
import { useState } from 'react';
import cn from 'classnames';
import { Field, Form, Formik } from 'formik';
import { useRouter } from 'next/navigation';
import * as Yup from 'yup';
import Logo from '@components/Logo';
import LoadingSpinner from '@components/LoadingSpinner';
import { SpeedTestAPI } from '@/lib/api-client/speed-test';

const SignUpSchema = Yup.object().shape({ urlToTest: Yup.string().required('Required') });

const SignUp = () => {
  const router = useRouter();
  const [errorMsg, setErrorMsg] = useState(null);
  const [loading, setLoading] = useState(false);

  async function signUp(formData) {
    try {
      setLoading(true);
      const { testId, jsonUrl, error } = await SpeedTestAPI.initiate({ url: formData.urlToTest });
      debugger;
      setLoading(false);
      if(error) {
        setErrorMsg(error)
      } else {
        router.push(`/speed-test/${testId}`);
      }
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
        <div className="bg-white py-8 px-4 sm:border sm:rounded-lg sm:px-10 shadow-sm text-center">
          <h2 className="text-2xl mb-6 text-gray-900">Run page speed audit</h2>

          <Formik
            initialValues={{ urlToTest: '' }} validationSchema={SignUpSchema} onSubmit={signUp}>
            {({ errors, touched }) => (
              <Form className="">
                <div> 
                  <div className="mt-1">
                    <Field
                      className={cn('input', errors.urlToTest && touched.urlToTest && 'border-red-400')}
                      id="urlToTest"
                      name="urlToTest"
                      placeholder="URL to audit"
                      type="text"
                      required
                    />
                    {errors.urlToTest && touched.urlToTest ? (<div className="text-red-600 mt-1 text-sm text-left">{errors.urlToTest}</div>) : null}
                  </div>
                </div>
                {errorMsg && <div className="text-red-600 text-sm mt-4">{errorMsg}</div>}
                <button
                  type="submit"
                  className="w-full flex justify-center py-2 px-4 mt-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-swishjam hover:bg-swishjam-dark focus:outline-none focus:ring-2 focus:ring-offse6-2"
                >
                  {loading ? <div className="h-6"><LoadingSpinner size={6} color='white' /></div> : 'Run page speed audit'}
                </button>
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </div>
  )
};

export default SignUp;





// 'use client';

// import AuthenticatedView from "@/components/AuthenticatedView";
// import { Field, Form } from 'formik';
// import { useState } from "react";

// export default function SpeedTest() {
//   const [loading, setLoading] = useState(false);
//   const [urlToTest, setUrlToTest] = useState();

//   const initiateSpeedTest = () => {

//   }

//   return (
//     <AuthenticatedView>
//       <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-8 text-center">
//         {/* <div className='grid grid-cols-2 mt-8 flex items-center'> */}
//         <h1 className='text-4xl'>Speed Test</h1>
//         <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg">

//           <form className="space-y-6" onSubmit={initiateSpeedTest}>
//             <div className="sm:col-span-4">
//               <label htmlFor="username" className="block text-sm font-medium leading-6 text-gray-900">
//                 URL to Test
//               </label>
//               <div className="mt-2">
//                 <div className="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600 sm:max-w-md">
//                   <input
//                     type="text"
//                     name="url"
//                     id="username"
//                     className="block flex-1 border-0 bg-transparent py-1.5 pl-1 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
//                     placeholder="www.google.com"
//                   />
//                 </div>
//               </div>
//             </div>
//             <div>
//               <button
//                 type="submit"
//                 className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-swishjam hover:bg-swishjam-dark focus:outline-none focus:ring-2 focus:ring-offse6-2"
//               >
//                 {loading ? <div className="h-6"><LoadingSpinner size={6} color='white' /></div> : 'Register'}
//               </button>
//             </div>
//           </form>

//         </div>
//       </main>
//     </AuthenticatedView>
//   );
// }