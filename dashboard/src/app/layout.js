import 'src/app/globals.css';

export const revalidate = 0;

export default async function RootLayout({ children, ...props}) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}