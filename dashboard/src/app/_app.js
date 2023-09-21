// import 'focus-visible'
// import '@/styles/tailwind.css'
import { AuthenticationProvider } from '@/components/Auth/AuthenticationProvider'

export default function App({ Component, pageProps }) {
  return (
    // <SwishjamProvider apiKey={'swishjam-1b73e1bd-c8b19919'} apiEndpoint={'https://swishjam-prod-9a00662c420f75d5.onporter.run/api/v1/capture'}>
      <AuthenticationProvider>
        <Component {...pageProps} />
      </AuthenticationProvider>
    // </SwishjamProvider>
  )
}