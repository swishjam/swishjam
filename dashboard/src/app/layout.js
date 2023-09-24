import 'src/app/globals.css';
import { AuthenticationProvider } from '@/components/Auth/AuthenticationProvider'

export const revalidate = 0;

export default async function RootLayout({ children, ...props}) {
  return (
    <AuthenticationProvider>
        <html lang="en">
          <body className='bg-slate-50'>
            {children}
          </body>
        </html>
    </AuthenticationProvider>
  );
}