import { Card, CardTitle } from "@/components/ui/card";
import Divider from "@/components/Divider";

export default function CardSection({ title, sections, topRightItem }) {
  return (
    <div className='mt-8'>
      <Card className='px-8 py-4'>
        <CardTitle className='my-2 grid grid-cols-4'>
          <span className='col-span-3'>{title}</span>
          {topRightItem && <span className='text-right'>{topRightItem}</span>}
        </CardTitle>
        <Divider />
        {sections.map(({ title, subTitle, body, disableFlex = false }, i) => (
          <div key={i} className={`w-full ${disableFlex ? '' : 'flex'} items-center justify-between ${i === 0 ? 'pb-4' : 'py-4'} ${i === sections.length - 1 ? '' : 'border-b border-gray-200'}`}>
            {title && (
              <div className='max-w-[60%]'>
                <span className='text-md text-gray-700 block'>{title}</span>
                {subTitle && <span className='text-xs text-gray-500'>{subTitle}</span>}
              </div>
            )}
            {body}
          </div>
        ))}
      </Card>
    </div>
  )
}