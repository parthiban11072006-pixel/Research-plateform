import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { 
  Brain, BookOpen, Github, Upload, FolderKanban, 
  Cpu, ChevronRight, Menu, X
} from 'lucide-react';

import Dashboard from './pages/Dashboard';
import ResearchPage from './pages/ResearchPage';
import GitHubPage from './pages/GitHubPage';
import UploadPage from './pages/UploadPage';
import ProjectsPage from './pages/ProjectsPage';
import ProjectDetail from './pages/ProjectDetail';

const navItems = [
  { path: '/', label: 'Dashboard', icon: Cpu, exact: true },
  { path: '/research', label: 'ArXiv Search', icon: BookOpen },
  { path: '/github', label: 'GitHub Repos', icon: Github },
  { path: '/upload', label: 'AI Analysis', icon: Upload },
  { path: '/projects', label: 'Projects', icon: FolderKanban },
];

function Sidebar({ isOpen, onClose }) {
  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-20 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside className={`
        fixed left-0 top-0 h-full w-64 bg-gray-900 border-r border-gray-800 z-30
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-800">
          <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25">
            <Brain size={20} className="text-white" />
          </div>
          <div>
            <h1 className="font-bold text-white text-sm leading-tight">Research AI</h1>
            <p className="text-xs text-gray-500">Intelligence Platform</p>
          </div>
          <button onClick={onClose} className="ml-auto lg:hidden text-gray-400 hover:text-white">
            <X size={18} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="px-3 py-4 space-y-1">
          <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider px-3 mb-3">Navigation</p>
          {navItems.map(({ path, label, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              end={path === '/'}
              onClick={onClose}
              className={({ isActive }) => `
                flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group
                ${isActive 
                  ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' 
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }
              `}
            >
              {({ isActive }) => (
                <>
                  <Icon size={18} className={isActive ? 'text-blue-400' : 'text-gray-500 group-hover:text-gray-300'} />
                  <span className="font-medium text-sm">{label}</span>
                  {isActive && <ChevronRight size={14} className="ml-auto text-blue-400" />}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-800">
          <div className="bg-gradient-to-r from-blue-600/10 to-purple-600/10 border border-blue-500/20 rounded-lg p-3">
            <p className="text-xs text-gray-400 leading-relaxed">
              Powered by <span className="text-blue-400 font-medium">Google Gemini AI</span>, 
              ArXiv & GitHub APIs
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <Router>
      <div className="flex min-h-screen">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        
        {/* Main content */}
        <div className="flex-1 lg:ml-64">
          {/* Top bar */}
          <header className="sticky top-0 z-10 bg-gray-950/90 backdrop-blur-sm border-b border-gray-800/50 px-6 py-3 flex items-center gap-4">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-gray-400 hover:text-white"
            >
              <Menu size={22} />
            </button>
            <div className="flex-1" />
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-xs text-gray-500">API Connected</span>
            </div>
          </header>

          {/* Page content */}
          <main className="p-6">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/research" element={<ResearchPage />} />
              <Route path="/github" element={<GitHubPage />} />
              <Route path="/upload" element={<UploadPage />} />
              <Route path="/projects" element={<ProjectsPage />} />
              <Route path="/projects/:id" element={<ProjectDetail />} />
            </Routes>
          </main>
        </div>
      </div>

      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#1f2937',
            color: '#f3f4f6',
            border: '1px solid #374151',
            borderRadius: '10px',
          },
          success: { iconTheme: { primary: '#22c55e', secondary: '#1f2937' } },
          error: { iconTheme: { primary: '#ef4444', secondary: '#1f2937' } },
        }}
      />
    </Router>
  );
}

export default App;
