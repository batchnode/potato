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
  const branch = url.searchParams.get('branch') || 'main';

  if (!repo || !path) {
    return new Response("Missing parameters", { status: 400 });
  }

  // 1. Check D1 for existing metadata (optional, helps with performance if we had a full CDN)
  // For now, we'll just log/track it if D1 is available

  let pat: string | null = null;
  if (env.potato_kv) {
    const configStr = await env.potato_kv.get('config');
    if (configStr) {
      const config = JSON.parse(configStr);
      pat = config.pat;
    }
  }

  if (!pat || pat.includes('****')) {
    pat = request.headers.get('x-github-token');
  }

  if (!pat) return new Response("Unauthorized", { status: 401 });

  const githubUrl = `https://api.github.com/repos/${repo}/contents/${path}?ref=${branch}`;

  try {
    const response = await fetch(githubUrl, {
      headers: {
        'Authorization': `Bearer ${pat.trim()}`,
        'Accept': 'application/vnd.github.v3.raw', // Request raw binary data
        'User-Agent': 'Potato-CMS'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[MEDIA PROXY] GitHub Error ${response.status}: ${errorText}`);
      return new Response(`GitHub Error: ${response.status}`, { status: response.status });
    }

    // Forward the data with correct content type
    const contentType = response.headers.get('content-type') || 'application/octet-stream';
    const blob = await response.arrayBuffer();

    // 2. Update D1 Media Cache
    if (env.potato_d1) {
        const filename = path.split('/').pop() || 'unknown';
        const dirPath = path.split('/').slice(0, -1).join('/');
        await env.potato_d1.prepare(`
            INSERT INTO media (id, repo, path, filename, branch, type, size, last_sync)
            VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
            ON CONFLICT(repo, path, filename) DO UPDATE SET
                type=excluded.type,
                size=excluded.size,
                last_sync=excluded.last_sync
        `).bind(`${repo}/${path}`, repo, dirPath, filename, branch, contentType, blob.byteLength).run();
    }

    return new Response(blob, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=3600'
      }
    });
  } catch (err: unknown) {
    console.error(`[MEDIA PROXY] Internal Error: ${err instanceof Error ? err.message : 'Unknown'}`);
    return new Response("Internal Server Error", { status: 500 });
  }
};
