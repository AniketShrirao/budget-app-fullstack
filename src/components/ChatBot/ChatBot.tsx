import { useChatSpeech } from '../../hooks/useChatSpeech';
import { useChatController } from './ChatBotController';
import { ChatBotUI } from './ChatBotUI';
import { processCommand } from '../../utils/chatHandlers';
import { useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';

const ChatBot = () => {
  const auth = useAuth();

  // Return null if user is not authenticated
  if (!auth?.user) {
    return null;
  }
  const {
    isOpen,
    setIsOpen,
    messages,
    setMessages,
    inputValue,
    setInputValue,
    isProcessing,
    isListeningForActivation,
    setIsListeningForActivation,
    messagesEndRef,
    inputRef,
    handleSend,
    handleClose,
    handleVoiceInput
  } = useChatController();

  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition
  } = useChatSpeech(
    isOpen,
    setIsOpen,
    setMessages,
    isListeningForActivation,
    isProcessing,
    setIsListeningForActivation
  );
  // Handle voice commands with proper message display
  const handleVoiceCommand = useCallback(async (message: string) => {
    if (!message.trim() || isProcessing) return;
    
    const displayMessage = message.trim();
    const isCommand = displayMessage.startsWith('/');
    const commandToSend = isCommand ? displayMessage.slice(1) : displayMessage;
    
    setMessages(prev => [...prev, { text: displayMessage, isUser: true }]);
    setInputValue('');
    await handleSend(commandToSend);
    resetTranscript();
  }, [handleSend, isProcessing, setInputValue, setMessages, resetTranscript]);
  // Process voice input with timeout
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
  
    if (transcript && isOpen && !isProcessing) {
      timeoutId = setTimeout(() => {
        const response = processCommand(transcript, {
          handleMicToggle: handleVoiceInput,
          handleClose,
          handleSend: handleVoiceCommand
        });
        
        if (response) {
          setMessages(prev => [...prev, { text: response, isUser: false }]);
          resetTranscript();
        }
      }, 1000);
    }
  
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [transcript, isOpen, isProcessing, handleVoiceInput, handleClose, handleVoiceCommand, setMessages, resetTranscript]);
  // Handle quick actions and manual input
  const setInputValueAndSend = async (value: string) => {
    if (!value.trim() || isProcessing) return;
    
    const displayValue = value.trim();
    const isCommand = displayValue.startsWith('/');
    const commandToSend = isCommand ? displayValue.slice(1) : displayValue;
    
    setMessages(prev => [...prev, { text: displayValue, isUser: true }]);
    setInputValue('');
    await handleSend(commandToSend);
  };
  const handleManualSend = async () => {
    const messageToSend = listening ? transcript : inputValue;
    if (!messageToSend.trim() || isProcessing) return;
    
    const displayMessage = messageToSend.trim();
    const isCommand = displayMessage.startsWith('/');
    const commandToSend = isCommand ? displayMessage.slice(1) : displayMessage;
    
    setMessages(prev => [...prev, { text: displayMessage, isUser: true }]);
    setInputValue('');
    await handleSend(commandToSend);
    
    if (listening) {
      resetTranscript();
    }
  };
  if (!browserSupportsSpeechRecognition) {
    return null;
  }

  return (
    <ChatBotUI
      isOpen={isOpen}
      messages={messages}
      inputValue={inputValue}
      isProcessing={isProcessing}
      listening={listening}
      transcript={transcript}
      isListeningForActivation={isListeningForActivation}
      messagesEndRef={messagesEndRef}
      inputRef={inputRef}
      onOpen={() => setIsOpen(true)}
      onClose={handleClose}
      onSend={handleManualSend}
      onInputChange={setInputValue}
      onVoiceInput={handleVoiceInput}
      setInputValueAndSend={setInputValueAndSend}
    />
  );
};

export default ChatBot;