# SmartStudy AI - Technical Documentation 📚

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [System Requirements](#system-requirements)
3. [Installation Guide](#installation-guide)
4. [Configuration](#configuration)
5. [API Reference](#api-reference)
6. [Database Schema](#database-schema)
7. [AI Integration](#ai-integration)
8. [Frontend Architecture](#frontend-architecture)
9. [Backend Architecture](#backend-architecture)
10. [Security Considerations](#security-considerations)
11. [Performance Optimization](#performance-optimization)
12. [Deployment Guide](#deployment-guide)
13. [Testing](#testing)
14. [Maintenance](#maintenance)

## Architecture Overview

SmartStudy AI is a full-stack web application built with a microservices architecture:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │    Ollama       │
│   (React.js)    │◄──►│   (Node.js)     │◄──►│   (AI Server)   │
│   Port: 3000    │    │   Port: 5000    │    │   Port: 11434   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Technology Stack

| Component | Technology | Version | Purpose |
|-----------|------------|---------|---------|
| Frontend | React.js | 18.x | User interface |
| Backend | Node.js | 16.x+ | API server |
| AI Server | Ollama | 0.9.x | Local AI models |
| File Processing | Multer, PDF-Parse, Mammoth | Latest | Document handling |
| Database | In-memory Map | N/A | Temporary storage |

## System Requirements

### Minimum Requirements

- **OS**: Windows 10, macOS 10.15+, or Linux (Ubuntu 18.04+)
- **RAM**: 8GB (16GB recommended for AI models)
- **Storage**: 10GB free space
- **CPU**: Multi-core processor
- **Network**: Internet connection for initial setup

### Recommended Requirements

- **RAM**: 16GB or more
- **Storage**: SSD with 20GB free space
- **CPU**: 8+ cores
- **GPU**: NVIDIA GPU with 8GB+ VRAM (optional)

## Installation Guide

### Prerequisites Installation

#### 1. Node.js Installation

**Windows:**
```bash
# Download from https://nodejs.org/
# Run installer and follow wizard
```

**macOS:**
```bash
# Using Homebrew
brew install node

# Or download from https://nodejs.org/
```

**Linux (Ubuntu/Debian):**
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

#### 2. Ollama Installation

**Windows:**
```bash
# Download from https://ollama.ai/
# Run installer and restart computer
```

**macOS:**
```bash
curl -fsSL https://ollama.ai/install.sh | sh
```

**Linux:**
```bash
curl -fsSL https://ollama.ai/install.sh | sh
```

### Application Setup

#### 1. Clone Repository
```bash
git clone <repository-url>
cd SmartStudy-Ai
```

#### 2. Install Dependencies

**Backend:**
```bash
cd backend
npm install
```

**Frontend:**
```bash
cd Frontend
npm install
```

#### 3. Download AI Models
```bash
# Start Ollama
ollama serve

# Download models (in new terminal)
ollama pull llama2
# OR
ollama pull gemma3
```

#### 4. Start Services

**Terminal 1 - Backend:**
```bash
cd backend
npm start
```

**Terminal 2 - Frontend:**
```bash
cd Frontend
npm start
```

**Terminal 3 - Ollama:**
```bash
ollama serve
```

## Configuration

### Environment Variables

Create `.env` file in `backend/` directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# AI Configuration
OLLAMA_BASE_URL=http://localhost:11434
AI_MODEL=llama2

# File Upload Configuration
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads

# Security
CORS_ORIGIN=http://localhost:3000
```

### AI Model Configuration

Edit `backend/services/aiService.js`:

```javascript
// Change model here
const model = 'llama2'; // or 'gemma3'

// Adjust parameters
const options = {
  model: model,
  temperature: 0.7,
  max_tokens: 1000,
  timeout: 120000
};
```

## API Reference

### Authentication
Currently, the application doesn't require authentication. All endpoints are publicly accessible.

### Base URL
```
http://localhost:5000/api
```

### Endpoints

#### Health Check
```http
GET /api/health
```
**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

#### Get Documents
```http
GET /api/documents
```
**Response:**
```json
[
  {
    "id": "document.pdf",
    "name": "document.pdf",
    "type": "application/pdf",
    "size": 1024000,
    "uploadedAt": "2024-01-01T00:00:00.000Z"
  }
]
```

#### Upload File
```http
POST /api/upload
Content-Type: multipart/form-data

file: [binary data]
```
**Response:**
```json
{
  "message": "File uploaded successfully",
  "filename": "document.pdf",
  "extractedText": "Document content..."
}
```

#### Generate Summary
```http
POST /api/ai/summarize
Content-Type: application/json

{
  "documentId": "document.pdf"
}
```
**Response:**
```json
{
  "summary": "Document summary...",
  "status": "success"
}
```

#### Generate Questions
```http
POST /api/ai/questions
Content-Type: application/json

{
  "documentId": "document.pdf"
}
```
**Response:**
```json
{
  "questions": [
    {
      "id": "1",
      "question": "What is the main topic?",
      "answer": "The main topic is..."
    }
  ]
}
```

#### Extract Terms
```http
POST /api/ai/terms
Content-Type: application/json

{
  "documentId": "document.pdf"
}
```
**Response:**
```json
{
  "terms": [
    {
      "term": "AI",
      "definition": "Artificial Intelligence"
    }
  ]
}
```

#### Generate Concept Graph
```http
POST /api/ai/concepts
Content-Type: application/json

{
  "documentId": "document.pdf"
}
```
**Response:**
```json
{
  "nodes": [
    {
      "id": "1",
      "label": "Main Concept",
      "category": "Main"
    }
  ],
  "edges": []
}
```

#### Delete Document
```http
DELETE /api/documents/:filename
```
**Response:**
```json
{
  "message": "Document deleted successfully"
}
```

## Database Schema

The application uses an in-memory database (Map object) for temporary storage:

### Results Database
```javascript
// Structure in backend/server.js
const resultsDB = new Map();

// Schema
{
  documentId: {
    summary: "Generated summary",
    questions: [...],
    terms: [...],
    concepts: {...},
    metadata: {
      documentName: "filename.pdf",
      wordCount: 1500,
      processedAt: "2024-01-01T00:00:00.000Z"
    }
  }
}
```

### File Storage
```
backend/uploads/
├── document1.pdf
├── document1.pdf.txt
├── document2.docx
└── document2.docx.txt
```

## AI Integration

### Ollama Configuration

**Model Selection:**
- **LLaMA 2**: Better for complex reasoning
- **Gemma3**: Faster, good for simple tasks

**Model Download:**
```bash
# Download specific models
ollama pull llama2:7b
ollama pull gemma3:2b
ollama pull gemma3:7b
```

### Prompt Engineering

The application uses carefully crafted prompts for each feature:

#### Summary Prompt
```
Create a concise summary of this document. Focus on the main points and key insights.

Document content:
{content}

Return ONLY the summary text, no additional formatting.
```

#### Questions Prompt
```
Create 5 questions with answers based on this document. Each question should have a clear, direct answer.

Document content:
{content}

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
```

#### Terms Prompt
```
Extract important terms and their definitions from this document.

Document content:
{content}

Return ONLY this JSON format:
{
  "terms": [
    {
      "term": "Term",
      "definition": "Definition"
    }
  ]
}
```

### Error Handling

```javascript
// AI Service Error Handling
try {
  const result = await ollama.generate(options);
  return result.response;
} catch (error) {
  console.error('AI generation failed:', error);
  return getFallbackResponse(feature);
}
```

## Frontend Architecture

### Component Structure

```
src/
├── components/          # Reusable components
├── pages/              # Page components
│   ├── Home.js         # Landing page
│   ├── Upload.js       # File upload
│   ├── DocumentSelection.js  # Document list
│   └── Results.js      # AI results display
├── services/           # API services
│   └── api.js          # HTTP client
├── styles/             # CSS files
└── App.js              # Main app component
```

### State Management

The application uses React hooks and sessionStorage for state management:

```javascript
// Session Storage Keys
sessionStorage.setItem('selectedDocument', JSON.stringify(documentData));
sessionStorage.setItem('aiResults', JSON.stringify(results));
sessionStorage.setItem('currentDocument', documentId);
```

### Routing

Simple client-side routing using React Router or manual navigation:

```javascript
// Navigation
window.location.href = '/results';
// OR
window.navigateTo('/results');
```

## Backend Architecture

### Server Structure

```
backend/
├── server.js           # Main server file
├── routes/             # API routes
│   ├── ai.js          # AI endpoints
│   └── upload.js      # File handling
├── services/           # Business logic
│   └── aiService.js   # AI integration
├── uploads/           # File storage
└── package.json       # Dependencies
```

### Middleware Stack

```javascript
// Express middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));
```

### File Processing Pipeline

1. **Upload**: Multer handles file upload
2. **Extraction**: PDF-Parse or Mammoth extracts text
3. **Storage**: Files saved to uploads directory
4. **Processing**: AI service processes content
5. **Response**: Results returned to frontend

## Security Considerations

### File Upload Security

```javascript
// File type validation
const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];

// File size limits
const maxFileSize = 10 * 1024 * 1024; // 10MB
```

### CORS Configuration

```javascript
// CORS setup
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));
```

### Input Validation

```javascript
// Validate document ID
if (!documentId || typeof documentId !== 'string') {
  return res.status(400).json({ error: 'Invalid document ID' });
}
```

## Performance Optimization

### Frontend Optimizations

- **Lazy Loading**: Components loaded on demand
- **Memoization**: React.memo for expensive components
- **Debouncing**: API calls debounced to prevent spam
- **Caching**: Results cached in sessionStorage

### Backend Optimizations

- **File Size Limits**: Prevent large file uploads
- **Content Truncation**: Limit content sent to AI
- **Timeout Handling**: Prevent hanging requests
- **Memory Management**: Clean up temporary files

### AI Optimizations

```javascript
// Optimize AI calls
const options = {
  model: model,
  temperature: 0.7,
  max_tokens: 1000,  // Limit response size
  timeout: 120000    // 2-minute timeout
};
```

## Deployment Guide

### Development Deployment

```bash
# Start all services
cd backend && npm start &
cd Frontend && npm start &
ollama serve &
```

### Production Deployment

#### Using PM2

```bash
# Install PM2
npm install -g pm2

# Start backend
cd backend
pm2 start server.js --name "smartstudy-backend"

# Start frontend (build first)
cd Frontend
npm run build
pm2 start serve -s build --name "smartstudy-frontend"
```

#### Using Docker

```dockerfile
# Backend Dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

### Environment Variables

```bash
# Production .env
NODE_ENV=production
PORT=5000
CORS_ORIGIN=https://yourdomain.com
OLLAMA_BASE_URL=http://localhost:11434
```

## Testing

### Manual Testing Checklist

- [ ] File upload (PDF, DOCX, TXT)
- [ ] Document selection
- [ ] AI feature generation
- [ ] Results display
- [ ] Export functionality
- [ ] File deletion
- [ ] Error handling

### Automated Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd Frontend
npm test
```

## Maintenance

### Regular Tasks

1. **Update Dependencies**
   ```bash
   npm update
   ```

2. **Clean Upload Directory**
   ```bash
   # Remove old files
   find backend/uploads -mtime +30 -delete
   ```

3. **Monitor Logs**
   ```bash
   # Check application logs
   pm2 logs
   ```

4. **Backup Data**
   ```bash
   # Backup uploads and results
   tar -czf backup-$(date +%Y%m%d).tar.gz backend/uploads/
   ```

### Troubleshooting

#### Common Issues

1. **Ollama Connection Failed**
   ```bash
   # Check if Ollama is running
   curl http://localhost:11434/api/tags
   ```

2. **Model Not Found**
   ```bash
   # List available models
   ollama list
   
   # Pull missing model
   ollama pull llama2
   ```

3. **Port Conflicts**
   ```bash
   # Check port usage
   netstat -tulpn | grep :5000
   ```

### Performance Monitoring

```javascript
// Add performance logging
console.time('ai-generation');
const result = await aiService.generateQuestions(documentId);
console.timeEnd('ai-generation');
```

---

**Documentation Version**: 1.0  
**Last Updated**: January 2024  
**Maintained By**: SmartStudy AI Team 