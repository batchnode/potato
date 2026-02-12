interface Env {
  potato_kv: {
    get: (key: string) => Promise<string | null>;
  };
}

async function getPat(context: { request: Request; env: Env }) {
  const { request, env } = context;
  if (env.potato_kv) {
    const configStr = await env.potato_kv.get('config');
    if (configStr) {
      const config = JSON.parse(configStr);
      if (config.pat && !config.pat.includes('****')) return config.pat as string;
    }
  }
  return request.headers.get('x-github-token');
}

export const onRequestPost = async (context: { request: Request; env: Env }) => {
  const { request } = context;
  const pat = await getPat(context);
  if (!pat) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });

  try {
    const bodyData = await request.json() as any;
    const { repo, workflow_id } = bodyData;
    
    // GitHub API for getting workflow runs
    const githubUrl = `https://api.github.com/repos/${repo}/actions/workflows/${workflow_id}/runs?per_page=1`;

    const response = await fetch(githubUrl, {
      headers: {
        'Authorization': `Bearer ${pat.trim()}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'Potato-CMS'
      }
    });
    
    const data = await response.json() as any;
    if (response.ok && data.workflow_runs && data.workflow_runs.length > 0) {
      const latestRun = data.workflow_runs[0];
      return new Response(JSON.stringify({
        id: latestRun.id,
        status: latestRun.status,
        conclusion: latestRun.conclusion,
        created_at: latestRun.created_at,
        updated_at: latestRun.updated_at,
        html_url: latestRun.html_url
      }), { status: 200 });
    } else {
      return new Response(JSON.stringify({ message: 'No runs found' }), { status: 404 });
    }
  } catch (err: unknown) {
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : 'Unknown error' }), { status: 500 });
  }
};
