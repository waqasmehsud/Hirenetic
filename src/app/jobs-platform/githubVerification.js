// GitHub verification — runs client-side against GitHub's free public REST API.
// No auth token needed for this volume of usage (unauthenticated limit is
// 60 requests/hour per IP; this uses 2 requests per candidate checked).
//
// NOTE: if you outgrow 60/hour (e.g. HR users checking many candidates back
// to back), create a free GitHub Personal Access Token with no scopes and
// send it as a header — that raises the limit to 5,000/hour. Not needed yet.

const GITHUB_SKILLS = [
  'javascript', 'typescript', 'python', 'java', 'react', 'vue', 'angular',
  'node', 'express', 'django', 'flask', 'go', 'rust', 'c++', 'c#', 'php',
  'ruby', 'swift', 'kotlin', 'sql', 'html', 'css', 'docker', 'kubernetes',
  'aws', 'security', 'penetration', 'machine learning', 'tensorflow', 'pytorch',
]

export function extractGithubUsername(url) {
  if (!url) return null
  try {
    const cleaned = url.trim().replace(/\/+$/, '')
    const match = cleaned.match(/github\.com\/([A-Za-z0-9-]+)/i)
    return match ? match[1] : null
  } catch {
    return null
  }
}

async function fetchGithubProfile(username) {
  const res = await fetch(`https://api.github.com/users/${username}`)
  if (res.status === 404) throw new Error('GitHub username not found')
  if (res.status === 403) throw new Error('GitHub rate limit exceeded — try again later')
  if (!res.ok) throw new Error(`GitHub API error: ${res.status}`)
  return res.json()
}

async function fetchGithubRepos(username) {
  const res = await fetch(`https://api.github.com/users/${username}/repos?per_page=100&sort=updated`)
  if (!res.ok) throw new Error(`GitHub API error fetching repos: ${res.status}`)
  return res.json()
}

function aggregateRepoData(repos) {
  const languageCounts = {}
  let totalStars = 0
  const allTopics = new Set()

  for (const repo of repos) {
    if (repo.language) {
      languageCounts[repo.language] = (languageCounts[repo.language] || 0) + 1
    }
    totalStars += repo.stargazers_count || 0
    if (Array.isArray(repo.topics)) {
      repo.topics.forEach((t) => allTopics.add(t))
    }
  }

  const topLanguages = Object.entries(languageCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([lang]) => lang)

  return {
    topLanguages,
    totalStars,
    topics: Array.from(allTopics),
    repoCount: repos.length,
  }
}

// Compares what the CV claims against what GitHub actually shows.
function crossCheckSkills(resumeText, githubLanguages, githubTopics) {
  const resumeLower = (resumeText || '').toLowerCase()
  const githubSignals = [...githubLanguages, ...githubTopics].map((s) => s.toLowerCase())

  const claimedSkills = GITHUB_SKILLS.filter((skill) => resumeLower.includes(skill))
  if (claimedSkills.length === 0) {
    return { matchedSkills: [], matchPercentage: null } // nothing to verify against
  }

  const matchedSkills = claimedSkills.filter((skill) =>
    githubSignals.some((signal) => signal.includes(skill) || skill.includes(signal))
  )

  const matchPercentage = Math.round((matchedSkills.length / claimedSkills.length) * 100)

  return { claimedSkills, matchedSkills, matchPercentage }
}

// Main entry point — call this with a candidate's github_url and resume_text.
export async function verifyCandidateGithub(githubUrl, resumeText) {
  const username = extractGithubUsername(githubUrl)
  if (!username) {
    return { ok: false, error: 'Invalid or missing GitHub URL' }
  }

  try {
    const [profile, repos] = await Promise.all([
      fetchGithubProfile(username),
      fetchGithubRepos(username),
    ])

    const { topLanguages, totalStars, topics, repoCount } = aggregateRepoData(repos)
    const { claimedSkills, matchedSkills, matchPercentage } = crossCheckSkills(
      resumeText,
      topLanguages,
      topics
    )

    return {
      ok: true,
      username,
      avatarUrl: profile.avatar_url,
      followers: profile.followers,
      publicRepos: profile.public_repos ?? repoCount,
      totalStars,
      topLanguages: topLanguages.slice(0, 6),
      claimedSkills: claimedSkills || [],
      matchedSkills: matchedSkills || [],
      matchPercentage, // null if CV mentioned no checkable tech skills at all
      checkedAt: new Date().toISOString(),
    }
  } catch (err) {
    return { ok: false, error: err.message }
  }
}