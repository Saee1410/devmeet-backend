
import Editor from '@monaco-editor/react';

export default function MyCodeEditor({ code, onChange }) {
  return (
    <div style={{ height: '100%', width: '100%', minHeight: '300px' }}>
            <Editor
                height="100%"
                defaultLanguage="javascript"
                theme="vs-dark"
                value={code}
                onChange={onChange}
                options={{
                    fontSize: 14,
                    minimap: { enabled: false },
                    automaticLayout: true,
                }}
            />
        </div>
  )
}
