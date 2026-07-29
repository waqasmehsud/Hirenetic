import { NextResponse } from 'next/server';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const runId = searchParams.get('run_id');

    const token = process.env.GITHUB_TOKEN;
    const owner = process.env.GITHUB_OWNER;
    const repo = process.env.GITHUB_REPO;

    if (!runId) {
      return NextResponse.json({ error: 'Missing run_id parameter' }, { status: 400 });
    }

    if (!token || token.includes('YOUR_TOKEN_HERE')) {
      return NextResponse.json({ error: 'GitHub Token not configured' }, { status: 400 });
    }

    const headers = {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
    };

    // 1. Fetch Run details
    const runRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/actions/runs/${runId}`, { headers });
    if (!runRes.ok) {
      const errText = await runRes.text();
      return NextResponse.json({ error: `GitHub API error (${runRes.status}): ${errText}` }, { status: runRes.status });
    }
    const runData = await runRes.json();

    // 2. Fetch Jobs for this run
    const jobsRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/actions/runs/${runId}/jobs`, { headers });
    let jobs = [];
    let logsText = '';
    let extractedScriptOutput = [];

    if (jobsRes.ok) {
      const jobsData = await jobsRes.json();
      jobs = jobsData.jobs || [];

      // If we have a main job, attempt to fetch raw logs
      if (jobs.length > 0) {
        const jobId = jobs[0].id;
        try {
          const logsRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/actions/jobs/${jobId}/logs`, {
            headers,
            redirect: 'follow',
          });
          if (logsRes.ok) {
            logsText = await logsRes.text();

            // Extract content between EXECUTION START and EXECUTION END or step outputs
            const lines = logsText.split('\n');
            let insideExecution = false;

            for (const line of lines) {
              // Strip timestamp prefixes (e.g. 2026-07-29T08:00:00.1234567Z )
              const cleanLine = line.replace(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d+Z\s*/, '');

              if (cleanLine.includes('EXECUTION START')) {
                insideExecution = true;
                continue;
              }
              if (cleanLine.includes('EXECUTION END')) {
                insideExecution = false;
                continue;
              }
              if (insideExecution) {
                extractedScriptOutput.push(cleanLine);
              }
            }
          }
        } catch {
          // Log fetch error ignored, fallback to step info
        }
      }
    }

    const stepsInfo = (jobs[0]?.steps || []).map((s) => ({
      name: s.name,
      status: s.status,
      conclusion: s.conclusion,
    }));

    return NextResponse.json({
      run_id: runId,
      status: runData.status, // queued, in_progress, completed
      conclusion: runData.conclusion, // success, failure, cancelled, null
      html_url: runData.html_url,
      steps: stepsInfo,
      output: extractedScriptOutput,
      logs_available: extractedScriptOutput.length > 0,
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
