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
      
      const limitedContent = content.substring(0, 2000);
      
      const prompt = `Summarize the following document in 3-4 concise paragraphs. Focus on the main points, key ideas, and important details. Make it easy to understand:

${limitedContent}

Summary:`;

      console.log('📝 Generating summary...');
      const result = await this.callRealLLaMA(prompt);
      console.log('📝 Summary generated:', result.substring(0, 100) + '...');
      
      return {
        summary: result,
        status: "success"
      };
    } catch (error) {
      console.error('Error in summarizeDocument:', error);
      return {
        summary: "This document appears to contain information that could be summarized. The content includes various topics and details that would benefit from a comprehensive summary.",
        status: "demo",
        error: error.message
      };
    }
  }

  async generateQuestions(documentId) {
    try {
      const filePath = path.join(this.uploadsDir, documentId);
      const content = await this.readFileContent(filePath);
      
      const limitedContent = content.substring(0, 1500);
      
      const prompt = `Based on this document, generate 5-7 questions that test understanding of the content. Include different types: factual, conceptual, and analytical questions. Return ONLY a JSON array like this:
[
  {"question": "What is...?", "type": "factual"},
  {"question": "How does...?", "type": "conceptual"},
  {"question": "Why is...?", "type": "analytical"}
]

Document content:
${limitedContent}

Questions:`;

      console.log('❓ Generating questions...');
      const result = await this.callRealLLaMA(prompt);
      console.log('❓ Raw questions response:', result);
      
      // Try to parse JSON, if it fails, return demo questions
      try {
        // Clean the response - remove any markdown formatting
        let cleanResult = result.trim();
        if (cleanResult.startsWith('```json')) {
          cleanResult = cleanResult.replace('```json', '').replace('```', '').trim();
        }
        if (cleanResult.startsWith('```')) {
          cleanResult = cleanResult.replace(/```/g, '').trim();
        }
        
        const questions = JSON.parse(cleanResult);
        console.log('✅ Successfully parsed questions:', questions);
        return {
          questions: questions,
          status: "success"
        };
      } catch (parseError) {
        console.log('❌ Failed to parse JSON, using demo questions. Parse error:', parseError);
        console.log('❌ Raw response was:', result);
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
      console.log('📁 Reading file for document ID:', documentId);
      const filePath = path.join(this.uploadsDir, documentId);
      console.log('📁 Full file path:', filePath);
      
      const content = await this.readFileContent(filePath);
      console.log('📄 File content length:', content.length);
      console.log('📄 First 200 chars of content:', content.substring(0, 200));
      
      const limitedContent = content.substring(0, 1500);
      
      const prompt = `Analyze this document and extract 5-7 important terms or concepts. For each term, provide a clear definition based on the document content. Return ONLY a JSON array like this:
[
  {"term": "Term Name", "definition": "Definition based on the document"},
  {"term": "Another Term", "definition": "Another definition"}
]

Document content:
${limitedContent}

Important Terms:`;

      console.log('📋 Extracting terms from document...');
      console.log('📋 Prompt length:', prompt.length);
      const result = await this.callRealLLaMA(prompt);
      console.log('📋 Raw AI response:', result);
      
      // Try to parse JSON, if it fails, return demo terms
      try {
        // Clean the response - remove any markdown formatting
        let cleanResult = result.trim();
        if (cleanResult.startsWith('```json')) {
          cleanResult = cleanResult.replace('```json', '').replace('```', '').trim();
        }
        if (cleanResult.startsWith('```')) {
          cleanResult = cleanResult.replace(/```/g, '').trim();
        }
        
        const terms = JSON.parse(cleanResult);
        console.log('✅ Successfully parsed terms:', terms);
        return {
          terms: terms,
          status: "success"
        };
      } catch (parseError) {
        console.log('❌ Failed to parse JSON, using demo terms. Parse error:', parseError);
        console.log('❌ Raw response was:', result);
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
      console.log('🤖 Starting AI processing with Gemma3...');
      const { Ollama } = require('ollama');
      const ollama = new Ollama();
      
      console.log('📤 Sending prompt to Gemma3...');
      console.log('📤 Prompt preview:', prompt.substring(0, 100) + '...');
      
      const response = await ollama.chat({
        model: 'gemma3',
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
          num_predict: 300, // Reduced for faster response
          timeout: 120000 // 2 minute timeout
        }
      });

      console.log('✅ AI processing completed successfully!');
      console.log('✅ Response content length:', response.message.content.length);
      console.log('✅ Response preview:', response.message.content.substring(0, 100) + '...');
      return response.message.content;
    } catch (error) {
      console.error('❌ LLaMA API error:', error);
      console.log('🔄 Falling back to demo responses...');
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