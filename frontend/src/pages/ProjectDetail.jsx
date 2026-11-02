import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, CheckCircle2, Circle, Plus, Trash2, Edit3,
  Brain, FileText, Github, BookOpen, Tag, Calendar,
  Loader2, Save, X, BarChart3, TrendingUp, Lightbulb
} from 'lucide-react';
import { getProject, updateProject, toggleMilestone, addMilestone, deleteProject } from '../api/api';
import toast from 'react-hot-toast';

const statusConfig = {
  'Planning': 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
  'In Progress': 'text-blue-400 bg-blue-400/10 border-blue-400/20',
  'Review': 'text-purple-400 bg-purple-400/10 border-purple-400/20',
  'Completed': 'text-green-400 bg-green-400/10 border-green-400/20',
  'On Hold': 'text-gray-400 bg-gray-400/10 border-gray-400/20',
};

function SafeJSONDisplay({ data, fallback = '' }) {
  if (!data) return <span className="text-gray-500 italic text-sm">{fallback || 'No data'}</span>;
  
  let parsed = data;
  if (typeof data === 'string') {
    try { parsed = JSON.parse(data); } catch { return <p className="text-sm text-gray-300 whitespace-pre-wrap">{data}</p>; }
  }

  if (typeof parsed === 'string') return <p className="text-sm text-gray-300">{parsed}</p>;

  return (
    <div className="space-y-3">
      {Object.entries(parsed).map(([key, value]) => {
        if (!value || (Array.isArray(value) && value.length === 0)) return null;
        return (
          <div key={key}>
            <p className="text-xs text-gray-500 mb-1.5 uppercase tracking-wide">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
            {Array.isArray(value) ? (
              <ul className="space-y-1">
                {value.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                    <CheckCircle2 size={13} className="text-blue-400 mt-0.5 flex-shrink-0" />
                    {typeof item === 'string' ? item : JSON.stringify(item)}
                  </li>
                ))}
              </ul>
            ) : typeof value === 'object' ? (
              <div className="pl-3 border-l border-gray-700 space-y-2">
                {Object.entries(value).map(([k, v]) => v && (
                  <div key={k}>
                    <span className="text-xs text-gray-500">{k}: </span>
                    <span className="text-sm text-gray-300">
                      {Array.isArray(v) ? v.join(', ') : String(v)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-300">{String(value)}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingStatus, setEditingStatus] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [addingMilestone, setAddingMilestone] = useState(false);
  const [milestoneForm, setMilestoneForm] = useState({ title: '', description: '' });
  const [activeTab, setActiveTab] = useState('milestones');

  const loadProject = async () => {
    try {
      const res = await getProject(id);
      setProject(res.data.project);
      setNewStatus(res.data.project.status);
    } catch (err) {
      toast.error('Project not found');
      navigate('/projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadProject(); }, [id]);

  const handleToggleMilestone = async (milestoneId) => {
    try {
      const res = await toggleMilestone(id, milestoneId);
      setProject(res.data.project);
    } catch {
      toast.error('Failed to update milestone');
    }
  };

  const handleUpdateStatus = async () => {
    try {
      const res = await updateProject(id, { status: newStatus });
      setProject(res.data.project);
      setEditingStatus(false);
      toast.success(`Status updated to "${newStatus}"`);
    } catch {
      toast.error('Failed to update status');
    }
  };

  const handleAddMilestone = async (e) => {
    e.preventDefault();
    if (!milestoneForm.title) { toast.error('Milestone title is required'); return; }
    try {
      const res = await addMilestone(id, milestoneForm);
      setProject(res.data.project);
      setMilestoneForm({ title: '', description: '' });
      setAddingMilestone(false);
      toast.success('Milestone added!');
    } catch {
      toast.error('Failed to add milestone');
    }
  };

  const handleDelete = async () => {
    if (!confirm('Permanently delete this project?')) return;
    try {
      await deleteProject(id);
      toast.success('Project deleted');
      navigate('/projects');
    } catch {
      toast.error('Failed to delete');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 size={36} className="text-blue-400 animate-spin" />
      </div>
    );
  }

  if (!project) return null;

  const completedMilestones = project.milestones?.filter(m => m.completed).length || 0;
  const totalMilestones = project.milestones?.length || 0;
  const sc = statusConfig[project.status] || statusConfig['Planning'];

  const tabs = [
    { id: 'milestones', label: 'Milestones', icon: CheckCircle2 },
    { id: 'ai', label: 'AI Analysis', icon: Brain },
    { id: 'papers', label: `Papers (${project.arxivPapers?.length || 0})`, icon: BookOpen },
    { id: 'repos', label: `Repos (${project.githubRepos?.length || 0})`, icon: Github },
  ];

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      {/* Back button */}
      <Link to="/projects" className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 w-fit transition-colors">
        <ArrowLeft size={18} /> Back to Projects
      </Link>

      {/* Project Header */}
      <div className="card p-6 mb-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              {editingStatus ? (
                <div className="flex items-center gap-2">
                  <select
                    value={newStatus}
                    onChange={e => setNewStatus(e.target.value)}
                    className="input-field text-sm py-1 w-36"
                  >
                    {Object.keys(statusConfig).map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  <button onClick={handleUpdateStatus} className="btn-primary text-sm py-1 px-3">
                    <Save size={14} /> Save
                  </button>
                  <button onClick={() => setEditingStatus(false)} className="btn-secondary text-sm py-1 px-3">
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setEditingStatus(true)}
                  className={`badge border ${sc} cursor-pointer hover:opacity-80 transition-opacity`}
                >
                  {project.status}
                  <Edit3 size={11} className="ml-1" />
                </button>
              )}
              {project.tags?.map((tag, i) => (
                <span key={i} className="badge bg-gray-800 text-gray-400 border border-gray-700 text-xs">
                  <Tag size={10} />{tag}
                </span>
              ))}
            </div>
            <h1 className="text-2xl font-bold text-white mb-1">{project.title}</h1>
            <p className="text-gray-400 text-sm">{project.topic}</p>
            {project.description && (
              <p className="text-gray-500 text-sm mt-2">{project.description}</p>
            )}
          </div>
          <button
            onClick={handleDelete}
            className="btn-danger text-sm flex-shrink-0"
          >
            <Trash2 size={15} /> Delete
          </button>
        </div>

        {/* Progress */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">
              Progress — {completedMilestones}/{totalMilestones} milestones
            </span>
            <span className="text-lg font-bold text-white">{project.progress}%</span>
          </div>
          <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full progress-bar rounded-full transition-all duration-500"
              style={{ width: `${project.progress}%` }}
            />
          </div>
        </div>

        {/* Meta */}
        <div className="flex items-center gap-4 mt-4 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <Calendar size={12} />
            Created {new Date(project.createdAt).toLocaleDateString()}
          </span>
          {project.pdfFile?.originalName && (
            <span className="flex items-center gap-1">
              <FileText size={12} />
              {project.pdfFile.originalName}
            </span>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-900 p-1 rounded-xl mb-6 border border-gray-800 overflow-x-auto">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap flex-1 justify-center
              ${activeTab === id ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
          >
            <Icon size={15} />{label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'milestones' && (
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-white">Milestones</h2>
            <button
              onClick={() => setAddingMilestone(true)}
              className="btn-primary text-sm"
            >
              <Plus size={15} /> Add Milestone
            </button>
          </div>

          {addingMilestone && (
            <form onSubmit={handleAddMilestone} className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 mb-4">
              <input
                className="input-field mb-3"
                placeholder="Milestone title *"
                value={milestoneForm.title}
                onChange={e => setMilestoneForm(f => ({ ...f, title: e.target.value }))}
              />
              <input
                className="input-field mb-3"
                placeholder="Description (optional)"
                value={milestoneForm.description}
                onChange={e => setMilestoneForm(f => ({ ...f, description: e.target.value }))}
              />
              <div className="flex gap-2">
                <button type="submit" className="btn-primary text-sm">
                  <Save size={14} /> Save
                </button>
                <button type="button" onClick={() => setAddingMilestone(false)} className="btn-secondary text-sm">
                  Cancel
                </button>
              </div>
            </form>
          )}

          {project.milestones?.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle2 size={36} className="text-gray-700 mx-auto mb-3" />
              <p className="text-gray-400 text-sm">No milestones yet. Add your first milestone!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {project.milestones.map((m) => (
                <button
                  key={m._id}
                  onClick={() => handleToggleMilestone(m._id)}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all text-left group
                    ${m.completed
                      ? 'bg-green-500/5 border-green-500/20 hover:bg-green-500/10'
                      : 'bg-gray-800/30 border-gray-700 hover:border-gray-600'
                    }`}
                >
                  {m.completed ? (
                    <CheckCircle2 size={20} className="text-green-400 flex-shrink-0" />
                  ) : (
                    <Circle size={20} className="text-gray-600 group-hover:text-gray-400 flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium ${m.completed ? 'text-gray-400 line-through' : 'text-white'}`}>
                      {m.title}
                    </p>
                    {m.description && (
                      <p className="text-sm text-gray-500 truncate">{m.description}</p>
                    )}
                  </div>
                  {m.completed && m.completedAt && (
                    <span className="text-xs text-gray-600 flex-shrink-0">
                      {new Date(m.completedAt).toLocaleDateString()}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'ai' && (
        <div className="space-y-4">
          {project.aiAnalysis?.summary || project.aiAnalysis?.techStack || project.aiAnalysis?.researchGaps ? (
            <>
              {project.aiAnalysis.summary && (
                <div className="card p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <FileText size={18} className="text-blue-400" />
                    <h3 className="font-semibold text-white">Structured Summary</h3>
                  </div>
                  <SafeJSONDisplay data={project.aiAnalysis.summary} />
                </div>
              )}
              {project.aiAnalysis.techStack && (
                <div className="card p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <BarChart3 size={18} className="text-purple-400" />
                    <h3 className="font-semibold text-white">Tech Stack & Architecture</h3>
                  </div>
                  <SafeJSONDisplay data={project.aiAnalysis.techStack} />
                </div>
              )}
              {project.aiAnalysis.researchGaps && (
                <div className="card p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <Lightbulb size={18} className="text-orange-400" />
                    <h3 className="font-semibold text-white">Research Gaps & Future Scope</h3>
                  </div>
                  <SafeJSONDisplay data={project.aiAnalysis.researchGaps} />
                </div>
              )}
            </>
          ) : (
            <div className="card p-10 text-center">
              <Brain size={40} className="text-gray-700 mx-auto mb-3" />
              <p className="text-gray-400 mb-2">No AI analysis yet</p>
              <p className="text-sm text-gray-600">Upload a PDF on the AI Analysis page and save it to this project</p>
              <Link to="/upload" className="btn-primary mt-4 mx-auto w-fit">
                <Brain size={16} /> Analyze PDF
              </Link>
            </div>
          )}
        </div>
      )}

      {activeTab === 'papers' && (
        <div className="card p-5">
          <h2 className="font-semibold text-white mb-4">Linked ArXiv Papers</h2>
          {project.arxivPapers?.length === 0 ? (
            <div className="text-center py-8">
              <BookOpen size={36} className="text-gray-700 mx-auto mb-3" />
              <p className="text-gray-400 text-sm">No papers linked</p>
              <Link to="/research" className="btn-primary mt-4 mx-auto w-fit text-sm">
                Search ArXiv
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {project.arxivPapers.map((p, i) => (
                <div key={i} className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
                  <h4 className="font-medium text-white mb-1">{p.title}</h4>
                  <p className="text-xs text-gray-500">{p.authors?.join(', ')}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'repos' && (
        <div className="card p-5">
          <h2 className="font-semibold text-white mb-4">Linked GitHub Repositories</h2>
          {project.githubRepos?.length === 0 ? (
            <div className="text-center py-8">
              <Github size={36} className="text-gray-700 mx-auto mb-3" />
              <p className="text-gray-400 text-sm">No repositories linked</p>
              <Link to="/github" className="btn-primary mt-4 mx-auto w-fit text-sm">
                Search GitHub
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {project.githubRepos.map((r, i) => (
                <div key={i} className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
                  <h4 className="font-medium text-white">{r.fullName}</h4>
                  <p className="text-sm text-gray-400">{r.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
