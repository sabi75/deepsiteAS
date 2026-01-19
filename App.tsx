
import React, { useState, useCallback, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import CodeEditor from './components/CodeEditor';
import LivePreview from './components/LivePreview';
import AIChat from './components/AIChat';
import SettingsModal from './components/SettingsModal';
import { FileItem, ProjectState, AISettings } from './types';
import { updateProjectWithAI } from './services/ai';

const INITIAL_SETTINGS: AISettings = {
  provider: 'gemini',
  modelId: 'gemini-3-pro-preview',
  openRouterKey: '',
  deepSeekKey: '',
};

const INITIAL_FILES: FileItem[] = [
  {
    id: '1',
    name: 'index.html',
    language: 'html',
    content: `<!DOCTYPE html>
<html>
<head>
  <title>DeepSiteAS - Dynamic Web Editor</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js"></script>
</head>
<body class="bg-[#0d1117] text-[#e6edf3] min-h-screen flex flex-col items-center justify-center p-8">
  <div class="max-w-3xl w-full text-center space-y-12">
    <header class="space-y-4">
      <h1 id="main-title" class="text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500">
        DeepSiteAS
      </h1>
      <p class="text-xl text-[#7d8590] font-light tracking-wide">
        Create Dynamic Web Experiences
      </p>
    </header>

    <div class="bg-[#161b22] border border-[#30363d] rounded-3xl p-10 shadow-2xl transform hover:scale-[1.02] transition-transform">
      <div class="flex items-center justify-center gap-4 mb-8 text-2xl font-semibold">
        <span>🚀 Features</span>
      </div>
      <ul class="grid grid-cols-1 md:grid-cols-2 gap-6 text-left text-lg">
        <li class="flex items-center gap-3 text-emerald-400">
          <i class="fa-solid fa-check-circle"></i>
          <span class="text-[#e6edf3]">Interactive Forms</span>
        </li>
        <li class="flex items-center gap-3 text-emerald-400">
          <i class="fa-solid fa-check-circle"></i>
          <span class="text-[#e6edf3]">Real-time Animations</span>
        </li>
        <li class="flex items-center gap-3 text-emerald-400">
          <i class="fa-solid fa-check-circle"></i>
          <span class="text-[#e6edf3]">Smart Modifications</span>
        </li>
        <li class="flex items-center gap-3 text-emerald-400">
          <i class="fa-solid fa-check-circle"></i>
          <span class="text-[#e6edf3]">JavaScript Interactivity</span>
        </li>
      </ul>
    </div>

    <div class="flex flex-col items-center gap-6">
      <button 
        id="cta-button"
        class="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white px-10 py-5 rounded-full font-bold text-xl shadow-[0_0_40px_rgba(236,72,153,0.3)] transition-all hover:shadow-[0_0_60px_rgba(236,72,153,0.5)] transform active:scale-95"
      >
        Start Creating! ✨
      </button>
      
      <div class="flex items-center gap-4">
        <a href="#" class="bg-[#21262d] border border-[#30363d] hover:bg-[#30363d] text-[#e6edf3] px-6 py-3 rounded-xl flex items-center gap-3 text-sm font-medium transition-all">
          <i class="fa-solid fa-star text-yellow-500"></i>
          Give a Star on GitHub
        </a>
      </div>
    </div>
    
    <p class="text-sm text-[#7d8590] max-w-lg mx-auto leading-relaxed">
      Ask AI to build dynamic pages OR enhance existing web experiences. Use the chat bar below to start.
    </p>
  </div>

  <script src="script.js"></script>
</body>
</html>`
  },
  {
    id: '2',
    name: 'script.js',
    language: 'javascript',
    content: `// Animation logic using GSAP
gsap.from("#main-title", {
  duration: 1.5,
  y: -50,
  opacity: 0,
  ease: "power4.out"
});

gsap.from(".bg-[#161b22]", {
  duration: 1.2,
  scale: 0.9,
  opacity: 0,
  delay: 0.5,
  ease: "elastic.out(1, 0.75)"
});

const btn = document.getElementById('cta-button');
btn.addEventListener('click', () => {
  gsap.to(btn, {
    scale: 1.2,
    duration: 0.1,
    yoyo: true,
    repeat: 1,
    onComplete: () => {
      alert("Let's build something amazing together! Use the AI chat to give me instructions.");
    }
  });
});`
  }
];

const App: React.FC = () => {
  const [project, setProject] = useState<ProjectState>({
    files: INITIAL_FILES,
    activeFileId: '1',
  });
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settings, setSettings] = useState<AISettings>(() => {
    const saved = localStorage.getItem('deepsiteas_settings');
    return saved ? JSON.parse(saved) : INITIAL_SETTINGS;
  });

  useEffect(() => {
    localStorage.setItem('deepsiteas_settings', JSON.stringify(settings));
  }, [settings]);

  const activeFile = project.files.find(f => f.id === project.activeFileId) || project.files[0];

  const handleUpdateCode = useCallback((newContent: string) => {
    setProject(prev => ({
      ...prev,
      files: prev.files.map(f => 
        f.id === prev.activeFileId ? { ...f, content: newContent } : f
      ),
    }));
  }, []);

  const handleSelectFile = (id: string) => {
    setProject(prev => ({ ...prev, activeFileId: id }));
  };

  const handleAddFile = () => {
    const name = prompt('File name:');
    if (name) {
      const extension = name.split('.').pop();
      let language: 'html' | 'css' | 'javascript' = 'html';
      if (extension === 'css') language = 'css';
      if (extension === 'js') language = 'javascript';
      
      const newFile: FileItem = {
        id: Date.now().toString(),
        name,
        language,
        content: '',
      };
      setProject(prev => ({
        ...prev,
        files: [...prev.files, newFile],
        activeFileId: newFile.id,
      }));
    }
  };

  const handleSendMessage = async (msg: string) => {
    setIsAiLoading(true);
    try {
      const result = await updateProjectWithAI(msg, project.files, settings);
      
      setProject(prev => {
        const updatedFiles = [...prev.files];
        
        result.files.forEach(newFile => {
          const existingIndex = updatedFiles.findIndex(f => f.name === newFile.name);
          if (existingIndex !== -1) {
            updatedFiles[existingIndex] = {
              ...updatedFiles[existingIndex],
              content: newFile.content,
            };
          } else {
            const extension = newFile.name.split('.').pop();
            let language: 'html' | 'css' | 'javascript' = 'html';
            if (extension === 'css') language = 'css';
            if (extension === 'js') language = 'javascript';

            updatedFiles.push({
              id: Date.now().toString() + Math.random(),
              name: newFile.name,
              language,
              content: newFile.content,
            });
          }
        });

        return {
          ...prev,
          files: updatedFiles,
        };
      });
      
      if (result.explanation) {
        console.log("AI Explanation:", result.explanation);
      }
    } catch (error: any) {
      console.error("AI Error:", error);
      alert(error.message || "Failed to generate code. Please try again.");
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleExport = () => {
    const html = project.files.find(f => f.name === 'index.html')?.content || '';
    const css = project.files.filter(f => f.name.endsWith('.css')).map(f => f.content).join('\n');
    const js = project.files.filter(f => f.name.endsWith('.js')).map(f => f.content).join('\n');
    
    const fullCode = `
      <!-- Exported from DeepSiteAS -->
      ${html.replace('</head>', `<style>${css}</style></head>`).replace('</body>', `<script>${js}</script></body>`)}
    `;
    
    const blob = new Blob([fullCode], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'deepsiteas_project.html';
    a.click();
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Settings Modal */}
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        settings={settings}
        onSave={setSettings}
      />

      {/* Header */}
      <header className="h-14 bg-[#010409] border-b border-[#30363d] flex items-center justify-between px-6 z-30">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
              <i className="fa-solid fa-brain text-purple-400 text-lg"></i>
            </div>
            <span className="text-lg font-bold tracking-tight text-[#f0f6fc]">DeepSiteAS</span>
          </div>
          <div className="h-6 w-[1px] bg-[#30363d]"></div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsSettingsOpen(true)}
              className="text-xs font-medium text-[#7d8590] hover:text-[#f0f6fc] px-3 py-1.5 rounded-md hover:bg-[#21262d] transition-colors flex items-center gap-2"
            >
              <i className="fa-solid fa-sliders"></i> {settings.provider === 'gemini' ? 'Gemini' : settings.modelId.split('/').pop()}
            </button>
            <button 
              onClick={handleExport}
              className="text-xs font-medium text-[#7d8590] hover:text-[#f0f6fc] px-3 py-1.5 rounded-md hover:bg-[#21262d] transition-colors flex items-center gap-2"
            >
              <i className="fa-solid fa-download"></i> Export
            </button>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-[10px] text-[#7d8590] bg-[#161b22] px-2 py-1 rounded border border-[#30363d]">
            AI: {settings.provider.toUpperCase()}
          </span>
          <button className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold px-6 py-2 rounded-lg transition-colors shadow-lg shadow-blue-900/20">
            Publish
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex overflow-hidden">
        <Sidebar 
          files={project.files} 
          activeFileId={project.activeFileId} 
          onSelectFile={handleSelectFile} 
          onAddFile={handleAddFile} 
        />
        <div className="flex-1 flex relative overflow-hidden">
          <CodeEditor file={activeFile} onChange={handleUpdateCode} />
          <AIChat 
            onSendMessage={handleSendMessage} 
            isLoading={isAiLoading} 
            onOpenSettings={() => setIsSettingsOpen(true)}
          />
        </div>
        <LivePreview files={project.files} />
      </main>
    </div>
  );
};

export default App;
