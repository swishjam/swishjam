import ConditionalCardWrapper from "@/components/DataVisualizations/utils/ConditionalCardWrapper";
import DataVisualizationSettingsProvider from "@/providers/DataVisualizationSettingsProvider";
import DataVisualizationContextMenu from "./utils/DataVisualizationContextMenu";

const defineComponentAsDataVisualization = (DataVisualizationComponent, {
  loadingDetectionProp = 'data',
  includeContextMenu: componentDefinedIncludeContextMenu = true,
  settings: componentDefinedSettings = []
} = {}) => {
  return function DataVisualizationWrapper({
    AdditionalHeaderActions,
    className,
    dataVisualizationId,
    DocumentationContent,
    includeCard = true,
    includeContextMenu = true,
    includeSettingsDropdown = true,
    includeQueryDetails = true,
    isEnlargable = true,
    linkToDataVisualizationDetailsPage = true,
    onDelete,
    onlyDisplayHeaderActionsOnHover = true,
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
          isTriggerable={componentDefinedIncludeContextMenu ?? includeContextMenu}
          onDelete={onDelete}
        >
          <ConditionalCardWrapper
            AdditionalHeaderActions={AdditionalHeaderActions}
            className={className}
            dataVisualizationId={dataVisualizationId}
            DocumentationContent={DocumentationContent}
            includeCard={includeCard}
            includeSettingsDropdown={includeSettingsDropdown}
            includeQueryDetails={includeQueryDetails}
            isEnlargable={isEnlargable}
            linkToDataVisualizationDetailsPage={linkToDataVisualizationDetailsPage}
            loading={dataVisualizationSpecificProps[loadingDetectionProp] === undefined}
            onlyDisplayHeaderActionsOnHover={onlyDisplayHeaderActionsOnHover}
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