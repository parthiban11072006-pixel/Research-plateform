const mongoose = require('mongoose');

const MilestoneSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  completed: { type: Boolean, default: false },
  dueDate: { type: Date },
  completedAt: { type: Date }
}, { timestamps: true });

const ProjectSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  topic: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  status: { 
    type: String, 
    enum: ['Planning', 'In Progress', 'Review', 'Completed', 'On Hold'],
    default: 'Planning'
  },
  tags: [{ type: String }],
  aiAnalysis: {
    summary: { type: String, default: '' },
    techStack: { type: String, default: '' },
    researchGaps: { type: String, default: '' },
    analyzedAt: { type: Date }
  },
  pdfFile: {
    originalName: { type: String },
    fileName: { type: String },
    filePath: { type: String },
    uploadedAt: { type: Date }
  },
  arxivPapers: [{
    id: String,
    title: String,
    authors: [String],
    summary: String,
    publishedDate: String,
    link: String,
    categories: [String]
  }],
  githubRepos: [{
    id: Number,
    name: String,
    fullName: String,
    description: String,
    url: String,
    stars: Number,
    forks: Number,
    language: String,
    topics: [String],
    updatedAt: String
  }],
  milestones: [MilestoneSchema],
  progress: { type: Number, default: 0, min: 0, max: 100 }
}, { timestamps: true });

// Auto-calculate progress based on milestones
ProjectSchema.pre('save', function(next) {
  if (this.milestones && this.milestones.length > 0) {
    const completed = this.milestones.filter(m => m.completed).length;
    this.progress = Math.round((completed / this.milestones.length) * 100);
  }
  next();
});

module.exports = mongoose.model('Project', ProjectSchema);
