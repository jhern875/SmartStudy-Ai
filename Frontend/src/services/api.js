const API_BASE_URL = 'http://localhost:5000/api';

class ApiService {
  // Health check
  async checkHealth() {
    try {
      console.log('Checking backend health...');
      const response = await fetch(`${API_BASE_URL}/health`);
      const result = await response.json();
      console.log('Health check result:', result);
      return result;
    } catch (error) {
      console.error('Health check failed:', error);
      return { status: 'error', message: 'Backend not available' };
    }
  }

  // Get list of uploaded documents
  async getDocuments() {
    try {
      console.log('Fetching documents from:', `${API_BASE_URL}/documents`);
      const response = await fetch(`${API_BASE_URL}/documents`);
      console.log('Documents response status:', response.status);
      if (!response.ok) {
        throw new Error('Failed to fetch documents');
      }
      const documents = await response.json();
      console.log('Documents fetched:', documents);
      return documents;
    } catch (error) {
      console.error('Failed to get documents:', error);
      return [];
    }
  }

  // Upload a file
  async uploadFile(file) {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${API_BASE_URL}/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      return await response.json();
    } catch (error) {
      console.error('Upload failed:', error);
      throw error;
    }
  }

  // Get file content
  async getFileContent(filename) {
    try {
      const response = await fetch(`${API_BASE_URL}/upload/${filename}`);
      if (!response.ok) {
        throw new Error('Failed to get file content');
      }
      return await response.json();
    } catch (error) {
      console.error('Failed to get file content:', error);
      throw error;
    }
  }

  // AI endpoints - now working with document IDs
  async summarizeDocument(documentId) {
    try {
      const response = await fetch(`${API_BASE_URL}/ai/summarize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ documentId }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate summary');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Summarize failed:', error);
      return {
        summary: "Sorry, I couldn't generate a summary at this time. Please try again.",
        status: "error",
        error: error.message
      };
    }
  }

  async generateQuestions(documentId) {
    try {
      const response = await fetch(`${API_BASE_URL}/ai/questions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ documentId }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate questions');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Questions generation failed:', error);
      return {
        questions: [
          {
            question: "What is the main topic of this document?",
            type: "conceptual"
          },
          {
            question: "What are the key points discussed?",
            type: "factual"
          },
          {
            question: "How does this relate to the subject matter?",
            type: "analytical"
          }
        ],
        status: "error",
        error: error.message
      };
    }
  }

  async extractImportantTerms(documentId) {
    try {
      const response = await fetch(`${API_BASE_URL}/ai/terms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ documentId }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to extract terms');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Terms extraction failed:', error);
      return {
        terms: [
          {
            term: "Artificial Intelligence",
            definition: "The simulation of human intelligence in machines"
          },
          {
            term: "Machine Learning",
            definition: "A subset of AI that enables systems to learn from data"
          },
          {
            term: "Data Processing",
            definition: "The collection and manipulation of data"
          }
        ],
        status: "error",
        error: error.message
      };
    }
  }

  // Database methods for saving and retrieving results
  async saveResults(documentId, results, metadata) {
    try {
      const response = await fetch(`${API_BASE_URL}/results`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ documentId, results, metadata }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save results');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Save results failed:', error);
      return { success: false, error: error.message };
    }
  }

  async getResults(documentId) {
    try {
      const response = await fetch(`${API_BASE_URL}/results/${documentId}`);
      
      if (!response.ok) {
        throw new Error('Failed to get results');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Get results failed:', error);
      return null;
    }
  }

  async getAllResults() {
    try {
      const response = await fetch(`${API_BASE_URL}/results`);
      
      if (!response.ok) {
        throw new Error('Failed to get all results');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Get all results failed:', error);
      return [];
    }
  }
}

const apiService = new ApiService();

export default apiService; 