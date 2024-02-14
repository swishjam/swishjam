import Combobox from "../utils/Combobox"

export default function UserOrEventPropertyDropdown({ userPropertyOptions, eventPropertyOptions, selectedProperty, onSelectionChange }) {
  return (
    <Combobox
      selectedValue={selectedProperty}
      onSelectionChange={onSelectionChange}
      options={[
        { type: "title", label: "User Properties" },
        ...userPropertyOptions.map(option => ({ label: option, value: option })),
        { type: "separator" },
        { type: "title", label: "Event Properties" },
        ...eventPropertyOptions.map(option => ({ label: option, value: option })),
      ]}
      placeholder="Select a property"
    />
  )
}