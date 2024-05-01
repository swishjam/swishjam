import ConditionalCardWrapper from "@/components/DataVisualizations/utils/ConditionalCardWrapper";
import DataVisualizationSettingsProvider from "@/providers/DataVisualizationSettingsProvider";
import DataVisualizationContextMenu from "./utils/DataVisualizationContextMenu";

const defineComponentAsDataVisualization = (DataVisualizationComponent, {
  loadingDetectionProp = 'data',
  contextMenu = true,
  settings: componentDefinedSettings = []
} = {}) => {
  return function ({
    AdditionalHeaderActions,
    className,
    dataVisualizationId,
    DocumentationContent,
    includeCard = true,
    includeSettingsDropdown = true,
    isEnlargable = true,
    linkToComponentDetailsPage = true,
    onDelete,
    settings,
    subtitle,
    title,
    QueryDetails,
    ...dataVisualizationSpecificProps
  }) {
    const dataVisualizationSettings = [...(settings || []), ...componentDefinedSettings];
    return (
      <DataVisualizationSettingsProvider settings={dataVisualizationSettings}>
        <DataVisualizationContextMenu
          dataVisualizationId={dataVisualizationId}
          isTriggerable={contextMenu}
          onDelete={onDelete}
        >
          <ConditionalCardWrapper
            AdditionalHeaderActions={AdditionalHeaderActions}
            className={className}
            dataVisualizationId={dataVisualizationId}
            DocumentationContent={DocumentationContent}
            includeCard={includeCard}
            includeSettingsDropdown={includeSettingsDropdown}
            isEnlargable={isEnlargable}
            linkToComponentDetailsPage={linkToComponentDetailsPage}
            loading={dataVisualizationSpecificProps[loadingDetectionProp] === undefined}
            QueryDetails={QueryDetails}
            settings={dataVisualizationSettings}
            subtitle={subtitle}
            title={title}
          >
            <DataVisualizationComponent {...dataVisualizationSpecificProps} />
          </ConditionalCardWrapper>
        </DataVisualizationContextMenu>
      </DataVisualizationSettingsProvider>
    )
  }
}

export { defineComponentAsDataVisualization };
export default defineComponentAsDataVisualization;