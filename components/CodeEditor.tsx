
import React from 'react';
import { FileItem } from '../types';

interface CodeEditorProps {
  file: FileItem;
  onChange: (content: string) => void;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ file, onChange }) => {
  return (
    <div className="flex-1 flex flex-col h-full bg-[#0d1117] relative">
      <div className="flex items-center bg-[#161b22] px-4 py-2 border-b border-[#30363d]">
        <span className="text-xs font-medium text-[#7d8590] tracking-wide">{file.name}</span>
      </div>
      <div className="flex-1 relative overflow-hidden flex">
        <div className="w-12 bg-[#0d1117] text-[#484f58] text-right pr-3 pt-4 text-xs font-mono select-none border-r border-[#30363d]">
          {Array.from({ length: file.content.split('\n').length }).map((_, i) => (
            <div key={i}>{i + 1}</div>
          ))}
        </div>
        <textarea
          value={file.content}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 bg-transparent text-[#e6edf3] p-4 font-mono text-sm resize-none focus:outline-none caret-blue-500 leading-relaxed"
          spellCheck={false}
          autoFocus
        />
      </div>
    </div>
  );
};

export default CodeEditor;
