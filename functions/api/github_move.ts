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
    const { repo, branch, filename, sourceDir, targetDir, message } = await request.json() as Record<string, string>;

    // 1. Get content from Source
    const getUrl = `https://api.github.com/repos/${repo}/contents/${sourceDir}/${filename}?ref=${branch}`;
    const getRes = await fetch(getUrl, {
      headers: { 
        'Authorization': `Bearer ${pat.trim()}`, 
        'Accept': 'application/vnd.github.v3+json', 
        'User-Agent': 'Potato-CMS' 
      }
    });

    if (!getRes.ok) {
      const errorData = await getRes.json().catch(() => ({})) as { message?: string };
      throw new Error(errorData.message || "Could not fetch source content");
    }
    const fileData = await getRes.json() as { content: string; sha: string };

    // 2. Create in Target
    const putUrl = `https://api.github.com/repos/${repo}/contents/${targetDir}/${filename}`;
    const putRes = await fetch(putUrl, {
      method: 'PUT',
      headers: { 
        'Authorization': `Bearer ${pat.trim()}`, 
        'Accept': 'application/vnd.github.v3+json', 
        'User-Agent': 'Potato-CMS' 
      },
      body: JSON.stringify({
        message: message || `Move ${filename} to ${targetDir}`,
        content: fileData.content, // reuse base64 content
        branch: branch
      })
    });

    if (!putRes.ok) {
      const errorData = await putRes.json().catch(() => ({})) as { message?: string };
      throw new Error(errorData.message || "Failed to create target file");
    }

    // 3. Delete from Source
    const delUrl = `https://api.github.com/repos/${repo}/contents/${sourceDir}/${filename}`;
    const delRes = await fetch(delUrl, {
      method: 'DELETE',
      headers: { 
        'Authorization': `Bearer ${pat.trim()}`, 
        'Accept': 'application/vnd.github.v3+json', 
        'User-Agent': 'Potato-CMS' 
      },
      body: JSON.stringify({
        message: message ? `Cleanup after: ${message}` : `Cleanup after move: ${filename}`,
        sha: fileData.sha,
        branch: branch
      })
    });

    if (!delRes.ok) {
      const errorData = await delRes.json().catch(() => ({})) as { message?: string };
      throw new Error(errorData.message || "Published but failed to delete draft");
    }

    return new Response(JSON.stringify({ success: true }), { 
      headers: { 'Content-Type': 'application/json' } 
    });

  } catch (err: unknown) {
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : 'Unknown error' }), { 
      status: 500, 
      headers: { 'Content-Type': 'application/json' } 
    });
  }
};
