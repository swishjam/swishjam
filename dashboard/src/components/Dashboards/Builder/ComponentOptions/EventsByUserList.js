import EventsByUserList from "@/components/Dashboards/Components/EventsByUserList";

export default function EventsByUserListOption({ onClick }) {
  return (
    <div className='cursor-pointer transition-all hover:scale-105' onClick={() => { onClick && onClick() }}>
      <EventsByUserList
        title='Users Event List'
        items={[
          { name: 'john@google.com', value: 100 },
          { name: 'jenny.rosen@swishjam.com', value: 80 },
          { name: 'larry@retool.com', value: 60 },
          { name: 'lexi@stripe.com', value: 40 },
          { name: 'kevin@meta.com', value: 20 },
        ]}
      />
    </div>
  )
}