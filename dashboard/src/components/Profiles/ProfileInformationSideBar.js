import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import EnrichedDataItem from "@/components/Profiles/EnrichedDataItem";
import { Lock } from "lucide-react";
import { humanizeVariable, safelyParseURL } from "@/lib/utils/misc";
import { Tooltipable } from '@/components/ui/tooltip'
import { prettyDateTime } from "@/lib/utils/timeHelpers";
import ProfileTags from "./ProfileTags";
import CopiableText from "../utils/CopiableText";

const shouldHumanizeValue = key => (
  !key.toLowerCase().endsWith('_id') &&
  !key.toLowerCase().includes('referrer') &&
  !key.toLowerCase().includes('url') &&
  !key.toLowerCase().includes('email') &&
  !key.toLowerCase().includes('gclid')
)

export default function ProfileInformationSideBar({ userData, hasStripeIntegrationEnabled, hasProfileEnrichmentEnabled }) {
  const hasNoEnrichmentData = !userData.enrichment_data?.job_title &&
    !userData.enrichment_data?.twitter_url &&
    !userData.enrichment_data?.linkedin_url &&
    !userData.enrichment_data?.company_name &&
    !userData.enrichment_data?.company_size &&
    !userData.enrichment_data?.company_industry &&
    !userData.enrichment_data?.company_location_metro;

  const metadataKeysToDisplay = Object.keys(userData.metadata || {}).filter(key => !['name', 'firstName', 'first_name', 'lastName', 'last_name', 'initial_landing_page_url', 'initial_referrer_url', 'gravatar_url'].includes(key))

  return (
    <Card className='col-span-4 relative'>
      <CardHeader>
        <div className='flex items-center'>
          <Avatar className="h-16 w-16 mr-4 border border-slate-200">
            {userData.gravatar_url
              ? <AvatarImage src={userData.gravatar_url} alt="Avatar" />
              : <AvatarFallback className="text-lg">{userData.initials || userData.id.slice(0, 2)}</AvatarFallback>
            }
          </Avatar>
          <div>
            <CardTitle className='text-2xl flex items-center'>
              {userData.full_name || userData.email || userData.user_unique_identifier || (<>Anonymous User<span className='italic ml-1'>{userData.id.slice(0, 6)}</span></>)}
              {!userData.full_name && userData.email && <CopiableText value={userData.email} className='ml-2' iconOnly={true} />}
            </CardTitle>
            {userData.full_name && (
              <div className='flex items-center'>
                <CardDescription className='text-base text-gray-500'>
                  {userData.email}
                </CardDescription>
                <CopiableText value={userData.email} className='ml-2' copyIconClassName='h-3 w-3 text-gray-500' iconOnly={true} />
              </div>
            )}
            {userData.tags.length > 0 && (
              <div className='mt-4'>
                <ProfileTags profileTags={userData.tags} />
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="border-t border-slate-100 w-full" />
        <div>
          <div className="mt-4">
            <dl className="grid grid-cols-1">
              <div className="px-4 py-2 col-span-1 sm:px-0 grid grid-cols-2 cursor-default">
                <dt className="text-sm font-medium leading-6 text-gray-900">Full name</dt>
                <dd className="text-sm leading-6 text-gray-700 text-right">
                  {userData.full_name || (userData.enrichment_data.first_name || '') + (userData.enrichment_data.last_name || '') || '-'}
                </dd>
              </div>
              <div className="px-4 py-2 col-span-1 sm:px-0 grid grid-cols-2 cursor-default">
                <dt className="text-sm font-medium leading-6 text-gray-900">Unique Identifier</dt>
                <dd className="text-sm leading-6 text-gray-700 text-right">
                  {userData.user_unique_identifier || '-'}
                </dd>
              </div>
              <div className="px-4 py-2 col-span-1 grid grid-cols-2 sm:px-0 cursor-default">
                <dt className="text-sm font-medium leading-6 text-gray-900">First seen</dt>
                <dd className="text-sm leading-6 text-gray-700 text-right">
                  {(userData.first_seen_at_in_web_app || userData.created_at)
                    ? prettyDateTime(userData.first_seen_at_in_web_app || userData.created_at, { month: 'short' })
                    : '-'
                  }
                </dd>
              </div>
              <div className="px-4 py-2 col-span-1 grid grid-cols-2 sm:px-0 cursor-default">
                <dt className="text-sm font-medium leading-6 text-gray-900">Last seen</dt>
                <dd className="text-sm leading-6 text-gray-700 text-right">
                  {userData.last_seen_at_in_web_app ? prettyDateTime(userData.last_seen_at_in_web_app, { month: 'short' }) : '-'}
                </dd>
              </div>
              <div className="px-4 py-2 col-span-1 grid grid-cols-2 sm:px-0">
                <dt className="text-sm font-medium leading-6 text-gray-900">Organizations</dt>
                <dd className="text-sm leading-6 text-gray-700 text-right flex flex-col">
                  {userData.organizations.length === 0
                    ? '-'
                    : userData.organizations.map((org, i) => (
                      <div>
                        <a
                          key={org.id}
                          href={`/organizations/${org.id}`}
                          className={`${i > 0 ? 'mt-2' : ''} inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10 hover:underline`}
                        >
                          {org.name}
                        </a>
                      </div>
                    ))
                  }
                </dd>
              </div>
              <>
                <EnrichedDataItem
                  title='Initial Referrer'
                  enrichmentData={{ initial_referrer: userData.metadata.initial_referrer_url }}
                  enrichmentKey='initial_referrer'
                  formatter={referrer => (
                    <Tooltipable content={referrer}>
                      <span className="flex items-center justify-end max-w-full">
                        <span className='truncate'>{referrer === '' ? 'Direct' : referrer}</span>
                      </span>
                    </Tooltipable>
                  )}
                />
                <EnrichedDataItem
                  title='Initial Landing Page'
                  enrichmentData={{ initial_landing_page_url: userData.metadata.initial_landing_page_url }}
                  enrichmentKey='initial_landing_page_url'
                  formatter={url => (
                    <Tooltipable content={url}>
                      <a
                        className="hover:underline hover:text-blue-400 transition duration-500 flex items-center justify-end max-w-full"
                        href={url}
                        target="_blank"
                        title={url}
                      >
                        <span className='truncate'>
                          {url}
                        </span>
                        <ArrowTopRightOnSquareIcon className='inline-block ml-1 h-3 w-3' />
                      </a>
                    </Tooltipable>
                  )}
                />
                {metadataKeysToDisplay.map((key, i) => (
                  <div className="px-4 py-2 col-span-1 grid grid-cols-2 sm:px-0">
                    <dt className="text-sm font-medium leading-6 text-gray-900">{humanizeVariable(key)}</dt>
                    <dd className="text-sm leading-6 text-gray-700 text-right flex flex-col">
                      {!shouldHumanizeValue(key) ? userData.metadata[key] : humanizeVariable([undefined, null].includes(userData.metadata[key]) ? '-' : userData.metadata[key].toString())}
                    </dd>
                  </div>
                ))}
                <div className='relative'>
                  {userData.active_subscriptions && userData.active_subscriptions.length === 0 && hasStripeIntegrationEnabled === false ? (
                    <div className='group cursor-default relative'>
                      <Tooltipable
                        direction="right"
                        content={
                          <div className='px-4 py-2 text-sm text-gray-500'>
                            Payment data is not enabled. <a href='/integrations' target='_blank' className='text-blue-400 hover:underline'>Connect your Stripe account</a> to begin importing your payments data to Swishjam.
                          </div>
                        }
                      >
                        <div className='absolute w-1/2 top-0 bottom-0 right-0 flex items-center justify-center group z-10'>
                          <Lock className='h-6 w-6 text-gray-400' />
                        </div>
                      </Tooltipable>
                      <div className="px-4 py-2 col-span-1 sm:px-0 grid grid-cols-2">
                        <dt className="text-sm font-medium leading-6 text-gray-900">Subscription Plan</dt>
                        <dd className="text-sm leading-6 text-gray-700 flex justify-end blur-sm group-hover:blur-md transition-all">
                          <span className="blur-md inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                            Gold Plan
                          </span>
                        </dd>
                      </div>
                      <div className="px-4 py-2 col-span-1 sm:px-0 grid grid-cols-2">
                        <dt className="text-sm font-medium leading-6 text-gray-900">Subscription MRR</dt>
                        <dd className="text-sm leading-6 text-gray-700 flex justify-end blur-sm group-hover:blur-md transition-all">
                          <span className="blur-md inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                            $79.99
                          </span>
                        </dd>
                      </div>

                      <div className="px-4 py-2 col-span-1 sm:px-0 grid grid-cols-2">
                        <dt className="text-sm font-medium leading-6 text-gray-900">Lifetime Value</dt>
                        <dd className="text-sm leading-6 text-gray-700 flex justify-end blur-sm group-hover:blur-md transition-all">
                          <span className="blur-md inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                            $1,234.56
                          </span>
                        </dd>
                      </div>
                    </div>
                  ) : (
                    <>
                      <EnrichedDataItem
                        title='Subscription Plan'
                        enrichmentData={userData}
                        enrichmentKey='active_subscriptions'
                        formatter={subscriptions => {
                          if (!subscriptions || subscriptions.length === 0) {
                            return '-'
                          } else {
                            return [].concat(...subscriptions.map(({ subscription_items }) => (
                              subscription_items.map(item => (
                                <span
                                  key={item.id}
                                  className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20"
                                >
                                  {item.product_name}
                                </span>
                              ))
                            )))
                          }
                        }}
                      />
                      <EnrichedDataItem
                        title='Subscription MRR'
                        enrichmentData={userData}
                        enrichmentKey='current_mrr_in_cents'
                        formatter={mrr => (
                          <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                            {(mrr / 100).toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                          </span>
                        )}
                      />
                      <EnrichedDataItem
                        title='Lifetime Value'
                        enrichmentData={userData}
                        enrichmentKey='lifetime_value_in_cents'
                        formatter={ltv => (
                          <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                            {(ltv / 100).toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                          </span>
                        )}
                      />
                    </>
                  )}
                </div>
                <div className='relative'>
                  {hasProfileEnrichmentEnabled === false && hasNoEnrichmentData ? (
                    <div className='group cursor-default relative'>
                      <Tooltipable
                        direction="right"
                        content={
                          <div className='px-4 py-2 text-sm text-gray-500'>
                            Profile enrichment is not enabled. <a href='/settings' target='_blank' className='text-blue-400 hover:underline'>Enable it here</a> to begin enriching user profiles.
                          </div>
                        }
                      >
                        <div className='absolute w-1/2 top-0 bottom-0 right-0 flex items-center justify-center group z-10'>
                          <Lock className='h-6 w-6 text-gray-400' />
                        </div>
                      </Tooltipable>
                      <div className="px-4 py-2 col-span-1 sm:px-0 grid grid-cols-2">
                        <dt className="text-sm font-medium leading-6 text-gray-900">Role</dt>
                        <dd className="text-sm leading-6 text-gray-700 flex justify-end blur-sm group-hover:blur-md transition-all">
                          <dd>CEO & Founder</dd>
                        </dd>
                      </div>
                      <div className="px-4 py-2 col-span-1 sm:px-0 grid grid-cols-2">
                        <dt className="text-sm font-medium leading-6 text-gray-900">Twitter Profile</dt>
                        <dd className="text-sm leading-6 text-gray-700 flex justify-end blur-sm group-hover:blur-md transition-all">
                          <dd>@jenny.rosen</dd>
                        </dd>
                      </div>

                      <div className="px-4 py-2 col-span-1 sm:px-0 grid grid-cols-2">
                        <dt className="text-sm font-medium leading-6 text-gray-900">LinkedIn Profile</dt>
                        <dd className="text-sm leading-6 text-gray-700 flex justify-end blur-sm group-hover:blur-md transition-all">
                          <dd>Jenny-Rosen</dd>
                        </dd>
                      </div>

                      <div className="px-4 py-2 col-span-1 sm:px-0 grid grid-cols-2">
                        <dt className="text-sm font-medium leading-6 text-gray-900">Company</dt>
                        <dd className="text-sm leading-6 text-gray-700 flex justify-end blur-sm group-hover:blur-md transition-all">
                          <dd>Swishjam</dd>
                        </dd>
                      </div>

                      <div className="px-4 py-2 col-span-1 sm:px-0 grid grid-cols-2">
                        <dt className="text-sm font-medium leading-6 text-gray-900">Company Size</dt>
                        <dd className="text-sm leading-6 text-gray-700 flex justify-end blur-sm group-hover:blur-md transition-all">
                          <dd>10-50</dd>
                        </dd>
                      </div>

                      <div className="px-4 py-2 col-span-1 sm:px-0 grid grid-cols-2">
                        <dt className="text-sm font-medium leading-6 text-gray-900">Industry</dt>
                        <dd className="text-sm leading-6 text-gray-700 flex justify-end blur-sm group-hover:blur-md transition-all">
                          <dd>Software</dd>
                        </dd>
                      </div>

                      <div className="px-4 py-2 col-span-1 sm:px-0 grid grid-cols-2">
                        <dt className="text-sm font-medium leading-6 text-gray-900">Location</dt>
                        <dd className="text-sm leading-6 text-gray-700 flex justify-end blur-sm group-hover:blur-md transition-all">
                          <dd>Los Angeles, CA</dd>
                        </dd>
                      </div>
                    </div>
                  ) : (
                    <>
                      <EnrichedDataItem
                        title='Role'
                        enrichmentData={userData.enrichment_data}
                        enrichmentKey='job_title'
                      />
                      <EnrichedDataItem
                        title='Twitter Profile'
                        enrichmentData={userData.enrichment_data}
                        enrichmentKey='twitter_url'
                        formatter={url => (
                          <a
                            className="hover:underline hover:text-blue-400 transition duration-500"
                            href={url}
                            target="_blank"
                          >
                            {(safelyParseURL(url).pathname?.split('/') || ['', url])[1]}
                          </a>
                        )}
                      />
                      <EnrichedDataItem
                        title='LinkedIn Profile'
                        enrichmentData={userData.enrichment_data}
                        enrichmentKey='linkedin_url'
                        formatter={url => (
                          <a
                            className="hover:underline hover:text-blue-400 transition duration-500 flex items-center justify-end"
                            href={`https://${url}`}
                            target="_blank"
                          >
                            {(safelyParseURL(`https://${url}`).pathname?.split('/') || ['', '', url])[2]}
                            <ArrowTopRightOnSquareIcon className='inline-block ml-1 h-3 w-3' />
                          </a>
                        )}
                      />
                      <EnrichedDataItem
                        title='Company'
                        enrichmentData={userData.enrichment_data}
                        enrichmentKey='company_name'
                        formatter={name => {
                          if (userData.enrichment_data.company_website) {
                            return (
                              <a
                                className="hover:underline hover:text-blue-400 transition duration-500 flex items-center justify-end"
                                href={`https://${userData.enrichment_data.company_website}`}
                                target="_blank"
                              >
                                {name}
                                <ArrowTopRightOnSquareIcon className='inline-block ml-1 h-3 w-3' />
                              </a>
                            )
                          } else {
                            return name;
                          }
                        }}
                      />
                      <EnrichedDataItem
                        title='Company Size'
                        enrichmentData={userData.enrichment_data}
                        enrichmentKey='company_size'
                      />
                      <EnrichedDataItem
                        title='Industry'
                        enrichmentData={userData.enrichment_data}
                        enrichmentKey='company_industry'
                      />
                      <EnrichedDataItem
                        title='Location'
                        enrichmentData={userData.enrichment_data}
                        enrichmentKey='company_location_metro'
                      />
                    </>
                  )}
                </div>
              </>
            </dl>
          </div>
        </div>
      </CardContent>
    </Card >
  )
}