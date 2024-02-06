'use client'

import ListView from '@/components/Integrations/ListView'

export default function DataSourcesPage() {
  return (
    <ListView
      title='Data Sources'
      subTitle='Pipe all of your data sources into Swishjam.'
      type='data_sources'
    />
  )
}