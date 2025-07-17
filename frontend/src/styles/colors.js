// SmartStudy AI Color Palette Configuration

export const colors = {
  // Primary Color Palette
  primary: {
    blue: '#3B82F6',      // Use for buttons, highlights, active elements
    green: '#10B981',     // Use for success messages, summary highlights, positive actions
    lightGray: '#F3F4F6', // Use for backgrounds or containers
    darkText: '#1F2937',  // Use for primary text
  },

  // Secondary / Supporting Colors
  secondary: {
    indigo: '#4F46E5',    // Use for links or hover states
    amber: '#FBBF24',     // Use for warnings, highlights, or attention-grabbing labels
    rose: '#F43F5E',      // Use for error messages or delete actions
    purple: '#8B5CF6',    // Use for AI/Q&A related icons, titles, or emphasis
  },

  // UI Combinations
  ui: {
    ctaButton: {
      background: '#3B82F6',
      text: '#FFFFFF'
    },
    summaryCard: {
      background: '#FFFFFF',
      border: '#E5E7EB',
      text: '#1F2937'
    },
    qaSection: {
      accent: '#8B5CF6'  // Use for icons or section headers
    }
  },

  // Semantic Colors
  semantic: {
    success: '#10B981',
    warning: '#FBBF24',
    error: '#F43F5E',
    info: '#3B82F6'
  }
};

// CSS Variables for easy use in stylesheets
export const cssVariables = `
  :root {
    /* Primary Colors */
    --primary-blue: #3B82F6;
    --primary-green: #10B981;
    --neutral-light-gray: #F3F4F6;
    --dark-text-gray: #1F2937;
    
    /* Secondary Colors */
    --indigo: #4F46E5;
    --amber: #FBBF24;
    --rose: #F43F5E;
    --purple: #8B5CF6;
    
    /* UI Combinations */
    --cta-button-bg: #3B82F6;
    --cta-button-text: #FFFFFF;
    --summary-card-bg: #FFFFFF;
    --summary-card-border: #E5E7EB;
    --summary-card-text: #1F2937;
    --qa-section-accent: #8B5CF6;
  }
`;

export default colors; 