import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import Link from "next/link"

export default function ItemizedList({ 
  title, 
  subTitle, 
  items, 
  leftItemHeaderKey, 
  leftItemSubHeaderKey, 
  rightItemKey, 
  rightItemKeyFormatter = value => value,
  fallbackAvatarGenerator,
  hoverable = true,
  linkFormatter,
  viewMoreUrl,
  noDataMsg
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
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
                ? (
                  <div className="flex items-center justify-center mt-4">
                    <p className="text-sm text-gray-700 leading-none">{noDataMsg || 'No data to display.'}</p>
                  </div>
                ) : (
                  items.slice(0, 5).map(item => (
                    <Link 
                      key={item.id}
                      href={linkFormatter ? linkFormatter(item) : '#'} 
                      className={`transition duration-500 flex items-center py-4 px-2 rounded-sm border border-transparent ${hoverable ? 'hover:bg-gray-50 hover:border-gray-200' : ''}`}
                    >
                        {(item.avatar_url || fallbackAvatarGenerator) && (
                          <Avatar className="h-9 w-9">
                            {
                            item.avatar_url 
                              ? <AvatarImage src={item.avatar_url} alt="Avatar" />
                              : <AvatarFallback>{fallbackAvatarGenerator(item)}</AvatarFallback>
                            }
                          </Avatar>
                        )}
                        <div className="ml-4 space-y-1 truncate">
                          <p className="text-sm font-medium leading-none">{item[leftItemHeaderKey]}</p>
                          <p className="text-sm text-muted-foreground">{item[leftItemSubHeaderKey]}</p>
                        </div>
                        <div className="ml-auto text-sm font-medium">{rightItemKeyFormatter(item[rightItemKey])}</div>
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