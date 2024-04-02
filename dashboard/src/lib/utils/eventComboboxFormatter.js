
import Logo from '@components/Logo'
const SlackIcon = ({ className }) => <img src={'/logos/slack.svg'} className={className} />
import { LuCode, LuHotel, LuMail, LuUserCircle } from 'react-icons/lu';
import { SiIntercom } from 'react-icons/si'
import { BsStripe } from 'react-icons/bs'

const createHeading = (icon, label) => <span className='flex items-center capitalize'>{icon} {label}</span>
const createCustomEvent = ({ value, label, icon }) => ({ value, label: label, icon })
const integrationPrefixes = {
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
  const sanitizedOption = option.startsWith('event.') ? option.replace('event.', '') : option;
  const prefix = sanitizedOption.split('.')[0]
  const { icon: Icon } = integrationPrefixes[prefix] || {};
  return (
    <span className='flex items-center capitalize'>
      {Icon ? <Icon className='w-4 h-4 mr-2 ' /> : <Logo className='w-4 h-4 mr-2' />}
      <span className='truncate'>{sanitizedOption.replace(integrationPrefixes[prefix] ? prefix : '', '').replaceAll('.', ' ').replaceAll('_', ' ')}</span>
    </span>
  );
}

export function formatEventDataForCombobox(eventData) {
  let formattedEventData = []

  const nonIntegrationEvents = eventData.filter(event => {
    if (event.startsWith('event.')) {
      const sanitizedEvent = event.replace('event.', '');
      return !integrationPrefixes[sanitizedEvent.split('.')[0]]
    } else {
      return !integrationPrefixes[event.split('.')[0]]
    }
  });
  if (nonIntegrationEvents.length > 0) {
    formattedEventData.push({
      heading: createHeading(<Logo className='h-4 mr-2' />, "Swishjam Events"),
      items: nonIntegrationEvents.map(event => {
        let label = event.replaceAll('swishjam_bot.', ' Swishjam Bot - ').replaceAll('event.', '').replaceAll('_', ' ');
        if (label.startsWith('event.')) label = label.replace('event.', '');
        return createCustomEvent({ value: event, icon: LuCode, label, })
      })
    })
  }

  const integrationEvents = eventData.filter(event => {
    if (event.startsWith('event.')) {
      const sanitizedEvent = event.replace('event.', '');
      return integrationPrefixes[sanitizedEvent.split('.')[0]]
    } else {
      return integrationPrefixes[event.split('.')[0]]
    }
  });
  const integrationEventsByPrefix = {};

  integrationEvents.forEach(event => {
    const sanitizedEvent = event.startsWith('event.') ? event.replace('event.', '') : event;
    const prefix = sanitizedEvent.split('.')[0];
    integrationEventsByPrefix[prefix] = integrationEventsByPrefix[prefix] || [];
    integrationEventsByPrefix[prefix].push(event);
  })

  Object.keys(integrationEventsByPrefix).forEach(prefix => {
    const { icon: Icon, title } = integrationPrefixes[prefix] || {};
    formattedEventData.push({
      heading: createHeading(Icon && <Icon className='w-4 h-4 mr-2' />, title || `${prefix.replace('.', ' ')} events`),
      items: integrationEventsByPrefix[prefix].map(event => {
        const label = (event.startsWith('event.') ? event.replace('event.', '') : event).replace(prefix, '').replaceAll('.', ' ').replaceAll('_', ' ');
        return createCustomEvent({ value: event, icon: Icon, label })
      })
    })
  })

  return formattedEventData;
}