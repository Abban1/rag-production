import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const PDFUpload = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [pdfs, setPdfs] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchPDFs();
  }, []);

  const fetchPDFs = async () => {
    try {
      const res = await axios.get('http://localhost:8000/pdf/list', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setPdfs(res.data.pdfs);
      }
    } catch (err) {
      console.error('Error fetching PDFs:', err);
      setError('Error loading PDFs');
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (!selectedFile.name.endsWith('.pdf')) {
        setError('Please select a PDF file');
        setFile(null);
        return;
      }
      if (selectedFile.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        setFile(null);
        return;
      }
      setFile(selectedFile);
      setError('');
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file');
      return;
    }

    setLoading(true);
    setMessage('');
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await axios.post('http://localhost:8000/pdf/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      });

      if (res.data.success) {
        setMessage(`✓ PDF uploaded successfully: ${res.data.filename}`);
        setFile(null);
        document.getElementById('fileInput').value = '';
        fetchPDFs();
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.response?.data?.detail || 'Error uploading PDF');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (pdfId) => {
    if (window.confirm('Are you sure you want to delete this PDF?')) {
      try {
        const res = await axios.delete(`http://localhost:8000/pdf/delete/${pdfId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data.success) {
          setMessage('PDF deleted successfully');
          fetchPDFs();
        }
      } catch (err) {
        setError('Error deleting PDF');
        console.error(err);
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-100">
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

      <div className="container mx-auto p-6">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-3xl font-bold mb-6">Upload PDF</h2>

          <form onSubmit={handleUpload} className="mb-8 border-2 border-dashed border-gray-300 p-6 rounded-lg">
            <div className="mb-4">
              <label className="block text-sm font-semibold mb-2">
                Select PDF File
              </label>
              <input
                id="fileInput"
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100"
              />
              {file && (
                <p className="text-sm text-gray-600 mt-2">
                  Selected: {file.name} ({(file.size / 1024).toFixed(2)} KB)
                </p>
              )}
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded border border-red-300">
                {error}
              </div>
            )}
            {message && (
              <div className="mb-4 p-3 bg-green-100 text-green-700 rounded border border-green-300">
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={!file || loading}
              className="w-full bg-blue-600 text-white py-3 rounded hover:bg-blue-700 disabled:bg-gray-400 font-semibold"
            >
              {loading ? '⏳ Uploading...' : '📤 Upload PDF'}
            </button>
          </form>

          <div>
            <h3 className="text-2xl font-semibold mb-4">Your PDFs ({pdfs.length})</h3>
            {pdfs.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                No PDFs uploaded yet. Upload your first PDF above!
              </p>
            ) : (
              <div className="space-y-3">
                {pdfs.map((pdf) => (
                  <div
                    key={pdf._id}
                    className="flex justify-between items-center p-4 bg-gray-50 rounded border border-gray-200 hover:bg-gray-100 transition"
                  >
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800">📄 {pdf.filename}</p>
                      <p className="text-sm text-gray-600">
                        Size: {(pdf.file_size / 1024).toFixed(2)} KB
                      </p>
                    </div>
                    <button
                      onClick={() => handleDelete(pdf._id)}
                      className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 text-sm font-semibold ml-4"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PDFUpload;