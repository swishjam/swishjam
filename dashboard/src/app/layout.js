import { AuthProvider } from 'src/components/AuthProvider';
import createClient from 'src/lib/supabase-server';
import PHProvider from './providers';

import 'src/styles/globals.css';
//import '@tremor/react/dist/esm/tremor.css';

// do not cache this layout
export const revalidate = 0;

export default async function RootLayout({ children, ...props}) {
  // const supabase = createClient();

  // //console.log(props)
  // const {
  //   data: { session },
  // } = await supabase.auth.getSession();

  // const accessToken = session?.access_token || null;

  return (
    <html lang="en">
      <body>
        {/* <AuthProvider accessToken={accessToken}> */}
          {children}
        {/* </AuthProvider> */}
      </body>
    </html>
  );
}