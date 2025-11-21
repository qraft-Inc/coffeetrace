'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, Bot, User, Loader } from 'lucide-react';

export default function ChatbotWidget({ language = 'en' }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      type: 'bot',
      text: language === 'sw' 
        ? 'Habari! Je, ninaweza kukusaidia na swali lolote kuhusu kilimo cha kahawa?'
        : language === 'rw'
        ? 'Muraho! Ese nshobora kukugufasha ikindi kibazo ku buhinzi bw\'ikawa?'
        : 'Hello! How can I help you with coffee farming today?',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = {
      type: 'user',
      text: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/training/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: input, language }),
      });

      if (response.ok) {
        const data = await response.json();
        
        const botMessage = {
          type: 'bot',
          text: data.answer,
          tips: data.tips,
          suggestions: data.suggestions,
          timestamp: new Date(),
        };

        setMessages(prev => [...prev, botMessage]);
      } else {
        throw new Error('Failed to get response');
      }
    } catch (error) {
      console.error('Chatbot error:', error);
      setMessages(prev => [
        ...prev,
        {
          type: 'bot',
          text: language === 'sw'
            ? 'Samahani, kulikuwa na tatizo. Tafadhali jaribu tena.'
            : language === 'rw'
            ? 'Ihangane, hari ikibazo. Nyamuneka gerageza kwongereza.'
            : 'Sorry, there was an error. Please try again.',
          timestamp: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const quickQuestions = {
    en: [
      'How to control coffee pests?',
      'When to harvest coffee?',
      'How to dry coffee properly?',
      'What fertilizer to use?',
    ],
    sw: [
      'Jinsi ya kudhibiti wadudu wa kahawa?',
      'Lini kuvuna kahawa?',
      'Jinsi ya kukausha kahawa vizuri?',
      'Mbolea gani ya kutumia?',
    ],
    rw: [
      'Uburyo bwo kurwanya udukoko tw\'ikawa?',
      'Igihe cyo gusarura ikawa?',
      'Uburyo bwo gukamisha ikawa neza?',
      'Ifumbire iki gukoresha?',
    ],
  };

  return (
    <>
      {/* Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 bg-green-600 text-white rounded-full p-4 shadow-lg hover:bg-green-700 transition-all z-50"
      >
        {isOpen ? (
          <span className="text-xl">×</span>
        ) : (
          <MessageCircle className="w-6 h-6" />
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-96 h-[600px] bg-white rounded-lg shadow-2xl flex flex-col z-50 max-w-[calc(100vw-3rem)]">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-4 rounded-t-lg">
            <div className="flex items-center">
              <Bot className="w-6 h-6 mr-2" />
              <div>
                <h3 className="font-semibold">
                  {language === 'sw' ? 'Msaidizi wa Kahawa' : language === 'rw' ? 'Umufasha w\'Ikawa' : 'Coffee Assistant'}
                </h3>
                <p className="text-xs text-green-100">
                  {language === 'sw' ? 'Uliza chochote kuhusu kahawa' : language === 'rw' ? 'Baza ikindi kibazo ku kawa' : 'Ask anything about coffee farming'}
                </p>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message, idx) => (
              <div key={idx} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex items-start max-w-[80%] ${message.type === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                    message.type === 'user' ? 'bg-blue-500 ml-2' : 'bg-green-500 mr-2'
                  }`}>
                    {message.type === 'user' ? (
                      <User className="w-4 h-4 text-white" />
                    ) : (
                      <Bot className="w-4 h-4 text-white" />
                    )}
                  </div>
                  <div>
                    <div className={`rounded-lg p-3 ${
                      message.type === 'user'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}>
                      <p className="text-sm">{message.text}</p>
                    </div>
                    
                    {/* Tips */}
                    {message.tips && (
                      <div className="mt-2 bg-green-50 rounded-lg p-3 text-sm">
                        <p className="font-medium text-green-800 mb-1">
                          {language === 'sw' ? 'Vidokezo:' : language === 'rw' ? 'Inama:' : 'Tips:'}
                        </p>
                        <ul className="list-disc list-inside space-y-1 text-green-700">
                          {message.tips.map((tip, i) => (
                            <li key={i}>{tip}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Suggestions */}
                    {message.suggestions && message.suggestions.length > 0 && (
                      <div className="mt-2 space-y-2">
                        <p className="text-xs font-medium text-gray-600">
                          {language === 'sw' ? 'Maudhui yanayohusiana:' : language === 'rw' ? 'Ibintu bifitanye isano:' : 'Related Content:'}
                        </p>
                        {message.suggestions.map((suggestion, i) => (
                          <a
                            key={i}
                            href={`/training/${suggestion.slug}`}
                            className="block bg-white border border-gray-200 rounded-lg p-2 hover:border-green-500 transition-colors"
                          >
                            <p className="text-sm font-medium text-gray-900">{suggestion.title}</p>
                            <p className="text-xs text-gray-500">
                              {suggestion.duration} min • {suggestion.difficulty}
                            </p>
                          </a>
                        ))}
                      </div>
                    )}
                    
                    <p className="text-xs text-gray-500 mt-1">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            
            {loading && (
              <div className="flex justify-start">
                <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-3">
                  <Loader className="w-4 h-4 animate-spin text-green-600" />
                  <span className="text-sm text-gray-600">Typing...</span>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Questions */}
          {messages.length <= 1 && (
            <div className="px-4 pb-2">
              <p className="text-xs text-gray-600 mb-2">
                {language === 'sw' ? 'Maswali ya Haraka:' : language === 'rw' ? 'Ibibazo byihuse:' : 'Quick Questions:'}
              </p>
              <div className="space-y-1">
                {(quickQuestions[language] || quickQuestions.en).map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setInput(q);
                      handleSend();
                    }}
                    className="w-full text-left text-sm bg-gray-50 hover:bg-gray-100 rounded p-2 transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="border-t p-4">
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder={
                  language === 'sw'
                    ? 'Andika ujumbe wako...'
                    : language === 'rw'
                    ? 'Andika ubutumwa bwawe...'
                    : 'Type your message...'
                }
                className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                disabled={loading}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || loading}
                className="bg-green-600 text-white rounded-lg p-2 hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
