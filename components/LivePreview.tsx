
import React, { useMemo, useState, useEffect } from 'react';
import { FileItem } from '../types';

interface LivePreviewProps {
  files: FileItem[];
}

const LivePreview: React.FC<LivePreviewProps> = ({ files }) => {
  const [key, setKey] = useState(0);

  const combinedSrc = useMemo(() => {
    const htmlFile = files.find(f => f.name.endsWith('.html'));
    const cssFiles = files.filter(f => f.name.endsWith('.css'));
    const jsFiles = files.filter(f => f.name.endsWith('.js'));

    if (!htmlFile) return 'data:text/html;charset=utf-8,' + encodeURIComponent('<h1>No index.html found</h1>');

    let content = htmlFile.content;

    // Inject CSS
    const styles = cssFiles.map(f => `<style>${f.content}</style>`).join('\n');
    content = content.replace('</head>', `${styles}\n</head>`);

    // Inject JS (at the end of body)
    const scripts = jsFiles.map(f => `<script>${f.content}</script>`).join('\n');
    if (content.includes('</body>')) {
      content = content.replace('</body>', `${scripts}\n</body>`);
    } else {
      content += scripts;
    }

    return content;
  }, [files]);

  const refresh = () => setKey(prev => prev + 1);

  return (
    <div className="flex-1 flex flex-col bg-white border-l border-[#30363d]">
      <div className="flex items-center justify-between bg-[#161b22] px-4 py-2 border-b border-[#30363d]">
        <span className="text-xs font-medium text-[#7d8590] tracking-wide">Preview</span>
        <button 
          onClick={refresh}
          className="text-xs text-[#7d8590] hover:text-[#e6edf3] flex items-center gap-2 px-2 py-1 bg-[#21262d] rounded border border-[#30363d] transition-colors"
        >
          <i className="fa-solid fa-rotate-right"></i>
          Refresh Preview
        </button>
      </div>
      <div className="flex-1 bg-white">
        <iframe
          key={key}
          title="preview"
          srcDoc={combinedSrc}
          className="w-full h-full border-none"
          sandbox="allow-scripts allow-forms allow-modals allow-popups"
        />
      </div>
    </div>
  );
};

export default LivePreview;
