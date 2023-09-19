import ReactGridLayout from 'react-grid-layout'
import AnalyticsFamilyConfigurationPill from './AnalyticsFamilyConfigurationPill'

export default function AnalyticsFamilyConfigurationsPills({ analyticsFamilyConfigurations, onDelete, onUpdatedPriority }) {
  const formattedConfigurations = analyticsFamilyConfigurations.map((afc, i) => ({
    ...afc,
    i: afc.id,
    x: 0,
    y: i,
    w: 1,
    h: 1,
  }))
  console.log(formattedConfigurations)
  return (
    <div className='relative'>
      {/* <ReactGridLayout
        cols={1}
        rowHeight={100}
        isResizable={false}
        isDraggable={true}
        layout={formattedConfigurations}
        onLayoutChange={console.log}
      > */}
        {analyticsFamilyConfigurations.map(config => (
          <div key={config.id}>
            <AnalyticsFamilyConfigurationPill analyticsFamilyConfiguration={config} onDelete={onDelete} />
          </div>
        ))}
      {/* </ReactGridLayout> */}
    </div>
  )
}