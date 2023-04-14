import LighthouseAuditResultRow from "./LighthouseAuditResultRow"

export default function LighthouseAuditResults({ opportunities }) {
  return (
    opportunities.map(({ title, description, details, numericValue, numericUnit, displayValue }) => (
      <LighthouseAuditResultRow 
        title={title} 
        description={description} 
        details={details} 
        numericValue={numericValue} 
        numericUnit={numericUnit} 
        displayValue={displayValue}
      />
    ))
  )
}