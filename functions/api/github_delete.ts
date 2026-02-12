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

const handleRequest = async (context: { request: Request; env: Env }) => {
  const { request } = context;
  const pat = await getPat(context);
  if (!pat) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });

  try {
    let repo, path, branch, message, sha, filename;
    
    if (request.method === 'DELETE' || request.headers.get('content-type')?.includes('application/json') === false) {
      const url = new URL(request.url);
      repo = url.searchParams.get('repo');
      path = url.searchParams.get('path');
      branch = url.searchParams.get('branch');
      message = url.searchParams.get('message');
      sha = url.searchParams.get('sha');
      filename = url.searchParams.get('filename');
    } else {
      const body = await request.json() as Record<string, string>;
      repo = body.repo;
      path = body.path;
      branch = body.branch;
      message = body.message;
      sha = body.sha;
      filename = body.filename;
    }

    // If path includes filename, and filename is not provided separately
    let fullPath = path || '';
    if (filename && !fullPath.endsWith(filename)) {
      fullPath = `${fullPath}/${filename}`.replace(/\/+/g, '/');
    }

    // GitHub API requires SHA for DELETE
    if (!sha) {
      const getUrl = `https://api.github.com/repos/${repo}/contents/${fullPath}?ref=${branch}`;
      const getRes = await fetch(getUrl, {
        headers: {
          'Authorization': `Bearer ${pat.trim()}`,
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'Potato-CMS'
        }
      });
      if (getRes.ok) {
        const data = await getRes.json() as { sha: string };
        sha = data.sha;
      } else {
        return new Response(JSON.stringify({ error: 'Could not find file to delete (SHA missing)' }), { status: 404 });
      }
    }

    const githubUrl = `https://api.github.com/repos/${repo}/contents/${fullPath}`;
    const response = await fetch(githubUrl, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${pat.trim()}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'Potato-CMS'
      },
      body: JSON.stringify({ message: message || `Delete ${fullPath}`, sha, branch })
    });
    return new Response(JSON.stringify(await response.json()), { status: response.status });
  } catch (err: unknown) {
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : 'Unknown error' }), { status: 500 });
  }
};

export const onRequestPost = handleRequest;
export const onRequestDelete = handleRequest;
