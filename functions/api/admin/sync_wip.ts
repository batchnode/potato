interface Env {
  potato_kv: {
    get: (key: string) => Promise<string | null>;
    put: (key: string, value: string) => Promise<void>;
    list: (options?: { prefix?: string }) => Promise<{ keys: { name: string }[] }>;
  };
  potato_d1: D1Database;
}

async function getPat(env: Env) {
  if (env.potato_kv) {
    const configStr = await env.potato_kv.get('config');
    if (configStr) {
      const config = JSON.parse(configStr);
      if (config.pat && !config.pat.includes('****')) return config.pat as string;
    }
  }
  return null;
}

export const onRequestPost = async (context: { request: Request; env: Env }) => {
  const { request, env } = context;
  
  const pat = await getPat(env);
  if (!pat) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });

  const userId = request.headers.get('x-user-id') || 'system';

  try {
    const { repo, branch = 'main', type } = await request.json() as { repo: string; branch: string; type: 'draft' | 'review' };
    const path = type === 'draft' ? '_drafts' : '_review';
    const kvType = type === 'draft' ? 'draft' : 'pending';

    // 1. Fetch contents from GitHub
    const githubUrl = `https://api.github.com/repos/${repo}/contents/${path}?ref=${branch}`;
    const response = await fetch(githubUrl, {
      headers: {
        'Authorization': `Bearer ${pat.trim()}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'Potato-CMS'
      }
    });

    if (!response.ok) {
      if (response.status === 404) return new Response(JSON.stringify({ success: true, count: 0, message: 'Folder not found on GitHub' }));
      return new Response(JSON.stringify({ error: 'Failed to fetch from GitHub' }), { status: response.status });
    }

    const files = await response.json() as any[];
    let count = 0;

    for (const file of files) {
        if (file.type !== 'file' || file.name === '.keep') continue;

        // Check if exists in KV (for this user, or generally?)
        // The requirement says "if available on repo but not on kv". 
        // Since KV is keyed by user, we should probably check if *any* user has it? 
        // Or just import it for the current user (admin/editor triggering this).
        // Let's import it for the current user to ensure they can see it.
        // Or better: Check if it exists for *this* user.
        
        const kvKey = `${kvType}:${userId}:${file.name}`;
        const existing = await env.potato_kv.get(kvKey);

        if (!existing) {
            const contentRes = await fetch(file.download_url, {
                headers: { 'Authorization': `Bearer ${pat.trim()}` }
            });
            
            if (contentRes.ok) {
                const content = await contentRes.text();
                await env.potato_kv.put(kvKey, content);
                
                // Update D1 if available
                if (env.potato_d1) {
                    await env.potato_d1.prepare(`
                        INSERT INTO work_in_progress (id, type, author_id, repo, path, filename, last_modified, mirror_to_github)
                        VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, 0)
                        ON CONFLICT(id) DO UPDATE SET last_modified=CURRENT_TIMESTAMP
                    `).bind(kvKey, kvType, userId, repo, path, file.name).run();
                }
                count++;
            }
        }
    }

    return new Response(JSON.stringify({ success: true, count }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
