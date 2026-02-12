import { hashPassword } from './_utils';

interface Env {
  potato_kv: {
    put: (key: string, value: string) => Promise<void>;
    delete: (key: string) => Promise<void>;
    get: (key: string) => Promise<string | null>;
    list: () => Promise<{ keys: { name: string }[] }>;
  };
  potato_d1: D1Database;
}

export const onRequest = async ({ request, env }: { request: Request; env: Env }) => {
  if (!env.potato_kv) {
    return new Response(JSON.stringify({ error: 'KV Namespace "potato_kv" not bound' }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const data = await request.json() as any;
    
    // Get existing config to merge
    const existingConfigStr = await env.potato_kv.get('config');
    const existingConfig = existingConfigStr ? JSON.parse(existingConfigStr) : {};
    
    // Handle Password Hashing
    if (data.password) {
      data.passwordHash = await hashPassword(data.password);
      delete data.password; // Never store plain password
    }

    // Merge existing config with new data
    // If pat is undefined in new data (authentication mask), keep existing pat
    const newConfig = { ...existingConfig, ...data };
    
    // Store the merged config in KV
    await env.potato_kv.put('config', JSON.stringify(newConfig));

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const onRequestDelete = async (context: { request: Request; env: Env }) => {
  const { request, env } = context;
  if (!env.potato_kv) return new Response(JSON.stringify({ error: 'KV not bound' }), { status: 500 });

  const url = new URL(request.url);
  const scope = url.searchParams.get('scope');

  try {
    // 1. Clear D1 Database
    if (env.potato_d1) {
        const tables = ['users', 'user_prefs', 'content_metadata', 'posts', 'media', 'work_in_progress'];
        for (const table of tables) {
            await env.potato_d1.prepare(`DROP TABLE IF EXISTS ${table}`).run();
        }
    }

    // 2. Clear KV Namespace (Skip if scope is d1_only to preserve Config)
    if (scope !== 'd1_only') {
        const list = await env.potato_kv.list();
        for (const key of list.keys) {
            await env.potato_kv.delete(key.name);
        }
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};