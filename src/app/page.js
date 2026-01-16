'use client';

import React, { useState } from 'react';
import { Send, RotateCcw, Brain, MessageSquare } from 'lucide-react';

const debateStyles = {
  socratic: {
    name: "Socratic",
    description: "Questions your assumptions and guides through logic",
    systemPrompt: "You are a Socratic debater. Instead of directly stating counter-arguments, ask probing questions that expose assumptions, contradictions, or gaps in reasoning. Guide the person to discover flaws in their own argument through thoughtful inquiry. Be respectful but persistent in your questioning."
  },
  blunt: {
    name: "Blunt",
    description: "Direct and straightforward opposition",
    systemPrompt: "You are a blunt debater. Present counter-arguments directly and clearly without sugar-coating. Point out logical flaws, provide opposing evidence, and challenge claims head-on. Be assertive but not disrespectful."
  },
  neutral: {
    name: "Neutral",
    description: "Balanced and analytical opposition",
    systemPrompt: "You are a neutral debater. Present counter-arguments in a measured, analytical way. Acknowledge valid points while systematically presenting opposing perspectives. Focus on evidence, logic, and balanced analysis."
  },
  devils: {
    name: "Devil's Advocate",
    description: "Extreme opposing position for exploration",
    systemPrompt: "You are playing devil's advocate. Take the most extreme reasonable opposing position to help stress-test arguments. Be provocative and challenge every aspect, but remain within bounds of rational debate."
  },
  empathetic: {
    name: "Empathetic",
    description: "Gentle opposition with understanding",
    systemPrompt: "You are an empathetic debater. While opposing the argument, acknowledge the person's perspective and feelings. Present counter-arguments gently, showing you understand why they might hold their view while explaining alternative perspectives."
  }
};

export default function DebateApp() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [style, setStyle] = useState('neutral');
  const [topic, setTopic] = useState('');

  const startDebate = async () => {
    if (!topic.trim()) return;

    const userMessage = { role: 'user', content: topic };
    setMessages([userMessage]);
    setLoading(true);

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          system: `${debateStyles[style].systemPrompt}\n\nThe user will present a position or argument. Your job is to take the OPPOSITE side and debate against their position. Identify what they're arguing FOR, then argue AGAINST it. Keep responses focused and concise (2-4 paragraphs).`,
          messages: [userMessage]
        })
      });

      const data = await response.json();
      const assistantMessage = {
        role: 'assistant',
        content: data.content[0].text
      };

      setMessages([userMessage, assistantMessage]);
      setTopic('');
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to get response. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = { role: 'user', content: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          system: `${debateStyles[style].systemPrompt}\n\nContinue debating against the user's position. Maintain the opposing viewpoint throughout the conversation. Keep responses focused and concise (2-4 paragraphs).`,
          messages: newMessages
        })
      });

      const data = await response.json();
      const assistantMessage = {
        role: 'assistant',
        content: data.content[0].text
      };

      setMessages([...newMessages, assistantMessage]);
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to get response. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetDebate = () => {
    setMessages([]);
    setTopic('');
    setInput('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center justify-center gap-3">
            <Brain className="w-10 h-10" />
            AI Debate Partner
          </h1>
          <p className="text-purple-200">Take a position, and I'll argue against it</p>
        </div>

        {messages.length === 0 ? (
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
            <div className="mb-6">
              <label className="block text-white font-semibold mb-3">Choose Debate Style</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {Object.entries(debateStyles).map(([key, styleInfo]) => (
                  <button
                    key={key}
                    onClick={() => setStyle(key)}
                    className={`p-4 rounded-xl text-left transition-all ${
                      style === key
                        ? 'bg-purple-600 text-white shadow-lg scale-105'
                        : 'bg-white/10 text-purple-100 hover:bg-white/20'
                    }`}
                  >
                    <div className="font-bold mb-1">{styleInfo.name}</div>
                    <div className="text-sm opacity-90">{styleInfo.description}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-white font-semibold mb-2">Your Position or Topic</label>
              <textarea
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., 'I believe social media does more harm than good' or 'Universal basic income should be implemented'"
                className="w-full p-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                rows="4"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    startDebate();
                  }
                }}
              />
            </div>

            <button
              onClick={startDebate}
              disabled={!topic.trim() || loading}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-xl transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <>Processing...</>
              ) : (
                <>
                  <MessageSquare className="w-5 h-5" />
                  Start Debate
                </>
              )}
            </button>
          </div>
        ) : (
          <>
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-4 border border-white/20">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="px-3 py-1 bg-purple-600 rounded-full text-white text-sm font-semibold">
                    {debateStyles[style].name} Mode
                  </div>
                </div>
                <button
                  onClick={resetDebate}
                  className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-all"
                >
                  <RotateCcw className="w-4 h-4" />
                  New Debate
                </button>
              </div>

              <div className="space-y-4 mb-4 max-h-96 overflow-y-auto">
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-xl ${
                      msg.role === 'user'
                        ? 'bg-blue-600/30 ml-8'
                        : 'bg-purple-600/30 mr-8'
                    }`}
                  >
                    <div className="font-bold text-white mb-2">
                      {msg.role === 'user' ? 'You' : 'AI Opponent'}
                    </div>
                    <div className="text-white whitespace-pre-wrap">{msg.content}</div>
                  </div>
                ))}
                {loading && (
                  <div className="bg-purple-600/30 mr-8 p-4 rounded-xl">
                    <div className="text-white">Thinking...</div>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !loading) {
                      sendMessage();
                    }
                  }}
                  placeholder="Continue your argument..."
                  className="flex-1 p-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <button
                  onClick={sendMessage}
                  disabled={!input.trim() || loading}
                  className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white p-3 rounded-xl transition-all"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}