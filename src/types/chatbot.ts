export interface ChatMessage {
  text: string;
  isUser: boolean;
}

export interface ChatBotCommand {
  command: string;
  response: string;
}