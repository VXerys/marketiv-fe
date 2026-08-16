export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ChatRequest {
  messages: ChatMessage[];
  currentPath: string;
}

export interface ChatResponse {
  message: string;
  suggestions: string[];
}
