
import React, { useState } from 'react';

interface AIChatProps {
  onSendMessage: (msg: string) => void;
  isLoading: boolean;
  onOpenSettings: () => void;
}

const AIChat: React.FC<AIChatProps> = ({ onSendMessage, isLoading, onOpenSettings }) => {
  const [input, setInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input);
      setInput('');
    }
  };

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-2xl z-20">
      <form 
        onSubmit={handleSubmit}
        className="bg-[#161b22] border border-[#30363d] rounded-2xl shadow-2xl p-2 flex items-center gap-2 group focus-within:border-blue-500/50 transition-all duration-300"
      >
        <div className="pl-3 text-blue-400">
          <i className="fa-solid fa-wand-magic-sparkles"></i>
        </div>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask AI to build dynamic pages or enhance features..."
          className="flex-1 bg-transparent text-sm py-2 px-1 focus:outline-none text-[#e6edf3] placeholder-[#7d8590]"
          disabled={isLoading}
        />
        <div className="flex items-center gap-2 pr-1">
          <button
            type="button"
            onClick={onOpenSettings}
            className="p-2 hover:bg-[#21262d] rounded-xl text-[#7d8590] hover:text-blue-400 transition-colors"
            title="AI Settings"
          >
            <i className="fa-solid fa-cog"></i>
          </button>
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className={`p-2 rounded-xl transition-all ${
              isLoading || !input.trim() 
                ? 'text-[#484f58] bg-transparent' 
                : 'bg-gradient-to-tr from-pink-500 to-purple-500 text-white shadow-lg'
            }`}
          >
            {isLoading ? (
              <i className="fa-solid fa-spinner fa-spin"></i>
            ) : (
              <i className="fa-solid fa-paper-plane"></i>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AIChat;
