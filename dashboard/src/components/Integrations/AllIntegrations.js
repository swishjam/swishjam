import CalComConnectView from '@/components/Integrations/ConnectViews/CalCom';
import ConnectStripeView from '@/components/Integrations/ConnectViews/Stripe';
import ConnectSlackView from '@/components/Integrations/ConnectViews/Slack';
import GithubConnectionView from '@/components/Integrations/ConnectViews/Github';
import GoogleSearchConsole from '@/components/Integrations/ConnectViews/GoogleSearchConsole';
import IntercomConnectionView from '@/components/Integrations/ConnectViews/Intercom';
import ResendConnectView from '@/components/Integrations/ConnectViews/Resend';
import SegmentConnectionView from './ConnectViews/Segment';

import CalComLogo from '@public/logos/calcom.png'
import GithubLogo from '@public/logos/github.png'
import GoogleSearchConsoleLogo from '@public/logos/Google-Search-Console.png'
import IntercomLogo from '@public/logos/intercom.png'
import ResendLogo from '@public/logos/resend.png'
import ResendDestination from './ConnectViews/ResendDestination';
import SegmentLogo from '@public/logos/segment.svg'
import SlackLogo from '@public/logos/slack.svg'
import StripeLogo from '@public/logos/stripe.jpeg'
import SwishjamLogo from '@public/logos/swishjam.png'

const AllDataSources = {
  Stripe: {
    img: StripeLogo,
    description: 'Connect your Stripe account to Swishjam to automatically import your Stripe customers and subscriptions.',
    connectComponent: onNewIntegration => <ConnectStripeView onNewIntegration={onNewIntegration} />,
  },
  Resend: {
    img: ResendLogo,
    description: 'Connect your Resend account to enable Swishjam to capture email events.',
    connectComponent: onNewIntegration => <ResendConnectView onNewIntegration={onNewIntegration} />,
    borderImage: true,
  },
  'Cal.com': {
    img: CalComLogo,
    description: 'Connect your Cal.com to Swishjam to automatically capture your Cal.com calendar events.',
    connectComponent: onNewIntegration => <CalComConnectView onNewIntegration={onNewIntegration} />,
  },
  'Google Search Console': {
    img: GoogleSearchConsoleLogo,
    description: 'Connect your Google Search Console account to Swishjam to automatically import your Google Search Console data.',
    connectComponent: onNewIntegration => <GoogleSearchConsole onNewIntegration={onNewIntegration} />,
    borderImage: true,
  },
  Intercom: {
    img: IntercomLogo,
    description: 'Connect your Intercom account to Swishjam to automatically import your Intercom data.',
    connectComponent: onNewIntegration => <IntercomConnectionView onNewIntegration={onNewIntegration} />,
    borderImage: true,
  },
  Github: {
    img: GithubLogo,
    description: 'Connect your Github account to Swishjam to automatically import your Github data.',
    connectComponent: onNewIntegration => <GithubConnectionView onNewIntegration={onNewIntegration} />,
  },
  Segment: {
    img: SegmentLogo,
    description: 'Connect your Segment account to Swishjam to start sending your Segment events into Swishjam.',
    connectComponent: (onNewIntegration, onClose) => <SegmentConnectionView onNewIntegration={onNewIntegration} onClose={onClose} />,
    borderImage: false,
  },
  'Swishjam - Product Analytics': {
    img: SwishjamLogo,
  },
  'Swishjam - Web Analytics': {
    img: SwishjamLogo,
  },
}

const AllDestinations = {
  Slack: {
    name: 'Slack',
    img: SlackLogo,
    description: 'Connect your Slack account to Swishjam to push notifications and reports into Slack.',
    borderImage: false,
    connectComponent: onNewIntegration => <ConnectSlackView onNewIntegration={onNewIntegration} />,
  },
  Resend: {
    name: 'Resend',
    img: ResendLogo,
    description: 'Connect your Resend account to start sending emails upon key events.',
    borderImage: true,
    connectComponent: onNewIntegration => <ResendDestination onNewIntegration={onNewIntegration} />,
  }
}

export {
  AllDataSources,
  AllDestinations
}