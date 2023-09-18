import 'src/app/globals.css';
import '/node_modules/react-grid-layout/css/styles.css';
import '/node_modules/react-resizable/css/styles.css';

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