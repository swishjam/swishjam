import { ExternalLinkIcon, MoveUpRightIcon } from "lucide-react";
import Link from "next/link"

export const MaybeExternalLink = ({ children, href, newTab, useAnimation = true, ...props }) => {
  const isExternal = newTab || (!href.startsWith('/') && new URL(href).hostname !== 'app.swishjam.com');
  return (
    <Link
      href={href}
      target={isExternal ? '_blank' : props.target}
      {...props}
      className={`group text-blue-600 flex items-center space-x-1 cursor-pointer ${props.className}`}
    >
      <>
        <div className='group-hover:underline flex-grow truncate'>
          {children}
        </div>
        {useAnimation && (
          <div className='h-[1rem] w-[1rem] flex items-end flex-shrink relative'>
            <div className='absolute transform duration-300 h-0 w-[0.65rem] border-blue-600 group-hover:border group-hover:h-[0.65rem]' style={{ borderRadius: '0.175rem' }} />
            <MoveUpRightIcon className='absolute left-[2px] bottom-[2px] transform duration-500 h-[0.85rem] w-0 group-hover:w-[0.85rem]' />
          </div>
        )}
        {!useAnimation && (
          <div className='h-3 w-3 flex items-end flex-shrink'>
            <ExternalLinkIcon className='h-3 w-3' />
          </div>
        )}
      </>
    </Link>
  )
}