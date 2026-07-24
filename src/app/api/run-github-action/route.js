import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { script_name, script_filename, script_code, requirements } = await req.json();

    const token = process.env.GITHUB_TOKEN;
    const owner = process.env.GITHUB_OWNER;
    const repo = process.env.GITHUB_REPO;
    const workflow = process.env.GITHUB_WORKFLOW || 'run_script.yml';

    if (!token || token.includes('YOUR_TOKEN_HERE')) {
      return NextResponse.json(
        {
          error: 'GitHub Token not configured. Please set GITHUB_TOKEN in .env.local',
          mode: 'simulated',
        },
        { status: 400 }
      );
    }

    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/actions/workflows/${workflow}/dispatches`;

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github+json',
        'Content-Type': 'application/json',
        'X-GitHub-Api-Version': '2022-11-28',
      },
      body: JSON.stringify({
        ref: process.env.GITHUB_BRANCH || 'wm',
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

    return NextResponse.json({
      success: true,
      message: `GitHub Action dispatched successfully for ${script_name}!`,
      workflow_url: `https://github.com/${owner}/${repo}/actions`,
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
