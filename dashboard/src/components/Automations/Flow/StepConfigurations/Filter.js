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
  { property: null, operator: 'equals', value: null }
]

export default function FilterConfiguration({ data, onSave }) {
  const [propertyOptionsForSelectedEvent, setPropertyOptionsForSelectedEvent] = useState();
  const form = useForm();
  const filterRulesFieldArray = useFieldArray({ control: form.control, name: "next_automation_step_condition_rules", defaultValues: data.next_automation_step_condition_rules || DEFAULT_RULES });
  const { uniqueUserProperties } = useCommonQueries();
  const { selectedEntryPointEventName } = useAutomationBuilder();

  useEffect(() => {
    if (selectedEntryPointEventName) {
      SwishjamAPI.Events.Properties.listUnique(selectedEntryPointEventName).then(setPropertyOptionsForSelectedEvent)
    }
  }, [selectedEntryPointEventName])

  useEffect(() => {
    form.reset({ next_automation_step_condition_rules: data.next_automation_step_condition_rules || DEFAULT_RULES })
  }, [data.next_automation_step_condition_rules])

  const onSubmit = values => {
    // validate and update the data
    onSave(values)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <ul className='grid gap-y-2 mt-2'>
          {filterRulesFieldArray.fields.map((field, index) => {
            return (
              <li key={index} className='w-full p-2 relative bg-gray-50 rounded-md border border-gray-200'>
                <FormLabel className="!mb-8">
                  {filterRulesFieldArray.fields.length > 1 && index > 0 ? 'And if' : 'If'}
                </FormLabel>
                <div className='w-full grid grid-cols-12'>
                  <div className='col-span-4'>
                    <FormField
                      control={field.control}
                      name={`next_automation_step_condition_rules.${index}.property`}
                      render={({ field }) => (
                        <FormItem>
                          <Combobox
                            minWidth='0'
                            buttonClass='!rounded-br-none !rounded-tr-none overflow-hidden'
                            selectedValue={field.value}
                            onSelectionChange={val => form.setValue(`next_automation_step_condition_rules.${index}.property`, val)}
                            isModal={true}
                            options={[
                              { type: "title", label: <div className='flex items-center'><SparkleIcon className='h-4 w-4 mr-1' /> Event Properties</div> },
                              ...(propertyOptionsForSelectedEvent || []).sort().map(p => ({ label: p, value: `event.${p}` })),
                              { type: "title", label: <div className='flex items-center'><UserCircleIcon className='h-4 w-4 mr-1' /> User Properties</div> },
                              ...(uniqueUserProperties || []).sort().map(p => ({ label: p, value: `user.${p}` })),
                            ]}
                            placeholder={<span className='text-gray-500 italic'>Property</span>}
                          />
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                  </div>
                  <div className='col-span-3'>
                    <FormField
                      control={field.control}
                      name={`next_automation_step_condition_rules.${index}.operator`}
                      render={({ field }) => (
                        <FormItem>
                          <Combobox
                            minWidth='0'
                            isModal={true}
                            buttonClass='!rounded-none border-l-0 border-r-0'
                            selectedValue={field.value}
                            onSelectionChange={val => form.setValue(`next_automation_step_condition_rules.${index}.operator`, val)}
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
                            placeholder={<span className='text-gray-500 italic'>Logic</span>}
                          />
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="col-span-5">
                    <FormField
                      control={form.control}
                      name={`next_automation_step_condition_rules.${index}.value`}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input
                              className='!rounded-bl-none !rounded-tl-none !ring-0'
                              type="text"
                              placeholder="Your property value"
                              disabled={form.watch(`next_automation_step_condition_rules.${index}.operator`) === 'is_not_defined' || form.watch(`next_automation_step_condition_rules.${index}.operator`) === 'is_defined'}
                              {...form.register(`next_automation_step_condition_rules.${index}.value`)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                {index > 0 && (
                  <Button
                    onClick={() => filterRulesFieldArray.remove(index)}
                    type='button'
                    variant="ghost"
                    className='absolute top-2 right-2 flex-none duration-500 hover:text-rose-600 !p-2 h-6'
                  >
                    <LuTrash size={12} />
                  </Button>
                )}

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
        <Button type="submit" variant="swishjam" className="w-full mt-6">Save</Button>
      </form>
    </Form>
  )
}