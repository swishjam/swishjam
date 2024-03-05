
import Logo from '@components/Logo'
const SlackIcon = ({ className }) => <img src={'/logos/slack.svg'} className={className} />
import { LuCode, LuMail } from 'react-icons/lu';
import { SiIntercom } from 'react-icons/si'
import { BsStripe } from 'react-icons/bs'

const createHeading = (icon, label) => (<span className='flex items-center capitalize'>{icon} {label}</span>)
const createCustomEvent = (string, icon, label) => { return { value: string, label: label || string, icon }} 
const integrationPrefixes = [
  { val: 'intercom.', icon: SiIntercom },
  { val: 'stripe.', icon: BsStripe },
  { val: 'resend.', icon: LuMail },
  { val: 'github.', icon: null },
  { val: 'slack.', icon: SlackIcon },
  { val: 'cal.', icon: null }
]

export function FormatSelectedValue (option) {
  let prefix = integrationPrefixes.find(prefix => option.startsWith(prefix.val))
  if(prefix) {
    return (<span className='flex items-center capitalize'>{prefix.icon && <prefix.icon size={14} className='h-4 mr-2 '/>} {option.replace(prefix.val, "").replaceAll('.', ' ')}</span>);  
  } else {
    return (<span className='flex items-center capitalize'><Logo className='h-4 mr-2'/> {option.replaceAll('_', ' ')}</span>);  
  }
}

export function FormatEventData (eventData) {
  // This is garbage code, Linus forgive me
  let formattedEventData = []

  let customEventStrings = eventData.filter(event => !event.startsWith("intercom.") && !event.startsWith("resend.") && !event.startsWith("stripe.") && !event.startsWith("github.") && !event.startsWith("cal."));
  if(customEventStrings.length > 0) {
    let customEvents = { heading: createHeading(<Logo className='h-4 mr-2'/>, "Swishjam SDK Events"), items: []}
    customEventStrings.forEach(event => {
      customEvents.items.push(createCustomEvent(event, LuCode, event.replaceAll('_', ' ')))
    })
    formattedEventData.push(customEvents)
  }

  integrationPrefixes.forEach(prefix => {
    let filteredEventStrings = eventData.filter(event => event.startsWith(prefix.val));
    if(filteredEventStrings.length > 0) {
      let customEvents = { heading: createHeading((prefix.icon && <prefix.icon size={14} className='h-4 mr-2 '/>), `${prefix.val.replace('.', ' ')} events`), items: []}
      filteredEventStrings.forEach(event => {
        customEvents.items.push(createCustomEvent(event, prefix.icon, event.replace(prefix.val, "").replaceAll('.', ' ')))
      })
      formattedEventData.push(customEvents)
    }
  })

  return formattedEventData;
}