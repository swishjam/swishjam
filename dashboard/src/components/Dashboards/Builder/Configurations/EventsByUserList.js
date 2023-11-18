
import ConfigurationModal from "./ConfigurationModal";
import EventsByUserList from '@/components/Dashboards/Components/EventsByUserList';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import SwishjamAPI from "@/lib/api-client/swishjam-api";
import { useState } from "react";

export default function EventsByUserListConfiguration({ onConfigurationSave = () => { } }) {
  const [barColorConfig, setBarColorConfig] = useState('rgb(186 230 253 )');
  const [eventsByUserListData, setEventsByUserListData] = useState();
  const [numUsersConfig, setNumUsersConfig] = useState(10);
  const [selectedEventName, setSelectedEventName] = useState();
  const [selectedDataSource, setSelectedDataSource] = useState();

  const AdditionalSettings = () => (
    <>
      <div className='flex items-center space-x-2 mt-2'>
        <Label className='font-normal'>Number of users to include</Label>
        <Input
          className='w-20'
          label='Number of Users'
          max={20}
          min={1}
          type='number'
          value={numUsersConfig}
          onChange={e => {
            const newNumUsers = parseInt(e.target.value);
            if (newNumUsers > numUsersConfig) {
              setEventsByUserListData();
              SwishjamAPI.Events.Users.list(selectedEventName, { dataSource: selectedDataSource, limit: newNumUsers }).then(data => {
                setEventsByUserListData(data.map(({ email, full_name: _full_name, count }) => ({ name: email, value: count })));
              });
            } else {
              setEventsByUserListData(eventsByUserListData.slice(0, newNumUsers));
            }
            setNumUsersConfig(newNumUsers)
          }}
        />
      </div>
      <div className='flex items-center space-x-2 mt-2'>
        <Label className='font-normal'>Bar Color</Label>
        <div className='flex space-x-2'>
          {['rgb(186 230 253 )', '#ff0422', '#F5A623', '#F8E71C', '#cb8447', '#7ED321', '#417505', '#BD10E0', '#9013FE', '#4A90E2', '#50E3C2', '#B8E986', '#4A4A4A', '#9B9B9B'].map(color => (
            <div
              key={color}
              className={`cursor-pointer w-6 h-6 rounded-lg hover:opacity-80 hover:scale-105 transition-all duration-200 ${barColorConfig === color ? 'ring-2 ring-offset-2 ring-gray-400' : ''}`}
              onClick={() => setBarColorConfig(color)}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      </div>
    </>
  )

  const onConfigurationChange = ({ eventName, dataSource }) => {
    setSelectedEventName(eventName);
    setSelectedDataSource(dataSource);
    setEventsByUserListData();
    if (eventName) {
      SwishjamAPI.Events.Users.list(eventName, { dataSource, limit: numUsersConfig }).then(data => {
        const formattedData = data.map(({ id, email, full_name: _full_name, count }) => {
          if (id) {
            return { name: email, value: count }
          } else {
            return { name: <span className='italic'>Anonymous User</span>, value: count }
          }
        })
        setEventsByUserListData(formattedData);
      });
    }
  }

  return (
    <ConfigurationModal
      AdditionalSettings={<AdditionalSettings />}
      description='Display a list of the top users who have triggered the selected event.'
      includeCalculationsDropdown={false}
      includePropertiesDropdown={false}
      onConfigurationChange={onConfigurationChange}
      onSave={config => onConfigurationSave({ ...config, numUsers: numUsersConfig, barColor: barColorConfig })}
      previewDashboardComponent={title => <EventsByUserList title={title} items={eventsByUserListData} barColor={barColorConfig} />}
      type='Events by User List'
    />
  )
}