import { ExternalLinkIcon } from "lucide-react";
import Link from "next/link"

export const MaybeExternalLink = ({ children, href, ...props }) => {
  const isExternal = !href.startsWith('/') && new URL(href).hostname !== 'app.swishjam.com';
  return (
    <Link
      href={href}
      target={isExternal ? '_blank' : props.target}
      className={`group text-blue-600 flex items-center space-x-1 cursor-pointer ${props.className}`}
      {...props}
    >
      <>
        <div className='group-hover:underline'>
          {children}
        </div>
        <ExternalLinkIcon className='h-3 w-3' />
      </>
    </Link>
  )
}