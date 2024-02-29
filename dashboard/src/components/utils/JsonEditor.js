import MonacoEditor from "@monaco-editor/react";

export default function JsonEditor({ json, onChange = () => { }, height = '200px', theme = 'vs-dark', minimap = false, readonly = false }) {
  // https://microsoft.github.io/monaco-editor/typedoc/interfaces/editor.IStandaloneEditorConstructionOptions.html
  return (
    <MonacoEditor
      height={height}
      language="json"
      theme={theme}
      value={JSON.stringify(json, null, 2)}
      onChange={j => onChange(JSON.parse(j))}
      options={{
        minimap: { enabled: minimap },
        scrollBeyondLastLine: false,
        matchBrackets: 'never',
        readOnly: readonly,
      }}
    />
  )
}