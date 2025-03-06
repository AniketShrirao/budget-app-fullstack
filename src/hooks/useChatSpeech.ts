import { useState, useEffect } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { SPEECH_RECOGNITION_CONFIG, CHAT_RESPONSES, VOICE_COMMANDS } from '../constants/chatbot';

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
            setMessages((prev: any) => [...prev, { text: CHAT_RESPONSES.ACTIVATED, isUser: false }]);
          }
        },
        isFuzzyMatch: true,
        fuzzyMatchingThreshold: 0.8,
        bestMatchOnly: true
      }
    ]
  });

  useEffect(() => {
    let timeoutId: NodeJS.Timeout | null = null;

    const startListening = async () => {
      if (!listening && browserSupportsSpeechRecognition && !isProcessing && !isStartingListening) {
        setIsStartingListening(true);
        try {
          await SpeechRecognition.startListening(SPEECH_RECOGNITION_CONFIG);
          if (!isSpeechInitialized) {
            setIsSpeechInitialized(true);
          }
        } catch (error) {
          console.error('Failed to start listening:', error);
        } finally {
          setIsStartingListening(false);
        }
      }
    };

    const restartListening = () => {
      if (browserSupportsSpeechRecognition && (isOpen || isListeningForActivation)) {
        timeoutId = setTimeout(startListening, 300);
      }
    };

    restartListening();

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      if (!isOpen && !isListeningForActivation) {
        SpeechRecognition.stopListening();
      }
    };
  }, [
    browserSupportsSpeechRecognition,
    isOpen,
    isProcessing,
    isListeningForActivation,
    listening,
    isStartingListening
  ]);

  // Stop listening when chat is closed
  useEffect(() => {
    if (!isOpen && !isListeningForActivation) {
      SpeechRecognition.stopListening();
    }
  }, [isOpen, isListeningForActivation]);

  return {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
    isSpeechInitialized
  };
};