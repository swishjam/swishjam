import useAuthData from "@/hooks/useAuthData"

export default function IntercomConnectionView() {
  const { token } = useAuthData();
  const intercomClientId = process.env.NEXT_PUBLIC_INTERCOM_CLIENT_ID || '7e8e5fe4-30f3-48f0-8312-43f2886c69a7';

  return (
    <a
      className='w-full mt-6 flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 bg-swishjam hover:bg-swishjam-dark'
      href={`https://app.intercom.com/oauth?client_id=${intercomClientId}&state=${token}`}
    >
      Connect Intercom
    </a>
  )
}