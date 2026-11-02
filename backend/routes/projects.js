const express = require('express');
const router = express.Router();
const Project = require('../models/Project');

// GET /api/projects - Get all projects
router.get('/', async (req, res) => {
  try {
    const { status, search, sort = '-createdAt' } = req.query;
    let query = {};

    if (status && status !== 'All') {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { topic: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const projects = await Project.find(query)
      .sort(sort)
      .select('-__v');

    const stats = {
      total: await Project.countDocuments(),
      planning: await Project.countDocuments({ status: 'Planning' }),
      inProgress: await Project.countDocuments({ status: 'In Progress' }),
      completed: await Project.countDocuments({ status: 'Completed' }),
      onHold: await Project.countDocuments({ status: 'On Hold' })
    };

    res.json({ success: true, projects, stats });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch projects', message: error.message });
  }
});

// GET /api/projects/:id - Get single project
router.get('/:id', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    res.json({ success: true, project });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch project', message: error.message });
  }
});

// POST /api/projects - Create new project
router.post('/', async (req, res) => {
  try {
    const { title, topic, description, status, tags, milestones, aiAnalysis, arxivPapers, githubRepos, pdfFile } = req.body;

    if (!title || !topic) {
      return res.status(400).json({ error: 'Title and topic are required' });
    }

    const project = new Project({
      title,
      topic,
      description: description || '',
      status: status || 'Planning',
      tags: tags || [],
      milestones: milestones || [
        { title: 'Literature Review', description: 'Review existing research papers' },
        { title: 'Problem Definition', description: 'Define the research problem clearly' },
        { title: 'Methodology Design', description: 'Design the research methodology' },
        { title: 'Implementation', description: 'Implement the proposed solution' },
        { title: 'Evaluation & Testing', description: 'Evaluate and test the solution' },
        { title: 'Documentation', description: 'Write documentation and final report' }
      ],
      aiAnalysis: aiAnalysis || {},
      arxivPapers: arxivPapers || [],
      githubRepos: githubRepos || [],
      pdfFile: pdfFile || {}
    });

    await project.save();
    res.status(201).json({ success: true, project });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create project', message: error.message });
  }
});

// PUT /api/projects/:id - Update project
router.put('/:id', async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      { ...req.body },
      { new: true, runValidators: true }
    );

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json({ success: true, project });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update project', message: error.message });
  }
});

// PATCH /api/projects/:id/milestone/:milestoneId - Toggle milestone
router.patch('/:id/milestone/:milestoneId', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const milestone = project.milestones.id(req.params.milestoneId);
    if (!milestone) {
      return res.status(404).json({ error: 'Milestone not found' });
    }

    milestone.completed = !milestone.completed;
    milestone.completedAt = milestone.completed ? new Date() : null;

    await project.save();
    res.json({ success: true, project });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update milestone', message: error.message });
  }
});

// POST /api/projects/:id/milestone - Add milestone
router.post('/:id/milestone', async (req, res) => {
  try {
    const { title, description, dueDate } = req.body;
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    project.milestones.push({ title, description, dueDate });
    await project.save();
    res.json({ success: true, project });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add milestone', message: error.message });
  }
});

// DELETE /api/projects/:id - Delete project
router.delete('/:id', async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    res.json({ success: true, message: 'Project deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete project', message: error.message });
  }
});

module.exports = router;
