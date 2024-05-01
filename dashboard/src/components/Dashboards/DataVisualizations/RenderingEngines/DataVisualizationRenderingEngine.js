import AreaChart from "@/components/Dashboards/DataVisualizations/RenderingEngines/AreaChart";
import BarChart from "@/components/Dashboards/DataVisualizations/RenderingEngines/BarChart";
import BarList from "@/components/Dashboards/DataVisualizations/RenderingEngines/BarList";
import PieChart from "@/components/Dashboards/DataVisualizations/RenderingEngines/PieChart";
import UserRetention from "@/components/Dashboards/DataVisualizations/RenderingEngines/RetentionWidget";
import ValueCard from "@/components/Dashboards/DataVisualizations/RenderingEngines/ValueCard";

const RENDERING_ENGINE_FOR_DATA_VISUALIZATION_TYPE = {
  BarList,
  BarChart,
  AreaChart,
  PieChart,
  ValueCard,
  UserRetention,
}

export default function DataVisualizationRenderingEngine({ type, ...props }) {
  const DashboardVisualizationRenderingEngine = RENDERING_ENGINE_FOR_DATA_VISUALIZATION_TYPE[type];
  if (!DashboardVisualizationRenderingEngine) {
    throw Error(`Unrecognized \`type\` provided to Dashboard RenderingEngine, must be one of ${Object.keys(RENDERING_ENGINE_FOR_DATA_VISUALIZATION_TYPE).join(', ')}, got ${type}`);
  }
  return <DashboardVisualizationRenderingEngine {...props} />;
}