'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageCircle,
  Send,
  Bot,
  User,
  Sparkles,
  HelpCircle,
  ChevronDown,
  Clock,
} from 'lucide-react';
import { GlassCard } from '@/components/ui/glass-card';
import { GlowButton } from '@/components/ui/glow-button';
import { ChatMessage } from '@/lib/types';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

const faqItems = [
  {
    question: 'How does non-contact vital sign monitoring work?',
    answer: 'Our AI technology uses your camera to detect subtle color changes in your face caused by blood flow. These changes are analyzed to calculate heart rate, respiratory rate, and SpO2 levels without any physical contact.',
  },
  {
    question: 'How accurate is the monitoring?',
    answer: 'Our AI algorithms achieve 99.2% accuracy when used in optimal conditions: good lighting, stable positioning, and minimal movement during monitoring sessions.',
  },
  {
    question: 'What triggers an alert?',
    answer: 'Alerts are triggered when vital signs exceed safe thresholds: Heart rate above 100 or below 50 BPM, respiratory rate above 25 or below 10 breaths/min, or SpO2 below 92%.',
  },
  {
    question: 'Can I monitor family members?',
    answer: 'Yes! Use the Family Space feature to add family members. They can be selected as alert recipients and will receive notifications when your vital signs are abnormal.',
  },
  {
    question: 'Is my health data secure?',
    answer: 'Absolutely. All data is encrypted end-to-end and stored securely. We comply with healthcare data protection standards and never share your information without consent.',
  },
];

const aiResponses: Record<string, string> = {
  'default': "I'm VitalAI Assistant. I can help you with questions about vital sign monitoring, using the app features, or understanding your health data. How can I assist you today?",
  'hello': "Hello! I'm here to help with any questions about VitalAI. What would you like to know?",
  'how': "VitalAI uses computer vision and AI algorithms to detect subtle changes in your skin color caused by blood flow. This allows us to measure your vital signs through your camera without any physical contact.",
  'accurate': "Our AI achieves 99.2% accuracy under optimal conditions. For best results, ensure good lighting, keep still during monitoring, and position your face clearly in the camera frame.",
  'alert': "Alerts are triggered when vital signs exceed safe thresholds. You can customize alert recipients in the Family Space section, and they'll receive notifications via email when abnormalities are detected.",
  'help': "I can help you with: monitoring your vital signs, understanding your health data, managing family members, configuring alerts, and troubleshooting issues. What do you need help with?",
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function HelpPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Welcome to VitalAI Help! I'm your AI assistant. Ask me anything about the app, vital sign monitoring, or health tracking features.",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getAIResponse = (message: string): string => {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
      return aiResponses['hello'];
    }
    if (lowerMessage.includes('how') && (lowerMessage.includes('work') || lowerMessage.includes('monitor'))) {
      return aiResponses['how'];
    }
    if (lowerMessage.includes('accura') || lowerMessage.includes('reliable')) {
      return aiResponses['accurate'];
    }
    if (lowerMessage.includes('alert') || lowerMessage.includes('notif') || lowerMessage.includes('warning')) {
      return aiResponses['alert'];
    }
    if (lowerMessage.includes('help') || lowerMessage.includes('assist')) {
      return aiResponses['help'];
    }
    
    return "That's a great question! Our team is constantly improving VitalAI. For specific technical questions, you can also reach our support team at support@vitalai.com. Is there anything else I can help with?";
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate AI thinking
    await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 1000));

    const aiMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: getAIResponse(inputValue),
      timestamp: new Date(),
    };

    setIsTyping(false);
    setMessages((prev) => [...prev, aiMessage]);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFaqClick = (index: number, question: string) => {
    setExpandedFaq(expandedFaq === index ? null : index);
    
    // Add FAQ question and answer to chat
    if (expandedFaq !== index) {
      const userMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'user',
        content: question,
        timestamp: new Date(),
      };
      
      const faq = faqItems[index];
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: faq.answer,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMessage, aiMessage]);
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <h1 className="text-2xl font-bold text-foreground">Help & Support</h1>
        <p className="text-muted-foreground">Get answers from our AI assistant</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chat Section */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <GlassCard className="flex flex-col h-[600px]">
            {/* Chat Header */}
            <div className="p-4 border-b border-glass-border flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center">
                <Bot className="w-5 h-5 text-accent" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">VitalAI Assistant</h3>
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                  <span className="text-xs text-muted-foreground">Online</span>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <AnimatePresence initial={false}>
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={cn(
                      'flex items-start gap-3',
                      message.role === 'user' && 'flex-row-reverse'
                    )}
                  >
                    <div
                      className={cn(
                        'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0',
                        message.role === 'assistant' ? 'bg-accent/20' : 'bg-primary/20'
                      )}
                    >
                      {message.role === 'assistant' ? (
                        <Bot className="w-4 h-4 text-accent" />
                      ) : (
                        <User className="w-4 h-4 text-primary" />
                      )}
                    </div>
                    <div
                      className={cn(
                        'max-w-[80%] p-4 rounded-2xl',
                        message.role === 'assistant'
                          ? 'bg-glass/50 rounded-tl-sm'
                          : 'bg-primary text-primary-foreground rounded-tr-sm'
                      )}
                    >
                      <p className="text-sm leading-relaxed">{message.content}</p>
                      <div className="flex items-center gap-1 mt-2 opacity-60">
                        <Clock className="w-3 h-3" />
                        <span className="text-xs">{format(message.timestamp, 'h:mm a')}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Typing indicator */}
              <AnimatePresence>
                {isTyping && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex items-start gap-3"
                  >
                    <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center">
                      <Bot className="w-4 h-4 text-accent" />
                    </div>
                    <div className="bg-glass/50 p-4 rounded-2xl rounded-tl-sm">
                      <div className="flex items-center gap-1">
                        <motion.span
                          className="w-2 h-2 rounded-full bg-muted-foreground"
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                        />
                        <motion.span
                          className="w-2 h-2 rounded-full bg-muted-foreground"
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                        />
                        <motion.span
                          className="w-2 h-2 rounded-full bg-muted-foreground"
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-glass-border">
              <div className="flex items-center gap-3">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your question..."
                  className="flex-1 px-4 py-3 rounded-xl bg-input border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
                <GlowButton
                  variant="primary"
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isTyping}
                  icon={<Send className="w-5 h-5" />}
                >
                  Send
                </GlowButton>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* FAQ Section */}
        <motion.div variants={itemVariants}>
          <GlassCard className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                <HelpCircle className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Quick Answers</h3>
                <p className="text-sm text-muted-foreground">Common questions</p>
              </div>
            </div>

            <div className="space-y-3">
              {faqItems.map((faq, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <button
                    onClick={() => handleFaqClick(index, faq.question)}
                    className={cn(
                      'w-full text-left p-4 rounded-xl bg-glass/30 hover:bg-glass/50 transition-all',
                      expandedFaq === index && 'bg-glass/50 ring-1 ring-primary/30'
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-sm font-medium text-foreground">{faq.question}</span>
                      <ChevronDown
                        className={cn(
                          'w-4 h-4 text-muted-foreground flex-shrink-0 transition-transform',
                          expandedFaq === index && 'rotate-180'
                        )}
                      />
                    </div>
                    <AnimatePresence>
                      {expandedFaq === index && (
                        <motion.p
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="text-sm text-muted-foreground mt-3 leading-relaxed"
                        >
                          {faq.answer}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </button>
                </motion.div>
              ))}
            </div>

            {/* Quick tips */}
            <div className="mt-6 p-4 rounded-xl bg-accent/10 border border-accent/20">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-accent" />
                <span className="text-sm font-medium text-foreground">Pro Tip</span>
              </div>
              <p className="text-sm text-muted-foreground">
                For the most accurate readings, monitor your vitals at the same time each day in 
                consistent lighting conditions.
              </p>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </motion.div>
  );
}
