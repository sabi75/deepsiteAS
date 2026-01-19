
import React from 'react';
import { AISettings, AIProvider, AIModel } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AISettings;
  onSave: (settings: AISettings) => void;
}

export const AVAILABLE_MODELS: AIModel[] = [
  // Gemini
  { id: 'gemini-3-pro-preview', name: 'Gemini 3 Pro', provider: 'gemini' },
  { id: 'gemini-3-flash-preview', name: 'Gemini 3 Flash', provider: 'gemini' },
  // OpenRouter (12 models now including DeepSeek variants)
  { id: 'openai/gpt-4o', name: 'GPT-4o (OpenRouter)', provider: 'openrouter' },
  { id: 'openai/gpt-4o-mini', name: 'GPT-4o Mini (OpenRouter)', provider: 'openrouter' },
  { id: 'anthropic/claude-3.5-sonnet', name: 'Claude 3.5 Sonnet (OpenRouter)', provider: 'openrouter' },
  { id: 'anthropic/claude-3-haiku', name: 'Claude 3 Haiku (OpenRouter)', provider: 'openrouter' },
  { id: 'meta-llama/llama-3.1-405b', name: 'Llama 3.1 405B (OpenRouter)', provider: 'openrouter' },
  { id: 'meta-llama/llama-3.1-70b', name: 'Llama 3.1 70B (OpenRouter)', provider: 'openrouter' },
  { id: 'google/gemini-pro-1.5', name: 'Gemini Pro 1.5 (OpenRouter)', provider: 'openrouter' },
  { id: 'mistralai/mistral-large', name: 'Mistral Large (OpenRouter)', provider: 'openrouter' },
  { id: 'perplexity/sonar-reasoning', name: 'Perplexity Sonar (OpenRouter)', provider: 'openrouter' },
  { id: 'qwen/qwen-2.5-72b-instruct', name: 'Qwen 2.5 72B (OpenRouter)', provider: 'openrouter' },
  { id: 'deepseek/deepseek-chat', name: 'DeepSeek V3 (OpenRouter)', provider: 'openrouter' },
  { id: 'deepseek/deepseek-r1', name: 'DeepSeek R1 (OpenRouter)', provider: 'openrouter' },
  // DeepSeek Direct (3 models)
  { id: 'deepseek-chat', name: 'DeepSeek Chat (V3) Direct', provider: 'deepseek' },
  { id: 'deepseek-coder', name: 'DeepSeek Coder Direct', provider: 'deepseek' },
  { id: 'deepseek-reasoner', name: 'DeepSeek Reasoner Direct', provider: 'deepseek' },
];

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, settings, onSave }) => {
  const [localSettings, setLocalSettings] = React.useState<AISettings>(settings);

  if (!isOpen) return null;

  const handleProviderChange = (provider: AIProvider) => {
    const firstModel = AVAILABLE_MODELS.find(m => m.provider === provider);
    setLocalSettings({ ...localSettings, provider, modelId: firstModel?.id || '' });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-[#161b22] border border-[#30363d] w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="px-6 py-4 border-b border-[#30363d] flex items-center justify-between bg-[#0d1117]">
          <h2 className="text-lg font-bold text-[#f0f6fc] flex items-center gap-2">
            <i className="fa-solid fa-gears text-blue-400"></i> AI Settings
          </h2>
          <button onClick={onClose} className="text-[#7d8590] hover:text-[#f0f6fc]">
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Provider Selection */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-[#7d8590] uppercase tracking-wider">AI Provider</label>
            <div className="grid grid-cols-3 gap-2">
              {(['gemini', 'openrouter', 'deepseek'] as AIProvider[]).map((p) => (
                <button
                  key={p}
                  onClick={() => handleProviderChange(p)}
                  className={`py-2 px-3 rounded-xl border text-sm font-medium transition-all ${
                    localSettings.provider === p 
                    ? 'bg-blue-600/10 border-blue-500 text-blue-400' 
                    : 'bg-[#0d1117] border-[#30363d] text-[#7d8590] hover:border-[#484f58]'
                  }`}
                >
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Model Selection */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-[#7d8590] uppercase tracking-wider">Model</label>
            <select
              value={localSettings.modelId}
              onChange={(e) => setLocalSettings({ ...localSettings, modelId: e.target.value })}
              className="w-full bg-[#0d1117] border border-[#30363d] text-[#e6edf3] text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            >
              {AVAILABLE_MODELS.filter(m => m.provider === localSettings.provider).map(m => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>

          {/* API Keys */}
          {localSettings.provider === 'openrouter' && (
            <div className="space-y-2 animate-in slide-in-from-top-2 duration-200">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-[#7d8590] uppercase tracking-wider">OpenRouter API Key</label>
                <a href="https://openrouter.ai/keys" target="_blank" rel="noopener noreferrer" className="text-[10px] text-blue-400 hover:underline">Get Key</a>
              </div>
              <input
                type="password"
                value={localSettings.openRouterKey}
                onChange={(e) => setLocalSettings({ ...localSettings, openRouterKey: e.target.value })}
                placeholder="sk-or-v1-..."
                className="w-full bg-[#0d1117] border border-[#30363d] text-[#e6edf3] text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            </div>
          )}

          {localSettings.provider === 'deepseek' && (
            <div className="space-y-2 animate-in slide-in-from-top-2 duration-200">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-[#7d8590] uppercase tracking-wider">DeepSeek API Key</label>
                <a href="https://platform.deepseek.com/api_keys" target="_blank" rel="noopener noreferrer" className="text-[10px] text-blue-400 hover:underline">Get Key</a>
              </div>
              <input
                type="password"
                value={localSettings.deepSeekKey}
                onChange={(e) => setLocalSettings({ ...localSettings, deepSeekKey: e.target.value })}
                placeholder="sk-..."
                className="w-full bg-[#0d1117] border border-[#30363d] text-[#e6edf3] text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            </div>
          )}

          {localSettings.provider === 'gemini' && (
            <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
              <p className="text-xs text-blue-400 leading-relaxed">
                Gemini uses the system-provided environment key. No extra configuration required.
              </p>
            </div>
          )}
        </div>

        <div className="px-6 py-4 bg-[#0d1117] border-t border-[#30363d] flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-[#7d8590] hover:text-[#f0f6fc] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => { onSave(localSettings); onClose(); }}
            className="px-6 py-2 text-sm font-bold bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-lg shadow-blue-900/20 transition-all active:scale-95"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
