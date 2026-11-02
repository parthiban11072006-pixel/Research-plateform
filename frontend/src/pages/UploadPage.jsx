import React, { useState, useRef } from 'react';
import {
  Upload, FileText, Brain, Zap, CheckCircle2, Loader2,
  AlertCircle, ChevronDown, ChevronUp, Code2, Lightbulb,
  TrendingUp, BarChart3, Save
} from 'lucide-react';
import { uploadPDF, createProject } from '../api/api';
import toast from 'react-hot-toast';

const AnalysisSection = ({ icon: Icon, title, color, children, defaultOpen = true }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="card overflow-hidden">
      <button
        className="w-full flex items-center gap-3 p-4 hover:bg-gray-800/50 transition-colors"
        onClick={() => setOpen(!open)}
      >
        <div className={`w-8 h-8 ${color} rounded-lg flex items-center justify-center flex-shrink-0`}>
          <Icon size={16} className="text-white" />
        </div>
        <h3 className="font-semibold text-white flex-1 text-left">{title}</h3>
        {open ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
      </button>
      {open && (
        <div className="px-4 pb-4 border-t border-gray-800 pt-4">
          {children}
        </div>
      )}
    </div>
  );
};

const ListItems = ({ items, color = 'text-blue-400' }) => (
  <ul className="space-y-2">
    {items?.map((item, i) => (
      <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
        <CheckCircle2 size={14} className={`${color} mt-0.5 flex-shrink-0`} />
        {item}
      </li>
    ))}
  </ul>
);

const TagGroup = ({ label, items }) => (
  <div className="mb-3">
    <p className="text-xs text-gray-500 mb-1.5 uppercase tracking-wide">{label}</p>
    <div className="flex flex-wrap gap-1.5">
      {items?.map((item, i) => (
        <span key={i} className="badge bg-blue-500/10 text-blue-300 border border-blue-500/20 text-xs">{item}</span>
      ))}
    </div>
  </div>
);

export default function UploadPage() {
  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const fileInputRef = useRef();
  const [saving, setSaving] = useState(false);

  const handleFile = (f) => {
    if (!f) return;
    if (f.type !== 'application/pdf') {
      toast.error('Only PDF files are supported');
      return;
    }
    if (f.size > 20 * 1024 * 1024) {
      toast.error('File too large. Max 20MB allowed.');
      return;
    }
    setFile(f);
    setResult(null);
    setError('');
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    handleFile(f);
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select a PDF file first');
      return;
    }
    setUploading(true);
    setUploadProgress(0);
    setError('');
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('pdf', file);

      const res = await uploadPDF(formData, setUploadProgress);
      setResult(res.data);
      toast.success('PDF analyzed successfully!');
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.message || 'Analysis failed. Please try again.';
      setError(msg);
      toast.error(msg);
    } finally {
      setUploading(false);
    }
  };

  const handleSaveProject = async () => {
    if (!result) return;
    setSaving(true);
    try {
      const analysis = result.analysis;
      const projectData = {
        title: analysis?.summary?.title || file?.name?.replace('.pdf', '') || 'Analyzed Research Paper',
        topic: analysis?.summary?.domain || 'Research',
        description: analysis?.summary?.overview || '',
        tags: [analysis?.summary?.domain].filter(Boolean),
        aiAnalysis: {
          summary: JSON.stringify(analysis?.summary || {}),
          techStack: JSON.stringify(analysis?.techStack || {}),
          researchGaps: JSON.stringify(analysis?.researchGaps || {}),
          analyzedAt: new Date()
        },
        pdfFile: {
          originalName: result.file.originalName,
          fileName: result.file.fileName,
          filePath: result.file.path,
          uploadedAt: new Date()
        }
      };
      await createProject(projectData);
      toast.success('Project saved to tracker!');
    } catch (err) {
      toast.error('Failed to save project');
    } finally {
      setSaving(false);
    }
  };

  const analysis = result?.analysis;

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-9 h-9 bg-purple-600/20 rounded-xl flex items-center justify-center">
            <Brain size={18} className="text-purple-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">AI Paper Analyzer</h1>
            <p className="text-sm text-gray-400">Upload a research PDF — Gemini AI will analyze it</p>
          </div>
        </div>
      </div>

      {/* Upload Zone */}
      <div className="card p-6 mb-6">
        <div
          className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all duration-200
            ${dragging ? 'border-purple-500 bg-purple-500/10' : file ? 'border-green-500/50 bg-green-500/5' : 'border-gray-700 hover:border-gray-600 hover:bg-gray-800/50'}`}
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            onChange={e => handleFile(e.target.files[0])}
            className="hidden"
          />
          {file ? (
            <>
              <FileText size={42} className="text-green-400 mx-auto mb-3" />
              <p className="font-semibold text-white">{file.name}</p>
              <p className="text-sm text-gray-400 mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              <p className="text-xs text-gray-500 mt-2">Click to change file</p>
            </>
          ) : (
            <>
              <Upload size={42} className="text-gray-600 mx-auto mb-3" />
              <p className="font-semibold text-gray-300">Drop your PDF here or click to browse</p>
              <p className="text-sm text-gray-500 mt-1">PDF files only · Max 20MB</p>
            </>
          )}
        </div>

        {/* Features */}
        <div className="grid grid-cols-3 gap-3 mt-4">
          {[
            { icon: FileText, label: 'Text Extraction', desc: 'pdf-parse' },
            { icon: Brain, label: 'AI Analysis', desc: 'Gemini 1.5 Flash' },
            { icon: Zap, label: 'Instant Results', desc: 'Structured JSON' }
          ].map(({ icon: Icon, label, desc }) => (
            <div key={label} className="bg-gray-800/50 rounded-lg p-3 text-center">
              <Icon size={16} className="text-purple-400 mx-auto mb-1" />
              <p className="text-xs font-medium text-gray-300">{label}</p>
              <p className="text-xs text-gray-600">{desc}</p>
            </div>
          ))}
        </div>

        {/* Upload button */}
        <button
          onClick={handleUpload}
          disabled={!file || uploading}
          className="btn-primary w-full mt-4 justify-center py-3"
          style={{ background: 'linear-gradient(135deg, #7c3aed, #9333ea)' }}
        >
          {uploading ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Analyzing... {uploadProgress > 0 && `(${uploadProgress}%)`}
            </>
          ) : (
            <>
              <Brain size={18} />
              Analyze with Gemini AI
            </>
          )}
        </button>

        {/* Progress bar */}
        {uploading && (
          <div className="mt-3">
            <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress || 10}%`, background: 'linear-gradient(90deg, #7c3aed, #9333ea)' }}
              />
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mt-4 flex items-start gap-3 bg-red-500/10 border border-red-500/30 rounded-lg p-4">
            <AlertCircle size={18} className="text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-300">{error}</p>
          </div>
        )}
      </div>

      {/* Analysis Results */}
      {analysis && (
        <div className="space-y-4 animate-fade-in">
          {/* File metadata */}
          <div className="flex items-center justify-between bg-green-500/10 border border-green-500/30 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 size={20} className="text-green-400" />
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-white">Analysis Complete</p>
                  {result.model && (
                    <span className="badge bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[11px]">
                      {result.model}
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-0.5">
                  {result.pageCount} page(s) · {result.extractedTextLength.toLocaleString()} characters extracted
                </p>
              </div>
            </div>
            <button
              onClick={handleSaveProject}
              disabled={saving}
              className="btn-success text-sm"
            >
              {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
              Save to Projects
            </button>
          </div>

          {/* Summary */}
          <AnalysisSection icon={FileText} title="Structured Summary" color="bg-blue-600">
            <div className="space-y-4">
              {analysis.summary?.title && (
                <div>
                  <p className="text-xs text-gray-500 mb-1 uppercase tracking-wide">Title</p>
                  <p className="text-white font-medium">{analysis.summary.title}</p>
                </div>
              )}
              {analysis.summary?.overview && (
                <div>
                  <p className="text-xs text-gray-500 mb-1 uppercase tracking-wide">Overview</p>
                  <p className="text-sm text-gray-300 leading-relaxed">{analysis.summary.overview}</p>
                </div>
              )}
              {analysis.summary?.keyContributions?.length > 0 && (
                <div>
                  <p className="text-xs text-gray-500 mb-2 uppercase tracking-wide">Key Contributions</p>
                  <ListItems items={analysis.summary.keyContributions} color="text-blue-400" />
                </div>
              )}
              {analysis.summary?.methodology && (
                <div>
                  <p className="text-xs text-gray-500 mb-1 uppercase tracking-wide">Methodology</p>
                  <p className="text-sm text-gray-300">{analysis.summary.methodology}</p>
                </div>
              )}
              {analysis.summary?.results && (
                <div>
                  <p className="text-xs text-gray-500 mb-1 uppercase tracking-wide">Results</p>
                  <p className="text-sm text-gray-300">{analysis.summary.results}</p>
                </div>
              )}
            </div>
          </AnalysisSection>

          {/* Tech Stack */}
          <AnalysisSection icon={Code2} title="Recommended Tech Stack & Architecture" color="bg-purple-600">
            <div className="space-y-4">
              {analysis.techStack?.recommendedStack && (
                <div>
                  <TagGroup label="Frontend" items={analysis.techStack.recommendedStack.frontend} />
                  <TagGroup label="Backend" items={analysis.techStack.recommendedStack.backend} />
                  <TagGroup label="Database" items={analysis.techStack.recommendedStack.database} />
                  <TagGroup label="ML Frameworks" items={analysis.techStack.recommendedStack.mlFrameworks} />
                  <TagGroup label="DevOps" items={analysis.techStack.recommendedStack.devOps} />
                </div>
              )}
              {analysis.techStack?.architecture && (
                <div>
                  <p className="text-xs text-gray-500 mb-1 uppercase tracking-wide">Architecture</p>
                  <p className="text-sm text-gray-300">{analysis.techStack.architecture}</p>
                </div>
              )}
              {analysis.techStack?.implementationRoadmap?.length > 0 && (
                <div>
                  <p className="text-xs text-gray-500 mb-2 uppercase tracking-wide">Implementation Roadmap</p>
                  <ol className="space-y-2">
                    {analysis.techStack.implementationRoadmap.map((step, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-gray-300">
                        <span className="w-5 h-5 bg-purple-600/30 border border-purple-500/50 rounded-full flex items-center justify-center text-xs text-purple-300 flex-shrink-0 font-medium">
                          {i + 1}
                        </span>
                        {step}
                      </li>
                    ))}
                  </ol>
                </div>
              )}
              {analysis.techStack?.rationale && (
                <div className="bg-purple-500/5 border border-purple-500/20 rounded-lg p-3">
                  <p className="text-xs text-gray-500 mb-1 uppercase tracking-wide">Rationale</p>
                  <p className="text-sm text-gray-300">{analysis.techStack.rationale}</p>
                </div>
              )}
            </div>
          </AnalysisSection>

          {/* Research Gaps */}
          <AnalysisSection icon={Lightbulb} title="Research Gaps & Future Scope" color="bg-orange-600">
            <div className="space-y-4">
              {analysis.researchGaps?.identifiedGaps?.length > 0 && (
                <div>
                  <p className="text-xs text-gray-500 mb-2 uppercase tracking-wide">Identified Gaps</p>
                  <ListItems items={analysis.researchGaps.identifiedGaps} color="text-orange-400" />
                </div>
              )}
              {analysis.researchGaps?.futureScope?.length > 0 && (
                <div>
                  <p className="text-xs text-gray-500 mb-2 uppercase tracking-wide">Future Scope</p>
                  <ListItems items={analysis.researchGaps.futureScope} color="text-green-400" />
                </div>
              )}
              {analysis.researchGaps?.openProblems?.length > 0 && (
                <div>
                  <p className="text-xs text-gray-500 mb-2 uppercase tracking-wide">Open Problems</p>
                  <ListItems items={analysis.researchGaps.openProblems} color="text-red-400" />
                </div>
              )}
              {analysis.researchGaps?.potentialExtensions?.length > 0 && (
                <div>
                  <p className="text-xs text-gray-500 mb-2 uppercase tracking-wide">Potential Extensions</p>
                  <ListItems items={analysis.researchGaps.potentialExtensions} color="text-blue-400" />
                </div>
              )}
              {analysis.researchGaps?.researchOpportunities && (
                <div className="bg-orange-500/5 border border-orange-500/20 rounded-lg p-3">
                  <p className="text-xs text-gray-500 mb-1 uppercase tracking-wide">Research Opportunities</p>
                  <p className="text-sm text-gray-300">{analysis.researchGaps.researchOpportunities}</p>
                </div>
              )}
            </div>
          </AnalysisSection>
        </div>
      )}
    </div>
  );
}
