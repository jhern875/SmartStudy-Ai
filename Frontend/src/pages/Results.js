import '../styles/Results.css';

const Results = () => {
  const handleBackToDocuments = () => {
    if (window.navigateTo) {
      window.navigateTo('/documents');
    } else {
      window.location.href = '/documents';
    }
  };

  const handleOptionClick = (option) => {
    alert(`You clicked: ${option}`);
    // In a real app, this would navigate to a specific feature page
  };

  // Fake parsed data for demonstration
  const fakeParsedText = `
    This is a simulated parsed text from your uploaded document.
    It contains key information that has been extracted.
    For example, important concepts like "Artificial Intelligence",
    "Machine Learning", and "Natural Language Processing" might be here.
    The document also discusses "data structures" and "algorithms".
    This section would typically show the cleaned and processed content.
  `;

  const fakeImportantTerms = [
    "Artificial Intelligence",
    "Machine Learning", 
    "Natural Language Processing",
    "Data Structures",
    "Algorithms",
    "Deep Learning",
    "Neural Networks"
  ];

  return (
    <div className="results-container">
      <div className="results-content">
        <button onClick={handleBackToDocuments} className="back-button">
          ← Back to Documents
        </button>
        <h1 className="results-title">Your Document is Ready!</h1>
        <p className="results-subtitle">Here's what you can do with your parsed information:</p>

        <div className="parsed-info-section">
          <h2>Parsed Text (Excerpt)</h2>
          <div className="parsed-text-box">
            <p>{fakeParsedText}</p>
          </div>
        </div>

        <div className="options-grid">
          <div className="option-card" onClick={() => handleOptionClick('Summarize Notes')}>
            <h3>📝 Summarize Notes</h3>
            <p>Get a concise summary of your document with key points and main ideas.</p>
          </div>
          
          <div className="option-card" onClick={() => handleOptionClick('Questions / Quiz')}>
            <h3>❓ Questions / Quiz</h3>
            <p>Generate questions or a quiz based on the content to test your knowledge.</p>
          </div>
          
          <div className="option-card" onClick={() => handleOptionClick('Parsed Text')}>
            <h3>📄 Full Parsed Text</h3>
            <p>View the complete extracted text from your file with formatting.</p>
          </div>
          
          <div className="option-card" onClick={() => handleOptionClick('Important Terms / Flashcards')}>
            <h3>🎯 Important Terms / Flashcards</h3>
            <p>Identify key terms and create flashcards for memorization.</p>
          </div>
        </div>

        <div className="important-terms-section">
          <h2>Important Terms to Memorize</h2>
          <ul className="terms-list">
            {fakeImportantTerms.map((term, index) => (
              <li key={index}>{term}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Results; 