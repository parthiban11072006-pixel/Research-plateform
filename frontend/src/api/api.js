import axios from 'axios';

const API = axios.create({
  baseURL: '/api',
  timeout: 30000,
});

// Research (ArXiv)
export const searchArxiv = (topic, maxResults = 10) =>
  API.get('/research', { params: { topic, maxResults } });

// GitHub
export const searchGitHub = (topic, page = 1, perPage = 10) =>
  API.get('/github', { params: { topic, page, perPage } });

// Upload PDF & AI Analysis
export const uploadPDF = (formData, onProgress) =>
  API.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (progressEvent) => {
      const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
      if (onProgress) onProgress(progress);
    },
    timeout: 120000, // 2 min for AI analysis
  });

// Projects
export const getProjects = (params) => API.get('/projects', { params });
export const getProject = (id) => API.get(`/projects/${id}`);
export const createProject = (data) => API.post('/projects', data);
export const updateProject = (id, data) => API.put(`/projects/${id}`, data);
export const deleteProject = (id) => API.delete(`/projects/${id}`);
export const toggleMilestone = (projectId, milestoneId) =>
  API.patch(`/projects/${projectId}/milestone/${milestoneId}`);
export const addMilestone = (projectId, data) =>
  API.post(`/projects/${projectId}/milestone`, data);

export default API;
