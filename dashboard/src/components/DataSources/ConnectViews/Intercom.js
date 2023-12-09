import useAuthData from "@/hooks/useAuthData"

export default function IntercomConnectionView() {
  const { token } = useAuthData();
  const intercomClientId = process.env.NEXT_PUBLIC_INTERCOM_CLIENT_ID;

  return (
    <a
      className='w-full mt-6 flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 bg-swishjam hover:bg-swishjam-dark'
      href={`https://app.intercom.com/oauth?client_id=${intercomClientId}&state=${token}`}
    >
      Connect Intercom
    </a>
  )
}