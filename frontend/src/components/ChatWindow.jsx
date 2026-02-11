import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ChatWindow = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  const sendMessage = async () => {
    if (!input) return;

    const newMsg = { text: input, fromUser: true };
    setMessages([...messages, newMsg]);

    try {
      const res = await axios.post('http://localhost:8000/chat', { question: input });
      setMessages([...messages, newMsg, { text: res.data.answer, fromUser: false }]);
    } catch (err) {
      console.error(err);
    }

    setInput('');
  };

  return (
    <div className="bg-white p-4 rounded-md shadow-md mt-4">
      <h3 className="font-semibold mb-2">Chat with RAG</h3>
      <div className="h-64 overflow-y-auto border p-2 mb-2">
        {messages.map((msg, idx) => (
          <div key={idx} className={`mb-2 ${msg.fromUser ? 'text-right' : 'text-left'}`}>
            <span className={`inline-block p-2 rounded ${msg.fromUser ? 'bg-red-600 text-white' : 'bg-gray-200'}`}>
              {msg.text}
            </span>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          className="flex-1 border p-2 rounded"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button onClick={sendMessage} className="bg-red-600 text-white px-4 py-2 rounded">
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatWindow;
