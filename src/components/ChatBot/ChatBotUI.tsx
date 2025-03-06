import { Box, Paper, IconButton, Typography, Fab } from '@mui/material';
import { Chat as ChatIcon, Close, Mic, MicOff, Send } from '@mui/icons-material';
import TextareaAutosize from '@mui/material/TextareaAutosize';
import { Button } from '../../design-system/components/Button';
import { ChatMessage } from '../../types/chatbot';
import { useTheme } from '@mui/material/styles';
import './ChatBot.scss';

interface ChatBotUIProps {
  isOpen: boolean;
  messages: ChatMessage[];
  inputValue: string;
  isProcessing: boolean;
  listening: boolean;
  transcript: string;
  isListeningForActivation: boolean;
  messagesEndRef: React.RefObject<HTMLDivElement>;
  inputRef: React.RefObject<HTMLTextAreaElement>;
  onOpen: () => void;
  onClose: () => void;
  onSend: () => void;
  onInputChange: (value: string) => void;
  onVoiceInput: () => void;
  setInputValueAndSend: (value: string) => void;
  onActivationIndicatorClick: () => void;
}

export const ChatBotUI: React.FC<ChatBotUIProps> = ({
  isOpen,
  messages,
  inputValue,
  isProcessing,
  listening,
  transcript,
  isListeningForActivation,
  messagesEndRef,
  inputRef,
  onOpen,
  onClose,
  onSend,
  onInputChange,
  onVoiceInput,
  setInputValueAndSend,
  onActivationIndicatorClick
}) => {
  const theme = useTheme();

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };
  
  return (
    <>
      {!isOpen && (
        <>
          <Fab
            color="primary"
            className="chatbot-trigger"
            onClick={onOpen}
            sx={{ 
              position: 'fixed', 
              bottom: 20, 
              right: 20,
              zIndex: theme.zIndex.drawer + 1
            }}
          >
            <ChatIcon />
          </Fab>
          {(
            <Box
              className="chatbot-activation-indicator"
              onClick={onActivationIndicatorClick}
              sx={{
                position: 'fixed',
                bottom: 80,
                right: 20,
                padding: '8px 16px',
                bgcolor: 'rgba(0, 0, 0, 0.6)',
                color: 'white',
                borderRadius: 2,
                zIndex: theme.zIndex.drawer + 1,
                display:  'flex',
                alignItems: 'center',
                gap: 1,
                cursor: 'pointer',
                '&:hover': {
                  bgcolor: 'rgba(0, 0, 0, 0.7)'
                }
              }}
            >
              <Mic sx={{ color: (listening || isListeningForActivation) ? '#f44336' : 'white' }} />
              Say "Hey Jarvis"
            </Box>
          )}
        </>
      )}

      {isOpen && (
        <Paper
          className="chatbot-container"
          sx={{
            position: 'fixed',
            bottom: 20,
            right: 20,
            width: 300,
            height: 400,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            zIndex: theme.zIndex.drawer + 1,
            boxShadow: theme.shadows[10]
          }}
        >
          <Box sx={{ 
            p: 2, 
            bgcolor: 'primary.main', 
            color: 'white',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <Typography>
              Budget Assistant {isProcessing && '(typing...)'} 
              {listening && !isListeningForActivation && '(Listening...)'}
            </Typography>
            <IconButton 
              size="small" 
              onClick={onClose}
              sx={{ color: 'white' }}
            >
              <Close />
            </IconButton>
          </Box>

          <Box 
            className="message-container"
            sx={{ 
              flex: 1, 
              overflowY: 'auto', 
              overflowX: 'hidden',
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              gap: 1,
              scrollBehavior: 'smooth'
            }}
          >
            {messages.map((msg, index) => {
              // Skip invalid messages
              if (!msg?.text || typeof msg.text !== 'string') {
                console.warn('Invalid message format:', msg);
                return null;
              }
              return (
                <Box
                  key={index}
                  sx={{
                    display: 'flex',
                    justifyContent: msg.isUser ? 'flex-end' : 'flex-start',
                    mb: 1
                  }}
                >
                  <Box
                    sx={{
                      bgcolor: msg.isUser ? 'primary.main' : 'grey.100',
                      color: msg.isUser ? 'white' : 'text.primary',
                      p: 1.5,
                      borderRadius: 2,
                      maxWidth: '80%',
                      whiteSpace: 'pre-line'
                    }}
                  >
                    <Typography variant="body2">
                      {typeof msg.text === 'string' ? msg.text : JSON.stringify(msg.text)}
                    </Typography>
                    {!msg.isUser && 
                      index === messages.length - 1 &&
                      (msg.text.toLowerCase().includes('how can i help you') ||
                       msg.text.toLowerCase().includes('i can help you with')) && (
                      <Box className="quick-actions" sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <Button
                          variant="outlined" 
                          size="small" 
                          className="action-button"
                          onClick={() => setInputValueAndSend("add transaction")}
                        >
                          Add Transaction
                        </Button>
                        <Button 
                          variant="outlined" 
                          size="small" 
                          className="action-button"
                          onClick={() => setInputValueAndSend("show balance")}
                        >
                          Check Balance
                        </Button>
                        <Button 
                          variant="outlined" 
                          size="small" 
                          className="action-button"
                          onClick={() => setInputValueAndSend("show summary")}
                        >
                          View Summary
                        </Button>
                        <Button 
                          variant="outlined" 
                          size="small" 
                          className="action-button"
                          onClick={() => setInputValueAndSend("budget help")}
                        >
                          Budget Help
                        </Button>
                      </Box>
                    )}
                  </Box>
                </Box>
              );
            })}
            <div ref={messagesEndRef} style={{ float: 'left', clear: 'both' }} />
          </Box>

          <Box sx={{ p: 2, display: 'flex', gap: 1 }}>
            <IconButton 
              color={listening ? "error" : "primary"} 
              onClick={onVoiceInput}
              disabled={isProcessing}
            >
              {listening ? <Mic /> : <MicOff />}
            </IconButton>
            <TextareaAutosize
              ref={inputRef}
              style={{
                width: '100%',
                padding: '8px 14px',
                borderRadius: '4px',
                border: '1px solid rgba(0, 0, 0, 0.23)',
                fontFamily: 'inherit',
                fontSize: 'inherit',
                resize: 'none',
                minHeight: '40px',
                maxHeight: '100px',
                backgroundColor: listening ? 'rgba(0, 0, 0, 0.05)' : 'inherit'
              }}
              value={listening ? transcript : inputValue}
              onChange={(e) => !listening && onInputChange(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={listening ? "Listening..." : "Type your message..."}
              disabled={listening || isProcessing}
            />
            <IconButton 
              color="primary" 
              onClick={onSend}
              disabled={isProcessing || (!inputValue.trim() && !transcript.trim())}
            >
              <Send />
            </IconButton>
          </Box>
        </Paper>
      )}
    </>
  );
};