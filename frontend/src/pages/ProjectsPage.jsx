import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FolderKanban, Plus, Search, Trash2, ArrowRight, 
  Clock, CheckCircle2, AlertCircle, Loader2, X,
  Edit3, Tag
} from 'lucide-react';
import { getProjects, createProject, deleteProject } from '../api/api';
import toast from 'react-hot-toast';

const statusConfig = {
  'Planning': { color: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20', dot: 'bg-yellow-400' },
  'In Progress': { color: 'text-blue-400 bg-blue-400/10 border-blue-400/20', dot: 'bg-blue-400' },
  'Review': { color: 'text-purple-400 bg-purple-400/10 border-purple-400/20', dot: 'bg-purple-400' },
  'Completed': { color: 'text-green-400 bg-green-400/10 border-green-400/20', dot: 'bg-green-400' },
  'On Hold': { color: 'text-gray-400 bg-gray-400/10 border-gray-400/20', dot: 'bg-gray-400' },
};

function CreateProjectModal({ onClose, onCreated }) {
  const [form, setForm] = useState({
    title: '', topic: '', description: '', status: 'Planning', tags: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.topic) {
      toast.error('Title and topic are required');
      return;
    }
    setLoading(true);
    try {
      const tags = form.tags.split(',').map(t => t.trim()).filter(Boolean);
      await createProject({ ...form, tags });
      toast.success('Project created!');
      onCreated();
      onClose();
    } catch (err) {
      toast.error('Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <div className="card w-full max-w-lg animate-fade-in">
        <div className="flex items-center justify-between p-5 border-b border-gray-800">
          <h2 className="text-lg font-bold text-white">New Project</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="text-sm text-gray-400 mb-1.5 block">Project Title *</label>
            <input
              className="input-field"
              placeholder="e.g. Autonomous Drone Navigation System"
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            />
          </div>
          <div>
            <label className="text-sm text-gray-400 mb-1.5 block">Research Topic *</label>
            <input
              className="input-field"
              placeholder="e.g. Autonomous Navigation, Computer Vision"
              value={form.topic}
              onChange={e => setForm(f => ({ ...f, topic: e.target.value }))}
            />
          </div>
          <div>
            <label className="text-sm text-gray-400 mb-1.5 block">Description</label>
            <textarea
              className="input-field resize-none"
              rows={3}
              placeholder="Brief project description..."
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-400 mb-1.5 block">Status</label>
              <select
                className="input-field"
                value={form.status}
                onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
              >
                {Object.keys(statusConfig).map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1.5 block">Tags (comma separated)</label>
              <input
                className="input-field"
                placeholder="AI, ML, Robotics"
                value={form.tags}
                onChange={e => setForm(f => ({ ...f, tags: e.target.value }))}
              />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1 justify-center">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn-primary flex-1 justify-center">
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
              Create Project
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const loadProjects = async () => {
    setLoading(true);
    try {
      const res = await getProjects({ search, status: statusFilter });
      setProjects(res.data.projects);
      setStats(res.data.stats);
    } catch (err) {
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, [search, statusFilter]);

  const handleDelete = async (id, e) => {
    e.preventDefault();
    if (!confirm('Delete this project?')) return;
    try {
      await deleteProject(id);
      toast.success('Project deleted');
      loadProjects();
    } catch {
      toast.error('Failed to delete');
    }
  };

  const filters = ['All', 'Planning', 'In Progress', 'Review', 'Completed', 'On Hold'];

  return (
    <div className="max-w-5xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Project Tracker</h1>
          <p className="text-sm text-gray-400 mt-0.5">Manage research projects and milestone progress</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary">
          <Plus size={18} /> New Project
        </button>
      </div>

      {/* Stats row */}
      <div className="flex gap-3 mb-6 overflow-x-auto pb-1">
        {[
          { label: 'Total', value: stats.total || 0, color: 'text-white' },
          { label: 'Planning', value: stats.planning || 0, color: 'text-yellow-400' },
          { label: 'In Progress', value: stats.inProgress || 0, color: 'text-blue-400' },
          { label: 'Completed', value: stats.completed || 0, color: 'text-green-400' },
          { label: 'On Hold', value: stats.onHold || 0, color: 'text-gray-400' },
        ].map(({ label, value, color }) => (
          <div key={label} className="card px-4 py-2.5 flex items-center gap-2 flex-shrink-0">
            <span className={`text-xl font-bold ${color}`}>{value}</span>
            <span className="text-sm text-gray-500">{label}</span>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            className="input-field pl-9 text-sm"
            placeholder="Search projects..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {filters.map(f => (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              className={`px-3 py-2 text-xs font-medium rounded-lg border whitespace-nowrap transition-all ${
                statusFilter === f
                  ? 'bg-blue-600/20 text-blue-400 border-blue-500/40'
                  : 'bg-gray-800 text-gray-400 border-gray-700 hover:border-gray-600'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Projects List */}
      {loading ? (
        <div className="card p-12 flex items-center justify-center">
          <Loader2 size={32} className="text-blue-400 animate-spin" />
        </div>
      ) : projects.length === 0 ? (
        <div className="card p-12 text-center">
          <FolderKanban size={48} className="text-gray-700 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-300 mb-2">No projects found</h3>
          <p className="text-sm text-gray-500 mb-4">
            {search || statusFilter !== 'All' ? 'Try different search terms or filters' : 'Create your first research project to get started'}
          </p>
          {!search && statusFilter === 'All' && (
            <button onClick={() => setShowModal(true)} className="btn-primary mx-auto">
              <Plus size={16} /> Create Project
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {projects.map(project => {
            const sc = statusConfig[project.status] || statusConfig['Planning'];
            return (
              <Link
                key={project._id}
                to={`/projects/${project._id}`}
                className="card-hover p-5 flex items-center gap-4 group"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <h3 className="font-semibold text-white truncate group-hover:text-blue-400 transition-colors">
                      {project.title}
                    </h3>
                    <span className={`badge border ${sc.color} flex-shrink-0 text-xs`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                      {project.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 truncate mb-2">{project.topic}</p>
                  
                  {project.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {project.tags.slice(0, 3).map((tag, i) => (
                        <span key={i} className="badge bg-gray-800 text-gray-400 border border-gray-700 text-xs">
                          <Tag size={9} />{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-4 flex-shrink-0">
                  <div className="text-center hidden sm:block">
                    <p className="text-lg font-bold text-white">{project.progress}%</p>
                    <p className="text-xs text-gray-500">Progress</p>
                  </div>
                  <div className="w-20 hidden sm:block">
                    <div className="bg-gray-800 rounded-full h-1.5">
                      <div
                        className="progress-bar h-1.5 rounded-full"
                        style={{ width: `${project.progress}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-600 mt-1">
                      {project.milestones?.filter(m => m.completed).length}/{project.milestones?.length} milestones
                    </p>
                  </div>
                  <button
                    onClick={(e) => handleDelete(project._id, e)}
                    className="p-2 text-gray-600 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={16} />
                  </button>
                  <ArrowRight size={16} className="text-gray-600 group-hover:text-blue-400 transition-colors" />
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {showModal && (
        <CreateProjectModal
          onClose={() => setShowModal(false)}
          onCreated={loadProjects}
        />
      )}
    </div>
  );
}
