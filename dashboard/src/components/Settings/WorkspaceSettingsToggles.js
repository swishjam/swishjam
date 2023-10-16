import { useState } from 'react'
import Toggle from '@/components/utils/Toggle'
import SwishjamAPI from '@/lib/api-client/swishjam-api';

export default function WorkspaceSettingsToggles({ settings }) {
  const [combineMarketingAndProductDataSources, setCombineMarketingAndProductDataSources] = useState(settings.combine_marketing_and_product_data_sources);

  const updateSettings = async ({ combine_marketing_and_product_data_sources }) => {
    setCombineMarketingAndProductDataSources(combine_marketing_and_product_data_sources);
    return await SwishjamAPI.WorkspaceSettings.update({ combine_marketing_and_product_data_sources });
  }

  return (
    <Toggle
      className='mt-4'
      text={<span className='text-sm text-gray-700'>Combine marketing and product data sources for all queries.</span>}
      checked={combineMarketingAndProductDataSources}
      onChange={checked => updateSettings({ combine_marketing_and_product_data_sources: checked })}
    />
  )
}