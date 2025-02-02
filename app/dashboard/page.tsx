"use client"
import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import { Send, Copy, Download, Github, Layout, Settings, ArrowRight, Loader2, Code, MessageSquare } from 'lucide-react';

const DashboardPage = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [input, setInput] = useState('');
  const [response, setResponse] = useState('');
  const [isCodeResponse, setIsCodeResponse] = useState(false);

  const detectIfCodeQuery = (text: any) => {
    const codeKeywords = [
      'code', 'function', 'bug', 'error', 'fix', 'debug',
      'implement', 'programming', 'syntax', 'correct'
    ];
    return codeKeywords.some(keyword =>
      text.toLowerCase().includes(keyword)
    );
  };

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

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(response);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      {/* Background Effect */}
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-800/20 via-gray-900/20 to-black"></div>

      {/* Header */}
      <header className="fixed w-full top-0 bg-gray-900/95 backdrop-blur-sm border-b border-gray-800 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
              fixly.ai
            </div>
            <nav className="hidden md:flex gap-4">
              <button className="text-gray-400 hover:text-white transition-all hover:scale-105 flex items-center gap-2">
                <Layout className="w-4 h-4" />
                Dashboard
              </button>
              <button className="text-gray-400 hover:text-white transition-all hover:scale-105 flex items-center gap-2">
                <Github className="w-4 h-4" />
                Projects
              </button>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <button className="text-gray-400 hover:text-white transition-all hover:scale-105">
              <Settings className="w-5 h-5" />
            </button>
            <button className="bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2 rounded-md transition-all hover:scale-105 hover:shadow-lg hover:shadow-blue-500/25">
              New Project
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-24 px-4 pb-16">
        <div className="max-w-3xl mx-auto">
          {/* Title Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent mb-2">
              AI Assistant
            </h1>
            <p className="text-gray-400">
              Ask questions, get code help, or general assistance.
            </p>
          </div>

          {/* Input Section */}
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

          {/* Output Section */}
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

          {/* Action Button */}
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