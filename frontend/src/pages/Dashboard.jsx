import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Brain, BookOpen, Github, Upload, FolderKanban, 
  TrendingUp, Clock, CheckCircle2, AlertCircle,
  ArrowRight, Zap, Activity
} from 'lucide-react';
import { getProjects } from '../api/api';

const StatCard = ({ label, value, icon: Icon, color, bg }) => (
  <div className="card p-5 flex items-center gap-4">
    <div className={`w-12 h-12 ${bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
      <Icon size={22} className={color} />
    </div>
    <div>
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="text-sm text-gray-400">{label}</p>
    </div>
  </div>
);

const FeatureCard = ({ icon: Icon, title, desc, color, to }) => (
  <Link to={to} className="card-hover p-5 group cursor-pointer block">
    <div className={`w-10 h-10 ${color} rounded-lg flex items-center justify-center mb-3`}>
      <Icon size={20} className="text-white" />
    </div>
    <h3 className="font-semibold text-white mb-1 group-hover:text-blue-400 transition-colors">{title}</h3>
    <p className="text-sm text-gray-400">{desc}</p>
    <div className="flex items-center gap-1 mt-3 text-blue-400 text-sm opacity-0 group-hover:opacity-100 transition-opacity">
      <span>Open</span><ArrowRight size={14} />
    </div>
  </Link>
);

export default function Dashboard() {
  const [stats, setStats] = useState({ total: 0, planning: 0, inProgress: 0, completed: 0 });
  const [recentProjects, setRecentProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await getProjects({ sort: '-createdAt' });
        setStats(res.data.stats);
        setRecentProjects(res.data.projects.slice(0, 4));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const statusColor = {
    'Planning': 'text-yellow-400 bg-yellow-400/10',
    'In Progress': 'text-blue-400 bg-blue-400/10',
    'Review': 'text-purple-400 bg-purple-400/10',
    'Completed': 'text-green-400 bg-green-400/10',
    'On Hold': 'text-gray-400 bg-gray-400/10',
  };

  return (
    <div className="max-w-6xl mx-auto animate-fade-in">
      {/* Hero */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Zap size={16} className="text-yellow-400" />
          <span className="text-sm text-gray-400">AI-Powered Research Intelligence</span>
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">
          Welcome to <span className="gradient-text">Research Platform</span>
        </h1>
        <p className="text-gray-400 max-w-xl">
          Explore research papers, analyze PDFs with Gemini AI, discover GitHub repositories, 
          and track your project milestones — all in one place.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Projects" value={stats.total} icon={FolderKanban} color="text-blue-400" bg="bg-blue-500/10" />
        <StatCard label="In Progress" value={stats.inProgress} icon={Activity} color="text-yellow-400" bg="bg-yellow-500/10" />
        <StatCard label="Completed" value={stats.completed} icon={CheckCircle2} color="text-green-400" bg="bg-green-500/10" />
        <StatCard label="Planning" value={stats.planning} icon={Clock} color="text-purple-400" bg="bg-purple-500/10" />
      </div>

      {/* Feature Cards */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-white mb-4">Quick Access</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <FeatureCard
            icon={BookOpen} title="ArXiv Search" to="/research"
            desc="Discover latest research papers from ArXiv"
            color="bg-orange-500"
          />
          <FeatureCard
            icon={Github} title="GitHub Repos" to="/github"
            desc="Find open-source projects by topic"
            color="bg-gray-600"
          />
          <FeatureCard
            icon={Upload} title="AI Analysis" to="/upload"
            desc="Upload PDF & get Gemini AI insights"
            color="bg-purple-600"
          />
          <FeatureCard
            icon={FolderKanban} title="Projects" to="/projects"
            desc="Track milestones & project progress"
            color="bg-blue-600"
          />
        </div>
      </div>

      {/* Recent Projects */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Recent Projects</h2>
          <Link to="/projects" className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1">
            View all <ArrowRight size={14} />
          </Link>
        </div>

        {loading ? (
          <div className="card p-8 flex items-center justify-center">
            <div className="loading-spinner w-8 h-8" />
          </div>
        ) : recentProjects.length === 0 ? (
          <div className="card p-8 text-center">
            <FolderKanban size={40} className="text-gray-700 mx-auto mb-3" />
            <p className="text-gray-400 mb-1">No projects yet</p>
            <p className="text-sm text-gray-600">Start by searching for a research topic or uploading a PDF</p>
            <Link to="/projects" className="btn-primary mt-4 mx-auto w-fit">
              Create Project
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {recentProjects.map(project => (
              <Link
                key={project._id}
                to={`/projects/${project._id}`}
                className="card-hover p-4 flex items-center gap-4 group"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium text-white truncate group-hover:text-blue-400 transition-colors">
                      {project.title}
                    </h3>
                    <span className={`badge ${statusColor[project.status]} text-xs flex-shrink-0`}>
                      {project.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 truncate">{project.topic}</p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="text-right">
                    <p className="text-sm font-semibold text-white">{project.progress}%</p>
                    <p className="text-xs text-gray-500">Progress</p>
                  </div>
                  <div className="w-16 bg-gray-800 rounded-full h-1.5">
                    <div 
                      className="progress-bar h-1.5 rounded-full transition-all"
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                  <ArrowRight size={16} className="text-gray-600 group-hover:text-blue-400 transition-colors" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
