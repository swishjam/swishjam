import CopiableText from "@/components/utils/CopiableText";

const Variable = ({ children }) => {
  return (
    <CopiableText value={`{{ ${children} }}`} includeIcon={false}>
      <span className="text-sm group text-emerald-500 bg-emerald-50 transition-colors hover:bg-emerald-100 italic px-1 py-0.5 rounded-md whitespace-nowrap">
        {'{{ '}
        {children.split('||').map((variable, i) => {
          const variableColor = variable.trim().startsWith('"') || variable.trim().startsWith("'") ? 'text-orange-500 group-hover:text-orange-600' : 'text-emerald-600 group-hover:text-emerald-700';
          return (
            <span key={i}>
              <span className={variableColor}>{variable.trim()}</span>
              {i !== children.split('||').length - 1 && <span className="text-sm text-emerald-500 transition-colors italic px-1 py-0.5 rounded-md whitespace-nowrap">||</span>}
            </span>
          )
        })}
        {' }}'}
      </span>
    </CopiableText>
  )
}

export default function VariableSyntaxDocumentation({ eventName, availableUserProperties, availableEventProperties, additionalSections = [], ...props }) {
  return (
    <div className="border border-zinc-200 shadow-sm bg-white rounded-md p-4" {...props}>
      <p className="text-sm font-medium">Using Variables</p>
      <p className="text-sm mt-1">
        Basic Syntax: <Variable>VARIABLE_NAME</Variable>
      </p>
      <p className="text-sm mt-1">
        Example: <Variable>user.email</Variable>
      </p>
      <p className="text-sm mt-1">
        Result: <Variable>founders@swishjam.com</Variable>
      </p>
      <p className="text-sm mt-1">
        Fallback values: <Variable>user.name || user.email || 'friend'</Variable>
      </p>
      <p className="text-sm mt-1">
        Using the<span className="ml-1 text-sm px-1.5 py-0.5 border border-zinc-200 bg-accent rounded-sm transition-colors cursor-default hover:bg-gray-200">||</span> allows you to provide a default value if the variable is not defined.
        These can be chained together, and the first defined value will be used.
      </p>

      <p className="text-sm font-medium mt-4">Event Variables</p>
      <p className="text-sm mt-1">
        Each event will have unique variables depending on the event. Custom variables that you pass to Swishjam can be referenced in the body of the email, subject line, etc.
      </p>
      {eventName && availableEventProperties && (
        <>
          <p className="text-sm mt-1 break-words">
            The <span className="ml-1 text-sm px-1.5 py-0.5 border border-zinc-200 bg-accent rounded-sm transition-colors cursor-default hover:bg-gray-200">{eventName}</span> event has the following properties:
          </p>
          <div className='flex flex-wrap gap-1 mt-1'>
            {availableEventProperties.map((property, i) => <Variable key={i}>{`event.${property}`}</Variable>)}
          </div>
        </>
      )}
      <p className="text-sm font-medium mt-4">User Variables</p>
      <p className="text-sm mt-1">
        User variables are a combination of the attributes Swishjam automatically applies to a user and any custom attributes you pass to Swishjam during events/identify calls.
      </p>
      <p className="text-sm mt-1">The following user variables are available to you:</p>
      {availableUserProperties && (
        <div className='flex flex-wrap gap-1 mt-1'>
          {availableUserProperties.map((property, i) => <Variable key={i}>{property}</Variable>)}
        </div>
      )}
      {additionalSections.map((section, i) => <div key={i} className="mt-4">{section}</div>)}
    </div>
  )
}