import useAuthData from "@/hooks/useAuthData"

export default function GoogleSearchConsole() {
  const { token, email } = useAuthData();
  const clientId = '411519113339-t2fidfed57o2pbkd2mc203in85k87fms.apps.googleusercontent.com';
  const redirectHost = process.env.NEXT_PUBLIC_GOOGLE_OATUH_REDIRECT_HOST || 'capture.swishjam.com';
  const redirectUri = `https://${redirectHost}/oauth/google/callback`;
  const scope = 'https://www.googleapis.com/auth/webmasters.readonly'
  const authUrl = `https://accounts.google.com/o/oauth2/auth?client_id=${clientId}&login_hint=${email}&redirect_uri=${redirectUri}&scope=${scope}&state=${token}&response_type=code&access_type=offline&approval_prompt=force&include_granted_scopes=true`;

  return (
    <a
      className='w-full mt-6 flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 bg-swishjam hover:bg-swishjam-dark'
      href={authUrl}
    >
      Connect Google Search Console
    </a>
  )
}