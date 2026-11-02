const express = require('express');
const router = express.Router();
const axios = require('axios');
const https = require('https');

// Agent to handle SSL certificate issues in local/corporate environments
const httpsAgent = new https.Agent({ rejectUnauthorized: false });

/**
 * Builds request headers for GitHub API
 * @param {boolean} withAuth Whether to attach the Authorization header if available
 */
const buildHeaders = (withAuth = true) => {
  const headers = {
    Accept: 'application/vnd.github.v3+json',
    'User-Agent': 'ResearchPlatform/1.0'
  };

  const rawToken = process.env.GITHUB_TOKEN ? process.env.GITHUB_TOKEN.trim() : '';
  if (withAuth && rawToken) {
    // Standard GitHub Bearer authorization
    headers.Authorization = `Bearer ${rawToken}`;
  }

  return headers;
};

/**
 * Executes a GitHub API request with automatic fallback to unauthenticated mode
 * if the provided GITHUB_TOKEN is invalid (401 Bad credentials) or forbidden (403)
 */
async function fetchGithub(urlPath, params = {}) {
  const token = process.env.GITHUB_TOKEN ? process.env.GITHUB_TOKEN.trim() : '';
  const fullUrl = `https://api.github.com${urlPath}`;

  if (token) {
    try {
      const response = await axios.get(fullUrl, {
        params,
        headers: buildHeaders(true),
        httpsAgent,
        timeout: 15000
      });
      return { data: response.data, authenticated: true };
    } catch (authError) {
      const status = authError.response?.status;
      const isBadCredentials =
        status === 401 ||
        (status === 403 && authError.response?.data?.message?.toLowerCase().includes('credentials'));

      if (isBadCredentials) {
        console.warn('⚠️ GitHub token is invalid or expired. Falling back gracefully to unauthenticated request...');
        const publicResponse = await axios.get(fullUrl, {
          params,
          headers: buildHeaders(false),
          httpsAgent,
          timeout: 15000
        });
        return { data: publicResponse.data, authenticated: false };
      }

      // If it's a rate limit or other specific error, rethrow
      throw authError;
    }
  }

  // No token provided, proceed directly with unauthenticated request
  const response = await axios.get(fullUrl, {
    params,
    headers: buildHeaders(false),
    httpsAgent,
    timeout: 15000
  });
  return { data: response.data, authenticated: false };
}

// GET /api/github?topic=<topic>&page=1&perPage=10
router.get('/', async (req, res) => {
  const { topic, page = 1, perPage = 10 } = req.query;

  if (!topic || !topic.trim()) {
    return res.status(400).json({ error: 'Topic is required' });
  }

  try {
    const searchQuery = topic.trim().replace(/\s+/g, '+');
    const { data, authenticated } = await fetchGithub('/search/repositories', {
      q: searchQuery,
      sort: 'stars',
      order: 'desc',
      page: parseInt(page) || 1,
      per_page: parseInt(perPage) || 10
    });

    const items = data.items || [];
    const totalCount = data.total_count || 0;

    const repos = items.map(repo => ({
      id: repo.id,
      name: repo.name,
      fullName: repo.full_name,
      description: repo.description || 'No description provided',
      url: repo.html_url,
      stars: repo.stargazers_count || 0,
      forks: repo.forks_count || 0,
      language: repo.language || 'Unknown',
      topics: repo.topics || [],
      updatedAt: repo.updated_at,
      openIssues: repo.open_issues_count || 0,
      license: repo.license ? repo.license.name : 'No License',
      isArchived: repo.archived || false,
      defaultBranch: repo.default_branch || 'main'
    }));

    res.json({
      success: true,
      topic: topic.trim(),
      totalCount,
      page: parseInt(page) || 1,
      perPage: parseInt(perPage) || 10,
      authenticated,
      repos
    });
  } catch (error) {
    console.error('GitHub API Error:', error.response?.data || error.message);

    if (error.response?.status === 403) {
      return res.status(403).json({
        error: 'GitHub API rate limit exceeded. Please try again later.',
        resetTime: error.response.headers?.['x-ratelimit-reset']
      });
    }

    if (error.response?.status === 401) {
      return res.status(401).json({
        error: 'GitHub authentication failed. Please check your token.'
      });
    }

    res.status(error.response?.status || 500).json({
      error: 'Failed to fetch GitHub repositories',
      message: error.response?.data?.message || error.message
    });
  }
});

// GET /api/github/repo?owner=<owner>&repo=<repo>
router.get('/repo', async (req, res) => {
  const { owner, repo } = req.query;

  if (!owner || !repo) {
    return res.status(400).json({ error: 'Owner and repo are required' });
  }

  try {
    const [repoResult, langResult] = await Promise.all([
      fetchGithub(`/repos/${owner}/${repo}`),
      fetchGithub(`/repos/${owner}/${repo}/languages`)
    ]);

    res.json({
      success: true,
      repo: repoResult.data,
      languages: langResult.data
    });
  } catch (error) {
    console.error('GitHub Repo Details Error:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: 'Failed to fetch repository details',
      message: error.response?.data?.message || error.message
    });
  }
});

module.exports = router;
