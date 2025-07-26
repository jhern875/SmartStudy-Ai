import '../styles/Results.css';
import apiService from '../services/api.js';
import React, { useState, useCallback } from 'react'; // Added missing import for React

const Results = () => {
  console.log('🚀 Results component is loading...');
  
  const [isLoading, setIsLoading] = useState(false);
  const [aiResults, setAiResults] = useState(null);
  const [currentFeature, setCurrentFeature] = useState('');
  const [currentDocument, setCurrentDocument] = useState(null);

  const handleBackToDocuments = () => {
    window.location.href = '/documents';
  };

  const handleOptionClick = useCallback(async (option) => {
    if (!currentDocument) {
      alert('No document selected. Please go back and select a document.');
      return;
    }

    setIsLoading(true);
    setCurrentFeature(option);
    updateUI();

    try {
      console.log(`Starting AI feature: ${option}`);
      
      // Show progress steps
      const updateProgress = (step) => {
        const progressText = document.querySelector('.loading-section p');
        if (progressText) {
          progressText.textContent = step;
        }
      };

      updateProgress('📤 Sending document to AI...');
      
      let result;
      
      // Add timeout for AI calls
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Request timed out')), 120000); // 2 minute timeout
      });

      const aiPromise = (async () => {
        updateProgress('🤖 Processing with AI...');
        
        switch (option) {
          case 'Summarize Notes':
            return await apiService.summarizeDocument(currentDocument.id);
          case 'Questions / Quiz':
            return await apiService.generateQuestions(currentDocument.id);
          case 'Important Terms / Flashcards':
            return await apiService.extractImportantTerms(currentDocument.id);
          case 'Concept Graph':
            return await apiService.extractConcepts(currentDocument.id);
          case 'Parsed Text':
            return { content: currentDocument.content };
          default:
            return { error: 'Unknown option' };
        }
      })();

      updateProgress('⏳ Generating results...');
      result = await Promise.race([aiPromise, timeoutPromise]);
      console.log(`AI feature completed: ${option}`, result);
      console.log('Result structure:', Object.keys(result));
      console.log('Result content:', JSON.stringify(result, null, 2));

      updateProgress('✅ Processing complete!');
      
      // Small delay to show completion
      setTimeout(() => {
        setAiResults(result);
        setIsLoading(false); // Set loading to false after AI processing completes
        updateUI();
      }, 500);

    } catch (error) {
      console.error('AI feature failed:', error);
      setAiResults({ 
        error: error.message === 'Request timed out' 
          ? 'Request timed out. Please try again with a smaller document.' 
          : 'Failed to process request. Please try again.' 
      });
      setIsLoading(false); // Set loading to false even on error
      updateUI();
    }
  }, [currentDocument]);

  const generateOptionsHTML = () => {
    console.log('📄 Generating options HTML for document:', currentDocument);
    console.log('📄 Document name:', currentDocument?.name);
    console.log('📄 Document content length:', currentDocument?.content?.length);
    console.log('📄 Document content preview:', currentDocument?.content?.substring(0, 100));
    
    const wordCount = currentDocument?.content?.split(' ').length || 0;
    const charCount = currentDocument?.content?.length || 0;
    const estimatedTime = Math.ceil(wordCount / 100); // Rough estimate: 1 second per 100 words
    
    console.log('📄 Calculated word count:', wordCount);
    console.log('📄 Calculated char count:', charCount);
    
    return `
      <button onclick="window.handleBackToDocuments()" class="back-button">← Back to Documents</button>
      
      <h1 class="results-title">Your Document is Ready!</h1>
      <p class="results-subtitle">Here's what you can do with your parsed information:</p>

      <div class="analytics-section">
        <h3>📊 Document Analytics</h3>
        <div class="analytics-grid">
          <div class="analytics-item">
            <span class="analytics-value">${wordCount}</span>
            <span class="analytics-label">Words</span>
          </div>
          <div class="analytics-item">
            <span class="analytics-value">${charCount}</span>
            <span class="analytics-label">Characters</span>
          </div>
          <div class="analytics-item">
            <span class="analytics-value">~${estimatedTime}s</span>
            <span class="analytics-label">Est. Processing Time</span>
          </div>
        </div>
      </div>

      <div class="parsed-info-section">
        <h2>Document: ${currentDocument?.name || 'Unknown'}</h2>
        <div class="preview-section">
          <h3>📄 Document Preview</h3>
          <div class="parsed-text-box">
            <p>${currentDocument?.content?.substring(0, 500) || 'No content available'}${currentDocument?.content?.length > 500 ? '...' : ''}</p>
          </div>
          ${currentDocument?.content?.length > 500 ? `<p class="preview-note">Showing first 500 characters of ${currentDocument?.content?.length} total characters</p>` : ''}
        </div>
      </div>

      <div class="options-grid">
        <div class="option-card" onclick="window.handleOptionClick('Summarize Notes')">
          <h3>📝 Summarize Notes</h3>
          <p>Get a concise summary of your document with key points and main ideas.</p>
          <small>Press <kbd>1</kbd> for quick access</small>
        </div>
        
        <div class="option-card" onclick="window.handleOptionClick('Questions / Quiz')">
          <h3>❓ Questions / Quiz</h3>
          <p>Generate questions or a quiz based on the content to test your knowledge.</p>
          <small>Press <kbd>2</kbd> for quick access</small>
        </div>
        
        <div class="option-card" onclick="window.handleOptionClick('Important Terms / Flashcards')">
          <h3>🎯 Important Terms / Flashcards</h3>
          <p>Identify key terms and create flashcards for memorization.</p>
          <small>Press <kbd>4</kbd> for quick access</small>
        </div>
        
        <div class="option-card" onclick="window.handleOptionClick('Concept Graph')">
          <h3>🧠 Concept Graph</h3>
          <p>Visualize relationships between key concepts in your document.</p>
          <small>Press <kbd>5</kbd> for quick access</small>
        </div>
        
        <div class="option-card" onclick="window.handleOptionClick('Parsed Text')">
          <h3>📄 Full Parsed Text</h3>
          <p>View the complete extracted text from your file with formatting.</p>
          <small>Press <kbd>3</kbd> for quick access</small>
        </div>
      </div>
      
      <div class="shortcuts-info">
        <p><strong>💡 Keyboard Shortcuts:</strong></p>
        <p>• Press <kbd>1-4</kbd> for quick feature selection</p>
        <p>• Press <kbd>Ctrl+S</kbd> to save results (when available)</p>
        <p>• Press <kbd>Esc</kbd> to go back (when viewing results)</p>
      </div>
    `;
  };

  const generateResultsHTML = () => {
    console.log('🔍 Generating results HTML for:', currentFeature);
    console.log('🔍 AI Results:', aiResults);
    
    // Store current results globally for export
    window.currentAIResults = aiResults;
    
    if (aiResults.error) {
      console.log('❌ Showing error:', aiResults.error);
      return `
        <div class="error-section">
          <h2>❌ Error</h2>
          <p>${aiResults.error}</p>
          <button onclick="window.handleBackToOptions()" class="back-button">← Back to Options</button>
        </div>
      `;
    }

    const metadata = `
      <div class="metadata-section">
        <p><strong>📄 Document:</strong> ${currentDocument?.name || 'Unknown'}</p>
        <p><strong>📊 Word Count:</strong> ${currentDocument?.content?.split(' ').length || 0} words</p>
        <p><strong>⏰ Processed:</strong> ${new Date().toLocaleString()}</p>
      </div>
    `;

    switch (currentFeature) {
      case 'Summarize Notes':
        console.log('📝 Rendering summary:', aiResults.summary);
        window.currentTextContent = aiResults.summary;
        return `
          <div class="results-section">
            <h2>📝 Document Summary</h2>
            ${metadata}
            <div class="summary-content">
              <p>${aiResults.summary}</p>
            </div>
            ${generateExportButtons()}
            <button onclick="window.handleBackToOptions()" class="back-button">← Back to Options</button>
          </div>
        `;

      case 'Questions / Quiz':
        console.log('❓ Rendering Quizlet-style questions:', aiResults);
        console.log('❓ Questions data:', aiResults?.questions);
        window.currentTextContent = JSON.stringify(aiResults, null, 2);
        
        return `
          <div class="results-section">
            <h2>❓ Questions & Answers</h2>
            ${metadata}
            <div class="quizlet-container">
              <div class="quizlet-controls">
                <button onclick="window.resetQuizlet()" class="quizlet-btn">🔄 Reset</button>
                <button onclick="window.showAllAnswers()" class="quizlet-btn">👁️ Show All Answers</button>
                <button onclick="window.hideAllAnswers()" class="quizlet-btn">🙈 Hide All Answers</button>
                <button onclick="window.generateNewQuestions()" class="quizlet-btn generate-new">✨ Generate New Questions</button>
              </div>
              <div class="quizlet-questions">
                ${aiResults?.questions?.map((q, index) => `
                  <div class="quizlet-card" data-question-id="${q.id}">
                    <div class="question-side">
                      <h3>Question ${index + 1}</h3>
                      <p class="question-text">${q.question}</p>
                    </div>
                    <div class="answer-side" id="answer-${q.id}" style="display: none;">
                      <h3>Answer</h3>
                      <p class="answer-text">${q.answer}</p>
                    </div>
                    <button onclick="window.toggleAnswer('${q.id}')" class="toggle-btn">
                      <span class="toggle-text">Show Answer</span>
                    </button>
                  </div>
                `).join('') || '<p>No questions found</p>'}
              </div>
              <div class="quizlet-info">
                <p><strong>📊 Statistics:</strong></p>
                <p>• ${aiResults?.questions?.length || 0} Questions</p>
                <p>• Quizlet-style format</p>
                <p>• Click to show/hide answers</p>
              </div>
            </div>
            ${generateExportButtons()}
            <button onclick="window.handleBackToOptions()" class="back-button">← Back to Options</button>
          </div>
        `;

      case 'Important Terms / Flashcards':
        console.log('🎯 Rendering terms:', aiResults.terms);
        const termsText = aiResults.terms.map((term, index) => 
          `${term.term}: ${term.definition}`
        ).join('\n\n');
        window.currentTextContent = termsText;
        return `
          <div class="results-section">
            <h2>🎯 Important Terms & Definitions</h2>
            ${metadata}
            <div class="terms-content">
              ${aiResults.terms.map((term, index) => `
                <div class="term-item">
                  <h4>${term.term}</h4>
                  <p>${term.definition}</p>
                </div>
              `).join('')}
            </div>
            ${generateExportButtons()}
            <button onclick="window.handleBackToOptions()" class="back-button">← Back to Options</button>
          </div>
        `;

      case 'Parsed Text':
        console.log('📄 Rendering parsed text:', aiResults.content);
        window.currentTextContent = aiResults.content;
        return `
          <div class="results-section">
            <h2>📄 Full Parsed Text</h2>
            ${metadata}
            <div class="parsed-content">
              <pre>${aiResults.content}</pre>
            </div>
            ${generateExportButtons()}
            <button onclick="window.handleBackToOptions()" class="back-button">← Back to Options</button>
          </div>
        `;

      case 'Concept Graph':
        console.log('🧠 Rendering concept graph:', aiResults);
        window.currentTextContent = JSON.stringify(aiResults, null, 2);
        
        // Render the graph after a short delay to ensure DOM is ready
        setTimeout(() => {
          renderSimpleGraph(aiResults);
        }, 100);
        
        return `
          <div class="results-section">
            <h2>🧠 Concept Graph</h2>
            ${metadata}
            <div class="concept-graph-container">
              <div class="graph-controls">
                <button onclick="window.zoomIn()" class="graph-btn">🔍 Zoom In</button>
                <button onclick="window.zoomOut()" class="graph-btn">🔍 Zoom Out</button>
                <button onclick="window.resetView()" class="graph-btn">🔄 Reset</button>
              </div>
              <div id="concept-graph" class="concept-graph-view">
                <div class="graph-loading">
                  <div class="spinner"></div>
                  <p>Analyzing document concepts...</p>
                </div>
              </div>
              <div class="graph-info">
                <p><strong>📊 Graph Statistics:</strong></p>
                <p>• ${aiResults.nodes?.length || 0} Concepts</p>
                <p>• ${aiResults.edges?.length || 0} Relationships</p>
                <p>• Click nodes to see details</p>
                <p>• Use controls to zoom and explore</p>
              </div>
            </div>
            ${generateExportButtons()}
            <button onclick="window.handleBackToOptions()" class="back-button">← Back to Options</button>
          </div>
        `;

      default:
        console.log('❓ Unknown feature, showing options');
        return generateOptionsHTML();
    }
  };

  const updateUI = useCallback(() => {
    console.log('🔄 Updating Results UI...');
    console.log('🔄 Current document state:', currentDocument);
    console.log('🔄 isLoading:', isLoading);
    console.log('🔄 aiResults:', aiResults);
    console.log('🔄 currentFeature:', currentFeature);
    
    // Wait a bit for the DOM to be ready
    setTimeout(() => {
      const resultsContainer = document.querySelector('.results-content');
      console.log('🔄 Results container found:', !!resultsContainer);
      
      if (!resultsContainer) {
        console.error('❌ Results container not found!');
        return;
      }

      // Find the main content area more reliably
      let mainContent = resultsContainer.querySelector('.main-content');
      if (!mainContent) {
        // If main-content doesn't exist, create it
        mainContent = document.createElement('div');
        mainContent.className = 'main-content';
        resultsContainer.appendChild(mainContent);
        console.log('🔄 Created new main-content element');
      }
      
      console.log('🔄 Main content found:', !!mainContent);

      if (isLoading) {
        console.log('🔄 Showing loading state...');
        mainContent.innerHTML = `
          <div class="loading-section">
            <div class="loading-spinner"></div>
            <p>Processing your document with AI...</p>
          </div>
        `;
      } else if (aiResults && currentFeature) {
        console.log('🔄 Showing AI results...');
        mainContent.innerHTML = generateResultsHTML();
      } else {
        console.log('🔄 Showing options...');
        console.log('🔄 About to call generateOptionsHTML...');
        mainContent.innerHTML = generateOptionsHTML();
      }
    }, 100); // Small delay to ensure DOM is ready
  }, [currentDocument, isLoading, aiResults, currentFeature, generateOptionsHTML, generateResultsHTML]);

  // Export functions
  const downloadAsJSON = (data, filename) => {
    const exportData = {
      document: currentDocument,
      results: data,
      metadata: {
        timestamp: new Date().toISOString(),
        documentName: currentDocument?.name || 'Unknown',
        wordCount: currentDocument?.content?.split(' ').length || 0,
        feature: currentFeature
      }
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename || 'smartstudy_results'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadAsText = (content, filename) => {
    const blob = new Blob([content], {type: 'text/plain'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename || 'smartstudy_results'}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const generateExportButtons = () => {
    return `
      <div class="export-section">
        <h4>📤 Export Results</h4>
        <div class="export-buttons">
          <button onclick="window.downloadAsJSON(window.currentAIResults, '${currentDocument?.name?.replace(/\.[^/.]+$/, '')}_results')" class="export-btn json-btn">
            📄 Export as JSON
          </button>
          <button onclick="window.downloadAsText(window.currentTextContent, '${currentDocument?.name?.replace(/\.[^/.]+$/, '')}_results')" class="export-btn text-btn">
            📝 Export as Text
          </button>
          <button onclick="window.saveResultsToDB()" class="export-btn save-btn">
            💾 Save to Database
          </button>
        </div>
      </div>
    `;
  };

  const saveResultsToDB = useCallback(async () => {
    try {
      const metadata = {
        documentName: currentDocument?.name || 'Unknown',
        wordCount: currentDocument?.content?.split(' ').length || 0,
        feature: currentFeature,
        timestamp: new Date().toISOString()
      };

      const result = await apiService.saveResults(currentDocument.id, aiResults, metadata);
      
      if (result.success) {
        alert('✅ Results saved successfully!');
      } else {
        alert('❌ Failed to save results: ' + result.error);
      }
    } catch (error) {
      console.error('Save failed:', error);
      alert('❌ Failed to save results');
    }
  }, [currentDocument, currentFeature, aiResults]);

  // Make functions available globally for onclick handlers
  window.handleOptionClick = handleOptionClick;
  window.handleBackToOptions = () => {
    setAiResults(null);
    setCurrentFeature('');
    updateUI();
  };
  window.handleBackToDocuments = handleBackToDocuments;
  window.downloadAsJSON = downloadAsJSON;
  window.downloadAsText = downloadAsText;
  window.saveResultsToDB = saveResultsToDB;

  // Load document data when component mounts
  const loadDocumentDataCallback = useCallback(() => {
    console.log('🔍 Starting document data load...');
    const documentData = sessionStorage.getItem('selectedDocument');
    console.log('🔍 Raw session storage data:', documentData);
    
    if (documentData) {
      try {
        const parsedDocument = JSON.parse(documentData);
        console.log('🔍 Parsed document:', parsedDocument);
        console.log('🔍 Document name:', parsedDocument.name);
        console.log('🔍 Document content length:', parsedDocument.content?.length);
        console.log('🔍 Document content preview:', parsedDocument.content?.substring(0, 100));
        
        setCurrentDocument(parsedDocument);
        console.log('�� Document state set successfully');
      } catch (error) {
        console.error('❌ Error parsing document data:', error);
        alert('Error loading document data. Please go back and select a document again.');
        window.location.href = '/documents';
      }
    } else {
      console.error('❌ No document data found in session storage');
      console.log('🔍 Available session storage keys:', Object.keys(sessionStorage));
      alert('No document selected. Please go back and select a document.');
      window.location.href = '/documents';
    }
  }, []);

  React.useEffect(() => {
    console.log('🎯 useEffect is running - loading document data...');
    loadDocumentDataCallback();
  }, [loadDocumentDataCallback]);

  // Watch for currentDocument changes and update UI
  React.useEffect(() => {
    if (currentDocument) {
      console.log('📄 Current document changed, updating UI...');
      console.log('📄 New document:', currentDocument);
      updateUI();
    }
  }, [currentDocument, updateUI]);

  // Keyboard shortcuts
  const handleKeyPress = useCallback((event) => {
    // Ctrl+S to save results
    if (event.ctrlKey && event.key === 's' && aiResults && currentFeature) {
      event.preventDefault();
      saveResultsToDB();
    }
    
    // Escape to go back to options
    if (event.key === 'Escape' && aiResults) {
      window.handleBackToOptions();
    }
    
    // Number keys for quick feature selection
    if (event.key >= '1' && event.key <= '4' && !aiResults) {
      const features = ['Summarize Notes', 'Questions / Quiz', 'Important Terms / Flashcards', 'Parsed Text'];
      const featureIndex = parseInt(event.key) - 1;
      if (features[featureIndex]) {
        handleOptionClick(features[featureIndex]);
      }
    }
  }, [aiResults, currentFeature, handleOptionClick, saveResultsToDB]);

  // Add keyboard event listener
  React.useEffect(() => {
    document.addEventListener('keydown', handleKeyPress);
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [handleKeyPress]);

  // Simple concept graph renderer (no external library needed)
  const renderSimpleGraph = (concepts) => {
    console.log('🧠 Rendering simple concept graph:', concepts);
    
    const graphContainer = document.getElementById('concept-graph');
    if (!graphContainer) {
      console.error('❌ Graph container not found');
      return;
    }

    // Show loading state first
    graphContainer.innerHTML = `
      <div class="graph-loading">
        <div class="spinner"></div>
        <p>Generating concept graph...</p>
      </div>
    `;

    // Simulate processing time for better UX
    setTimeout(() => {
      if (!concepts || !concepts.nodes || concepts.nodes.length === 0) {
        graphContainer.innerHTML = `
          <div class="simple-graph">
            <div class="graph-node main">No Concepts Found</div>
            <p style="color: white; text-align: center;">Try processing a different document</p>
          </div>
        `;
        return;
      }

      // Create simple HTML graph
      let graphHTML = '<div class="simple-graph">';
      
      // Add main concept first
      const mainConcept = concepts.nodes.find(node => node.category === 'Main') || concepts.nodes[0];
      if (mainConcept) {
        graphHTML += `
          <div class="graph-node main" onclick="alert('${mainConcept.label}\\n\\nThis is the main concept from your document.')">
            ${mainConcept.label}
          </div>
        `;
      }

      // Add sub concepts with better spacing
      const subConcepts = concepts.nodes.filter(node => node.category === 'Sub' || node.id !== mainConcept?.id);
      subConcepts.forEach((concept, index) => {
        // Add connection line
        graphHTML += `<div class="graph-connection"></div>`;
        
        // Add concept node
        graphHTML += `
          <div class="graph-node sub" onclick="alert('${concept.label}\\n\\nThis concept relates to: ${mainConcept?.label || 'the main topic'}.')">
            ${concept.label}
          </div>
        `;
        
        // Add small spacing between concepts
        if (index < subConcepts.length - 1) {
          graphHTML += `<div style="height: 10px;"></div>`;
        }
      });

      graphHTML += '</div>';
      graphContainer.innerHTML = graphHTML;

      // Add graph controls
      window.zoomIn = () => {
        const graph = document.querySelector('.simple-graph');
        if (graph) {
          const currentScale = parseFloat(graph.style.transform.replace('scale(', '').replace(')', '') || 1);
          graph.style.transform = `scale(${Math.min(2, currentScale + 0.1)})`;
        }
      };

      window.zoomOut = () => {
        const graph = document.querySelector('.simple-graph');
        if (graph) {
          const currentScale = parseFloat(graph.style.transform.replace('scale(', '').replace(')', '') || 1);
          graph.style.transform = `scale(${Math.max(0.5, currentScale - 0.1)})`;
        }
      };

      window.resetView = () => {
        const graph = document.querySelector('.simple-graph');
        if (graph) {
          graph.style.transform = 'scale(1)';
        }
      };
    }, 500); // Show loading for 500ms
  };

  // Quizlet-style functions
  window.toggleAnswer = (questionId) => {
    const answerElement = document.getElementById(`answer-${questionId}`);
    const toggleBtn = document.querySelector(`[data-question-id="${questionId}"] .toggle-btn`);
    const toggleText = toggleBtn.querySelector('.toggle-text');
    
    if (answerElement.style.display === 'none') {
      answerElement.style.display = 'block';
      toggleText.textContent = 'Hide Answer';
    } else {
      answerElement.style.display = 'none';
      toggleText.textContent = 'Show Answer';
    }
  };

  window.showAllAnswers = () => {
    const answerElements = document.querySelectorAll('.answer-side');
    const toggleBtns = document.querySelectorAll('.toggle-btn .toggle-text');
    
    answerElements.forEach(element => {
      element.style.display = 'block';
    });
    
    toggleBtns.forEach(btn => {
      btn.textContent = 'Hide Answer';
    });
  };

  window.hideAllAnswers = () => {
    const answerElements = document.querySelectorAll('.answer-side');
    const toggleBtns = document.querySelectorAll('.toggle-btn .toggle-text');
    
    answerElements.forEach(element => {
      element.style.display = 'none';
    });
    
    toggleBtns.forEach(btn => {
      btn.textContent = 'Show Answer';
    });
  };

  window.resetQuizlet = () => {
    window.hideAllAnswers();
  };

  window.generateNewQuestions = async () => {
    try {
      // Get current document ID from the selected document data
      const selectedDocumentData = sessionStorage.getItem('selectedDocument');
      
      if (!selectedDocumentData) {
        alert('No document selected. Please go back and select a document.');
        return;
      }

      const documentData = JSON.parse(selectedDocumentData);
      const currentDocument = documentData.id;
      
      console.log('🔄 Generating new questions for document:', currentDocument);

      // Show loading state
      const quizletContainer = document.querySelector('.quizlet-container');
      if (quizletContainer) {
        quizletContainer.innerHTML = `
          <div class="quizlet-loading">
            <div class="spinner"></div>
            <p>Generating new questions...</p>
          </div>
        `;
      }

      // Call the API to generate new questions
      const response = await apiService.generateQuestions(currentDocument);
      
      if (response && response.questions) {
        // Update the questions in the current AI results
        const currentResults = JSON.parse(sessionStorage.getItem('aiResults') || '{}');
        currentResults.questions = response.questions;
        sessionStorage.setItem('aiResults', JSON.stringify(currentResults));
        
        // Re-render the questions section
        updateUI();
        
        // Show success message
        setTimeout(() => {
          alert('✨ New questions generated successfully!');
        }, 500);
      } else {
        throw new Error('Failed to generate new questions');
      }
    } catch (error) {
      console.error('❌ Error generating new questions:', error);
      alert('❌ Failed to generate new questions. Please try again.');
      
      // Restore the original content
      updateUI();
    }
  };

  return (
    <div className="results-container">
      <div className="results-content">
        <div className="main-content">
          {/* Content will be dynamically updated */}
        </div>
      </div>
    </div>
  );
};

export default Results;