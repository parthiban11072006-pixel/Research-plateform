# AI-Powered Research & Project Intelligence Platform

A full-stack MERN application that combines AI capabilities (Google Gemini), ArXiv API, and GitHub API to supercharge your research workflow.

## 🚀 Features

- **🔍 ArXiv Research Explorer** – Search and discover recent research papers by topic
- **🐙 GitHub Repository Search** – Find open-source projects with star/fork stats
- **🤖 AI PDF Analyzer** – Upload research PDFs for Gemini AI analysis:
  - Structured Summary
  - Recommended Tech Stack & Architecture
  - Research Gaps & Future Scope
- **📊 Project Progress Tracker** – Save projects, track milestones, monitor progress in MongoDB

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS, Lucide Icons |
| Backend | Node.js, Express.js, MongoDB (Mongoose) |
| AI | Google Gemini 1.5 Flash API |
| APIs | ArXiv API, GitHub REST API |
| File Handling | Multer, pdf-parse |

## ⚙️ Quick Start

### 1. Start Both Servers (Windows)
```
Double-click start.bat
```

### 2. Or manually:

**Backend** (Terminal 1):
```bash
cd backend
npm run dev
```

**Frontend** (Terminal 2):
```bash
cd frontend
npm run dev
```

## 🌐 URLs

| Service | URL |
|---------|-----|
| Frontend App | http://localhost:5173 |
| Backend API | http://localhost:5000 |
| API Health | http://localhost:5000/api/health |

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/research?topic=<topic>` | Search ArXiv papers |
| GET | `/api/github?topic=<topic>` | Search GitHub repos |
| POST | `/api/upload` | Upload PDF & get AI analysis |
| GET | `/api/projects` | List all projects |
| POST | `/api/projects` | Create new project |
| GET | `/api/projects/:id` | Get project details |
| PUT | `/api/projects/:id` | Update project |
| DELETE | `/api/projects/:id` | Delete project |
| PATCH | `/api/projects/:id/milestone/:milestoneId` | Toggle milestone |

## 📁 Project Structure

```
Research-plateform/
├── .env                    # Environment variables
├── start.bat               # Quick start script
├── backend/
│   ├── server.js           # Express server
│   ├── models/
│   │   └── Project.js      # Mongoose project model
│   ├── routes/
│   │   ├── research.js     # ArXiv API route
│   │   ├── github.js       # GitHub API route
│   │   ├── upload.js       # PDF upload + Gemini AI
│   │   └── projects.js     # Project CRUD routes
│   └── uploads/            # Uploaded PDF files
└── frontend/
    ├── src/
    │   ├── App.jsx          # Router + sidebar layout
    │   ├── api/api.js       # Axios API service
    │   ├── pages/
    │   │   ├── Dashboard.jsx
    │   │   ├── ResearchPage.jsx
    │   │   ├── GitHubPage.jsx
    │   │   ├── UploadPage.jsx
    │   │   ├── ProjectsPage.jsx
    │   │   └── ProjectDetail.jsx
    │   └── index.css        # Tailwind + custom styles
    └── vite.config.js       # Vite + proxy config
```

## 🔑 Environment Variables

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/research_platform
GEMINI_API_KEY=your_gemini_api_key
GITHUB_TOKEN=your_github_token
```

## 📋 Prerequisites

- Node.js 18+
- MongoDB (running locally on port 27017)
- Google Gemini API Key
- GitHub Personal Access Token
