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

  // Generate questions with answers (Quizlet-style)
  async generateQuestions(documentId) {
    try {
      console.log('❓ Generating Quizlet-style questions for document:', documentId);
      
      const content = await this.getDocumentContent(documentId);
      if (!content) {
        return this.getDemoQuestions();
      }

      const prompt = `
        Create 5 questions with answers based on this document. Each question should have a clear, direct answer.
        
        Document content:
        ${content.substring(0, 1000)}
        
        Return ONLY this JSON format:
        {
          "questions": [
            {
              "id": "1",
              "question": "What is the main topic?",
              "answer": "The main topic is..."
            }
          ]
        }
        
        Make sure:
        - Generate exactly 5 questions
        - Questions are relevant to the document content
        - Answers are clear and concise
        - Base questions on specific facts from the document
      `;

      console.log('❓ Sending question generation prompt...');
      const result = await this.callRealLLaMA(prompt);
      console.log('❓ Raw question generation result:', result);

      // Try to parse the result
      try {
        let jsonString = result;
        
        // Remove markdown code blocks if present
        if (result.includes('```json')) {
          jsonString = result.replace(/```json\n?/g, '').replace(/```\n?/g, '');
          console.log('❓ Removed markdown code blocks');
        }
        
        jsonString = jsonString.trim();
        
        // Try simple JSON parsing first
        try {
          const parsedQuestions = JSON.parse(jsonString);
          console.log('❓ Successfully parsed questions:', parsedQuestions);
          return parsedQuestions;
        } catch (jsonError) {
          console.log('❓ JSON parsing failed, trying to extract questions...');
          
          // Simple extraction for Quizlet-style questions
          const questions = this.extractSimpleQuestions(jsonString);
          if (questions && questions.questions && questions.questions.length > 0) {
            console.log('❓ Successfully extracted questions:', questions);
            return questions;
          }
          
          throw jsonError;
        }
        
      } catch (parseError) {
        console.log('❓ Failed to parse AI result:', parseError.message);
        console.log('❓ Raw result was:', result);
        return this.getDemoQuestions();
      }
    } catch (error) {
      console.error('❓ Question generation failed:', error);
      return this.getDemoQuestions();
    }
  }

  // Extract simple questions with answers
  extractSimpleQuestions(text) {
    try {
      console.log('🔍 Extracting simple questions...');
      
      // Find all question-answer pairs
      const questionMatches = text.match(/"question":\s*"([^"]+)"/g);
      const answerMatches = text.match(/"answer":\s*"([^"]+)"/g);
      const idMatches = text.match(/"id":\s*"([^"]+)"/g);
      
      console.log(`🔍 Found ${questionMatches ? questionMatches.length : 0} questions`);
      console.log(`🔍 Found ${answerMatches ? answerMatches.length : 0} answers`);
      console.log(`🔍 Found ${idMatches ? idMatches.length : 0} IDs`);
      
      if (questionMatches && answerMatches) {
        const questions = [];
        const maxQuestions = Math.min(questionMatches.length, answerMatches.length);
        
        for (let i = 0; i < maxQuestions; i++) {
          try {
            const questionMatch = questionMatches[i].match(/"question":\s*"([^"]+)"/);
            const answerMatch = answerMatches[i].match(/"answer":\s*"([^"]+)"/);
            const idMatch = idMatches && idMatches[i] ? idMatches[i].match(/"id":\s*"([^"]+)"/) : null;
            
            if (questionMatch && answerMatch) {
              questions.push({
                id: idMatch ? idMatch[1] : (i + 1).toString(),
                question: questionMatch[1],
                answer: answerMatch[1]
              });
              console.log(`✅ Extracted question ${i + 1}: ${questionMatch[1].substring(0, 50)}...`);
            }
          } catch (error) {
            console.log(`🔍 Failed to extract question ${i + 1}:`, error.message);
          }
        }
        
        if (questions.length > 0) {
          console.log(`🔍 Successfully extracted ${questions.length} questions`);
          return { questions: questions };
        }
      }
      
      return null;
    } catch (error) {
      console.log('🔍 Simple question extraction failed:', error.message);
      return null;
    }
  }

  // Demo questions for fallback
  getDemoQuestions() {
    return {
      questions: [
        {
          id: "1",
          question: "What is the main purpose of this document?",
          answer: "The document explains concepts and provides information about the topic."
        },
        {
          id: "2", 
          question: "What are the key points discussed?",
          answer: "The key points include important facts and details from the document."
        }
      ]
    };
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

  // Extract concepts and relationships from document
  async extractConcepts(documentId) {
    try {
      console.log('🧠 Extracting concepts for document:', documentId);
      
      const content = await this.getDocumentContent(documentId);
      console.log('🧠 Document content received:', content ? 'YES' : 'NO');
      console.log('🧠 Content length:', content?.length);
      console.log('🧠 Content preview:', content?.substring(0, 500));
      
      if (!content) {
        console.log('🧠 No content found, using demo data');
        return this.getDemoConcepts();
      }

      const prompt = `
        Extract key concepts from this document and create a logical concept map:
        
        ${content.substring(0, 1500)}
        
        Instructions:
        1. Identify the MAIN TOPIC (the central subject)
        2. Find 4-5 RELATED CONCEPTS that support or explain the main topic
        3. Create LOGICAL RELATIONSHIPS between concepts
        4. Use EXACT terms from the document
        5. Make sure concepts flow logically from main to sub-concepts
        
        Return ONLY this JSON (no markdown):
        {
          "nodes": [
            {"id": "1", "label": "Main Topic", "size": 25, "category": "Main"},
            {"id": "2", "label": "Related Concept 1", "size": 18, "category": "Sub"},
            {"id": "3", "label": "Related Concept 2", "size": 18, "category": "Sub"},
            {"id": "4", "label": "Related Concept 3", "size": 18, "category": "Sub"},
            {"id": "5", "label": "Related Concept 4", "size": 18, "category": "Sub"}
          ],
          "edges": [
            {"from": "1", "to": "2", "label": "includes"},
            {"from": "1", "to": "3", "label": "enables"},
            {"from": "1", "to": "4", "label": "supports"},
            {"from": "1", "to": "5", "label": "creates"}
          ]
        }
        
        Make sure the concepts flow logically and make sense together.
      `;

      console.log('🧠 Sending concept extraction prompt...');
      console.log('🧠 Prompt length:', prompt.length);
      console.log('🧠 Prompt preview:', prompt.substring(0, 200));
      
      const result = await this.callRealLLaMA(prompt);
      console.log('🧠 Raw concept extraction result:', result);
      console.log('🧠 Result length:', result?.length);
      console.log('🧠 Result type:', typeof result);

      // Try to parse the result
      try {
        let jsonString = result;
        
        // Remove markdown code blocks if present
        if (result.includes('```json')) {
          jsonString = result.replace(/```json\n?/g, '').replace(/```\n?/g, '');
          console.log('🧠 Removed markdown code blocks');
        }
        
        // Clean up any extra whitespace
        jsonString = jsonString.trim();
        console.log('🧠 Cleaned JSON string length:', jsonString.length);
        console.log('🧠 Cleaned JSON string preview:', jsonString.substring(0, 200));
        
        // Check if JSON is complete
        if (!jsonString.includes('"nodes"') || !jsonString.includes('"edges"')) {
          console.log('🧠 JSON appears incomplete, missing required fields');
          throw new Error('Incomplete JSON response');
        }
        
        // Check for balanced braces
        const openBraces = (jsonString.match(/\{/g) || []).length;
        const closeBraces = (jsonString.match(/\}/g) || []).length;
        if (openBraces !== closeBraces) {
          console.log('🧠 Unbalanced braces detected:', openBraces, 'open,', closeBraces, 'close');
          throw new Error('Unbalanced JSON braces');
        }
        
        const concepts = JSON.parse(jsonString);
        console.log('🧠 Successfully parsed concepts:', concepts);
        console.log('🧠 Number of nodes:', concepts.nodes?.length);
        console.log('🧠 Number of edges:', concepts.edges?.length);
        
        // Validate the structure
        if (!concepts.nodes || !concepts.edges || concepts.nodes.length === 0) {
          console.log('🧠 Invalid concept structure');
          throw new Error('Invalid concept structure');
        }
        
        return concepts;
      } catch (parseError) {
        console.log('🧠 Failed to parse AI result:', parseError.message);
        console.log('🧠 Raw result was:', result);
        console.log('🧠 Using demo data as fallback');
        return this.getDemoConcepts();
      }

    } catch (error) {
      console.error('🧠 Concept extraction failed:', error);
      return this.getDemoConcepts();
    }
  }

  // Demo concepts for fallback
  getDemoConcepts() {
    return {
      nodes: [
        { id: "1", label: "Document Analysis", size: 25, category: "Main" },
        { id: "2", label: "Content Processing", size: 20, category: "Sub" },
        { id: "3", label: "Text Extraction", size: 20, category: "Sub" },
        { id: "4", label: "AI Processing", size: 18, category: "Sub" },
        { id: "5", label: "Data Analysis", size: 18, category: "Sub" },
        { id: "6", label: "Information Retrieval", size: 15, category: "Sub" }
      ],
      edges: [
        { from: "1", to: "2", label: "includes" },
        { from: "1", to: "3", label: "enables" },
        { from: "2", to: "3", label: "supports" },
        { from: "1", to: "4", label: "requires" },
        { from: "4", to: "5", label: "leads to" },
        { from: "1", to: "6", label: "enables" },
        { from: "3", to: "6", label: "powers" }
      ]
    };
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

  // Get document content from file
  async getDocumentContent(documentId) {
    try {
      console.log('📄 Getting content for document:', documentId);
      
      const fs = require('fs-extra');
      const path = require('path');
      
      // Try to find the document file
      const uploadsDir = path.join(__dirname, '..', 'uploads');
      console.log('📄 Uploads directory:', uploadsDir);
      
      // List all files in uploads directory
      const allFiles = await fs.readdir(uploadsDir);
      console.log('📄 All files in uploads:', allFiles);
      
      const possibleFiles = [
        documentId,
        documentId + '.txt',
        documentId.replace(/\.[^/.]+$/, '') + '.txt',
        // Also try without timestamp
        documentId.split('_')[0] + '.txt',
        documentId.split('_')[0] + '.docx',
        documentId.split('_')[0] + '.pdf'
      ];
      
      console.log('📄 Looking for files:', possibleFiles);
      
      let content = null;
      let foundFile = null;
      
      for (const filename of possibleFiles) {
        const filePath = path.join(uploadsDir, filename);
        console.log('📄 Trying file path:', filePath);
        
        if (await fs.pathExists(filePath)) {
          console.log('📄 Found file:', filePath);
          foundFile = filename;
          
          // Read the file content
          if (filename.endsWith('.txt')) {
            content = await fs.readFile(filePath, 'utf8');
          } else {
            // For non-txt files, look for corresponding .txt file
            const txtPath = filePath + '.txt';
            if (await fs.pathExists(txtPath)) {
              content = await fs.readFile(txtPath, 'utf8');
              console.log('📄 Found corresponding .txt file:', txtPath);
            }
          }
          
          if (content) {
            console.log('📄 Content length:', content.length);
            console.log('📄 Content preview:', content.substring(0, 200));
            break;
          }
        }
      }
      
      if (!content) {
        console.log('📄 No content found for document:', documentId);
        console.log('📄 Searched files:', possibleFiles);
        return null;
      }
      
      return content;
    } catch (error) {
      console.error('📄 Error getting document content:', error);
      return null;
    }
  }

  // Ultra-aggressive extraction for very truncated responses
  extractFromTruncatedText(text) {
    try {
      console.log('🔍 Ultra-aggressive extraction starting...');
      
      // Look for any patterns that might be questions
      const questionPatterns = [
        /"question":\s*"([^"]+)"/g,
        /"id":\s*"([^"]+)"/g,
        /"correctAnswer":\s*"([a-d])"/g
      ];
      
      const questions = [];
      let questionIndex = 1;
      
      // Find all question texts
      const questionMatches = text.match(/"question":\s*"([^"]+)"/g);
      const correctAnswerMatches = text.match(/"correctAnswer":\s*"([a-d])"/g);
      const idMatches = text.match(/"id":\s*"([^"]+)"/g);
      
      console.log(`🔍 Found ${questionMatches ? questionMatches.length : 0} question texts`);
      console.log(`🔍 Found ${correctAnswerMatches ? correctAnswerMatches.length : 0} correct answers`);
      console.log(`🔍 Found ${idMatches ? idMatches.length : 0} IDs`);
      
      if (questionMatches && correctAnswerMatches) {
        const maxQuestions = Math.min(questionMatches.length, correctAnswerMatches.length);
        
        for (let i = 0; i < maxQuestions; i++) {
          try {
            const questionMatch = questionMatches[i].match(/"question":\s*"([^"]+)"/);
            const correctAnswerMatch = correctAnswerMatches[i].match(/"correctAnswer":\s*"([a-d])"/);
            const idMatch = idMatches && idMatches[i] ? idMatches[i].match(/"id":\s*"([^"]+)"/) : null;
            
            if (questionMatch && correctAnswerMatch) {
              // Try to extract options for this question
              const options = this.extractOptionsForQuestion(text, i);
              
              if (Object.keys(options).length >= 2) {
                questions.push({
                  id: idMatch ? idMatch[1] : questionIndex.toString(),
                  question: questionMatch[1],
                  options: options,
                  correctAnswer: correctAnswerMatch[1],
                  explanation: "Answer based on document content."
                });
                console.log(`✅ Ultra-aggressive extracted question ${questionIndex} with correct answer: ${correctAnswerMatch[1]}`);
                questionIndex++;
              }
            }
          } catch (error) {
            console.log(`🔍 Failed to extract ultra-aggressive question ${i + 1}:`, error.message);
          }
        }
      }
      
      if (questions.length > 0) {
        console.log(`🔍 Ultra-aggressive extraction successful: ${questions.length} questions`);
        return { questions: questions };
      }
      
      return null;
    } catch (error) {
      console.log('🔍 Ultra-aggressive extraction failed:', error.message);
      return null;
    }
  }
  
  // Extract options for a specific question index
  extractOptionsForQuestion(text, questionIndex) {
    const options = {};
    
    // Look for options patterns around the question
    const optionPatterns = [
      /"a":\s*"([^"]+)"/g,
      /"b":\s*"([^"]+)"/g,
      /"c":\s*"([^"]+)"/g,
      /"d":\s*"([^"]+)"/g
    ];
    
    const optionKeys = ['a', 'b', 'c', 'd'];
    
    optionKeys.forEach((key, index) => {
      const matches = text.match(new RegExp(`"${key}":\\s*"([^"]+)"`, 'g'));
      if (matches && matches.length > questionIndex) {
        const optionMatch = matches[questionIndex].match(new RegExp(`"${key}":\\s*"([^"]+)"`));
        if (optionMatch) {
          options[key] = optionMatch[1];
        }
      }
    });
    
    return options;
  }
}

module.exports = new AIService(); 