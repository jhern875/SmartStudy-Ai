const API_BASE_URL = 'http://localhost:5000/api';

class ApiService {
  // Health check
  async checkHealth() {
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      return await response.json();
    } catch (error) {
      console.error('Health check failed:', error);
      return { status: 'error', message: 'Backend not available' };
    }
  }

  // Get list of uploaded documents
  async getDocuments() {
    try {
      const response = await fetch(`${API_BASE_URL}/documents`);
      if (!response.ok) {
        throw new Error('Failed to fetch documents');
      }
      return await response.json();
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

  // AI endpoints (fake for now)
  async summarizeText(text) {
    try {
      const response = await fetch(`${API_BASE_URL}/ai/summarize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });
      return await response.json();
    } catch (error) {
      console.error('Summarize failed:', error);
      return {
        summary: "This is a sample summary. AI integration coming soon!",
        status: "placeholder"
      };
    }
  }

  async generateQuestions(text) {
    try {
      const response = await fetch(`${API_BASE_URL}/ai/questions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });
      return await response.json();
    } catch (error) {
      console.error('Questions generation failed:', error);
      return {
        questions: [
          "What is the main topic of this document?",
          "What are the key points discussed?",
          "How does this relate to the subject matter?"
        ],
        status: "placeholder"
      };
    }
  }

  async extractTerms(text) {
    try {
      const response = await fetch(`${API_BASE_URL}/ai/terms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });
      return await response.json();
    } catch (error) {
      console.error('Terms extraction failed:', error);
      return {
        terms: [
          "Artificial Intelligence",
          "Machine Learning",
          "Data Processing",
          "Algorithm",
          "Neural Network"
        ],
        status: "placeholder"
      };
    }
  }
}

const apiService = new ApiService();

export default apiService; 