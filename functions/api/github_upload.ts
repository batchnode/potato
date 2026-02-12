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
    const bodyData = await request.json() as Record<string, string>;
    const { repo, path, branch, message, content, filename } = bodyData;
    let { sha } = bodyData;
    
    // Ensure path doesn't end with slash if filename is provided
    const cleanPath = path.replace(/\/+$/, '');
    const githubUrl = `https://api.github.com/repos/${repo}/contents/${cleanPath}/${filename}`;
    
    // If SHA is not provided, try to fetch it in case the file exists (to avoid 422)
    if (!sha) {
      const getRes = await fetch(`${githubUrl}?ref=${branch}`, {
        headers: {
          'Authorization': `Bearer ${pat.trim()}`,
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'Potato-CMS'
        }
      });
      if (getRes.ok) {
        const existingFile = await getRes.json() as { sha: string };
        sha = existingFile.sha;
      }
    }

    const body: { message: string; content: string; branch: string; sha?: string } = { 
      message: message || `${sha ? 'Update' : 'Create'} ${filename}`, 
      content, 
      branch 
    };
    if (sha) body.sha = sha;

    const response = await fetch(githubUrl, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${pat.trim()}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'Potato-CMS'
      },
      body: JSON.stringify(body)
    });
    
    const data = await response.json();
    return new Response(JSON.stringify(data), { status: response.status });
  } catch (err: unknown) {
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : 'Unknown error' }), { status: 500 });
  }
};