import React, { useState } from 'react';
import { BookOpen, Search, ExternalLink, Download, Calendar, Users, Tag, Loader2, AlertCircle } from 'lucide-react';
import { searchArxiv } from '../api/api';
import toast from 'react-hot-toast';

const PaperCard = ({ paper }) => (
  <div className="card p-5 animate-fade-in hover:border-orange-500/30 transition-all duration-200">
    <div className="flex items-start justify-between gap-4 mb-3">
      <h3 className="font-semibold text-white leading-tight flex-1">{paper.title}</h3>
      <div className="flex gap-2 flex-shrink-0">
        <a
          href={paper.link}
          target="_blank"
          rel="noopener noreferrer"
          className="p-1.5 text-gray-400 hover:text-orange-400 hover:bg-orange-400/10 rounded-lg transition-all"
          title="View on ArXiv"
        >
          <ExternalLink size={16} />
        </a>
        <a
          href={paper.pdfLink || paper.link.replace('abs', 'pdf')}
          target="_blank"
          rel="noopener noreferrer"
          className="p-1.5 text-gray-400 hover:text-blue-400 hover:bg-blue-400/10 rounded-lg transition-all"
          title="Download PDF"
        >
          <Download size={16} />
        </a>
      </div>
    </div>

    <p className="text-sm text-gray-400 leading-relaxed mb-4 line-clamp-3">{paper.summary}</p>

    <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
      {paper.publishedDate && (
        <span className="flex items-center gap-1">
          <Calendar size={12} />
          {paper.publishedDate}
        </span>
      )}
      {paper.authors?.length > 0 && (
        <span className="flex items-center gap-1">
          <Users size={12} />
          {paper.authors.slice(0, 3).join(', ')}
          {paper.authors.length > 3 && ` +${paper.authors.length - 3} more`}
        </span>
      )}
    </div>

    {paper.categories?.length > 0 && (
      <div className="flex flex-wrap gap-1.5 mt-3">
        {paper.categories.map((cat, i) => (
          <span key={i} className="badge bg-orange-500/10 text-orange-400 border border-orange-500/20">
            <Tag size={10} />{cat}
          </span>
        ))}
      </div>
    )}
  </div>
);

export default function ResearchPage() {
  const [topic, setTopic] = useState('');
  const [maxResults, setMaxResults] = useState(10);
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [searchedTopic, setSearchedTopic] = useState('');

  const handleSearch = async (e) => {
    e?.preventDefault();
    if (!topic.trim()) {
      toast.error('Please enter a research topic');
      return;
    }

    setLoading(true);
    setSearched(false);
    try {
      const res = await searchArxiv(topic.trim(), maxResults);
      setPapers(res.data.papers);
      setSearchedTopic(res.data.topic);
      setSearched(true);
      if (res.data.papers.length === 0) {
        toast('No papers found. Try a different topic.', { icon: '📭' });
      } else {
        toast.success(`Found ${res.data.papers.length} papers on "${res.data.topic}"`);
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to fetch papers');
    } finally {
      setLoading(false);
    }
  };

  const suggestions = ['Machine Learning', 'Autonomous Drones', 'Large Language Models', 'Quantum Computing', 'Computer Vision'];

  return (
    <div className="max-w-5xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-9 h-9 bg-orange-500/20 rounded-xl flex items-center justify-center">
            <BookOpen size={18} className="text-orange-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">ArXiv Research Explorer</h1>
            <p className="text-sm text-gray-400">Search latest papers from arXiv.org</p>
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
                placeholder="e.g. Autonomous Drone Navigation, Transformer Models..."
                className="input-field pl-10"
              />
            </div>
            <select
              value={maxResults}
              onChange={e => setMaxResults(Number(e.target.value))}
              className="input-field w-28"
            >
              {[5, 10, 15, 20, 25].map(n => (
                <option key={n} value={n}>{n} results</option>
              ))}
            </select>
            <button type="submit" disabled={loading} className="btn-primary px-6 whitespace-nowrap">
              {loading ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>

          {/* Quick suggestions */}
          <div className="flex flex-wrap gap-2">
            <span className="text-xs text-gray-500 flex items-center">Try:</span>
            {suggestions.map(s => (
              <button
                key={s}
                type="button"
                onClick={() => setTopic(s)}
                className="text-xs px-2.5 py-1 bg-gray-800 text-gray-400 hover:text-orange-400 hover:bg-orange-400/10 rounded-full border border-gray-700 hover:border-orange-400/30 transition-all"
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
          <Loader2 size={36} className="text-orange-400 animate-spin" />
          <p className="text-gray-400">Fetching papers from ArXiv...</p>
        </div>
      )}

      {!loading && searched && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">
              Results for <span className="text-orange-400">"{searchedTopic}"</span>
            </h2>
            <span className="badge bg-orange-500/10 text-orange-400 border border-orange-500/20">
              {papers.length} papers
            </span>
          </div>

          {papers.length === 0 ? (
            <div className="card p-8 text-center">
              <AlertCircle size={40} className="text-gray-700 mx-auto mb-3" />
              <p className="text-gray-400">No papers found for this topic</p>
              <p className="text-sm text-gray-600 mt-1">Try different keywords or broader terms</p>
            </div>
          ) : (
            <div className="space-y-4">
              {papers.map((paper, i) => (
                <PaperCard key={paper.id || i} paper={paper} />
              ))}
            </div>
          )}
        </div>
      )}

      {!loading && !searched && (
        <div className="card p-12 text-center">
          <BookOpen size={48} className="text-gray-700 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-300 mb-2">Search Research Papers</h3>
          <p className="text-gray-500 text-sm max-w-md mx-auto">
            Enter any research topic to discover the latest papers from arXiv.org — the leading open-access repository for scientific preprints.
          </p>
        </div>
      )}
    </div>
  );
}
