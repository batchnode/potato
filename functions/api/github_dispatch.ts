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
    const { repo, branch, workflow_id, inputs } = bodyData;
    
    // GitHub API for triggering workflow_dispatch
    const githubUrl = `https://api.github.com/repos/${repo}/actions/workflows/${workflow_id}/dispatches`;

    const response = await fetch(githubUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${pat.trim()}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'Potato-CMS'
      },
      body: JSON.stringify({
        ref: branch || 'main',
        inputs: inputs || {}
      })
    });
    
    if (response.status === 204) {
      return new Response(JSON.stringify({ success: true, message: 'Workflow triggered successfully' }), { status: 200 });
    } else {
      const errorData = await response.json();
      return new Response(JSON.stringify(errorData), { status: response.status });
    }
  } catch (err: unknown) {
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : 'Unknown error' }), { status: 500 });
  }
};
