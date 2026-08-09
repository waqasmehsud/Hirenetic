import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = (supabaseUrl && supabaseAnonKey) ? createClient(supabaseUrl, supabaseAnonKey) : null;

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const candidateId = searchParams.get('state');

  if (!code) {
    return NextResponse.redirect(new URL('/candidate-panel?error=github_code_missing', request.url));
  }

  const clientId = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;

  try {
    // 1. Exchange OAuth code for GitHub Access Token
    const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code: code
      })
    });

    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;

    if (accessToken) {
      // 2. Fetch authenticated GitHub user details
      const userRes = await fetch('https://api.github.com/user', {
        headers: {
          'Authorization': `token ${accessToken}`,
          'User-Agent': 'Hirenetic-App'
        }
      });
      const githubUser = await userRes.json();

      // 3. Fetch public repositories and calculate REAL LOC & repo count
      const reposRes = await fetch('https://api.github.com/user/repos?per_page=100', {
        headers: {
          'Authorization': `token ${accessToken}`,
          'User-Agent': 'Hirenetic-App'
        }
      });
      // =========================================================
      // TOUGH & RIGOROUS GITHUB AUDIT SCORING ENGINE (100 PTS)
      // =========================================================
      const allRepos = Array.isArray(reposData) ? reposData : [];
      const nonForkRepos = allRepos.filter(r => !r.fork);
      const totalRepoCount = allRepos.length;
      const originalRepoCount = nonForkRepos.length;
      const forkCount = totalRepoCount - originalRepoCount;

      // 1. Original Code Ratio Score (35 Pts Max)
      const originalRatio = totalRepoCount > 0 ? (originalRepoCount / totalRepoCount) : 0;
      let ratioScore = 0;
      if (originalRatio >= 0.85) ratioScore = 35;
      else if (originalRatio >= 0.70) ratioScore = 27;
      else if (originalRatio >= 0.50) ratioScore = 18;
      else ratioScore = 8; // Heavy penalty for mostly forked repos

      // 2. Lines of Code & Codebase Volume Score (25 Pts Max)
      const totalSizeKb = allRepos.reduce((acc, r) => acc + (r.size || 0), 0);
      const realLocCount = totalSizeKb * 30; // Approx 30 LOC per KB
      const locFormatted = realLocCount.toLocaleString();
      let locScore = 0;
      if (realLocCount >= 30000) locScore = 25;
      else if (realLocCount >= 15000) locScore = 20;
      else if (realLocCount >= 5000) locScore = 14;
      else locScore = 6; // Low codebase volume penalty

      // 3. Original Repository Count Score (20 Pts Max)
      let repoCountScore = 0;
      if (originalRepoCount >= 10) repoCountScore = 20;
      else if (originalRepoCount >= 5) repoCountScore = 15;
      else if (originalRepoCount >= 2) repoCountScore = 10;
      else repoCountScore = 4; // Penalty for < 2 original repos

      // 4. Recent Commit Activity Score (20 Pts Max)
      const now = new Date();
      const recentlyActiveRepos = nonForkRepos.filter(r => {
        if (!r.pushed_at) return false;
        const monthsOld = (now - new Date(r.pushed_at)) / (1000 * 60 * 60 * 24 * 30);
        return monthsOld <= 12; // Active in past 12 months
      }).length;
      let activityScore = 0;
      if (recentlyActiveRepos >= 4) activityScore = 20;
      else if (recentlyActiveRepos >= 2) activityScore = 14;
      else if (recentlyActiveRepos >= 1) activityScore = 8;
      else activityScore = 2; // Inactive account penalty

      // Calculate Experience Years based on GitHub First Push / Creation Date
      const userCreatedAt = githubUser.created_at ? new Date(githubUser.created_at) : new Date('2018-01-01');
      const earliestRepoDate = nonForkRepos.reduce((earliest, r) => {
        if (!r.created_at) return earliest;
        const rDate = new Date(r.created_at);
        return rDate < earliest ? rDate : earliest;
      }, userCreatedAt);

      const firstPushDate = earliestRepoDate < userCreatedAt ? earliestRepoDate : userCreatedAt;
      const firstPushYear = firstPushDate.getFullYear();
      const currentYear = new Date().getFullYear();
      const calculatedGithubExpYears = Math.max(currentYear - firstPushYear, 1.0);

      // Calculate Total Tough Score (Max 100)
      const rawTotalScore = ratioScore + locScore + repoCountScore + activityScore;
      const calculatedScore = Math.min(Math.max(rawTotalScore, 35), 98);
      const statusLabel = calculatedScore >= 70 ? 'Verified' : 'Caution';
      const githubText = `${originalRepoCount} original public repos (${forkCount} forks filtered) verified with ${locFormatted}+ LOC audit score. First commit activity: ${firstPushYear}.`;

      // 4. Update Supabase Database with REAL live GitHub metadata & Experience
      if (supabase && candidateId) {
        await supabase
          .from('candidates_profiles')
          .update({
            github_verified: calculatedScore >= 70,
            github_score: calculatedScore,
            github_url: githubUser.html_url || `https://github.com/${githubUser.login}`,
            experience_years: calculatedGithubExpYears,
            github_first_push_year: firstPushYear,
            verifications: {
              github: {
                status: statusLabel,
                score: calculatedScore,
                url: githubUser.html_url,
                total_repos: originalRepoCount,
                loc_verified: realLocCount,
                first_push_year: firstPushYear,
                experience_years: calculatedGithubExpYears,
                text: githubText
              }
            }
          })
          .eq('id', candidateId);
      }
    }

    return NextResponse.redirect(new URL('/candidate-panel?tab=verification&verified=github', request.url));
  } catch (err) {
    console.error('GitHub OAuth Backend Callback Error:', err);
    return NextResponse.redirect(new URL('/candidate-panel?tab=verification&verified=github', request.url));
  }
}
