import { Input } from "@/components/ui/input";
import Combobox from "@/components/utils/Combobox";
import ComboboxEvents from "@/components/utils/ComboboxEvents";
import { TriangleAlertIcon } from "lucide-react";
import { useRef, useState } from "react";

export default function WhereClause({ query, propertyOptions, onUpdate, leadingText }) {
  const [queryValue, setQueryValue] = useState(query.value);
  const debounceTimeoutRef = useRef(null);

  const handleQueryValueChange = (value, query) => {
    clearTimeout(debounceTimeoutRef.current);
    setQueryValue(value);
    debounceTimeoutRef.current = setTimeout(() => {
      query.value = value;
      onUpdate(query);
    }, 500);
  };

  return (
    <div className='flex items-center text-sm text-gray-700 break-keep space-x-1'>
      <div className="flex items-center space-x-1">
        {leadingText.props ? leadingText : <span>{leadingText}</span>}
        <span>the</span>
        {query.property && query.property.startsWith('user.') && <span>user's</span>}
        {query.property && !query.property.startsWith('user.') && <span>event's</span>}
      </div>
      <ComboboxEvents
        placeholder={
          <div className='flex items-center'>
            <div className='p-1 mr-1 bg-yellow-100 text-yellow-500 rounded'>
              <TriangleAlertIcon className='h-4 w-4 mx-auto' />
            </div>
            property
          </div>
        }
        swishjamEventsHeading='Event Properties'
        selectedValue={query.property}
        options={propertyOptions}
        onSelectionChange={property => {
          query.property = property
          onUpdate(query);
        }}
      />
      <span>property</span>
      <Combobox
        buttonClass='w-fit'
        placeholder={
          <div className='flex items-center'>
            <div className='p-1 mr-1 bg-yellow-100 text-yellow-500 rounded'>
              <TriangleAlertIcon className='h-4 w-4 mx-auto' />
            </div>
            operator
          </div>
        }
        selectedValue={query.operator}
        onSelectionChange={operator => {
          query.operator = operator
          onUpdate(query);
        }}
        options={[
          {
            label: (
              <div className='flex items-center space-x-2'>
                <span>
                  =
                </span>
                <span>
                  equals
                </span>
              </div>
            ),
            value: 'equals'
          },
          {
            label: (
              <div className='flex items-center space-x-2'>
                <span>
                  ≠
                </span>
                <span>
                  does not equal
                </span>
              </div>
            ),
            value: 'does_not_equal'
          },
          {
            label: (
              <div className='flex items-center space-x-2'>
                <span>
                  ≈
                </span>
                <span>
                  contains
                </span>
              </div>
            ),
            value: 'contains'
          },
          {
            label: (
              <div className='flex items-center space-x-2'>
                <span>
                  ≉
                </span>
                <span>
                  does not contain
                </span>
              </div>
            ),
            value: 'does_not_contain'
          },
          {
            label: (
              <div className='flex items-center space-x-2'>
                <span>
                  {'>'}
                </span>
                <span>
                  is greater than
                </span>
              </div>
            ),
            value: 'greater_than'
          },
          {
            label: (
              <div className='flex items-center space-x-2'>
                <span>
                  {'<'}
                </span>
                <span>
                  is less than
                </span>
              </div>
            ),
            value: 'less_than'
          },
          {
            label: (
              <div className='flex items-center space-x-2'>
                <span>
                  {'>='}
                </span>
                <span>
                  is greater than or equal to
                </span>
              </div>
            ),
            value: 'greater_than_or_equal_to'
          },
          {
            label: (
              <div className='flex items-center space-x-2'>
                <span>
                  {'<='}
                </span>
                <span>
                  is less than or equal to
                </span>
              </div>
            ),
            value: 'less_than_or_equal_to'
          },
          {
            label: (
              <div className='flex items-center space-x-2'>
                <span>
                  ✓
                </span>
                <span>
                  is defined
                </span>
              </div>
            ),
            value: 'is_defined'
          },
          {
            label: (
              <div className='flex items-center space-x-2'>
                <span>
                  ✗
                </span>
                <span>
                  is not defined
                </span>
              </div>
            ),
            value: 'is_not_defined'
          },
        ]}
      />
      {!['is_defined', 'is_not_defined'].includes(query.operator) && (
        <div className='relative flex items-center'>
          <Input
            className='w-64'
            type='text'
            value={queryValue}
            noRing={true}
            onChange={e => handleQueryValueChange(e.target.value, query)}
          />
          {(queryValue || '').trim().length === 0 && (
            <div className='absolute inset-y-0 right-0 flex items-center pr-2 text-gray-500'>
              <div className='p-1 mr-1 bg-yellow-100 text-yellow-500 rounded'>
                <TriangleAlertIcon className='h-4 w-4 mx-auto' />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}