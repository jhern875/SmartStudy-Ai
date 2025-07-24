const OpenAI = require('openai');
const fs = require('fs-extra');
const path = require('path');

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'your-api-key-here', // You'll need to set this
});

class AIService {
  constructor() {
    this.uploadsDir = path.join(__dirname, '..', 'uploads');
  }

  async summarizeDocument(documentId) {
    try {
      const filePath = path.join(this.uploadsDir, documentId);
      const content = await this.readFileContent(filePath);
      
      const prompt = `Please provide a comprehensive summary of the following document. 
      Focus on the main points, key concepts, and important details. 
      Make it easy to understand and well-structured:

      ${content}

      Summary:`;

      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are a helpful study assistant that creates clear, concise summaries of academic and professional documents."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 500,
        temperature: 0.3
      });

      return {
        summary: response.choices[0].message.content.trim(),
        status: "success"
      };
    } catch (error) {
      console.error('Error in summarizeDocument:', error);
      return {
        summary: "Sorry, I couldn't generate a summary at this time. Please try again.",
        status: "error",
        error: error.message
      };
    }
  }

  async generateQuestions(documentId) {
    try {
      const filePath = path.join(this.uploadsDir, documentId);
      const content = await this.readFileContent(filePath);
      
      const prompt = `Based on the following document content, generate 5-7 thoughtful questions that test understanding of the material. 
      Include a mix of factual, conceptual, and analytical questions. Format as a JSON array with "question" and "type" fields:

      ${content}

      Questions:`;

      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are a helpful study assistant that creates educational questions. Respond with valid JSON only."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 800,
        temperature: 0.4
      });

      const questionsText = response.choices[0].message.content.trim();
      const questions = JSON.parse(questionsText);

      return {
        questions: questions,
        status: "success"
      };
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
        status: "error",
        error: error.message
      };
    }
  }

  async extractImportantTerms(documentId) {
    try {
      const filePath = path.join(this.uploadsDir, documentId);
      const content = await this.readFileContent(filePath);
      
      const prompt = `Extract the most important terms, concepts, and definitions from the following document. 
      Focus on technical terms, key concepts, and important definitions. Format as a JSON array with "term" and "definition" fields:

      ${content}

      Important Terms:`;

      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are a helpful study assistant that identifies and defines important terms. Respond with valid JSON only."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 600,
        temperature: 0.3
      });

      const termsText = response.choices[0].message.content.trim();
      const terms = JSON.parse(termsText);

      return {
        terms: terms,
        status: "success"
      };
    } catch (error) {
      console.error('Error in extractImportantTerms:', error);
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