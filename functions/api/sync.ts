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
  
  if (!env.potato_d1) return new Response(JSON.stringify({ error: 'potato_d1 not bound' }), { status: 500 });

  const pat = await getPat(env);
  if (!pat) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });

  const userId = request.headers.get('x-user-id') || 'system';

  try {
    const { repo, path, branch = 'main', migrate_wip } = await request.json() as { repo: string; path: string; branch: string; migrate_wip?: boolean };
    const isWIP = path === '_drafts' || path === '_review';
    const wipType = path === '_drafts' ? 'draft' : 'pending';
    
    if (isWIP && !migrate_wip) {
        // We no longer sync WIP from GitHub by default as they now live exclusively in KV
        return new Response(JSON.stringify({ success: true, message: 'WIP folders are now local-only' }));
    }

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
      if (response.status === 404) return new Response(JSON.stringify({ success: true, results: { updated: 0, skipped: 0, removed: 0 }, message: 'Path not found on GitHub' }));
      return new Response(JSON.stringify({ error: 'Failed to fetch from GitHub' }), { status: response.status });
    }

    const files = await response.json() as any[];
    const syncResults = { updated: 0, skipped: 0, removed: 0 };

        if (isWIP && migrate_wip) {

            // --- Migration Logic: GitHub -> KV Engine ---

            for (const file of files) {

                if (file.type !== 'file' || file.name === '.keep') continue;

    

                const contentRes = await fetch(file.download_url, {

                    headers: { 'Authorization': `Bearer ${pat.trim()}` }

                });

                if (!contentRes.ok) continue;

    

                const content = await contentRes.text();

                const kvKey = `${wipType}:${userId}:${file.name}`;

    

                await env.potato_kv.put(kvKey, content);

                await env.potato_d1.prepare(`

                    INSERT INTO work_in_progress (id, type, author_id, repo, path, filename, last_modified, mirror_to_github)

                    VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, 0)

                    ON CONFLICT(id) DO UPDATE SET last_modified=CURRENT_TIMESTAMP

                `).bind(kvKey, wipType, userId, repo, path, file.name).run();

    

                syncResults.updated++;

            }

        } else {

            // --- Production Sync Logic ---

            const { results: existingFiles } = await env.potato_d1.prepare(

              "SELECT filename, hash FROM posts WHERE repo = ? AND path = ? AND branch = ?"

            ).bind(repo, path, branch).all();

            

            const existingMap = new Map(existingFiles.map((f: any) => [f.filename, f.hash]));

            const currentFiles = new Set(files.map(f => f.name));

    

            for (const file of files) {

              if (file.type !== 'file') continue;

    

              if (existingMap.has(file.name) && existingMap.get(file.name) === file.sha) {

                syncResults.skipped++;

                continue;

              }

    

              await env.potato_d1.prepare(`

                INSERT INTO posts (id, repo, path, filename, branch, hash, last_sync)

                VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)

                ON CONFLICT(repo, path, filename) DO UPDATE SET

                  hash=excluded.hash,

                  last_sync=excluded.last_sync

              `).bind(`${repo}/${path}/${file.name}`, repo, path, file.name, branch, file.sha).run();

    

              syncResults.updated++;

            }

    

                        // Remove files no longer present

    

                        for (const [filename, _] of existingMap) {

    

                          if (!currentFiles.has(filename)) {

    

                            await env.potato_d1.prepare(

    

                              "DELETE FROM posts WHERE repo = ? AND path = ? AND filename = ?"

    

                            ).bind(repo, path, filename).run();

    

                            syncResults.removed++;

    

                          }

    

                        }

    

                    }

    

            

    

                return new Response(JSON.stringify({ success: true, results: syncResults }), {

    

                  headers: { 'Content-Type': 'application/json' }

    

                });

    

              } catch (err: any) {

    

                return new Response(JSON.stringify({ error: err.message }), { 

    

                  status: 500,

    

                  headers: { 'Content-Type': 'application/json' }

    

                });

    

              }

    

            };

    