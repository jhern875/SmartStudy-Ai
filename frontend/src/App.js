import Home from './pages/Home';
import Upload from './pages/Upload';
import Results from './pages/Results';
import DocumentSelection from './pages/DocumentSelection.js';
import './App.css';

function App() {
  // Get current path from URL
  const currentPath = window.location.pathname;
  
  // Handle navigation
  const navigateTo = (path) => {
    window.history.pushState({}, '', path);
    window.location.reload(); // Simple way to trigger re-render
  };

  // Add navigation function to window for components to use
  window.navigateTo = navigateTo;
  
  if (currentPath === '/upload') {
    return <Upload />;
  } else if (currentPath === '/results') {
    return <Results />;
  } else if (currentPath === '/documents') {
    return <DocumentSelection />;
  }
  
  return <Home />;
}

export default App; 