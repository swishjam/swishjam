import { AuthProvider } from 'src/components/AuthProvider';
import createClient from 'src/lib/supabase-server';
import { redirect } from 'next/navigation';
import 'src/styles/globals.css';

// do not cache this layout
export const revalidate = 0;

export default async function RootLayout({ children }) {
  const supabase = createClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const accessToken = session?.access_token || null;

  if(accessToken) {
    redirect('/');
  }

  console.info('Future Self: Develop in Incognitor BC Nextjs derps out with chrome extensions messing with the UI in dev mode')

  return (
    <html lang="en">
      <body>
        <AuthProvider accessToken={accessToken}>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}