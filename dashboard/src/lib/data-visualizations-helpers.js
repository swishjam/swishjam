export const GLOBAL_SUPPORT_CONFIG_KEYS = ['event', 'property', 'aggregationMethod', 'whereClauseGroups'];

export const SUPPORT_CONFIG_KEYS_BY_VISUALIZATION_TYPE = {
  BarChart: [
    'showGridLines',
    'legendType',
    'showXAxis',
    'showYAxis',
    'maxRankingToNotBeConsideredOther',
    'excludeEmptyValues',
    'emptyValuePlaceholder',
  ],
  AreaChart: [
    'showGridLines',
    'showYAxis',
    'showXAxis',
    'includeTable',
    'primaryColor',
    'primaryColorFill',
    'secondaryColor',
    'secondaryColorFill',
  ],
  ValueCard: ['comparisonFormat', 'increaseFromComparisonValueIsPositive', 'resizeValueBasedOnHeight', 'textAlignment'],
}

export const DEFAULT_CONFIGS_DICT = {
  BarChart: {
    showGridLines: true,
    legendType: 'table',
    showXAxis: true,
    showYAxis: true,
    maxRankingToNotBeConsideredOther: 10,
    excludeEmptyValues: false,
    emptyValuePlaceholder: 'EMPTY',
  },
  AreaChart: {
    showGridLines: true,
    showYAxis: true,
    showXAxis: true,
    includeTable: true,
    primaryColor: '#7dd3fc',
    primaryColorFill: '#bde7fd',
    secondaryColor: "#878b90",
    secondaryColorFill: "#bfc3ca",
  },
  ValueCard: {
    comparisonFormat: 'value',
    increaseFromComparisonValueIsPositive: true,
    resizeValueBasedOnHeight: true,
    textAlignment: 'left',
  },
}

export const sanitizedConfigDataForVisualizationType = (visualizationType, configData) => {
  const supportedKeys = SUPPORT_CONFIG_KEYS_BY_VISUALIZATION_TYPE[visualizationType];
  // currently doesn't take into account only barcharts make use of the `property` key for count-based queries
  return Object.fromEntries(Object.entries(configData).filter(([key]) => GLOBAL_SUPPORT_CONFIG_KEYS.includes(key) || supportedKeys.includes(key)));
}