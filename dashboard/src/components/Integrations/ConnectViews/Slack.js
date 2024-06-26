import { getToken } from '@/lib/auth'

export default function SlackConnectionView() {
  const authToken = getToken();
  const redirectHost = process.env.NEXT_PUBLIC_SLACK_REDIRECT_HOST || 'capture.swishjam.com';
  const redirectUrl = `https://${redirectHost}/oauth/slack/callback`;
  const clientId = process.env.NEXT_PUBLIC_SLACK_CLIENT_ID || '3567839339057.6156356819525';
  const scopes = ['channels:read', 'channels:join', 'chat:write', 'commands', 'groups:read', 'groups:write', 'im:read', 'im:write', 'mpim:read', 'reactions:write', 'users.profile:read', 'users:read', 'users:read.email'];
  const oauthLink = `https://slack.com/oauth/v2/authorize?scope=${scopes.join(',')}&redirect_uri=${redirectUrl}&client_id=${clientId}&state=${authToken}`;
  return (
    <a
      className='w-full mt-6 flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 bg-swishjam hover:bg-swishjam-dark'
      href={oauthLink}
    >
      Connect Slack
    </a>
  )
}