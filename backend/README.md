# SmartStudy AI Backend

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure OpenAI API Key

You need to set up your OpenAI API key to use the AI features:

1. Get an API key from [OpenAI Platform](https://platform.openai.com/api-keys)
2. Create a `.env` file in the backend directory with:
```
OPENAI_API_KEY=your-actual-api-key-here
PORT=5000
```

### 3. Start the Server
```bash
npm start
```

Or for development with auto-restart:
```bash
npm run dev
```

## Features

- **File Upload**: Supports PDF, DOC, DOCX, and TXT files
- **Document Processing**: Extracts text from uploaded documents
- **AI Summarization**: Generates concise summaries of documents
- **Question Generation**: Creates quiz questions based on document content
- **Term Extraction**: Identifies and defines important terms and concepts

## API Endpoints

- `POST /api/upload` - Upload a document
- `GET /api/documents` - List all uploaded documents
- `POST /api/ai/summarize` - Generate document summary
- `POST /api/ai/questions` - Generate quiz questions
- `POST /api/ai/terms` - Extract important terms

## File Support

- **PDF**: Uses pdf-parse library
- **DOC/DOCX**: Uses mammoth library
- **TXT**: Direct text reading

## Error Handling

The AI service includes fallback responses if the OpenAI API is unavailable or returns errors. This ensures the application remains functional even if there are API issues. 