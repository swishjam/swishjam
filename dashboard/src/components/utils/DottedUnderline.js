export default function DottedUnderline({ children, cursor = 'default', ...props }) {
  return (
    <span
      {...props}
      className={`italic underline decoration-dotted text-gray-600 hover:text-gray-800 cursor-${cursor} transition-colors text-sm ${props.className || ''}`}
    >
      {children}
    </span>
  )
}