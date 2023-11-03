import useAuthData from "@/hooks/useAuthData"

export default function StripeConnectionView() {
  const { token } = useAuthData();
  const url = `https://app.swishjam.com`  
  
  return (
    <a
      className='w-full mt-6 flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 bg-swishjam hover:bg-swishjam-dark'
      href={`https://connect.stripe.com/oauth/authorize?response_type=code&client_id=ca_ONSwwqiCfDZHQzg1hURYH5pfTVj1PrAe&scope=read_write&redirect_uri=${url}/oauth/stripe/callback&state={"authToken":"${token}"}`}
    >
      Connect Stripe
    </a>
  )
}