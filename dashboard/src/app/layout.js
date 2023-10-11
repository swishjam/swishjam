import 'src/app/globals.css';
import '/node_modules/react-grid-layout/css/styles.css';
import '/node_modules/react-resizable/css/styles.css';
import { AuthenticationProvider } from '@/providers/AuthenticationProvider'
import { SwishjamProvider } from '@swishjam/react'

export const revalidate = 0;

export default async function RootLayout({ children }) {
  return (
    <SwishjamProvider apiKey='swishjam_prdct-48f6c7b4273c515a'>
      <AuthenticationProvider>
        <html lang="en">
          <body className='bg-slate-50'>
            {children}
          </body>
        </html>
      </AuthenticationProvider>
    </SwishjamProvider>
  );
}