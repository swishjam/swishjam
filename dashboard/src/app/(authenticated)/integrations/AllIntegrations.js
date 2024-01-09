import CalComConnectView from '@/components/Integrations/ConnectViews/CalCom';
import ConnectStripeView from '@/components/Integrations/ConnectViews/Stripe';
import ConnectSlackView from '@/components/Integrations/ConnectViews/Slack';
import GithubConnectionView from '@/components/Integrations/ConnectViews/Github';
import GoogleSearchConsole from '@/components/Integrations/ConnectViews/GoogleSearchConsole';
import ResendConnectView from '@/components/Integrations/ConnectViews/Resend';
import IntercomConnectionView from '@/components/Integrations/ConnectViews/Intercom';

import CalComLogo from '@public/logos/calcom.png'
import GithubLogo from '@public/logos/github.png'
import GoogleSearchConsoleLogo from '@public/logos/Google-Search-Console.png'
import IntercomLogo from '@public/logos/intercom.png'
import ResendLogo from '@public/logos/resend.png'
import SlackLogo from '@public/logos/slack.svg'
import StripeLogo from '@public/logos/stripe.jpeg'
// import HubspotLogo from '@public/logos/hubspot.jpeg';
// import SalesforceLogo from '@public/logos/salesforce.png'
// import ZendeskLogo from '@public/logos/Zendesk.webp'

const AllSources = {
  Stripe: {
    img: StripeLogo,
    description: 'Connect your Stripe account to Swishjam to automatically import your Stripe customers and subscriptions.',
    connectComponent: onNewConnection => <ConnectStripeView onNewConnection={onNewConnection} />,
  },
  Resend: {
    img: ResendLogo,
    description: 'Connect your Resend account to enable Swishjam to capture email events.',
    connectComponent: onNewConnection => <ResendConnectView onNewConnection={onNewConnection} />,
    borderImage: true,
  },
  'Cal.com': {
    img: CalComLogo,
    description: 'Connect your Cal.com to Swishjam to automatically capture your Cal.com calendar events.',
    connectComponent: onNewConnection => <CalComConnectView onNewConnection={onNewConnection} />,
  },
  'Google Search Console': {
    img: GoogleSearchConsoleLogo,
    description: 'Connect your Google Search Console account to Swishjam to automatically import your Google Search Console data.',
    connectComponent: onNewConnection => <GoogleSearchConsole onNewConnection={onNewConnection} />,
    borderImage: true,
  },
  Intercom: {
    img: IntercomLogo,
    description: 'Connect your Intercom account to Swishjam to automatically import your Intercom data.',
    connectComponent: onNewConnection => <IntercomConnectionView onNewConnection={onNewConnection} />,
    borderImage: true,
  },
  Github: {
    img: GithubLogo,
    description: 'Connect your Github account to Swishjam to automatically import your Github data.',
    connectComponent: onNewConnection => <GithubConnectionView onNewConnection={onNewConnection} />,
  }
  // Hubspot: { img: HubspotLogo },
  // Salesforce: { img: SalesforceLogo },
  // Zendesk: {
  //   img: ZendeskLogo,
  //   borderImage: true,
  // },
}

const AllDestinations = {
  Slack: {
    name: 'Slack',
    img: SlackLogo,
    description: 'Connect your Slack account to Swishjam to push notifications and reports into Slack.',
    borderImage: false,
    connectComponent: onNewConnection => <ConnectSlackView onNewConnection={onNewConnection} />,
  },
}

export {
  AllSources,
  AllDestinations
}