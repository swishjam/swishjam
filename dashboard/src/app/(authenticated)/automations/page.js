'use client';

import { useState, useEffect } from "react";
import EmptyState from '@/components/utils/PageEmptyState';
import { SwishjamAPI } from "@/lib/api-client/swishjam-api";
import { Skeleton } from "@/components/ui/skeleton";
import AutomationRow from "@/components/Automations/AutomationRow";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "src/lib/utils"
import Link from "next/link";
import { LuPlus } from "react-icons/lu";
import PageWithHeader from "@/components/utils/PageWithHeader";

export default function AutomationsListPage() {
  const [automations, setAutomations] = useState();

  useEffect(() => {
    SwishjamAPI.Automations.list().then(setAutomations)
  }, []);

  return (
    <PageWithHeader
      title="Automations"
      buttons={[
        <Link href="/automations/new" className={cn(buttonVariants({ variant: "swishjam" }))}>
          <LuPlus className="h-5 w-5" />
          New Automation
        </Link>
      ]}
    >
      <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0 mt-8">
        <div className="flex-1">
          <div>
            <div className="flex items-center justify-between">
            </div>
            {automations === undefined ? (
              <div>
                <ul role="list" className="w-full space-y-2 mt-8">
                  {Array.from({ length: 5 }).map((_, i) => <Skeleton className='w-full h-10' key={i} />)}
                </ul>
              </div>
            ) : (
              automations.length > 0 ? (
                <div>
                  <ul role="list" className="w-full space-y-2 mt-8">
                    {automations.sort((a, b) => new Date(a.created_at) - new Date(b.created_at)).map(automation => (
                      <AutomationRow
                        key={automation.id}
                        automation={automation}
                        onPause={newAutomation => setAutomations([...automations.filter(a => a.id !== automation.id), newAutomation])}
                        onResume={newAutomation => setAutomations([...automations.filter(a => a.id !== automation.id), newAutomation])}
                        onDelete={() => setAutomations(automations.filter(a => a.id !== automation.id))}
                      />
                    ))}
                  </ul>
                </div>
              ) : <EmptyState title="No Automations" />
            )
            }
          </div>

        </div>
      </div>
    </PageWithHeader>
  )
}

