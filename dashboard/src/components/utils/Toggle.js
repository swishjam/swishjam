import { Switch } from '@headlessui/react'

export default function Toggle({ checked, onChange, text, className, disabled }) {
  return (
    <Switch.Group className={className}>
      <div className='flex items-center'>
        <Switch.Label className='mr-4 cursor-pointer'>{text}</Switch.Label>
        <Switch
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          className={`${checked ? 'bg-swishjam' : 'bg-gray-200'} ${disabled ? 'cursor-not-allowed' : ''} relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out`}
        >
          <span className={`${checked ? 'translate-x-5' : 'translate-x-0'} pointer-events-none relative inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}>
            <span
              className={`${checked ? 'opacity-0 duration-100 ease-out' : 'opacity-100 duration-200 ease-in'} absolute inset-0 flex h-full w-full items-center justify-center transition-opacity`}
              aria-hidden="true"
            />
            <span
              className={`${checked ? 'opacity-100 duration-200 ease-in' : 'opacity-0 duration-100 ease-out'} absolute inset-0 flex h-full w-full items-center justify-center transition-opacity`}
              aria-hidden="true"
            />
          </span>
        </Switch>
      </div>
    </Switch.Group>
  )
}