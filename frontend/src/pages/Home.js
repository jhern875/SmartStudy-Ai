import React from 'react';
import logo from '../images/logo.png';
import '../styles/Home.css';

const Home = () => {
  const handleGetStarted = () => {
    // Navigate to upload page or open upload modal
    console.log('Get Started clicked');
  };

  return (
    <div className="home-container">
      <div className="home-content">
        {/* Logo */}
        <div className="logo-container">
          <img src={logo} alt="SmartStudy AI Logo" className="logo" />
        </div>

        {/* Catchy Phrase */}
        <div className="phrase-container">
          <h1 className="main-title">
            Welcome to your AI Study Assistant
          </h1>
          <p className="subtitle">
            Upload a file → Summarize it → Ask questions instantly
          </p>
        </div>

        {/* Get Started Button */}
        <div className="button-container">
          <button 
            onClick={handleGetStarted}
            className="get-started-button"
          >
            Get Started
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home; 