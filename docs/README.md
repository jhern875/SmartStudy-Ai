# SmartStudy AI 📚✨

A powerful AI-powered study assistant that helps you analyze documents, generate summaries, create flashcards, and build interactive quizzes. Built with React.js frontend and Node.js backend, powered by local AI models.

## 🚀 Features

- **📄 Document Upload & Processing**: Support for PDF, DOCX, and TXT files
- **🤖 AI-Powered Analysis**: Generate summaries, important terms, and concept graphs
- **❓ Interactive Quiz Generation**: Create Quizlet-style questions with answers
- **📊 Concept Visualization**: Visual concept graphs from document content
- **💾 Results Management**: Save, export, and manage your study materials
- **🗑️ File Management**: Upload, delete, and organize your documents
- **🎨 Modern UI**: Beautiful, responsive interface with smooth animations

## 🛠️ Tech Stack

### Frontend
- **React.js** - Modern UI framework
- **CSS3** - Custom styling with gradients and animations
- **JavaScript ES6+** - Modern JavaScript features

### Backend
- **Node.js** - Server runtime
- **Express.js** - Web framework
- **Multer** - File upload handling
- **PDF-Parse** - PDF text extraction
- **Mammoth** - DOCX text extraction

### AI Integration
- **Ollama** - Local AI model server
- **LLaMA 2 / Gemma3** - Large Language Models
- **Custom AI Service** - Tailored prompts for study materials

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js)
- **Ollama** - [Download here](https://ollama.ai/)

## 🚀 Installation & Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd SmartStudy-Ai
```

### 2. Install Ollama

#### Windows
```bash
# Download from https://ollama.ai/
# Run the installer and follow the setup wizard
```

#### macOS
```bash
curl -fsSL https://ollama.ai/install.sh | sh
```

#### Linux
```bash
curl -fsSL https://ollama.ai/install.sh | sh
```

### 3. Download AI Models

```bash
# Start Ollama (if not already running)
ollama serve

# Download the AI model (in a new terminal)
ollama pull llama2
# OR
ollama pull gemma3
```

### 4. Install Dependencies

#### Backend Dependencies
```bash
cd backend
npm install
```

#### Frontend Dependencies
```bash
cd Frontend
npm install
```

### 5. Configure Environment

Create a `.env` file in the `backend` directory:

```bash
cd backend
# Create .env file (optional - app works without it)
touch .env
```

### 6. Start the Application

#### Terminal 1 - Start Backend
```bash
cd backend
npm start
```
Backend will run on: http://localhost:5000

#### Terminal 2 - Start Frontend
```bash
cd Frontend
npm start
```
Frontend will run on: http://localhost:3000

#### Terminal 3 - Ensure Ollama is Running
```bash
ollama serve
```

## 🎯 Quick Start Guide

1. **Open your browser** and go to http://localhost:3000
2. **Upload a document** (PDF, DOCX, or TXT)
3. **Select your document** from the document selection page
4. **Choose an AI feature**:
   - 📝 **Summary**: Get a concise summary
   - ❓ **Questions/Quiz**: Generate Quizlet-style questions
   - 📚 **Important Terms**: Extract key terms and definitions
   - 🧠 **Concept Graph**: Visualize document concepts
5. **Interact with results** and export as needed

## 📁 Project Structure

```
SmartStudy-Ai/
├── backend/                 # Node.js backend server
│   ├── models/             # AI model configurations
│   ├── routes/             # API endpoints
│   │   ├── ai.js          # AI feature routes
│   │   └── upload.js      # File upload routes
│   ├── services/           # Business logic
│   │   └── aiService.js   # AI integration service
│   ├── uploads/           # Uploaded files storage
│   ├── server.js          # Main server file
│   └── package.json       # Backend dependencies
├── Frontend/              # React.js frontend
│   ├── public/            # Static files
│   ├── src/               # Source code
│   │   ├── components/    # React components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API service layer
│   │   └── styles/        # CSS stylesheets
│   └── package.json       # Frontend dependencies
└── README.md              # This file
```

## 🔧 Configuration

### AI Model Selection

The app uses Ollama with LLaMA 2 or Gemma3. To change models:

1. **Download a different model**:
   ```bash
   ollama pull llama2:7b
   # OR
   ollama pull gemma3:2b
   ```

2. **Update the model in** `backend/services/aiService.js`:
   ```javascript
   const model = 'llama2'; // or 'gemma3'
   ```

### Port Configuration

- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:5000
- **Ollama**: http://localhost:11434

To change ports, modify the respective configuration files.

## 🚀 Usage Examples

### Generate Questions from a Document

1. Upload a PDF document about machine learning
2. Select the document from the list
3. Choose "Questions/Quiz" feature
4. Get 5 interactive questions with answers
5. Use "Generate New Questions" for more variety

### Create Concept Graphs

1. Upload a research paper
2. Select "Concept Graph" feature
3. View visual representation of key concepts
4. Export the graph for presentations

### Extract Important Terms

1. Upload a textbook chapter
2. Choose "Important Terms" feature
3. Get a list of key terms with definitions
4. Export as flashcards for study

## 🐛 Troubleshooting

### Common Issues

#### "Ollama command not found"
- Ensure Ollama is installed and in your PATH
- Restart your terminal/command prompt
- On Windows, restart your computer after installation

#### "Model not found"
```bash
# Download the required model
ollama pull llama2
# OR
ollama pull gemma3
```

#### "Backend connection failed"
- Ensure backend is running on port 5000
- Check that Ollama is running on port 11434
- Verify no firewall blocking the connections

#### "Frontend not loading"
- Ensure frontend is running on port 3000
- Check browser console for errors
- Verify all dependencies are installed

### Performance Tips

- **Use smaller models** for faster responses (gemma3:2b)
- **Limit document size** for better performance
- **Close other applications** to free up memory
- **Use SSD storage** for faster file processing

## 📝 API Documentation

### Backend Endpoints

- `GET /api/health` - Health check
- `GET /api/documents` - List uploaded documents
- `POST /api/upload` - Upload a file
- `POST /api/ai/summarize` - Generate summary
- `POST /api/ai/questions` - Generate questions
- `POST /api/ai/terms` - Extract important terms
- `POST /api/ai/concepts` - Generate concept graph
- `DELETE /api/documents/:filename` - Delete document

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **Ollama** for local AI model hosting
- **React.js** for the frontend framework
- **Express.js** for the backend framework
- **OpenAI** for inspiration in AI integration

## 📞 Support

If you encounter any issues:

1. Check the troubleshooting section above
2. Review the console logs for error messages
3. Ensure all prerequisites are installed
4. Verify all services are running

---

**Happy Studying! 📚✨** 