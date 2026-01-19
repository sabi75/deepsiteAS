
import React from 'react';
import { FileItem } from '../types';

interface SidebarProps {
  files: FileItem[];
  activeFileId: string;
  onSelectFile: (id: string) => void;
  onAddFile: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ files, activeFileId, onSelectFile, onAddFile }) => {
  return (
    <div className="w-64 bg-[#0d1117] border-r border-[#30363d] flex flex-col h-full">
      <div className="p-4 border-b border-[#30363d] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <i className="fa-solid fa-folder-open text-[#7d8590]"></i>
          <span className="font-semibold text-sm tracking-tight text-[#e6edf3]">Project</span>
        </div>
        <button 
          onClick={onAddFile}
          className="p-1 hover:bg-[#21262d] rounded text-[#7d8590] transition-colors"
          title="New File"
        >
          <i className="fa-solid fa-plus text-xs"></i>
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto py-2">
        {files.map((file) => (
          <button
            key={file.id}
            onClick={() => onSelectFile(file.id)}
            className={`w-full flex items-center gap-3 px-4 py-2 text-sm transition-colors ${
              activeFileId === file.id 
                ? 'bg-[#21262d] text-[#e6edf3] border-l-2 border-blue-500' 
                : 'text-[#7d8590] hover:bg-[#161b22] hover:text-[#e6edf3]'
            }`}
          >
            <i className={`fa-solid ${
              file.name.endsWith('.html') ? 'fa-code text-orange-400' :
              file.name.endsWith('.css') ? 'fa-hashtag text-blue-400' :
              'fa-bolt text-yellow-400'
            } text-xs w-4`}></i>
            <span className="truncate">{file.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
