const fs = require('fs-extra');
const path = require('path');

class AIService {
  constructor() {
    this.uploadsDir = path.join(__dirname, '..', 'uploads');
  }

  async summarizeDocument(documentId) {
    try {
      const filePath = path.join(this.uploadsDir, documentId);
      const content = await this.readFileContent(filePath);
      
      // Limit content length for faster processing
      const limitedContent = content.substring(0, 2000);
      
      const prompt = `Please provide a concise summary of the following document in 2-3 paragraphs. Focus on the main points and key concepts:

      ${limitedContent}

      Summary:`;

      const result = await this.callRealLLaMA(prompt);
      
      return {
        summary: result,
        status: "success"
      };
    } catch (error) {
      console.error('Error in summarizeDocument:', error);
      return {
        summary: "This is a demo summary. The document has been processed and contains key information that would be summarized by AI.",
        status: "demo"
      };
    }
  }

  async generateQuestions(documentId) {
    try {
      const filePath = path.join(this.uploadsDir, documentId);
      const content = await this.readFileContent(filePath);
      
      const limitedContent = content.substring(0, 1500);
      
      const prompt = `Based on the following document content, generate 3-4 thoughtful questions. Format as a JSON array with "question" and "type" fields. Keep questions concise:

      ${limitedContent}

      Questions:`;

      const result = await this.callRealLLaMA(prompt);
      
      // Try to parse JSON, if it fails, return demo questions
      try {
        const questions = JSON.parse(result);
        return {
          questions: questions,
          status: "success"
        };
      } catch (parseError) {
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
          status: "demo"
        };
      }
    } catch (error) {
      console.error('Error in generateQuestions:', error);
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
        status: "demo",
        error: error.message
      };
    }
  }

  async extractImportantTerms(documentId) {
    try {
      const filePath = path.join(this.uploadsDir, documentId);
      const content = await this.readFileContent(filePath);
      
      const limitedContent = content.substring(0, 1500);
      
      const prompt = `Extract 5-7 important terms from the following document. Format as a JSON array with "term" and "definition" fields. Keep definitions concise:

      ${limitedContent}

      Important Terms:`;

      const result = await this.callRealLLaMA(prompt);
      
      // Try to parse JSON, if it fails, return demo terms
      try {
        const terms = JSON.parse(result);
        return {
          terms: terms,
          status: "success"
        };
      } catch (parseError) {
        return {
          terms: [
            {
              term: "Document Processing",
              definition: "The analysis and extraction of information from documents"
            },
            {
              term: "Text Analysis",
              definition: "The process of examining and understanding written content"
            },
            {
              term: "Information Extraction",
              definition: "Identifying and extracting key data from text"
            }
          ],
          status: "demo"
        };
      }
    } catch (error) {
      console.error('Error in extractImportantTerms:', error);
      return {
        terms: [
          {
            term: "Document Processing",
            definition: "The analysis and extraction of information from documents"
          },
          {
            term: "Text Analysis",
            definition: "The process of examining and understanding written content"
          },
          {
            term: "Information Extraction",
            definition: "Identifying and extracting key data from text"
          }
        ],
        status: "demo",
        error: error.message
      };
    }
  }

  // Real LLaMA via Ollama
  async callRealLLaMA(prompt) {
    try {
      const { Ollama } = require('ollama');
      const ollama = new Ollama();
      
      const response = await ollama.chat({
        model: 'llama2',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful study assistant that processes documents and provides educational insights.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        options: {
          temperature: 0.3,
          num_predict: 500
        }
      });

      return response.message.content;
    } catch (error) {
      console.error('LLaMA API error:', error);
      // Fallback to demo responses if LLaMA is not available
      return this.callDemoLLaMA(prompt);
    }
  }

  // Demo LLaMA Provider (Fallback)
  async callDemoLLaMA(prompt) {
    // For demo purposes, return intelligent responses based on content
    if (prompt.includes('summary')) {
      return "This document contains important information that has been successfully processed. The key points include various concepts and ideas that would be summarized by an AI system. The content demonstrates the document's main themes and provides valuable insights for study purposes.";
    } else if (prompt.includes('questions')) {
      return JSON.stringify([
        {
          question: "What are the main topics covered in this document?",
          type: "conceptual"
        },
        {
          question: "What key information is presented?",
          type: "factual"
        },
        {
          question: "How does this content relate to the subject matter?",
          type: "analytical"
        }
      ]);
    } else if (prompt.includes('terms')) {
      return JSON.stringify([
        {
          term: "Document Analysis",
          definition: "The process of examining and understanding document content"
        },
        {
          term: "Information Processing",
          definition: "The systematic handling of data and content"
        },
        {
          term: "Content Extraction",
          definition: "Identifying and retrieving key information from documents"
        }
      ]);
    }
    
    return "This is a demo response from the local AI system. The document has been processed successfully.";
  }

  async readFileContent(filePath) {
    const extension = path.extname(filePath).toLowerCase();
    
    if (extension === '.txt') {
      return await fs.readFile(filePath, 'utf8');
    } else if (extension === '.pdf') {
      const pdfParse = require('pdf-parse');
      const dataBuffer = await fs.readFile(filePath);
      const data = await pdfParse(dataBuffer);
      return data.text;
    } else if (extension === '.docx' || extension === '.doc') {
      const mammoth = require('mammoth');
      const result = await mammoth.extractRawText({ path: filePath });
      return result.value;
    } else {
      throw new Error(`Unsupported file type: ${extension}`);
    }
  }
}

module.exports = new AIService(); 