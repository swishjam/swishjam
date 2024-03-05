import { Button } from "@/components/ui/button"
import Combobox from "@/components/utils/Combobox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm, useFieldArray } from "react-hook-form";
import { SparkleIcon, UserCircleIcon } from "lucide-react";
import { LuTrash } from "react-icons/lu";
import useAutomationBuilder from "@/hooks/useAutomationBuilder";
import useCommonQueries from "@/hooks/useCommonQueries";
import { useEffect, useState } from "react";
import SwishjamAPI from "@/lib/api-client/swishjam-api";

const DEFAULT_RULES = [
  [{ type: 'NextAutomationStepConditionRules::EventProperty', config: { property: null, operator: 'equals', value: null } }]
]

export default function FilterConfiguration({ data, onUpdate }) {
  const [propertyOptionsForSelectedEvent, setPropertyOptionsForSelectedEvent] = useState();

  const form = useForm();
  const filterRulesFieldArray = useFieldArray({ control: form.control, name: "rules", defaultValues: data.rules || DEFAULT_RULES });

  const { uniqueUserProperties } = useCommonQueries();
  const { selectedEntryPointEventName } = useAutomationBuilder();

  useEffect(() => {
    if (selectedEntryPointEventName) {
      SwishjamAPI.Events.Properties.listUnique(selectedEntryPointEventName).then(setPropertyOptionsForSelectedEvent)
    }
  }, [selectedEntryPointEventName])

  const onSubmit = values => {
    // validate and update the data
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <ul className='grid gap-y-2 mt-2'>
          {filterRulesFieldArray.fields.map((field, index) => {
            return (
              <li key={index} className='w-full flex items-center gap-x-2'>
                <span className='text-sm'>
                  {filterRulesFieldArray.fields.length > 1 && index > 0 ? 'And if' : 'If'}
                  {form.watch(`rules.${index}.property`)?.startsWith('user.') ? ' the user\'s' : ' the event\'s'}
                </span>
                <FormField
                  control={field.control}
                  name={`rules.${index}.property`}
                  render={({ field }) => (
                    <FormItem>
                      <Combobox
                        minWidth='0'
                        selectedValue={field.value}
                        onSelectionChange={val => form.setValue(`rules.${index}.property`, val)}
                        options={[
                          { type: "title", label: <div className='flex items-center'><SparkleIcon className='h-4 w-4 mr-1' /> Event Properties</div> },
                          ...(propertyOptionsForSelectedEvent || []).map(p => ({ label: p, value: `event.${p}` })),
                          { type: "title", label: <div className='flex items-center'><UserCircleIcon className='h-4 w-4 mr-1' /> User Properties</div> },
                          ...(uniqueUserProperties || []).map(p => ({ label: p, value: `user.${p}` })),
                        ]}
                        placeholder={<span className='text-gray-500 italic'>Property</span>}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={field.control}
                  name={`rules.${index}.operator`}
                  render={({ field }) => (
                    <FormItem>
                      <Combobox
                        minWidth='0'
                        selectedValue={field.value}
                        onSelectionChange={val => form.setValue(`rules.${index}.condition`, val)}
                        options={[
                          { label: 'equals', value: 'equals' },
                          { label: 'does not equals', value: 'does_not_equal' },
                          { label: 'contains', value: 'contains' },
                          { label: 'does not contain', value: 'does_not_contain' },
                          { label: 'ends with', value: 'ends_with' },
                          { label: 'does not end with', value: 'does_not_end_with' },
                          { label: 'is defined', value: 'is_defined' },
                          { label: 'is not defined', value: 'is_not_defined' },
                          { label: 'greater than', value: 'greater_than' },
                          { label: 'less than', value: 'less_than' },
                          { label: 'greater than or equal to', value: 'greater_than_or_equal_to' },
                          { label: 'less than or equal to', value: 'less_than_or_equal_to' },
                        ]}
                        placeholder={<span className='text-gray-500 italic'>Operator</span>}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {form.watch(`rules.${index}.operator`) !== 'is_defined' && (
                  <FormField
                    control={form.control}
                    name={`rules.${index}.value`}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            type="text"
                            placeholder="Your property value"
                            // disabled={propertyOptionsForSelectedEvent === undefined}
                            {...form.register(`rules.${index}.property_value`)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                <Button
                  onClick={() => filterRulesFieldArray.remove(index)}
                  type='button'
                  variant="ghost"
                  className='flex-none ml-2 duration-500 hover:text-rose-600'
                >
                  <LuTrash size={14} />
                </Button>
              </li>
            )
          })}
          <li key="add-more-button">
            <Button
              onClick={() => filterRulesFieldArray.append()}
              type='button'
              variant="outline"
              className='!mt-2 w-full'
            >
              Add Condition
            </Button>
          </li>
        </ul>
      </form>
    </Form>
  )
}