import CardSection from './CardSection';
import SwishjamAPI from '@/lib/api-client/swishjam-api';
import Toggle from '@/components/utils/Toggle'
import { useState } from 'react'
import WorkspaceForm from './WorkspaceForm';
import { toast } from 'sonner';

export default function WorkspaceSettingsToggles({ settings }) {
  const [combineMarketingAndProductDataSources, setCombineMarketingAndProductDataSources] = useState(settings?.combine_marketing_and_product_data_sources);

  const updateSettings = ({ combine_marketing_and_product_data_sources }) => {
    setCombineMarketingAndProductDataSources(combine_marketing_and_product_data_sources);
    SwishjamAPI.WorkspaceSettings.update({ combine_marketing_and_product_data_sources }).then(({ error }) => {
      if (error) {
        setCombineMarketingAndProductDataSources(!combine_marketing_and_product_data_sources);
        toast.error('Failed to update workspace settings.', { description: error, duration: 10_000 });
      } else {
        toast.success('Updated workspace settings.');
      }
    })
  }

  return (
    <>
      <CardSection
        title='General Settings'
        sections={[
          {
            title: 'Workspace name',
            subTitle: 'Change the name of your workspace. A workspace houses your current project and all of its data. This is purely for display purposes.',
            body: <WorkspaceForm />
          },
          {
            title: 'Combine marketing and product data sources for all queries.',
            subTitle: 'When enabled, Swishjam will merge your product and marketing data sources together for all queries. This is useful if you don\'t have a separate app for you app and marketing site.',
            body: <Toggle checked={combineMarketingAndProductDataSources} onChange={checked => updateSettings({ combine_marketing_and_product_data_sources: checked })} />
          }
        ]}
      />
    </>
  )
}