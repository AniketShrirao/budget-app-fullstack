import { useState, useEffect } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { SPEECH_RECOGNITION_CONFIG, CHAT_RESPONSES, VOICE_COMMANDS, CHAT_COMMANDS } from '../constants/chatbot';

export const useChatSpeech = (
  isOpen: boolean,
  setIsOpen: (value: boolean) => void,
  setMessages: (value: any) => void,
  isListeningForActivation: boolean,
  isProcessing: boolean,
  setIsListeningForActivation: (value: boolean) => void
) => {
  const [isSpeechInitialized, setIsSpeechInitialized] = useState(false);
  const [isStartingListening, setIsStartingListening] = useState(false);
  const [isExplicitlyStopped, setIsExplicitlyStopped] = useState(false);

  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition
  } = useSpeechRecognition({
    commands: [
      {
        command: VOICE_COMMANDS.ACTIVATE,
        callback: () => {
          if (!isOpen && isListeningForActivation) {
            setIsOpen(true);
            setIsListeningForActivation(false);
            resetTranscript();
            setIsExplicitlyStopped(false);
            setMessages((prev: Array<{ text: string; isUser: boolean }>) => [
              ...prev,
              { text: CHAT_RESPONSES.ACTIVATED, isUser: false },
              { text: CHAT_COMMANDS.HELP.response, isUser: false }
            ]);
          }
        },
        isFuzzyMatch: true,
        fuzzyMatchingThreshold: 0.6,
        bestMatchOnly: true
      }
    ]
  });
  // Start listening on component mount
  useEffect(() => {
    if (browserSupportsSpeechRecognition && !isSpeechInitialized) {
      SpeechRecognition.startListening(SPEECH_RECOGNITION_CONFIG);
      setIsSpeechInitialized(true);
    }
  }, [browserSupportsSpeechRecognition, isSpeechInitialized]);

  // Handle listening state changes
  useEffect(() => {
    let timeoutId: NodeJS.Timeout | null = null;

    const startListening = async () => {
      if (!listening && browserSupportsSpeechRecognition && !isProcessing && !isStartingListening && !isExplicitlyStopped) {
        setIsStartingListening(true);
        try {
          await SpeechRecognition.startListening(SPEECH_RECOGNITION_CONFIG);
          setMessages((prev: Array<{ text: string; isUser: boolean }>) => [...prev, { text: CHAT_RESPONSES.MIC_ON, isUser: false }]);
        } catch (error) {
          console.error('Failed to start listening:', error);
          setMessages((prev: Array<{ text: string; isUser: boolean }>) => [...prev, { text: CHAT_RESPONSES.ERROR, isUser: false }]);
        } finally {
          setIsStartingListening(false);
        }
      }
    };

    if (isListeningForActivation && !listening && !isStartingListening && !isExplicitlyStopped) {
      timeoutId = setTimeout(startListening, 300);
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [
    browserSupportsSpeechRecognition,
    isProcessing,
    listening,
    isStartingListening,
    isExplicitlyStopped,
    isListeningForActivation,
    setMessages
  ]);

  return {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
    setIsExplicitlyStopped
  };
};