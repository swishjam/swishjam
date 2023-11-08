import {
  ArrowRightOnRectangleIcon,
  BriefcaseIcon,
  Cog6ToothIcon,
  DocumentTextIcon,
  EllipsisVerticalIcon,
  UserCircleIcon,
  UserGroupIcon
} from "@heroicons/react/24/outline";
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuthData } from '@/hooks/useAuthData'
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function UserFlyout() {
  const { email, currentWorkspaceName, currentWorkspaceId, workspaces } = useAuthData();
  const currentPath = usePathname();

  return (
    <DropdownMenu className='w-full'>
      <DropdownMenuTrigger asChild>
        <Button variant='outline' className='w-full border-none flex justify-between'>
          <div className='flex items-center truncate'>
            <UserCircleIcon className='text-gray-400 group-hover:text-swishjam duration-300 transition h-6 w-6 shrink-0 inline-block mr-2' />
            <span className='truncate text-gray-700'>{email}</span>
          </div>
          <EllipsisVerticalIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel>
          <span className='block font-medium text-gray-900'>{email}</span>
          <span className='block font-light text-gray-700'>{currentWorkspaceName}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <Link href='/settings'>
            <DropdownMenuItem className='cursor-pointer py-3'>
              <Cog6ToothIcon className='h-5 w-5 text-gray-700 mr-2' />
              Settings
              <DropdownMenuShortcut>⌘,</DropdownMenuShortcut>
            </DropdownMenuItem>
          </Link>
          <Link href='/team'>
            <DropdownMenuItem className='cursor-pointer py-3'>
              <UserGroupIcon className='h-5 w-5 text-gray-700 mr-2' />
              Team Management
            </DropdownMenuItem>
          </Link>
          {workspaces && workspaces.length > 1 && (
            <DropdownMenuSub>
              <DropdownMenuSubTrigger className='py-3'>
                <BriefcaseIcon className='h-5 w-5 text-gray-700 mr-2' />
                Change workspaces
              </DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent>
                  {workspaces.map(workspace => {
                    if (workspace.id === currentWorkspaceId) {
                      return (
                        <DropdownMenuItem key={workspace.id} className='flex text-swishjam px-8 py-4 hover:text-swishjam'>
                          <Avatar className="h-10 w-10 mr-4 bg-gray-300">
                            <AvatarFallback className="text-xs">
                              {workspace.name.split(' ').map(w => w[0].toUpperCase()).join('')}
                            </AvatarFallback>
                          </Avatar>
                          {workspace.name}
                        </DropdownMenuItem>
                      )
                    } else {
                      return (
                        <Link key={workspace.id} href={`/change-workspaces/${workspace.id}?redirectTo=${currentPath}`}>
                          <DropdownMenuItem className='flex cursor-pointer px-8 py-4'>
                            <Avatar className="h-10 w-10 mr-4 bg-gray-300">
                              <AvatarFallback className="text-xs">
                                {workspace.name.split(' ').map(w => w[0].toUpperCase()).join('')}
                              </AvatarFallback>
                            </Avatar>
                            {workspace.name}
                          </DropdownMenuItem>
                        </Link>
                      )
                    }
                  })}
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>
          )}
          <Link href='https://docs.swishjam.com' target='_blank'>
            <DropdownMenuItem className='cursor-pointer py-3'>
              <DocumentTextIcon className='h-5 w-5 text-gray-700 mr-2' />
              Docs
            </DropdownMenuItem>
          </Link>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <Link href='/logout'>
          <DropdownMenuItem className='cursor-pointer py-3'>
            <ArrowRightOnRectangleIcon className='h-5 w-5 text-gray-700 mr-2' />
            Log out
          </DropdownMenuItem>
        </Link>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}