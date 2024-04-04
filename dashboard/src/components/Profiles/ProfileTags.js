import { prettyDateTime } from "@/lib/utils/timeHelpers";
import { Tooltipable } from "../ui/tooltip";
import { BanIcon, TargetIcon, UserMinus, Users2Icon } from "lucide-react";
import { LuUserCheck } from "react-icons/lu";
import DottedUnderline from "../utils/DottedUnderline";

const CLASSES_BY_TAG_NAME = {
  'Active User': 'bg-green-50 hover:bg-green-100 text-green-700 ring-green-600/20',
  'Identified User': 'bg-blue-50 hover:bg-blue-100 text-blue-700 ring-blue-600/20',
  'Anonymous User': 'bg-yellow-50 hover:bg-yellow-100 text-yellow-700 ring-yellow-600/20',
}

const ICONS_BY_TAG_NAME = {
  'Active User': <LuUserCheck className='h-3 w-3 inline-block mr-1 text-green-700' />,
  'Identified User': <LuUserCheck className='h-3 w-3 inline-block mr-1 text-blue-700' />,
  'Anonymous User': <UserMinus className='h-3 w-3 inline-block mr-1 text-yellow-700' />,
}

const classesForTag = tag => {
  if (tag.removed_at) {
    return 'bg-gray-50 hover:bg-gray-100 text-gray-700 ring-gray-600/20 bg-striped'
  }
  return CLASSES_BY_TAG_NAME[tag.name] || 'bg-gray-50 hover:bg-gray-100 text-gray-700 ring-gray-600/20'
}

const iconForTag = tag => {
  if (tag.removed_at) {
    return <BanIcon className='h-3 w-3 inline-block mr-1 text-gray-700' />
  }
  return ICONS_BY_TAG_NAME[tag.name] || <Users2Icon className='h-3 w-3 inline-block mr-1 text-gray-700' />
}

const Badge = ({ tag }) => (
  <div className={`cursor-default transition-colors inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${classesForTag(tag)}`}>
    {iconForTag(tag)} {tag.name}
  </div>
)

export default function ProfileTags({ profileTags }) {
  return (
    <div className='flex items-center flex-wrap gap-2'>
      {profileTags.map(tag => {
        if (tag.removed_at) {
          return (
            <Tooltipable
              key={tag.id}
              content={
                <div className='text-xs'>
                  <span className='block'><strong className='block'>No longer an active tag.</strong></span>
                  <span classname='mt-2'>User was in the <DottedUnderline className='text-xs'>{tag.name}</DottedUnderline> cohort from {prettyDateTime(tag.applied_at)} to {prettyDateTime(tag.removed_at)}.</span>
                </div>
              }
            >
              <div>
                <Badge tag={tag} />
              </div>
            </Tooltipable>
          )
        } else if (tag.cohort_description || tag.cohort_name) {
          return (
            <Tooltipable
              key={tag.id}
              content={
                <div className='text-xs'>
                  <span className='block'>Automatically applied by the <strong>{tag.cohort_name}</strong> cohort on <strong>{prettyDateTime(tag.applied_at)}</strong>.</span>
                  {tag.cohort_description && <span className='block mt-2 text-gray-600'>{tag.cohort_description}</span>}
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