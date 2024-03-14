import CopiableText from "./CopiableText";

export default function FormattedSwishjamVariable({ children, includeBrackets = true, copiable = true }) {
  const content = (
    <span className="text-sm group text-emerald-500 bg-emerald-50 transition-colors hover:bg-emerald-100 italic px-1 py-0.5 rounded-md whitespace-nowrap">
      {includeBrackets && '{{ '}
      {children.split('||').map((variable, i) => {
        const variableColor = variable.trim().startsWith('"') || variable.trim().startsWith("'") ? 'text-orange-500 group-hover:text-orange-600' : 'text-emerald-600 group-hover:text-emerald-700';
        return (
          <span key={i}>
            <span className={variableColor}>{variable.trim()}</span>
            {i !== children.split('||').length - 1 && <span className="text-sm text-emerald-500 transition-colors italic px-1 py-0.5 rounded-md whitespace-nowrap">||</span>}
          </span>
        )
      })}
      {includeBrackets && ' }}'}
    </span>
  )
  if (copiable) {
    return (
      <CopiableText value={`{{ ${children} }}`}>
        {content}
      </CopiableText>
    )
  } else {
    return content;
  }
}