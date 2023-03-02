import { AuthProvider } from 'src/components/AuthProvider';
import createClient from 'src/lib/supabase-server';

import 'src/styles/globals.css';
import '@tremor/react/dist/esm/tremor.css';

// do not cache this layout
export const revalidate = 0;

export default async function RootLayout({ children }) {
  const supabase = createClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const accessToken = session?.access_token || null;

  return (
    <html lang="en">
      <body>
        <AuthProvider accessToken={accessToken}>
          <div className='mb-10'>
            {children}
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
