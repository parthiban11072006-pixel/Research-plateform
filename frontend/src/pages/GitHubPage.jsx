import React, { useState } from 'react';
import { 
  Github, Search, Star, GitFork, ExternalLink, 
  Code, Loader2, AlertCircle, Archive, Calendar
} from 'lucide-react';
import { searchGitHub } from '../api/api';
import toast from 'react-hot-toast';

const langColors = {
  Python: 'bg-blue-500', JavaScript: 'bg-yellow-400', TypeScript: 'bg-blue-400',
  Java: 'bg-red-500', 'C++': 'bg-pink-500', Go: 'bg-cyan-400',
  Rust: 'bg-orange-600', Ruby: 'bg-red-600', Swift: 'bg-orange-500',
  Kotlin: 'bg-purple-500', C: 'bg-gray-500', 'C#': 'bg-green-600',
  Unknown: 'bg-gray-600'
};

const RepoCard = ({ repo }) => (
  <div className="card-hover p-5 animate-fade-in">
    <div className="flex items-start justify-between gap-4 mb-3">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          {repo.isArchived && (
            <span className="badge bg-gray-700 text-gray-400 border border-gray-600">
              <Archive size={10} /> Archived
            </span>
          )}
          <h3 className="font-semibold text-white group-hover:text-blue-400 truncate">
            {repo.fullName}
          </h3>
        </div>
        <p className="text-sm text-gray-400 line-clamp-2">{repo.description}</p>
      </div>
      <a
        href={repo.url}
        target="_blank"
        rel="noopener noreferrer"
        className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-all flex-shrink-0"
        title="Open on GitHub"
      >
        <ExternalLink size={16} />
      </a>
    </div>

    {/* Stats Row */}
    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-3">
      <span className="flex items-center gap-1.5">
        <Star size={13} className="text-yellow-400" />
        {repo.stars.toLocaleString()}
      </span>
      <span className="flex items-center gap-1.5">
        <GitFork size={13} className="text-gray-400" />
        {repo.forks.toLocaleString()}
      </span>
      {repo.language && repo.language !== 'Unknown' && (
        <span className="flex items-center gap-1.5">
          <span className={`w-2.5 h-2.5 rounded-full ${langColors[repo.language] || 'bg-gray-500'}`} />
          {repo.language}
        </span>
      )}
      {repo.updatedAt && (
        <span className="flex items-center gap-1 text-xs">
          <Calendar size={11} />
          {new Date(repo.updatedAt).toLocaleDateString()}
        </span>
      )}
    </div>

    {/* Topics */}
    {repo.topics?.length > 0 && (
      <div className="flex flex-wrap gap-1.5">
        {repo.topics.slice(0, 6).map((topic, i) => (
          <span key={i} className="badge bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs">
            {topic}
          </span>
        ))}
      </div>
    )}

    {/* License */}
    {repo.license && repo.license !== 'No License' && (
      <p className="text-xs text-gray-600 mt-2 flex items-center gap-1">
        <Code size={11} /> {repo.license}
      </p>
    )}
  </div>
);

export default function GitHubPage() {
  const [topic, setTopic] = useState('');
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [searchedTopic, setSearchedTopic] = useState('');
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [perPage] = useState(10);

  const handleSearch = async (e, newPage = 1) => {
    e?.preventDefault();
    if (!topic.trim()) {
      toast.error('Please enter a topic to search');
      return;
    }

    setLoading(true);
    try {
      const res = await searchGitHub(topic.trim(), newPage, perPage);
      setRepos(res.data.repos);
      setTotalCount(res.data.totalCount);
      setSearchedTopic(res.data.topic);
      setPage(newPage);
      setSearched(true);
      if (newPage === 1) {
        toast.success(`Found ${res.data.totalCount.toLocaleString()} repositories for "${res.data.topic}"`);
      }
    } catch (err) {
      if (err.response?.status === 403) {
        toast.error(err.response?.data?.error || 'GitHub API rate limit exceeded. Try again later.');
      } else {
        toast.error(err.response?.data?.error || err.response?.data?.message || 'Failed to fetch repositories');
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    const fakeEvent = { preventDefault: () => {} };
    handleSearch(fakeEvent, newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const totalPages = Math.ceil(Math.min(totalCount, 1000) / perPage);
  const suggestions = ['Machine Learning', 'Drone Navigation', 'React Dashboard', 'NLP Transformer', 'Computer Vision'];

  return (
    <div className="max-w-5xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-9 h-9 bg-gray-700 rounded-xl flex items-center justify-center">
            <Github size={18} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">GitHub Repository Explorer</h1>
            <p className="text-sm text-gray-400">Discover open-source projects by topic</p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="card p-5 mb-6">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                value={topic}
                onChange={e => setTopic(e.target.value)}
                placeholder="e.g. autonomous drone navigation, bert nlp..."
                className="input-field pl-10"
              />
            </div>
            <button type="submit" disabled={loading} className="btn-primary px-6 whitespace-nowrap">
              {loading ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            <span className="text-xs text-gray-500 flex items-center">Try:</span>
            {suggestions.map(s => (
              <button
                key={s}
                type="button"
                onClick={() => setTopic(s)}
                className="text-xs px-2.5 py-1 bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700 rounded-full border border-gray-700 transition-all"
              >
                {s}
              </button>
            ))}
          </div>
        </form>
      </div>

      {/* Results */}
      {loading && (
        <div className="card p-12 flex flex-col items-center gap-4">
          <Loader2 size={36} className="text-gray-400 animate-spin" />
          <p className="text-gray-400">Fetching repositories from GitHub...</p>
        </div>
      )}

      {!loading && searched && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">
              Results for <span className="text-white">"{searchedTopic}"</span>
            </h2>
            <span className="badge bg-gray-700 text-gray-300 border border-gray-600">
              {totalCount.toLocaleString()} repositories
            </span>
          </div>

          {repos.length === 0 ? (
            <div className="card p-8 text-center">
              <AlertCircle size={40} className="text-gray-700 mx-auto mb-3" />
              <p className="text-gray-400">No repositories found</p>
            </div>
          ) : (
            <>
              <div className="space-y-4 mb-6">
                {repos.map(repo => (
                  <RepoCard key={repo.id} repo={repo} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page === 1}
                    className="btn-secondary text-sm"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-gray-400">
                    Page {page} of {Math.min(totalPages, 100)}
                  </span>
                  <button
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page >= Math.min(totalPages, 100)}
                    className="btn-secondary text-sm"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {!loading && !searched && (
        <div className="card p-12 text-center">
          <Github size={48} className="text-gray-700 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-300 mb-2">Explore GitHub Repositories</h3>
          <p className="text-gray-500 text-sm max-w-md mx-auto">
            Search for open-source projects related to your research topic. Results are sorted by stars.
          </p>
        </div>
      )}
    </div>
  );
}
