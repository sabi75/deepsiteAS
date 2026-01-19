
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

const START_PAGE_CONTENT = `<!DOCTYPE html>
<html>
  <head>
    <title>DeepSiteAS - Dynamic Web Editor</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta charset="utf-8">
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js"></script>
  </head>
  <body class="min-h-screen bg-gray-900 text-white flex items-center justify-center">
    <div class="max-w-2xl mx-auto text-center p-8">
      <div class="mb-8">
        <h1 class="text-6xl font-bold bg-gradient-to-r from-pink-400 to-blue-400 bg-clip-text text-transparent mb-4 animate-pulse">
          DeepSiteAS
        </h1>
        <p class="text-xl text-gray-300 mb-6">Create Dynamic Web Experiences</p>
      </div>

      <div class="bg-gray-800 rounded-xl p-6 mb-8 shadow-2xl">
        <h3 class="text-lg font-semibold mb-4 text-blue-400">🚀 Features</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-left text-sm">
          <div class="flex items-center space-x-2">
            <span class="text-green-400">✓</span>
            <span>Interactive Forms</span>
          </div>
          <div class="flex items-center space-x-2">
            <span class="text-green-400">✓</span>
            <span>Real-time Animations</span>
          </div>
          <div class="flex items-center space-x-2">
            <span class="text-green-400">✓</span>
            <span>Smart Modifications</span>
          </div>
          <div class="flex items-center space-x-2">
            <span class="text-green-400">✓</span>
            <span>JavaScript Interactivity</span>
          </div>
        </div>
      </div>

      <button onclick="handleClick()"
        class="bg-gradient-to-r from-pink-500 to-violet-500 hover:from-pink-600 hover:to-violet-600 text-white font-bold py-4 px-8 rounded-full text-lg shadow-lg transform transition hover:scale-105 animate-bounce">
        Start Creating! ✨
      </button>

      <p class="text-gray-400 text-sm mt-6">
        Ask AI to build dynamic pages OR enhance existing web experiences
      </p>
    </div>

    <script>
      function handleClick() {
        const button = event.target;
        gsap.to(button, {
          scale: 0.95,
          yoyo: true,
          repeat: 1,
          duration: 0.2,
          ease: "power2.out"
        });

        const features = document.querySelectorAll('.text-sm .text-green-400');
        gsap.fromTo(features,
          { opacity: 0, x: -20 },
          {
            opacity: 1,
            x: 0,
            stagger: 0.1,
            duration: 0.5,
            ease: "back.out(1.7)"
          }
        );

        setTimeout(() => {
          alert('🌟 Ready to create amazing web experiences! Ask AI anything!');
        }, 500);
      }

      // Add some initial animations
      gsap.from('.animate-pulse', {
        opacity: 0,
        y: -30,
        duration: 1.5,
        ease: "power2.out"
      });

      gsap.from('.bg-gray-800', {
        opacity: 0,
        scale: 0.9,
        duration: 1,
        delay: 0.3,
        ease: "back.out(1.7)"
      });

      gsap.from('.bg-gradient-to-r:last-child', {
        opacity: 0,
        y: 20,
        duration: 1,
        delay: 0.6,
        ease: "power2.out"
      });

      // Add interactive hover effects
      const button = document.querySelector('button');
      button.addEventListener('mouseenter', () => {
        gsap.to(button, { scale: 1.05, duration: 0.2 });
      });
      button.addEventListener('mouseleave', () => {
        gsap.to(button, { scale: 1, duration: 0.2 });
      });
    </script>
  </body>
</html>`;

const INITIAL_FILES: FileItem[] = [
  {
    id: 'initial-index-html',
    name: 'index.html',
    language: 'html',
    content: START_PAGE_CONTENT,
  }
];

const App: React.FC = () => {
  const [project, setProject] = useState<ProjectState>({
    files: INITIAL_FILES,
    activeFileId: 'initial-index-html',
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

  const handleNewProject = () => {
    const confirm = window.confirm("Are you sure you want to start a new project? All current changes will be reset to the start page.");
    if (!confirm) return;
    
    setProject({
      files: INITIAL_FILES,
      activeFileId: 'initial-index-html',
    });
  };

  const handleAddFile = () => {
    const name = prompt('File name (e.g. index.html, styles.css, app.js):');
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
        let firstNewFileId = '';
        
        result.files.forEach(newFile => {
          const existingIndex = updatedFiles.findIndex(f => f.name === newFile.name);
          if (existingIndex !== -1) {
            updatedFiles[existingIndex] = {
              ...updatedFiles[existingIndex],
              content: newFile.content,
            };
            if (!firstNewFileId) firstNewFileId = updatedFiles[existingIndex].id;
          } else {
            const extension = newFile.name.split('.').pop();
            let language: 'html' | 'css' | 'javascript' = 'html';
            if (extension === 'css') language = 'css';
            if (extension === 'js') language = 'javascript';

            const id = Date.now().toString() + Math.random();
            updatedFiles.push({
              id,
              name: newFile.name,
              language,
              content: newFile.content,
            });
            if (!firstNewFileId) firstNewFileId = id;
          }
        });

        return {
          ...prev,
          files: updatedFiles,
          activeFileId: prev.activeFileId || firstNewFileId
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
    if (project.files.length === 0) {
      alert("No files to export.");
      return;
    }
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
              onClick={handleNewProject}
              className="text-xs font-medium text-[#7d8590] hover:text-[#f0f6fc] px-3 py-1.5 rounded-md hover:bg-[#21262d] transition-colors flex items-center gap-2"
              title="Start a fresh project"
            >
              <i className="fa-solid fa-plus"></i> New Project
            </button>
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
          <button 
            onClick={handleExport}
            className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold px-6 py-2 rounded-lg transition-colors shadow-lg shadow-blue-900/20"
          >
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
          {activeFile ? (
            <CodeEditor file={activeFile} onChange={handleUpdateCode} />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-[#484f58] bg-[#0d1117] p-12 text-center">
              <div className="w-24 h-24 bg-[#161b22] rounded-3xl flex items-center justify-center mb-6 border border-[#30363d]">
                <i className="fa-solid fa-code-branch text-4xl opacity-20"></i>
              </div>
              <h3 className="text-xl font-semibold text-[#e6edf3] mb-2">No files in project</h3>
              <p className="text-sm max-w-xs text-[#7d8590]">
                Use the AI chat bar below or click the <i className="fa-solid fa-plus mx-1"></i> button in the sidebar to create your first file.
              </p>
            </div>
          )}
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
