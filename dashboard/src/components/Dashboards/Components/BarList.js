import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import ConditionalCardWrapper from "./ConditionalCardWrapper";

const LoadingState = () => (
  <div>
    <div className="flex justify-between space-x-6">
      <div className="relative w-full">
        <Skeleton className="w-[80%] rounded h-9 mb-2" />
        <Skeleton className="w-[75%] rounded h-9 mb-2" />
        <Skeleton className="w-[40%] rounded h-9 mb-2" />
        <Skeleton className="w-[35%] rounded h-9 mb-2" />
        <Skeleton className="w-[10%] rounded h-9 mb-2" />
      </div>
    </div>
  </div>
)

export default function BarList({ title, items, includeCard = true }) {
  if (!items) {
    return (
      <ConditionalCardWrapper title={title} includeCard={includeCard}>
        <LoadingState />
      </ConditionalCardWrapper>
    )
  };

  const total = items.reduce((acc, item) => acc + item.value, 0);
  const sortedItems = items.sort((item1, item2) => item2.value - item1.value);

  return (
    <ConditionalCardWrapper title={title} includeCard={includeCard}>
      <div>
        <div className="flex justify-between space-x-6">
          <div className="relative w-full">
            {sortedItems.sort().map(item => (
              <div
                key={item.name}
                className="bg-sky-200 rounded flex items-center h-9 mb-2 transition duration-300 ease-in-out"
                style={{ width: (item.value / total) * 100 + '%', transition: 'all 1s ease 0s' }}
              >
                <div className="absolute max-w-full flex left-2">
                  {item.icon && <item.icon className="h-4 w-4 mr-2" />}
                  {item.href
                    ? (
                      <Link className="hover:underline delay-75 duration-300 transition whitespace-nowrap truncate text-sm font-medium leading-none" href={item.href} target="_blank">
                        {item.name}
                      </Link>
                    ) : (
                      <p className="whitespace-nowrap truncate text-sm font-medium leading-none">
                        {item.name}
                      </p>
                    )
                  }
                </div>
              </div>
            ))}
          </div>
          <div className="text-right min-w-min">
            {sortedItems.map(item => (
              <div
                key={item.name}
                className="flex justify-end items-center h-9 mb-2"
              >
                <p className="whitespace-nowrap truncate text-sm text-muted-foreground">
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ConditionalCardWrapper>
  )
}