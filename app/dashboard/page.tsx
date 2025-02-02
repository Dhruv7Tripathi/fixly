"use client"
import React, { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { Send, Copy, Download, Github, Layout, Settings, ArrowRight, Loader2, Code, MessageSquare } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { ChatSidebar } from '@/components/ChatSideBar';
const DashboardPage = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [input, setInput] = useState('');
  const [response, setResponse] = useState('');
  const [isCodeResponse, setIsCodeResponse] = useState(false);
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);
  const [chatHistory, setChatHistory] = useState<any[]>([]);
  const [activeChat, setActiveChat] = useState(null);

  const detectIfCodeQuery = (text: any) => {
    const codeKeywords = [
      'code', 'function', 'bug', 'error', 'fix', 'debug',
      'implement', 'programming', 'syntax', 'correct'
    ];
    return codeKeywords.some(keyword =>
      text.toLowerCase().includes(keyword)
    );
  };
  const { status } = useSession();
  const router = useRouter();
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/signin");
    }
  }, [status, router]);

  useEffect(() => {
    const fetchChatHistory = async () => {
      try {
        const response = await fetch('/api/chat');
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);
        setChatHistory(data);
      } catch (error) {
        console.error('Failed to fetch chat history:', error);
      }
    };

    fetchChatHistory();
  }, []);

  const handleSubmit = async () => {
    if (!input.trim()) return;

    setIsProcessing(true);
    try {
      const response = await fetch('/api/gemini', {
        method: 'POST',
        body: input,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success === false) {
        throw new Error(data.message);
      }

      setIsCodeResponse(detectIfCodeQuery(input));
      setResponse(data.response || data.content || '');


      const chatResponse = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: input.slice(0, 30) + (input.length > 30 ? '...' : ''),
          input,
          response,
        }),
      });

      if (!chatResponse.ok) {
        throw new Error('Failed to save chat');
      }

      const newChat = await chatResponse.json();
      setChatHistory(prev => [newChat, ...prev]);
      setActiveChat(newChat.id);


    } catch (error) {
      console.error('Error:', error);
      if (error instanceof Error) {
        setResponse(error.message || 'Failed to generate response. Please try again.');
      } else {
        setResponse('Failed to generate response. Please try again.');
      }
    } finally {
      setIsProcessing(false);
    }
  };
  const handleNewChat = () => {
    setActiveChat(null);
    setInput('');
    setResponse('');
  };

  const handleChatSelect = (chat: any) => {
    setActiveChat(chat.id);
    setInput(chat.input);
    setResponse(chat.response);
    setIsCodeResponse(detectIfCodeQuery(chat.input));
  };
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(response);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <ChatSidebar
        // isVisible={isSidebarVisible}
        chats={chatHistory}
        activeChat={activeChat}
        onNewChat={handleNewChat}
        onSelectChat={handleChatSelect}
      />
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-800/20 via-gray-900/20 to-black"></div>
      <main className="pt-24 px-4 pb-16">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent mb-2">
              AI Assistant
            </h1>
            <p className="text-gray-400">
              Ask questions, get code help, or general assistance.
            </p>
          </div>
          <div className="bg-gray-800/50 rounded-xl border border-gray-700 overflow-hidden backdrop-blur-sm mb-4">
            <div className="border-b border-gray-700 p-4 flex justify-between items-center">
              <h2 className="text-gray-300 font-medium flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Your Question
              </h2>
            </div>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything... For code-related questions, include keywords like 'code', 'function', 'fix', etc."
              className="w-full bg-transparent p-4 outline-none resize-none min-h-[200px] text-gray-300 placeholder-gray-500"
            />
          </div>
          <div className="bg-gray-800/50 rounded-xl border border-gray-700 overflow-hidden backdrop-blur-sm">
            <div className="border-b border-gray-700 p-4 flex justify-between items-center">
              <h2 className="text-gray-300 font-medium flex items-center gap-2">
                {isCodeResponse ? (
                  <>
                    <Code className="w-4 h-4" />
                    Code Response
                  </>
                ) : (
                  <>
                    <MessageSquare className="w-4 h-4" />
                    Response
                  </>
                )}
              </h2>
              <button
                onClick={handleCopy}
                className="p-2 hover:bg-gray-700 rounded-md transition-colors"
              >
                <Copy className="w-4 h-4 text-gray-400" />
              </button>
            </div>
            {isCodeResponse ? (
              <div className="h-[400px]">
                <Editor
                  height="100%"
                  defaultLanguage="javascript"
                  theme="vs-dark"
                  value={response}
                  options={{
                    readOnly: true,
                    minimap: { enabled: false },
                    fontSize: 14,
                    padding: { top: 16 },
                  }}
                />
              </div>
            ) : (
              <div className="p-4">
                <textarea
                  value={response}
                  readOnly
                  className="w-full bg-transparent outline-none resize-none min-h-[200px] text-gray-300"
                />
              </div>
            )}
          </div>
          <div className="flex justify-center mt-6">
            <button
              onClick={handleSubmit}
              disabled={isProcessing || !input.trim()}
              className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-md transition-all hover:scale-105 flex items-center gap-2 disabled:opacity-50 disabled:hover:scale-100"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  Get Response
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;