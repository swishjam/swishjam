import 'src/app/globals.css';

export const revalidate = 0;

export default async function RootLayout({ children, ...props}) {
  return (
    <html lang="en">
      <body className='bg-slate-50'>
        {children}
      </body>
    </html>
  );
}