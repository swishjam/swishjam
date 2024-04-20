
import SwishjamLogo from '@components/Logo'
import { LuCode, LuHotel, LuMail, LuUserCircle } from 'react-icons/lu';
import { SiIntercom } from 'react-icons/si'
import { BsStripe } from 'react-icons/bs'

const SlackIcon = ({ className }) => <img src={'/logos/slack.svg'} className={className} />
const createHeading = (icon, label) => <span className='flex items-center capitalize'>{icon} {label}</span>
const createCustomEvent = value => ({
  value,
  label: eventDisplayValue(value),
  icon: INTEGRATION_PREFIXES[value.replace(/^event\./, '').split('.')[0]]?.icon || SwishjamLogo
})
const eventDisplayValue = event => (
  event.replace(/^(event\.)/, '')
    .replace(/^(user\.|organization\.|intercom\.|stripe\.|resend\.|github\.|slack\.|cal\.)/, '')
    .replaceAll('swishjam_bot.', ' Swishjam Bot - ')
    .replaceAll('.', ' ')
    .replaceAll('_', ' ')
    .replaceAll(' url', ' URL')
    .replace(/ id(?= |$)/g, ' ID')
)

const INTEGRATION_PREFIXES = {
  user: { icon: LuUserCircle, title: 'User Properties' },
  organization: { icon: LuHotel, title: 'Organization Properties' },
  intercom: { icon: SiIntercom },
  stripe: { icon: BsStripe },
  resend: { icon: LuMail },
  github: { icon: null },
  slack: { icon: SlackIcon },
  cal: { icon: null },
}

export function formatSelectedValueForCombobox(option) {
  const sanitizedOption = option.replace(/^event\./, '');
  const prefix = sanitizedOption.split('.')[0]
  const { icon: Icon } = INTEGRATION_PREFIXES[prefix] || {};
  return (
    <span className='flex items-center capitalize'>
      {Icon ? <Icon className='w-4 h-4 mr-2 ' /> : <SwishjamLogo className='w-4 h-4 mr-2' />}
      <span className='truncate'>{eventDisplayValue(sanitizedOption)}</span>
    </span>
  );
}

export function formatEventOptionsForCombobox(eventData, options = {}) {
  let formattedEventData = []

  const nonIntegrationEvents = eventData.filter(event => {
    const sanitizedEvent = event.replace(/^event\./, '');
    return !INTEGRATION_PREFIXES[sanitizedEvent.split('.')[0]]
  });
  if (nonIntegrationEvents.length > 0) {
    formattedEventData.push({
      heading: createHeading(<SwishjamLogo className='h-4 mr-2' />, options.swishjamEventsHeading || "Swishjam Events"),
      items: nonIntegrationEvents.map(createCustomEvent)
    })
  }

  const integrationEvents = eventData.filter(event => {
    const sanitizedEvent = event.replace(/^event\./, '');
    return INTEGRATION_PREFIXES[sanitizedEvent.split('.')[0]]
  });
  const integrationEventsByPrefix = {};

  integrationEvents.forEach(event => {
    const sanitizedEvent = event.replace(/^event\./, '');
    const splitEventName = sanitizedEvent.split('.');
    // ignores events like `event.organization`
    if (splitEventName.length < 2) return;
    const prefix = splitEventName[0];
    integrationEventsByPrefix[prefix] = integrationEventsByPrefix[prefix] || [];
    integrationEventsByPrefix[prefix].push(event);
  })

  Object.keys(integrationEventsByPrefix).forEach(prefix => {
    const { icon: Icon, title } = INTEGRATION_PREFIXES[prefix] || {};
    if ((integrationEventsByPrefix[prefix] || []).length > 0) {
      formattedEventData.push({
        heading: createHeading(Icon && <Icon className='w-4 h-4 mr-2' />, title || `${prefix.replace('.', ' ')} events`),
        items: integrationEventsByPrefix[prefix].map(createCustomEvent)
      })
    }
  })

  return formattedEventData;
}