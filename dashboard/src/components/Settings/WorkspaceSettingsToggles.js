import { useState } from 'react'
// import { Switch } from "@headlessui/react"
import Toggle from '@/components/utils/Toggle'
import SwishjamAPI from '@/lib/api-client/swishjam-api';

export default function WorkspaceSettingsToggles({ settings }) {
  const [useProductDataSourceInLieuOfMarketing, setUseProductDataSourceInLieuOfMarketing] = useState(settings.use_product_data_source_in_lieu_of_marketing);
  const [useMarketingDataSourceInLieuOfProduct, setUseMarketingDataSourceInLieuOfProduct] = useState(settings.use_marketing_data_source_in_lieu_of_product);

  const updateSettings = async ({ use_product_data_source_in_lieu_of_marketing, use_marketing_data_source_in_lieu_of_product }) => {
    setUseProductDataSourceInLieuOfMarketing(use_product_data_source_in_lieu_of_marketing);
    setUseMarketingDataSourceInLieuOfProduct(use_marketing_data_source_in_lieu_of_product);
    return await SwishjamAPI.WorkspaceSettings.update({ use_marketing_data_source_in_lieu_of_product, use_product_data_source_in_lieu_of_marketing });
  }

  return (
    <>
      <h2 className="block text-sm font-medium leading-6 text-gray-900">Data source settings</h2>
      <Toggle
        className='mt-4'
        text={<span className='text-sm text-gray-700'>Use the <span className='italic'>product</span> data source in lieu of the marketing data source in Dashboard queries.</span>}
        checked={useProductDataSourceInLieuOfMarketing}
        onChange={checked => {
          updateSettings({
            use_product_data_source_in_lieu_of_marketing: checked,
            use_marketing_data_source_in_lieu_of_product: useMarketingDataSourceInLieuOfProduct
          })
        }}
      />
      {/* <Toggle
        className='mt-4'
        text={<span className='text-sm text-gray-700'>Use the <span className='italic'>marketing</span> data source in lieu of the product data source in Dashboard queries.</span>}
        checked={useMarketingDataSourceInLieuOfProduct}
        onChange={checked => {
          updateSettings({
            use_product_data_source_in_lieu_of_marketing: useProductDataSourceInLieuOfMarketing,
            use_marketing_data_source_in_lieu_of_product: checked
          })
        }}
      /> */}
    </>
  )
}