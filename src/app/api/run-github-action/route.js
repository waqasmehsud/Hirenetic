import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { script_name, script_filename, script_code, requirements } = await req.json();

    const token = process.env.GITHUB_TOKEN;
    const owner = process.env.GITHUB_OWNER;
    const repo = process.env.GITHUB_REPO;
    const workflow = process.env.GITHUB_WORKFLOW || 'run_script.yml';
    const branch = process.env.GITHUB_BRANCH || 'wm_hirenetic';

    if (!token || token.includes('YOUR_TOKEN_HERE')) {
      return NextResponse.json(
        {
          error: 'GitHub Token not configured. Please set GITHUB_TOKEN in .env.local',
        },
        { status: 400 }
      );
    }

    const headers = {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/vnd.github+json',
      'Content-Type': 'application/json',
      'X-GitHub-Api-Version': '2022-11-28',
    };

    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/actions/workflows/${workflow}/dispatches`;

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        ref: branch,
        inputs: {
          script_name: script_name || 'Custom Script',
          script_filename: script_filename || 'script.py',
          script_code: script_code || '# No code provided',
          requirements: requirements || '',
        },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      return NextResponse.json(
        { error: `GitHub API error (${response.status}): ${errText}` },
        { status: response.status }
      );
    }

    // Wait 2 seconds for GitHub to create the workflow run record
    await new Promise((r) => setTimeout(r, 2000));

    // Retrieve recent workflow runs to capture the run_id
    const runsUrl = `https://api.github.com/repos/${owner}/${repo}/actions/workflows/${workflow}/runs?per_page=5`;
    const runsRes = await fetch(runsUrl, { headers });
    let runId = null;
    let workflowUrl = `https://github.com/${owner}/${repo}/actions`;

    if (runsRes.ok) {
      const runsData = await runsRes.json();
      if (runsData.workflow_runs && runsData.workflow_runs.length > 0) {
        const latestRun = runsData.workflow_runs[0];
        runId = latestRun.id;
        workflowUrl = latestRun.html_url || workflowUrl;
      }
    }

    return NextResponse.json({
      success: true,
      run_id: runId,
      message: `GitHub Action dispatched successfully for ${script_name}!`,
      workflow_url: workflowUrl,
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

