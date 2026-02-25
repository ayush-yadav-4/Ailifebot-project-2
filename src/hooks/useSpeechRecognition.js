import { useState, useEffect, useRef } from 'react';

/**
 * Custom hook for speech recognition with multilingual support
 * @param {string} language - Language code (e.g., 'en-US', 'es-ES', 'fr-FR', 'hi-IN', 'auto')
 *                            Defaults to 'auto' for automatic language detection
 */
export function useSpeechRecognition(language = 'auto') {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef(null);
  const finalTranscriptRef = useRef('');
  const shouldBeListeningRef = useRef(false); // Track if we should be listening

  useEffect(() => {
    // Check if speech recognition is supported
    const hasSupport = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
    setIsSupported(hasSupport);

    if (hasSupport) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      // Increase timeout for speech detection (some browsers support this)
      if ('maxAlternatives' in recognitionRef.current) {
        recognitionRef.current.maxAlternatives = 1;
      }
      
      // Set language - use browser default if 'auto', otherwise use specified language
      if (language && language !== 'auto') {
        recognitionRef.current.lang = language;
      } else {
        // Try to detect browser language or default to en-US
        const browserLang = navigator.language || navigator.userLanguage || 'en-US';
        recognitionRef.current.lang = browserLang;
      }

      recognitionRef.current.onresult = (event) => {
        let interimTranscript = '';
        let newFinalTranscript = '';

        console.log('Speech recognition result event:', event);

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          const isFinal = event.results[i].isFinal;
          console.log(`Result ${i}: "${transcript}" (isFinal: ${isFinal})`);
          
          if (isFinal) {
            newFinalTranscript += transcript + ' ';
          } else {
            interimTranscript += transcript;
          }
        }

        // Accumulate final transcripts
        if (newFinalTranscript) {
          finalTranscriptRef.current += newFinalTranscript;
          console.log('Final transcript accumulated:', finalTranscriptRef.current);
        }

        // Combine accumulated final transcript with current interim transcript
        const combinedTranscript = finalTranscriptRef.current + interimTranscript;
        console.log('Setting transcript to:', combinedTranscript);
        setTranscript(combinedTranscript);
      };

      recognitionRef.current.onerror = (event) => {
        console.log('Speech recognition event:', event.error);
        
        // Handle different error types
        switch (event.error) {
          case 'no-speech':
            // This is not a fatal error - just means no speech detected yet
            // Keep listening - don't turn off the button
            console.log('No speech detected yet, continuing to listen...');
            // Don't change isListening - keep button on
            // The onend handler will restart if needed
            break;
          case 'audio-capture':
            console.error('No microphone found or microphone not accessible');
            setIsListening(false);
            shouldBeListeningRef.current = false;
            break;
          case 'not-allowed':
            console.error('Microphone permission denied');
            setIsListening(false);
            shouldBeListeningRef.current = false;
            alert('Microphone permission is required for voice input. Please allow microphone access and try again.');
            break;
          case 'aborted':
            // User or system aborted, this is expected
            console.log('Speech recognition aborted');
            setIsListening(false);
            shouldBeListeningRef.current = false;
            break;
          case 'network':
            console.error('Network error occurred');
            setIsListening(false);
            shouldBeListeningRef.current = false;
            break;
          case 'service-not-allowed':
            console.error('Speech recognition service not allowed');
            setIsListening(false);
            shouldBeListeningRef.current = false;
            break;
          default:
            console.error('Speech recognition error:', event.error);
            setIsListening(false);
            shouldBeListeningRef.current = false;
        }
      };

      recognitionRef.current.onend = () => {
        console.log('onend fired - shouldBeListening:', shouldBeListeningRef.current);
        // If user wants to keep listening, restart IMMEDIATELY and seamlessly
        // This makes it appear as if recognition never stopped
        if (shouldBeListeningRef.current && recognitionRef.current) {
          console.log('Auto-restarting recognition (seamless continuation)...');
          try {
            // Restart immediately - no delay to make it seamless
            recognitionRef.current.start();
            // Keep button state as listening - never turn it off
            setIsListening(true);
            console.log('Recognition restarted successfully');
          } catch (error) {
            // If already started (InvalidStateError), that's perfect - it means it's still running
            if (error.name === 'InvalidStateError') {
              // Recognition is still active - perfect! No action needed
              console.log('Recognition already running (InvalidStateError - this is OK)');
              setIsListening(true);
            } else {
              // Some other error - try once more immediately
              console.log('First restart attempt failed, retrying...', error);
              try {
                recognitionRef.current.start();
                setIsListening(true);
                console.log('Recognition restarted on retry');
              } catch (retryError) {
                // If still failing, keep button on anyway - user can manually stop
                console.error('Recognition restart failed, but keeping button on:', retryError);
                setIsListening(true);
              }
            }
          }
        } else {
          // shouldBeListeningRef is false - this means stopRecording() was called
          console.log('Not restarting - shouldBeListeningRef is false (user stopped or component cleanup)');
          setIsListening(false);
        }
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [language]);

  const startRecording = () => {
    if (recognitionRef.current && !isListening) {
      try {
        console.log('Starting speech recognition...');
        shouldBeListeningRef.current = true;
        finalTranscriptRef.current = '';
        setTranscript('');
        recognitionRef.current.start();
        setIsListening(true);
        console.log('Speech recognition started successfully');
      } catch (error) {
        console.error('Error starting speech recognition:', error);
        setIsListening(false);
        shouldBeListeningRef.current = false;
      }
    } else {
      console.log('Cannot start recording:', { 
        hasRecognition: !!recognitionRef.current, 
        isListening 
      });
    }
  };

  const stopRecording = () => {
    console.log('User explicitly stopping recording');
    shouldBeListeningRef.current = false; // Mark that we should stop
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
        setIsListening(false);
      } catch (error) {
        console.error('Error stopping speech recognition:', error);
        setIsListening(false);
      }
    } else {
      setIsListening(false);
    }
  };

  const toggleRecording = () => {
    if (isListening) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return {
    isListening,
    transcript,
    isSupported,
    startRecording,
    stopRecording,
    toggleRecording
  };
}

