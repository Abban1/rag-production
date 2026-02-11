import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navigation Bar */}
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

      {/* Main Content */}
      <div className="container mx-auto p-6">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-3xl font-bold mb-4">Welcome to RAG PDF Chat</h2>
          <p className="text-gray-700 mb-6">
            Upload your PDF documents and interact with them using AI-powered chat.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Upload Card */}
            <div className="bg-blue-50 rounded-lg p-6 border-2 border-blue-200">
              <h3 className="text-xl font-semibold mb-2">📤 Upload PDF</h3>
              <p className="text-gray-600 mb-4">
                Upload your PDF documents to get started with AI-powered insights.
              </p>
              <Link
                to="/upload"
                className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Go to Upload
              </Link>
            </div>

            {/* Chat Card */}
            <div className="bg-green-50 rounded-lg p-6 border-2 border-green-200">
              <h3 className="text-xl font-semibold mb-2">💬 Chat with PDFs</h3>
              <p className="text-gray-600 mb-4">
                Ask questions about your uploaded PDFs and get instant answers.
              </p>
              <Link
                to="/chat"
                className="inline-block bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                Go to Chat
              </Link>
            </div>

            {/* Info Card */}
            <div className="bg-purple-50 rounded-lg p-6 border-2 border-purple-200">
              <h3 className="text-xl font-semibold mb-2">ℹ️ About</h3>
              <p className="text-gray-600 mb-4">
                Powered by advanced AI and semantic search. Max file size: 10MB.
              </p>
              <button
                className="inline-block bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
              >
                Learn More
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;