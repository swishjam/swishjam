import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
// import ChurnWarningUserBadge from "./ChurnWarningUserBadge";
import { dateFormatterForGrouping } from "@/lib/utils/timeseriesHelpers";
import EnrichedDataItem from "@/components/Profiles/EnrichedDataItem";
// import PowerUserBadge from "./PowerUserBadge";
import { Lock } from "lucide-react";
import { safelyParseURL } from "@/lib/utils/misc";
import { Tooltipable } from '@/components/ui/tooltip'

const dateFormatter = dateFormatterForGrouping('minute')

export default function ProfileInformationSideBar({ userData, hasStripeIntegrationEnabled, hasProfileEnrichmentEnabled }) {
  const hasNoEnrichmentData = !userData.enrichment_data?.job_title &&
    !userData.enrichment_data?.twitter_url &&
    !userData.enrichment_data?.linkedin_url &&
    !userData.enrichment_data?.company_name &&
    !userData.enrichment_data?.company_size &&
    !userData.enrichment_data?.company_industry &&
    !userData.enrichment_data?.company_location_metro;

  return (
    <Card className='col-span-4 relative'>
      <CardHeader>
        <div className='flex items-center'>
          <Avatar className="h-16 w-16 mr-4 border border-slate-200">
            {userData.gravatar_url
              ? <AvatarImage src={userData.gravatar_url} alt="Avatar" />
              : <AvatarFallback className="text-lg">{userData.initials}</AvatarFallback>
            }
          </Avatar>
          <div>
            {/* {userData.poweruser ? <PowerUserBadge className="absolute top-5 right-5" size={8} /> : ''}
            {userData.churnwarning ? <ChurnWarningUserBadge className="absolute top-5 right-5" size={8} /> : ''} */}
            <CardTitle className='text-2xl'>
              {userData.full_name || userData.email || userData.user_unique_identifier || (<>Anonymous User <span className='italic'>{userData.id.slice(0, 6)}</span></>)}
            </CardTitle>
            {userData.full_name && (
              <CardDescription className='text-base text-gray-500'>
                {userData.email}
              </CardDescription>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="border-t border-slate-100 w-full" />
        <div>
          <div className="mt-4">
            <dl className="grid grid-cols-1">
              <div className="px-4 py-2 col-span-1 sm:px-0 grid grid-cols-2">
                <dt className="text-sm font-medium leading-6 text-gray-900">Full name</dt>
                <dd className="text-sm leading-6 text-gray-700 text-right">
                  {userData.full_name || (userData.enrichment_data.first_name || '') + (userData.enrichment_data.last_name || '')}
                </dd>
              </div>
              <div className="px-4 py-2 col-span-1 grid grid-cols-2 sm:px-0">
                <dt className="text-sm font-medium leading-6 text-gray-900">First Identified</dt>
                <dd className="text-sm leading-6 text-gray-700 text-right">
                  {dateFormatter(userData.created_at)}
                </dd>
              </div>
              {/* <div className="px-4 py-2 col-span-1 grid grid-cols-2 sm:px-0">
                <dt className="text-sm font-medium leading-6 text-gray-900">First Identified By</dt>
                <dd className="text-sm leading-6 text-gray-700 text-right">
                  {userData.created_by_data_source}
                </dd>
              </div> */}
              <div className="px-4 py-2 col-span-1 grid grid-cols-2 sm:px-0">
                <dt className="text-sm font-medium leading-6 text-gray-900">Organizations</dt>
                <dd className="text-sm leading-6 text-gray-700 text-right flex flex-col">
                  {userData.organizations.length === 0
                    ? '-'
                    : userData.organizations.map((org, i) => (
                      <div>
                        <a key={org.id} href={`/organizations/${org.id}`} className={`${i > 0 ? 'mt-2' : ''} inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10 hover:underline`}>
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
                  enrichmentData={{ initial_referrer: userData?.immutable_metadata?.initial_referrer }}
                  enrichmentKey='initial_referrer'
                  formatter={referrer => referrer === '' ? 'Direct' : referrer}
                />
                <EnrichedDataItem
                  title='Initial Landing Page'
                  enrichmentData={{ initial_url: userData?.immutable_metadata?.initial_url }}
                  enrichmentKey='initial_url'
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
                          <dd>
                            <span className="blur-md inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                              Gold Plan
                            </span>
                          </dd>
                        </dd>
                      </div>
                      <div className="px-4 py-2 col-span-1 sm:px-0 grid grid-cols-2">
                        <dt className="text-sm font-medium leading-6 text-gray-900">Subscription MRR</dt>
                        <dd className="text-sm leading-6 text-gray-700 flex justify-end blur-sm group-hover:blur-md transition-all">
                          <dd>
                            <span className="blur-md inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                              $79.99
                            </span>
                          </dd>
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
                          <dd>@CollinSchneid</dd>
                        </dd>
                      </div>

                      <div className="px-4 py-2 col-span-1 sm:px-0 grid grid-cols-2">
                        <dt className="text-sm font-medium leading-6 text-gray-900">LinkedIn Profile</dt>
                        <dd className="text-sm leading-6 text-gray-700 flex justify-end blur-sm group-hover:blur-md transition-all">
                          <dd>Collin-Schneider</dd>
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

                <div className="my-4 border-t border-slate-100 w-full" />
                <div className="px-4 py-2 col-span-1 sm:px-0 grid grid-cols-2">
                  <dt className="text-sm font-medium leading-6 text-gray-900">Attributes</dt>
                </div>
                <div className="px-4 py-2 col-span-1 sm:px-0 grid grid-cols-2">
                  <dt className="text-sm font-medium leading-6 text-gray-900"></dt>
                  <dd className="text-sm leading-6 text-gray-700 text-right">
                    {userData.metadata
                      ? (
                        Object.keys(userData.metadata).map(key => (
                          <span className='block'>{key}: {userData.metadata[key]}</span>
                        ))
                      )
                      : 'No attributes provided.'}
                  </dd>
                </div>
                {/* <div className="my-4 border-t border-slate-100 w-full" />
                      <div className="px-4 py-2 col-span-1 sm:px-0 grid grid-cols-2">
                        <dt className="text-sm font-medium leading-6 text-gray-900">Connected Apps</dt>
                      </div>
                      <div className="px-4 py-2 col-span-1 sm:px-0 grid grid-cols-2">
                        <dt className="text-sm font-medium leading-6 text-gray-900"></dt>
                        <dd className="text-sm leading-6 text-gray-700 text-right">No additional data</dd>
                      </div> */}
              </>
            </dl>
          </div>
        </div>
      </CardContent>
    </Card >
  )
}