interface Env {
  potato_kv: {
    get: (key: string) => Promise<string | null>;
  };
}

export const onRequest = async (context: { env: Env }) => {
  const { env } = context;
  if (!env.potato_kv) return new Response(JSON.stringify({ error: 'KV not bound' }), { status: 500 });

  const configStr = await env.potato_kv.get('config');
  if (!configStr) return new Response(JSON.stringify({ error: 'Not configured' }), { status: 404 });
  const config = JSON.parse(configStr);

  try {
    const [userRes, rateRes] = await Promise.all([
      fetch('https://api.github.com/user', {
        headers: {
          'Authorization': `Bearer ${config.pat.trim()}`,
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'Potato-CMS'
        }
      }),
      fetch('https://api.github.com/rate_limit', {
        headers: {
          'Authorization': `Bearer ${config.pat.trim()}`,
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'Potato-CMS'
        }
      })
    ]);

    const userData = await userRes.json();
    const rateData = await rateRes.json();

    // Headers are case-insensitive in .get()
    const rawScopes = userRes.headers.get('x-oauth-scopes');
    
    // If x-oauth-scopes is missing but the request succeeded, it's a Fine-grained PAT
    const scopes = rawScopes ? rawScopes : (userRes.ok ? 'Fine-grained (Permissions managed per-repo)' : 'none');
    
    return new Response(JSON.stringify({
      valid: userRes.ok,
      username: userData.login || 'Unknown',
      scopes: scopes,
      rateLimit: rateData.resources.core,
      tokenType: rawScopes ? 'Classic' : 'Fine-grained'
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err: unknown) {
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : 'Unknown error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};