import { prettyDateTime } from "@/lib/utils/timeHelpers";
import { Tooltipable } from "../ui/tooltip";
import { BanIcon } from "lucide-react";
import { LuUserCheck } from "react-icons/lu";
import DottedUnderline from "../utils/DottedUnderline";

const CLASSES = ['bg-blue-50 hover:bg-blue-100 text-blue-700 ring-blue-600/20', 'bg-red-50 hover:bg-red-100 text-red-700 ring-red-600/20', 'bg-yellow-50 hover:bg-yellow-100 text-yellow-700 ring-yellow-600/20', 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 ring-indigo-600/20', 'bg-pink-50 hover:bg-pink-100 text-pink-700 ring-pink-600/20', 'bg-purple-50 hover:bg-purple-100 text-purple-700 ring-purple-600/20', 'bg-green-50 hover:bg-green-100 text-green-700 ring-green-600/20', 'bg-gray-50 hover:bg-gray-100 text-gray-700 ring-gray-600/20', 'bg-teal-50 hover:bg-teal-100 text-teal-700 ring-teal-600/20', 'bg-orange-50 hover:bg-orange-100 text-orange-700 ring-orange-600/20'];

const CLASSES_BY_TAG_NAME = {
  'Active User': 'bg-green-50 hover:bg-green-100 text-green-700 ring-green-600/20',
}

const ICONS_BY_TAG_NAME = {
  'Active User': <LuUserCheck className='h-3 w-3 inline-block mr-1 text-green-700' />,
}

const classesForTag = tag => {
  if (tag.removed_at) {
    return 'bg-gray-50 hover:bg-gray-100 text-gray-700 ring-gray-600/20'
  }
  return CLASSES_BY_TAG_NAME[tag.name] || CLASSES[Math.floor(Math.random() * CLASSES.length)]
}

const iconForTag = tag => {
  if (tag.removed_at) {
    return <BanIcon className='h-3 w-3 inline-block mr-1 text-gray-700' />
  }
  return ICONS_BY_TAG_NAME[tag.name]
}

const Badge = ({ tag }) => (
  <div className={`cursor-default transition-colors inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${classesForTag(tag)}`}>
    {iconForTag(tag)} {tag.name}
  </div>
)

export default function ProfileTags({ profileTags }) {
  return (
    <div className='flex flex-wrap gap-2'>
      {profileTags.map(tag => {
        if (tag.removed_at) {
          return (
            <Tooltipable
              key={tag.id}
              content={
                <div className='text-xs'>
                  <span className='block'><strong className='block'>No longer an active tag.</strong></span>
                  <span classname='mt-2'>User was in the <DottedUnderline className='text-xs'>{tag.name}</DottedUnderline> segment from {prettyDateTime(tag.applied_at)} to {prettyDateTime(tag.removed_at)}.</span>
                </div>
              }
            >
              <div>
                <Badge tag={tag} />
              </div>
            </Tooltipable>
          )
        } else if (tag.user_segment_description || tag.user_segment_name) {
          return (
            <Tooltipable
              key={tag.id}
              content={
                <div className='text-xs'>
                  <span className='block'>Automatically applied by the <strong>{tag.user_segment_name}</strong> segment on <strong>{prettyDateTime(tag.applied_at)}</strong>.</span>
                  {tag.user_segment_description && <span className='block mt-2 text-gray-600'>{tag.user_segment_description}</span>}
                </div>
              }
            >
              <div>
                <Badge tag={tag} />
              </div>
            </Tooltipable>
          )
        } else {
          return <Badge key={tag.id} tag={tag} />
        }
      })}
    </div>
  )
}