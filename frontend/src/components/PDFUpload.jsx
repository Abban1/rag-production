import React, { useState, useEffect } from 'react';
import axios from 'axios';

const PDFUpload = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [pdfs, setPdfs] = useState([]);
  const [error, setError] = useState('');

  const token = localStorage.getItem('token');

  // Fetch PDFs on component mount
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
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (!selectedFile.name.endsWith('.pdf')) {
        setError('Please select a PDF file');
        return;
      }
      if (selectedFile.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
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
        document.getElementById('fileInput').value = ''; // Clear input
        fetchPDFs(); // Refresh PDF list
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

  return (
    <div className="p-6 bg-white rounded-lg shadow-md max-w-2xl">
      <h2 className="text-2xl font-bold mb-4">Upload PDF</h2>

      {/* Upload Form */}
      <form onSubmit={handleUpload} className="mb-6">
        <div className="mb-4">
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
        </div>

        {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>}
        {message && <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">{message}</div>}

        <button
          type="submit"
          disabled={!file || loading}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? 'Uploading...' : 'Upload PDF'}
        </button>
      </form>

      {/* PDF List */}
      <div>
        <h3 className="text-xl font-semibold mb-3">Your PDFs</h3>
        {pdfs.length === 0 ? (
          <p className="text-gray-500">No PDFs uploaded yet</p>
        ) : (
          <div className="space-y-2">
            {pdfs.map((pdf) => (
              <div key={pdf._id} className="flex justify-between items-center p-3 bg-gray-100 rounded">
                <div>
                  <p className="font-medium">{pdf.filename}</p>
                  <p className="text-sm text-gray-600">
                    {(pdf.file_size / 1024).toFixed(2)} KB
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(pdf._id)}
                  className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 text-sm"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PDFUpload;