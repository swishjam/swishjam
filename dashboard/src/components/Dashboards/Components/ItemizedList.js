import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import Link from "next/link"
import EmptyState from "@/components/EmptyState"

export default function ItemizedList({
  avatarKey = 'gravatar_url',
  className,
  hoverable = true,
  fallbackAvatarGenerator,
  items,
  leftItemHeaderKey,
  leftItemSubHeaderKey,
  linkFormatter,
  maxNumItems,
  noDataMsg,
  rightItemKey,
  rightItemKeyFormatter = value => value,
  subTitle,
  subTitleFormatter,
  title,
  titleFormatter,
  viewMoreUrl,
}) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-sm font-medium cursor-default">{title}</CardTitle>
        {subTitle && <CardDescription>{subTitle}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div className="space-y-0">
          {[undefined, null].includes(items)
            ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div className="flex items-center py-4 px-2" key={i}>
                  <Skeleton className='rounded-full h-9 w-9' />
                  <div className="ml-4 space-y-1">
                    <Skeleton className='h-4 w-24' />
                    <Skeleton className='h-3 w-28' />
                  </div>
                  <Skeleton className='h-5 w-12 ml-auto' />
                </div>
              ))
            ) : (
              items.length === 0
                ? <EmptyState msg={noDataMsg || 'No data to display.'} />
                : (
                  items.slice(0, (maxNumItems || items.length)).map((item, idx) => (
                    <Link
                      key={idx}
                      href={linkFormatter ? linkFormatter(item) : '#'}
                      className={`transition duration-500 flex items-center py-4 px-2 rounded-sm border border-transparent ${hoverable ? 'hover:bg-gray-50 hover:border-gray-200' : ''}`}
                    >
                      {(item[avatarKey] || fallbackAvatarGenerator) && (
                        <Avatar className="h-9 w-9 border border-slate-200">
                          {
                            item[avatarKey]
                              ? <AvatarImage src={item[avatarKey]} alt="Avatar" />
                              : <AvatarFallback>{fallbackAvatarGenerator(item)}</AvatarFallback>
                          }
                        </Avatar>
                      )}
                      <div className="ml-4 space-y-1 truncate">
                        <p className="text-sm font-medium leading-none">
                          {
                            titleFormatter
                              ? titleFormatter(item)
                              : item[leftItemHeaderKey] || item[leftItemSubHeaderKey]
                          }
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {
                            subTitleFormatter
                              ? subTitleFormatter(item)
                              : item[leftItemHeaderKey] && item[leftItemSubHeaderKey]
                          }
                        </p>
                      </div>
                      {item[rightItemKey] && (
                        <div className="ml-auto text-sm font-medium">{rightItemKeyFormatter(item[rightItemKey])}</div>
                      )}
                    </Link>
                  ))
                )
            )
          }
        </div>
        {viewMoreUrl && items && items.length > 0 &&
          <Link href={viewMoreUrl}>
            <Button variant="outline" className="w-full mt-4">View More</Button>
          </Link>}
      </CardContent>
    </Card>
  )
}