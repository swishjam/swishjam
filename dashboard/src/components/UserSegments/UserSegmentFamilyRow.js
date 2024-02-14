import SwishjamAPI from "@/lib/api-client/swishjam-api"
import OperatorDropdown from "./OperatorDropdown"
import UserOrEventPropertyDropdown from "./UserOrEventPropertyDropdown"
import { useState } from "react"

export default function UserSegmentFamilyRow({ uniqueUserProperties, uniqueEvents }) {
  const [selectedOperator, setSelectedOperator] = useState()
  const [selectedPropetyObjectType, setSelectedPropertyObjectType] = useState()
  const [selectedPropertyName, setSelectedPropertyName] = useState()
  const [uniquePropertiesForSelectedEvent, setUniquePropertiesForSelectedEvent] = useState()

  useEffect(() => {
    if (selectedPropertyName && selectedPropetyObjectType === "event") {
      SwishjamAPI.Events.Properties.listUnique(selectedPropertyName).then(setUniquePropertiesForSelectedEvent)
    } else {
      setUniquePropertiesForSelectedEvent(null)
    }
  }, [selectedPropetyObjectType, selectedPropertyName])

  return (
    <div className='flex text-sm items-center space-x-2'>
      <span>
        Where
        {selectedPropetyObjectType === "user" ? " user" : " event"}
      </span>
      <UserOrEventPropertyDropdown
        userPropertyOptions={uniqueUserProperties}
        eventPropertyOptions={uniqueEvents}
        selectedProperty={selectedPropertyName}
        onSelectionChange={(propertName, objectType) => {
          setSelectedPropertyName(propertName)
          setSelectedPropertyObjectType(objectType)
        }}
      />
      <OperatorDropdown
        selectedOperator={selectedOperator}
        onSelectionChange={setSelectedOperator}
        options={[
          { label: "=", value: "equals" },
          { label: "≠", value: "does_not_equal" },
          { label: "contains", value: "contains" },
          { label: "does not contain", value: "does_not_contain" },
          { label: "occurred", value: "total_occurrences" },
          { label: ">", value: "greater_than" },
          { label: ">= ", value: "greater_than_or_equal_to" },
          { label: "<", value: "less_than" },
          { label: "<=", value: "less_than_or_equal_to" },
        ]}
      />
    </div>
  )
}