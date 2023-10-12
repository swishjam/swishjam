import { useRef, useState, useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardNameDisplayEditor({ dashboardName, onDashboardNameSave }) {
  const [isEditingDashboardName, setIsEditingDashboardName] = useState(false);
  const [inputValue, setInputValue] = useState(dashboardName);
  const dashboardNameInputRef = useRef(null);

  useEffect(() => {
    if (isEditingDashboardName) {
      dashboardNameInputRef.current.focus();
    }
  }, [inputValue])

  const DashboardNameInput = () => (
    <input
      type="text"
      className={`input ${isEditingDashboardName ? '' : 'hidden'}`}
      value={inputValue}
      ref={dashboardNameInputRef}
      onChange={e => setInputValue(e.target.value)}
      onBlur={() => {
        setIsEditingDashboardName(false);
        onDashboardNameSave(inputValue);
      }}
      onKeyDown={e => {
        if (e.key === 'Enter') {
          setIsEditingDashboardName(false);
          onDashboardNameSave(inputValue);
        }
      }}
    />
  )

  const DashboardNameDisplay = () => (
    <h1
      className={`text-lg font-medium text-gray-700 mb-0 underline decoration-dotted underline-offset-2 cursor-pointer hover:text-gray-900 ${isEditingDashboardName ? 'hidden' : ''}`}
      onClick={() => {
        setIsEditingDashboardName(true);
        setTimeout(() => dashboardNameInputRef.current.focus(), 0);
      }}
    >
      {dashboardName}
    </h1>
  )

  return (
    <>
      <DashboardNameInput />
      <DashboardNameDisplay />
    </>
  )
}