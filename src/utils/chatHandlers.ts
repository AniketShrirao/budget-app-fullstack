import { CHAT_COMMANDS, VOICE_COMMANDS, CHAT_RESPONSES } from '../constants/chatbot';

export const processCommand = (
  input: string,
  handlers?: {
    handleMicToggle?: () => void;
    handleClose?: () => void;
    handleSend?: (message: string) => void;
  }
): string => {
  const text = input.toLowerCase().trim();
  
  // Handle voice-specific commands first
  if (handlers) {
    // Check for chat close commands
    if (VOICE_COMMANDS.CLOSE_CHAT.some(cmd => text.includes(cmd))) {
      handlers.handleClose?.();
      return CHAT_RESPONSES.CLOSING;
    }

    // Check for mic toggle commands
    if (VOICE_COMMANDS.TURN_OFF_MIC.some(cmd => text.includes(cmd))) {
      handlers.handleMicToggle?.();
      return CHAT_RESPONSES.MIC_OFF;
    }

    // Check for send command
    if (VOICE_COMMANDS.SEND_MESSAGE.some(cmd => text.includes(cmd))) {
      const cleanText = text
        .replace(/send|submit|send message|send this/gi, '')
        .trim();
      if (cleanText && handlers.handleSend) {
        handlers.handleSend(cleanText);
        return '';
      }
    }
  }

  // Process chat commands
  for (const [, value] of Object.entries(CHAT_COMMANDS)) {
    if (value.command.some(cmd => text.includes(cmd))) {
      return value.response;
    }
  }

  return CHAT_RESPONSES.NOT_UNDERSTOOD;
};

export const fuzzyMatch = (text: string, commands: string[]): boolean => {
  const cleanText = text.toLowerCase().trim();
  return commands.some(cmd => {
    const cleanCmd = cmd.toLowerCase().trim();
    return cleanText.includes(cleanCmd) || 
           cleanCmd.includes(cleanText) ||
           levenshteinDistance(cleanText, cleanCmd) <= 2;
  });
};

// Helper function for fuzzy matching
const levenshteinDistance = (a: string, b: string): number => {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const matrix = Array(b.length + 1).fill(null).map(() => Array(a.length + 1).fill(null));

  for (let i = 0; i <= a.length; i++) matrix[0][i] = i;
  for (let j = 0; j <= b.length; j++) matrix[j][0] = j;

  for (let j = 1; j <= b.length; j++) {
    for (let i = 1; i <= a.length; i++) {
      const substitutionCost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1,
        matrix[j - 1][i] + 1,
        matrix[j - 1][i - 1] + substitutionCost
      );
    }
  }

  return matrix[b.length][a.length];
};