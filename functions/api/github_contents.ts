interface Env {
  potato_kv: {
    get: (key: string) => Promise<string | null>;
  };
  potato_d1: D1Database;
}

export const onRequest = async (context: { request: Request; env: Env }) => {
  const { request, env } = context;
  const url = new URL(request.url);
  const repo = url.searchParams.get('repo');
  const path = url.searchParams.get('path');
  const filename = url.searchParams.get('filename');
  const branch = url.searchParams.get('branch') || 'main';

  // We no longer return content from D1 cache to ensure fresh reads and save space
  // But we still update D1 metadata after a GitHub fetch

  const githubUrl = `https://api.github.com/repos/${repo}/contents/${path}${filename ? '/' + filename : ''}?ref=${branch}`;

  let pat = null;

  // 1. Always prioritize the secure PAT from KV
  if (env.potato_kv) {
    const configStr = await env.potato_kv.get('config');
    if (configStr) {
      const config = JSON.parse(configStr);
      pat = config.pat;
    }
  }

  // 2. Fallback to header ONLY during initial setup
  if (!pat) {
    pat = request.headers.get('x-github-token');
  }

  if (!pat || pat.includes('****')) {
    return new Response(JSON.stringify({ error: 'Unauthorized: Invalid or missing PAT', url: githubUrl }), { 
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const response = await fetch(githubUrl, {
      headers: {
        'Authorization': `Bearer ${pat.trim()}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'Potato-CMS'
      }
    });

    const data = await response.json() as any;
    if (!response.ok) {
      return new Response(JSON.stringify({ error: `GitHub: ${data.message || response.status}`, url: githubUrl }), { 
        status: response.status,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const result = Array.isArray(data) ? data : [data];

    // 2. Update D1 Metadata if it's a file
    if (env.potato_d1 && !Array.isArray(data) && data.type === 'file') {
        try {
            await env.potato_d1.prepare(`
                INSERT INTO posts (id, repo, path, filename, branch, hash, last_sync)
                VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
                ON CONFLICT(repo, path, filename) DO UPDATE SET
                    hash=excluded.hash,
                    last_sync=excluded.last_sync
            `).bind(`${repo}/${path}/${data.name}`, repo, path, data.name, branch, data.sha).run();
        } catch (e) {
            console.error("D1 Update Error:", e);
        }
    }

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'X-Cache': 'MISS' }
    });
  } catch (err: unknown) {
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : 'Unknown error', url: githubUrl }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};