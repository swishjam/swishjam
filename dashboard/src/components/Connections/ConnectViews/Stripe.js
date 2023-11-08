import useAuthData from "@/hooks/useAuthData"

export default function StripeConnectionView() {
  const { token } = useAuthData();
  const redirectUrlHost = process.env.NEXT_PUBLIC_STRIPE_REDIRECT_URL_HOST || 'https://capture.swishjam.com';
  const stripeClientId = process.env.NEXT_PUBLIC_STRIPE_CLIENT_ID || 'ca_ONSwyVU8wOJ9ZvJ06DmBcx83cvJsGujT';

  return (
    <a
      className='w-full mt-6 flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 bg-swishjam hover:bg-swishjam-dark'
      href={`https://connect.stripe.com/oauth/authorize?response_type=code&client_id=${stripeClientId}&scope=read_write&redirect_uri=${redirectUrlHost}/oauth/stripe/callback&state={"authToken":"${token}"}`}
    >
      Connect Stripe
    </a>
  )
}