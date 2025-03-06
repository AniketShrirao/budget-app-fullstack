export const CHAT_COMMANDS = {
  HELP: {
    command: ['help', 'what can you do', 'budget help'],
    response: `I can help you with:
• Adding transactions
• Checking balances
• Viewing summaries
• Managing budget

Click any option below or type your question!`
  },
  ADD_TRANSACTION: {
    command: ['add transaction', 'new transaction', 'create transaction'],
    response: `To add a new transaction:
1. Go to the Transactions page
2. Click the + button
3. Fill in the transaction details
4. Click Save

Would you like me to help you with anything specific?`,
    actions: [
      { text: 'Go to Transactions', command: 'navigate_transactions' },
      { text: 'Show Categories', command: 'show_categories' },
      { text: 'Add Income', command: 'add_income' }
    ]
  },
  SUMMARY: {
    command: ['summary', 'show summary', 'view summary'],
    response: 'The Summary page shows your spending patterns and budget overview with monthly breakdowns and category-wise spending.'
  },
  GREETING: {
    command: ['hello', 'hi', 'hey'],
    response: 'Hello! How can I assist you with your budget today?'
  },
  BALANCE: {
    command: ['balance', 'show balance', 'check balance'],
    response: 'Your current balance and transaction history can be viewed on the Dashboard.'
  }
};

export const VOICE_COMMANDS = {
  ACTIVATE: ['hey jarvis', 'hi jarvis', 'hello jarvis', 'jarvis'],
  TURN_ON_MIC: ['turn on mic', 'start listening', 'start mic', 'start', 'wake up'],
  TURN_OFF_MIC: ['turn off mic', 'stop listening', 'stop mic', 'pause'],
  CLOSE_CHAT: ['close chat', 'goodbye', 'bye jarvis', 'close jarvis', 'exit', 'close', 'bye'],
  SEND_MESSAGE: ['send', 'send message', 'submit', 'send this']
};

export const CHAT_RESPONSES = {
  INITIAL: "Hi! I'm your budget assistant. How can I help you?",
  MIC_ON: "Voice input activated. You can speak now.",
  MIC_OFF: "Voice input stopped. Click the microphone icon or say 'start listening' to resume.",
  CLOSING: "Goodbye! Call me anytime by saying 'Hey Jarvis'.",
  ACTIVATED: "Hello! How can I help you today?",
  LISTENING: "I'm listening...",
  NOT_UNDERSTOOD: "I'm sorry, I didn't understand that. Could you rephrase?",
  ERROR: "Sorry, I encountered an error. Please try again.",
  PROCESSING: "Processing your request...",
  PAUSED: "I'll wait here. Say 'resume' or 'wake up Jarvis' when you want to continue.",
  RESUMED: "I'm back and listening!",
  WINDOW_BLUR: "I'll keep listening in the background.",
  WINDOW_FOCUS: "Welcome back! I'm still here to help."
};

export const SPEECH_RECOGNITION_CONFIG = {
  continuous: true,
  language: 'en-US',
  interimResults: true,
  maxAlternatives: 1
};

export const INITIAL_MESSAGE = CHAT_RESPONSES.INITIAL;