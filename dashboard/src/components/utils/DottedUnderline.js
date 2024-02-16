export default function DottedUnderline({ children, ...props }) {
  return (
    <span
      {...props}
      className={`italic underline decoration-dotted text-gray-600 hover:text-gray-900 cursor-default transition-colors text-sm ${props.className || ''}`}
    >
      {children}
    </span>
  )
}