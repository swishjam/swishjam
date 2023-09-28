import { RxCardStack } from 'react-icons/rx';
import AddConnectionButton from './AddConnectionButton' 

export default function EmptyView({ allConnections, availableConnections, setConnectionForModal }) {

  return (
    <div className="w-full mt-12">
      <div>
        <div className="text-center">
          <RxCardStack className="mx-auto h-12 w-12 text-gray-400" />
          <h2 className="mt-2 text-base font-semibold leading-6 text-gray-900">Add a data connection</h2>
          <p className="mt-1 text-sm text-gray-500">Data connections let you pull in and push data to key business tools.</p>
        </div>
      </div>
      <div className="mt-10">
        <h3 className="text-sm font-medium text-gray-500">Recommended Available Connections</h3>
        <ul role="list" className="grid grid-cols-1 gap-x-6 gap-y-8 lg:grid-cols-3 xl:gap-x-8 mt-6">
          {availableConnections.map((connection, idx) => (
            <AddConnectionButton
              key={idx}
              img={allConnections[connection.name].img}
              connection={connection}
              //apiKey='INSTANCE-7da3a8bc'
              onConnectionClick={() => setConnectionForModal(connection)}
            />
          ))}
        </ul>
      </div>
    </div>
  )
}