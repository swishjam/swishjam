'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import Link from "next/link";
import Logo from '@components/Logo'
import { Button } from '@/components/ui/button';
import { Label } from "@/components/ui/label"
import { LuPlus, LuArrowUpRight, LuGitCommit } from "react-icons/lu";


export default function AddNewEventTriggerModal({trigger, onPause, onResume, onDelete, className, ...props}) {

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          className={`duration-300 transition-all ml-2 flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 bg-swishjam hover:bg-swishjam-dark`}
        >
          <LuPlus className="h-4 w-4 mt-0.5 mr-2" />
          New Event Trigger
        </Button>        
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Trigger</DialogTitle>
          <DialogDescription>
            Automtate workflows based on Swishjam events.
          </DialogDescription>
        </DialogHeader>
        <Label htmlFor="username" className="mt-4">
          Choose Trigger Type 
        </Label>
        <div className="flex flex-col gap-4">
          <Link href="/automations/event-triggers/new?type=Slack" className="group border p-4 border-gray-200 rounded-sm flex items-center gap-x-1.5 hover:bg-accent duration-300 transition-all">
            <Logo className="h-8" />
            <h2 className="min-w-0 text-xs font-semibold leading-6 text-gray-600">
              <span className="truncate">Swishjam Event</span>
            </h2>
            <LuGitCommit size={20} className="w-8" />
            <img src={'/logos/slack.svg'} className="h-8 w-8 text-gray-600" /> 
            <h2 className="ml-1 min-w-0 text-xs font-semibold leading-6 text-gray-600">
              Slack Message
            </h2>
            <div className="grow realtive">
              <LuArrowUpRight className="group-hover:text-swishjam float-right w-4 h-4" />
            </div> 
          </Link>
          <Link href="/automations/event-triggers/new?type=ResendEmail" className="group border p-4 border-gray-200 rounded-sm flex items-center gap-x-1.5 hover:bg-accent duration-300 transition-all">
            <Logo className="h-8" />
            <h2 className="min-w-0 text-xs font-semibold leading-6 text-gray-600">
              <span className="truncate">Swishjam Event</span>
            </h2>
            <LuGitCommit size={20} className="w-8" />
            <img src={'/logos/resend.png'} className="h-8 w-8 text-gray-600" /> 
            <h2 className="ml-1 min-w-0 text-xs font-semibold leading-6 text-gray-600">
              Send Email 
            </h2>
            <div className="grow realtive">
              <LuArrowUpRight className="group-hover:text-swishjam float-right w-4 h-4" />
            </div> 
          </Link>
        </div>
      </DialogContent>
    </Dialog>
  )
}