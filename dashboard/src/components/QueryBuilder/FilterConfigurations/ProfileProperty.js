import ComboboxEvents from "@/components/utils/ComboboxEvents";
import Combobox from "@/components/utils/Combobox";
import { Input } from "@/components/ui/input";

export default function ProfilePropertyConfiguration({
  precedingContent,
  onConfigChange,
  onPropertySelect,
  property,
  operator,
  propertyValue,
  propertyOptions,
  profileType,
  succeedingContent,
}) {
  let operatorOptions = [
    { label: "equals", value: "equals" },
    { label: "does not equal", value: "does_not_equal" },
    { label: "contains", value: "contains" },
    { label: "does not contain", value: "does_not_contain" },
    { label: 'is defined', value: 'is_defined' },
    { label: 'is not defined', value: 'is_not_defined' },
  ];
  if (property === 'email') {
    operatorOptions = operatorOptions.concat([{ label: 'is not a generic email', value: 'is_not_generic_email' }, { label: 'is a generic email', value: 'is_generic_email' }])
  } else {
    operatorOptions = operatorOptions.concat([
      { label: "greater than", value: "greater_than" },
      { label: "less than", value: "less_than" },
      { label: "greater than or equal to", value: "greater_than_or_equal_to" },
      { label: "less than or equal to", value: "less_than_or_equal_to" },
    ])
  }

  return (
    <div className='flex items-center space-x-2 text-sm'>
      {precedingContent}
      <span className='whitespace-nowrap'>
        {profileType.charAt(0).toUpperCase() + profileType.slice(1)}s whose
      </span>
      <ComboboxEvents
        selectedValue={property ? `${profileType}.${property}` : null}
        onSelectionChange={onPropertySelect}
        options={propertyOptions}
        placeholder="Select a property"
      />
      <Combobox
        buttonClass='w-fit'
        selectedValue={operator}
        onSelectionChange={selectedValue => onConfigChange({ operator: selectedValue })}
        options={operatorOptions}
      />
      {!["is_not_defined", "is_defined", "is_not_generic_email", 'is_generic_email'].includes(operator) && (
        <Input
          className='w-fit max-w-[200px]'
          type='text'
          placeholder='Property value'
          value={propertyValue}
          noRing={true}
          onChange={e => onConfigChange({ property_value: e.target.value })}
        />
      )}
      {succeedingContent}
    </div>
  )
}