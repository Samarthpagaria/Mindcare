import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Badge } from './ui/badge';
import { 
  Send, 
  Bot, 
  User, 
  Heart,
  Sparkles,
  Volume2,
  VolumeX,
  RotateCcw,
  AlertCircle
} from 'lucide-react';

const AI_CHAT_URL = 'http://localhost:5000/api/ai/chat';

export function ChatBot() {
  const [messages, setMessages] = useState([
    {
      id: '1',
      content: "Hello! I'm MindCare AI, your 24/7 mental health companion. I'm here to listen, support, and help you navigate your feelings. How are you feeling today?",
      sender: 'bot',
      timestamp: new Date(),
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [speechEnabled, setSpeechEnabled] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  const suggestedResponses = [
    "I'm feeling anxious",
    "I'm having trouble sleeping",
    "I feel overwhelmed",
    "I need breathing exercises",
    "I want to talk about my day",
    "I'm feeling sad"
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  /**
   * Build conversation history for the AI API in the format [{role, content}]
   * Excludes the initial bot greeting from history (it's not part of user conversation)
   */
  const buildConversationHistory = (currentMessages) => {
    return currentMessages
      .filter(m => !(m.id === '1' && m.sender === 'bot')) // skip initial greeting
      .map(m => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.content,
      }));
  };

  const sendMessage = async (content) => {
    if (!content.trim()) return;

    setError(null);

    const userMessage = {
      id: Date.now().toString(),
      content,
      sender: 'user',
      timestamp: new Date(),
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInputValue('');
    setIsTyping(true);

    try {
      const conversationHistory = buildConversationHistory(updatedMessages);

      const response = await fetch(AI_CHAT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: conversationHistory }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `Server error: ${response.status}`);
      }

      const data = await response.json();
      const botReplyText = data.reply;

      const botResponse = {
        id: (Date.now() + 1).toString(),
        content: botReplyText,
        sender: 'bot',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, botResponse]);

      // Text-to-speech if enabled
      if (speechEnabled && 'speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(botReplyText);
        utterance.rate = 0.8;
        utterance.pitch = 1;
        speechSynthesis.speak(utterance);
      }
    } catch (err) {
      console.error('MindCare AI error:', err);
      setError('Could not reach MindCare AI. Please check your connection or try again.');

      // Show error message in chat
      setMessages(prev => [...prev, {
        id: (Date.now() + 2).toString(),
        content: "I'm having trouble connecting right now. Please try again in a moment.",
        sender: 'bot',
        timestamp: new Date(),
        isError: true,
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    sendMessage(suggestion);
  };

  const resetChat = () => {
    setMessages([
      {
        id: '1',
        content: "Hello! I'm MindCare AI, your 24/7 mental health companion. I'm here to listen, support, and help you navigate your feelings. How are you feeling today?",
        sender: 'bot',
        timestamp: new Date(),
      }
    ]);
    setError(null);
    setInputValue('');
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Header */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-primary/10 rounded-full">
                  <Bot className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="flex items-center space-x-2">
                    <span>MindCare AI</span>
                    <Badge variant="secondary" className="ml-2">
                      <Sparkles className="h-3 w-3 mr-1" />
                      Powered by Groq
                    </Badge>
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Your compassionate AI companion for mental health support
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSpeechEnabled(!speechEnabled)}
                  title={speechEnabled ? "Disable voice" : "Enable voice"}
                >
                  {speechEnabled ? (
                    <Volume2 className="h-4 w-4" />
                  ) : (
                    <VolumeX className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={resetChat}
                  title="Reset conversation"
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Error Banner */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center space-x-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm"
          >
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}

        {/* Chat Messages */}
        <Card className="h-96">
          <CardContent className="p-4 h-full flex flex-col">
            <div className="flex-1 overflow-y-auto space-y-4 mb-4">
              <AnimatePresence>
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`flex items-start space-x-3 max-w-[80%] ${
                      message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                    }`}>
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>
                          {message.sender === 'user' ? (
                            <User className="h-4 w-4" />
                          ) : (
                            <Bot className="h-4 w-4" />
                          )}
                        </AvatarFallback>
                      </Avatar>
                      <div className={`rounded-lg p-3 ${
                        message.sender === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : message.isError
                            ? 'bg-red-50 border border-red-200'
                            : 'bg-muted'
                      }`}>
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                        <p className="text-xs opacity-70 mt-1">
                          {message.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div className="flex items-start space-x-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        <Bot className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="bg-muted rounded-lg p-3">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="flex space-x-2">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Type your message..."
                onKeyPress={(e) => e.key === 'Enter' && !isTyping && sendMessage(inputValue)}
                className="flex-1"
                disabled={isTyping}
              />
              <Button 
                onClick={() => sendMessage(inputValue)}
                disabled={!inputValue.trim() || isTyping}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Suggested Responses */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Start Conversations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {suggestedResponses.map((suggestion, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="w-full justify-start h-auto py-2 px-3 text-left whitespace-normal"
                    disabled={isTyping}
                  >
                    <Heart className="h-3 w-3 mr-2 flex-shrink-0 text-primary" />
                    <span className="text-xs">{suggestion}</span>
                  </Button>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Disclaimer */}
        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="p-4">
            <p className="text-sm text-yellow-800">
              <strong>Important:</strong> This AI companion provides emotional support and general guidance. 
              If you're experiencing a mental health emergency, please contact{' '}
              <strong>iCall: 9152987821</strong> or{' '}
              <strong>Vandrevala Foundation: 1860-2662-345</strong> (24/7).
              For ongoing concerns, speak with a licensed professional.
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}