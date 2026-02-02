import React, { useState, useRef, useEffect, useCallback } from 'react';
import { X, Send, Bot, User, Loader2, Sparkles, Volume2, VolumeX, Mic, MicOff, MapPin, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { useVoiceOutput } from '@/hooks/useVoiceOutput';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-chat`;
const SCRIBE_TOKEN_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/elevenlabs-scribe-token`;

const ethiopianRegions = [
  { value: "all", labelEn: "All Ethiopia", labelAm: "ሁሉም ኢትዮጵያ" },
  { value: "tigray", labelEn: "Tigray", labelAm: "ትግራይ" },
  { value: "amhara", labelEn: "Amhara", labelAm: "አማራ" },
  { value: "oromia", labelEn: "Oromia", labelAm: "ኦሮሚያ" },
  { value: "snnpr", labelEn: "SNNPR", labelAm: "ደቡብ ብሔሮች" },
  { value: "sidama", labelEn: "Sidama", labelAm: "ሲዳማ" },
  { value: "afar", labelEn: "Afar", labelAm: "አፋር" },
  { value: "somali", labelEn: "Somali", labelAm: "ሶማሌ" },
  { value: "benishangul", labelEn: "Benishangul-Gumuz", labelAm: "ቤንሻንጉል-ጉሙዝ" },
  { value: "gambela", labelEn: "Gambela", labelAm: "ጋምቤላ" },
  { value: "harari", labelEn: "Harari", labelAm: "ሐረሪ" },
  { value: "addis", labelEn: "Addis Ababa", labelAm: "አዲስ አበባ" },
  { value: "dire", labelEn: "Dire Dawa", labelAm: "ድሬ ዳዋ" },
];

const AIAssistant: React.FC = () => {
  const { language } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isConnectingMic, setIsConnectingMic] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  
  const { speak, stop: stopSpeaking, isSpeaking, isLoading: ttsLoading } = useVoiceOutput();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize Web Speech API for voice input (works with Amharic in Chrome)
  useEffect(() => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = language === 'am' ? 'am-ET' : 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
          setInput(prev => prev + ' ' + finalTranscript);
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, [language]);

  const toggleVoiceInput = useCallback(async () => {
    if (!recognitionRef.current) {
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        setIsConnectingMic(true);
        await navigator.mediaDevices.getUserMedia({ audio: true });
        recognitionRef.current.lang = language === 'am' ? 'am-ET' : 'en-US';
        recognitionRef.current.start();
        setIsListening(true);
      } catch (error) {
        console.error('Microphone access error:', error);
      } finally {
        setIsConnectingMic(false);
      }
    }
  }, [isListening, language]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Stop listening if active
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }

    let assistantContent = '';

    try {
      const response = await fetch(CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ 
          messages: [...messages, userMessage],
          language,
          userRegion: selectedRegion !== 'all' ? selectedRegion : undefined,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to get response');
      }

      if (!response.body) throw new Error('No response body');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = '';

      const updateAssistant = (newContent: string) => {
        assistantContent = newContent;
        setMessages(prev => {
          const last = prev[prev.length - 1];
          if (last?.role === 'assistant') {
            return prev.map((m, i) => 
              i === prev.length - 1 ? { ...m, content: assistantContent } : m
            );
          }
          return [...prev, { role: 'assistant', content: assistantContent }];
        });
      };

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf('\n')) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (line.startsWith(':') || line.trim() === '') continue;
          if (!line.startsWith('data: ')) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              assistantContent += content;
              updateAssistant(assistantContent);
            }
          } catch {
            textBuffer = line + '\n' + textBuffer;
            break;
          }
        }
      }

      // Speak the response if voice is enabled
      if (voiceEnabled && assistantContent) {
        // Clean markdown for TTS
        const cleanText = assistantContent
          .replace(/[#*_`~\[\]()]/g, '')
          .replace(/\n+/g, '. ')
          .slice(0, 500); // Limit for TTS
        speak(cleanText);
      }

    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: language === 'am' 
          ? 'ይቅርታ፣ ስህተት ተከሰተ። እባክዎ እንደገና ይሞክሩ።'
          : 'Sorry, an error occurred. Please try again.'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const speakMessage = (content: string) => {
    const cleanText = content
      .replace(/[#*_`~\[\]()]/g, '')
      .replace(/\n+/g, '. ')
      .slice(0, 500);
    speak(cleanText);
  };

  const suggestedQuestions = language === 'am' 
    ? [
        'ጤፍ ለማምረት ምርጥ ወቅት የትኛው ነው?',
        'የአሁኑ የገበያ ዋጋ ምን ያህል ነው?',
        'በክልሌ ምን ሰብል ይመረጣል?',
        'የአፈር ማዳበሪያ መቼ መጠቀም አለብኝ?'
      ]
    : [
        'What is the best season to grow teff?',
        'What are current market prices?',
        'What crops are best for my region?',
        'When should I apply fertilizer?'
      ];

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          "fixed bottom-24 right-4 z-50 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center transition-all hover:scale-105 active:scale-95",
          isOpen && "hidden"
        )}
        aria-label={language === 'am' ? 'AI ረዳት ይክፈቱ' : 'Open AI Assistant'}
      >
        <Sparkles className="h-6 w-6" />
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-4 left-4 md:left-auto md:w-[420px] z-50 bg-card rounded-2xl shadow-2xl border border-border flex flex-col max-h-[75vh] overflow-hidden">
          {/* Header */}
          <div className="bg-primary text-primary-foreground px-4 py-3 flex items-center justify-between rounded-t-2xl">
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              <span className="font-semibold">
                {language === 'am' ? 'የእርሻ AI ረዳት' : 'Farm AI Assistant'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {/* Voice Toggle */}
              <button 
                onClick={() => {
                  if (isSpeaking) stopSpeaking();
                  setVoiceEnabled(!voiceEnabled);
                }}
                className={cn(
                  "p-1.5 rounded-full transition-colors",
                  voiceEnabled ? "bg-primary-foreground/20" : "hover:bg-primary-foreground/10"
                )}
                title={voiceEnabled ? 'Disable voice' : 'Enable voice'}
              >
                {voiceEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              </button>
              <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-primary-foreground/10 rounded">
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Region Selector */}
          <div className="px-3 py-2 border-b border-border bg-muted/30">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                <SelectTrigger className="h-8 text-xs flex-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ethiopianRegions.map((region) => (
                    <SelectItem key={region.value} value={region.value}>
                      {language === 'am' ? region.labelAm : region.labelEn}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[200px]">
            {messages.length === 0 ? (
              <div className="text-center py-6">
                <Bot className="h-12 w-12 text-primary mx-auto mb-3" />
                <p className="text-muted-foreground mb-4 text-sm">
                  {language === 'am' 
                    ? '🌾 ስለ ግብርና እና ገበያ ጥያቄዎችዎን ይጠይቁ!'
                    : '🌾 Ask me anything about farming and markets!'}
                </p>
                <div className="space-y-2">
                  {suggestedQuestions.map((q, i) => (
                    <button
                      key={i}
                      onClick={() => setInput(q)}
                      className="block w-full text-left text-sm bg-muted hover:bg-muted/80 p-2 rounded-lg transition-colors"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((msg, i) => (
                <div
                  key={i}
                  className={cn(
                    "flex gap-2",
                    msg.role === 'user' ? "justify-end" : "justify-start"
                  )}
                >
                  {msg.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Bot className="h-4 w-4 text-primary" />
                    </div>
                  )}
                  <div className="flex flex-col gap-1 max-w-[80%]">
                    <div
                      className={cn(
                        "p-3 rounded-2xl text-sm",
                        msg.role === 'user'
                          ? "bg-primary text-primary-foreground rounded-br-md"
                          : "bg-muted rounded-bl-md"
                      )}
                    >
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    </div>
                    {/* Speak button for assistant messages */}
                    {msg.role === 'assistant' && (
                      <button
                        onClick={() => speakMessage(msg.content)}
                        disabled={ttsLoading || isSpeaking}
                        className="self-start p-1 text-muted-foreground hover:text-primary transition-colors"
                        title={language === 'am' ? 'ድምጽ' : 'Listen'}
                      >
                        {isSpeaking ? (
                          <Square className="h-3 w-3" />
                        ) : (
                          <Volume2 className="h-3 w-3" />
                        )}
                      </button>
                    )}
                  </div>
                  {msg.role === 'user' && (
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                      <User className="h-4 w-4 text-primary-foreground" />
                    </div>
                  )}
                </div>
              ))
            )}
            {isLoading && messages[messages.length - 1]?.role === 'user' && (
              <div className="flex gap-2">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Bot className="h-4 w-4 text-primary" />
                </div>
                <div className="bg-muted p-3 rounded-2xl rounded-bl-md">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Voice Input Indicator */}
          {isListening && (
            <div className="px-3 py-2 bg-red-50 dark:bg-red-900/20 border-t border-red-200 dark:border-red-800 flex items-center gap-2">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <span className="text-sm text-red-600 dark:text-red-400">
                {language === 'am' ? 'እየሰማሁ ነው...' : 'Listening...'}
              </span>
            </div>
          )}

          {/* Input */}
          <div className="p-3 border-t border-border">
            <div className="flex gap-2">
              {/* Microphone Button */}
              <Button
                size="icon"
                variant={isListening ? "destructive" : "outline"}
                onClick={toggleVoiceInput}
                disabled={isConnectingMic || !('webkitSpeechRecognition' in window)}
                title={language === 'am' ? 'በድምጽ ይናገሩ' : 'Speak'}
              >
                {isConnectingMic ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : isListening ? (
                  <MicOff className="h-4 w-4" />
                ) : (
                  <Mic className="h-4 w-4" />
                )}
              </Button>
              
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={language === 'am' ? 'መልእክትዎን ይፃፉ...' : 'Type your message...'}
                className="flex-1"
                disabled={isLoading}
              />
              <Button 
                size="icon" 
                onClick={sendMessage} 
                disabled={!input.trim() || isLoading}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              {language === 'am' 
                ? '🇪🇹 ለኢትዮጵያ ገበሬዎች የተዘጋጀ AI ረዳት' 
                : '🇪🇹 AI Assistant for Ethiopian Farmers'}
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default AIAssistant;
