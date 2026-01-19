
export interface FileItem {
  id: string;
  name: string;
  content: string;
  language: 'html' | 'css' | 'javascript';
}

export interface ProjectState {
  files: FileItem[];
  activeFileId: string;
}

export type AIProvider = 'gemini' | 'openrouter' | 'deepseek';

export interface AIModel {
  id: string;
  name: string;
  provider: AIProvider;
}

export interface AISettings {
  provider: AIProvider;
  modelId: string;
  openRouterKey: string;
  deepSeekKey: string;
}

export interface AIUpdateResponse {
  files: {
    name: string;
    content: string;
  }[];
  explanation: string;
}
