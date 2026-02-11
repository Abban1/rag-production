import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Chat = () => {
  const [pdfs, setPdfs] = useState([]);
  const [selectedPdfId, setSelectedPdfId] = useState('');
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchPDFs();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchPDFs = async () => {
    try {
      const res = await axios.get('http://localhost:8000/pdf/list', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setPdfs(res.data.pdfs);
        if (res.data.pdfs.length > 0) {
          setSelectedPdfId(res.data.pdfs[0]._id);
        }
      }
    } catch (err) {
      console.error('Error fetching PDFs:', err);
      setError('Error loading PDFs');
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || !selectedPdfId) {
      setError('Please select a PDF and enter a message');
      return;
    }

    const userMessage = input;
    setInput('');
    setMessages([...messages, { role: 'user', content: userMessage }]);
    setLoading(true);
    setError('');

    try {
      const res = await axios.post(
        'http://localhost:8000/chat/ask',
        {
          pdf_id: selectedPdfId,
          message: userMessage
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (res.data.success) {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: res.data.response }
        ]);
      }
    } catch (err) {
      console.error('Chat error:', err);
      setError(err.response?.data?.detail || 'Error sending message');
      setMessages((prev) => prev.slice(0, -1)); // Remove the user message on error
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <nav className="bg-red-600 text-white p-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">RAG PDF Chat</h1>
          <div className="flex gap-4">
            <Link to="/dashboard" className="hover:bg-red-700 px-3 py-2 rounded">
              Dashboard
            </Link>
            <Link to="/upload" className="hover:bg-red-700 px-3 py-2 rounded">
              Upload PDF
            </Link>
            <Link to="/chat" className="hover:bg-red-700 px-3 py-2 rounded">
              Chat
            </Link>
            <button
              onClick={handleLogout}
              className="hover:bg-red-700 px-3 py-2 rounded"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto p-6 flex-1 flex flex-col">
        <div className="bg-white rounded-lg shadow-md flex flex-col h-full max-w-4xl mx-auto w-full">
          {/* PDF Selection */}
          <div className="p-6 border-b">
            <label className="block text-sm font-semibold mb-2">
              Select PDF to Chat With:
            </label>
            {pdfs.length === 0 ? (
              <div className="p-3 bg-yellow-100 text-yellow-700 rounded">
                No PDFs uploaded yet. <Link to="/upload" className="underline">Upload a PDF</Link> first.
              </div>
            ) : (
              <select
                value={selectedPdfId}
                onChange={(e) => setSelectedPdfId(e.target.value)}
                className="w-full border rounded px-3 py-2"
              >
                {pdfs.map((pdf) => (
                  <option key={pdf._id} value={pdf._id}>
                    📄 {pdf.filename}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <p className="text-lg mb-2">👋 Start a conversation</p>
                <p className="text-sm">Ask questions about your PDF and get instant answers</p>
              </div>
            ) : (
              messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      msg.role === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-800'
                    }`}
                  >
                    <p className="text-sm">{msg.content}</p>
                  </div>
                </div>
              ))
            )}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg">
                  <p className="text-sm">⏳ Thinking...</p>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-100 text-red-700 rounded mx-6 mb-4 border border-red-300">
              {error}
            </div>
          )}

          {/* Input */}
          {pdfs.length > 0 && (
            <form onSubmit={handleSendMessage} className="p-6 border-t">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask a question about the PDF..."
                  disabled={loading}
                  className="flex-1 border rounded px-4 py-2 disabled:bg-gray-100"
                />
                <button
                  type="submit"
                  disabled={loading || !input.trim()}
                  className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400 font-semibold"
                >
                  {loading ? '⏳' : '📤'} Send
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chat;