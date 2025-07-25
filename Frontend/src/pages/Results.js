import '../styles/Results.css';
import apiService from '../services/api.js';
import React from 'react'; // Added missing import for React

const Results = () => {
  let currentDocument = null;
  let aiResults = null;
  let currentFeature = null;
  let isLoading = false;
  let isShowingAIResults = false; // New state to track AI results display

  const handleBackToDocuments = () => {
    window.location.href = '/documents';
  };

  const loadDocumentData = () => {
    const documentData = sessionStorage.getItem('selectedDocument');
    if (documentData) {
      currentDocument = JSON.parse(documentData);
      console.log('Document data loaded:', currentDocument);
      updateUI();
    } else {
      console.error('No document data found in session storage');
      window.location.href = '/documents';
    }
  };

  const handleOptionClick = async (option) => {
    if (!currentDocument) {
      alert('No document selected. Please go back and select a document.');
      return;
    }

    isLoading = true;
    currentFeature = option;
    isShowingAIResults = false; // Reset state
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
        aiResults = result;
        isLoading = false; // Set loading to false after AI processing completes
        isShowingAIResults = true; // Set state to show AI results
        updateUI();
      }, 500);

    } catch (error) {
      console.error('AI feature failed:', error);
      aiResults = { 
        error: error.message === 'Request timed out' 
          ? 'Request timed out. Please try again with a smaller document.' 
          : 'Failed to process request. Please try again.' 
      };
      isLoading = false; // Set loading to false even on error
      isShowingAIResults = true; // Set state to show AI results even on error
      updateUI();
    }
  };

  const updateUI = () => {
    console.log('Updating Results UI...');
    
    // Wait a bit for the DOM to be ready
    setTimeout(() => {
      const resultsContainer = document.querySelector('.results-content');
      console.log('Results container found:', !!resultsContainer);
      
      if (!resultsContainer) {
        console.error('Results container not found!');
        return;
      }

      // Find the main content area more reliably
      let mainContent = resultsContainer.querySelector('.main-content');
      if (!mainContent) {
        // If main-content doesn't exist, create it
        mainContent = document.createElement('div');
        mainContent.className = 'main-content';
        resultsContainer.appendChild(mainContent);
      }
      
      console.log('Main content found:', !!mainContent);

      if (isLoading) {
        console.log('Showing loading state...');
        mainContent.innerHTML = `
          <div class="loading-section">
            <div class="loading-spinner"></div>
            <p>Processing your document with AI...</p>
          </div>
        `;
      } else if (aiResults && currentFeature) {
        console.log('Showing AI results...');
        mainContent.innerHTML = generateResultsHTML();
      } else {
        console.log('Showing options...');
        mainContent.innerHTML = generateOptionsHTML();
      }
    }, 100); // Small delay to ensure DOM is ready
  };

  const generateOptionsHTML = () => {
    console.log('Generating options HTML for document:', currentDocument);
    
    const wordCount = currentDocument?.content?.split(' ').length || 0;
    const charCount = currentDocument?.content?.length || 0;
    const estimatedTime = Math.ceil(wordCount / 100); // Rough estimate: 1 second per 100 words
    
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
            <p>${currentDocument?.content?.substring(0, 500)}${currentDocument?.content?.length > 500 ? '...' : ''}</p>
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
        
        <div class="option-card" onclick="window.handleOptionClick('Parsed Text')">
          <h3>📄 Full Parsed Text</h3>
          <p>View the complete extracted text from your file with formatting.</p>
          <small>Press <kbd>3</kbd> for quick access</small>
        </div>
        
        <div class="option-card" onclick="window.handleOptionClick('Important Terms / Flashcards')">
          <h3>🎯 Important Terms / Flashcards</h3>
          <p>Identify key terms and create flashcards for memorization.</p>
          <small>Press <kbd>4</kbd> for quick access</small>
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
        console.log('❓ Rendering questions:', aiResults.questions);
        const questionsText = aiResults.questions.map((q, index) => 
          `Question ${index + 1} (${q.type}): ${q.question}`
        ).join('\n\n');
        window.currentTextContent = questionsText;
        return `
          <div class="results-section">
            <h2>❓ Questions & Quiz</h2>
            ${metadata}
            <div class="questions-content">
              ${aiResults.questions.map((q, index) => `
                <div class="question-item">
                  <h4>Question ${index + 1} (${q.type})</h4>
                  <p>${q.question}</p>
                </div>
              `).join('')}
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

      default:
        console.log('❓ Unknown feature, showing options');
        return generateOptionsHTML();
    }
  };

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

  const saveResultsToDB = async () => {
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
  };

  // Make functions available globally for onclick handlers
  window.handleOptionClick = handleOptionClick;
  window.handleBackToOptions = () => {
    aiResults = null;
    currentFeature = null;
    isShowingAIResults = false; // Reset state
    updateUI();
  };
  window.handleBackToDocuments = handleBackToDocuments;
  window.downloadAsJSON = downloadAsJSON;
  window.downloadAsText = downloadAsText;
  window.saveResultsToDB = saveResultsToDB;

  // Load document data when component mounts
  loadDocumentData();

  // Keyboard shortcuts
  const handleKeyPress = (event) => {
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
  };

  // Add keyboard event listener
  React.useEffect(() => {
    document.addEventListener('keydown', handleKeyPress);
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [aiResults, currentFeature]);

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