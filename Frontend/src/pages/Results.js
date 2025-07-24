import '../styles/Results.css';
import apiService from '../services/api.js';

const Results = () => {
  let currentDocument = null;
  let isLoading = false;
  let currentFeature = null;
  let aiResults = null;

  const handleBackToDocuments = () => {
    if (window.navigateTo) {
      window.navigateTo('/documents');
    } else {
      window.location.href = '/documents';
    }
  };

  const loadDocumentData = () => {
    try {
      console.log('Loading document data from sessionStorage...');
      const storedDocument = sessionStorage.getItem('selectedDocument');
      console.log('Stored document:', storedDocument);
      
      if (storedDocument) {
        currentDocument = JSON.parse(storedDocument);
        console.log('Parsed document:', currentDocument);
        updateUI();
      } else {
        console.log('No document found in sessionStorage, redirecting...');
        // No document selected, redirect back to documents
        handleBackToDocuments();
      }
    } catch (error) {
      console.error('Error loading document data:', error);
      handleBackToDocuments();
    }
  };

  const handleOptionClick = async (option) => {
    if (!currentDocument) {
      alert('No document selected. Please go back and select a document.');
      return;
    }

    isLoading = true;
    currentFeature = option;
    updateUI();

    try {
      console.log(`Starting AI feature: ${option}`);
      let result;
      
      // Add timeout for AI calls
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Request timed out')), 45000); // 45 second timeout
      });

      const aiPromise = (async () => {
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

      result = await Promise.race([aiPromise, timeoutPromise]);
      console.log(`AI feature completed: ${option}`, result);

      aiResults = result;
      updateUI();
    } catch (error) {
      console.error('AI feature failed:', error);
      aiResults = { 
        error: error.message === 'Request timed out' 
          ? 'Request timed out. Please try again with a smaller document.' 
          : 'Failed to process request. Please try again.' 
      };
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
    return `
      <h1 class="results-title">Your Document is Ready!</h1>
      <p class="results-subtitle">Here's what you can do with your parsed information:</p>

      <div class="parsed-info-section">
        <h2>Document: ${currentDocument?.name || 'Unknown'}</h2>
        <div class="parsed-text-box">
          <p>${currentDocument?.content?.substring(0, 200)}${currentDocument?.content?.length > 200 ? '...' : ''}</p>
        </div>
      </div>

      <div class="options-grid">
        <div class="option-card" onclick="window.handleOptionClick('Summarize Notes')">
          <h3>📝 Summarize Notes</h3>
          <p>Get a concise summary of your document with key points and main ideas.</p>
        </div>
        
        <div class="option-card" onclick="window.handleOptionClick('Questions / Quiz')">
          <h3>❓ Questions / Quiz</h3>
          <p>Generate questions or a quiz based on the content to test your knowledge.</p>
        </div>
        
        <div class="option-card" onclick="window.handleOptionClick('Parsed Text')">
          <h3>📄 Full Parsed Text</h3>
          <p>View the complete extracted text from your file with formatting.</p>
        </div>
        
        <div class="option-card" onclick="window.handleOptionClick('Important Terms / Flashcards')">
          <h3>🎯 Important Terms / Flashcards</h3>
          <p>Identify key terms and create flashcards for memorization.</p>
        </div>
      </div>
    `;
  };

  const generateResultsHTML = () => {
    if (aiResults.error) {
      return `
        <div class="error-section">
          <h2>Error</h2>
          <p>${aiResults.error}</p>
          <button onclick="window.handleBackToOptions()" class="back-button">← Back to Options</button>
        </div>
      `;
    }

    switch (currentFeature) {
      case 'Summarize Notes':
        return `
          <div class="results-section">
            <h2>📝 Document Summary</h2>
            <div class="summary-content">
              <p>${aiResults.summary}</p>
            </div>
            <button onclick="window.handleBackToOptions()" class="back-button">← Back to Options</button>
          </div>
        `;

      case 'Questions / Quiz':
        return `
          <div class="results-section">
            <h2>❓ Questions & Quiz</h2>
            <div class="questions-content">
              ${aiResults.questions.map((q, index) => `
                <div class="question-item">
                  <h4>Question ${index + 1} (${q.type})</h4>
                  <p>${q.question}</p>
                </div>
              `).join('')}
            </div>
            <button onclick="window.handleBackToOptions()" class="back-button">← Back to Options</button>
          </div>
        `;

      case 'Important Terms / Flashcards':
        return `
          <div class="results-section">
            <h2>🎯 Important Terms & Definitions</h2>
            <div class="terms-content">
              ${aiResults.terms.map((term, index) => `
                <div class="term-item">
                  <h4>${term.term}</h4>
                  <p>${term.definition}</p>
                </div>
              `).join('')}
            </div>
            <button onclick="window.handleBackToOptions()" class="back-button">← Back to Options</button>
          </div>
        `;

      case 'Parsed Text':
        return `
          <div class="results-section">
            <h2>📄 Full Parsed Text</h2>
            <div class="parsed-content">
              <pre>${aiResults.content}</pre>
            </div>
            <button onclick="window.handleBackToOptions()" class="back-button">← Back to Options</button>
          </div>
        `;

      default:
        return generateOptionsHTML();
    }
  };

  // Make functions available globally for onclick handlers
  window.handleOptionClick = handleOptionClick;
  window.handleBackToOptions = () => {
    aiResults = null;
    currentFeature = null;
    updateUI();
  };

  // Load document data when component mounts
  loadDocumentData();

  return (
    <div className="results-container">
      <div className="results-content">
        <button onClick={handleBackToDocuments} className="back-button">
          ← Back to Documents
        </button>
        
        <div className="main-content">
          {/* Content will be dynamically updated */}
        </div>
      </div>
    </div>
  );
};

export default Results; 