interface Env {
  potato_kv: {
    put: (key: string, value: string) => Promise<void>;
    get: (key: string) => Promise<string | null>;
  };
  potato_d1: D1Database;
}

export const onRequestPost = async (context: { request: Request; env: Env }) => {
  const { env } = context;

  if (!env.potato_d1) return new Response(JSON.stringify({ error: 'potato_d1 not bound' }), { status: 500 });

  const steps = [
    { 
      name: 'users', 
      sql: `CREATE TABLE IF NOT EXISTS users (email TEXT PRIMARY KEY, password_hash TEXT, role TEXT DEFAULT 'Editor', can_publish BOOLEAN DEFAULT 0, can_delete BOOLEAN DEFAULT 0, allowed_paths JSON, joined_at DATETIME DEFAULT CURRENT_TIMESTAMP);` 
    },
    { 
      name: 'user_prefs', 
      sql: `CREATE TABLE IF NOT EXISTS user_prefs (user_email TEXT PRIMARY KEY, theme TEXT DEFAULT 'default', last_login DATETIME, FOREIGN KEY(user_email) REFERENCES users(email) ON DELETE CASCADE);` 
    },
    { 
      name: 'content_metadata', 
      sql: `CREATE TABLE IF NOT EXISTS content_metadata (id TEXT PRIMARY KEY, filename TEXT NOT NULL, author_email TEXT NOT NULL, repo TEXT, status TEXT NOT NULL, last_modified DATETIME DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY(author_email) REFERENCES users(email) ON DELETE CASCADE);` 
    },
    { 
      name: 'posts', 
      sql: `CREATE TABLE IF NOT EXISTS posts (id TEXT PRIMARY KEY, repo TEXT NOT NULL, path TEXT NOT NULL, filename TEXT NOT NULL, branch TEXT NOT NULL DEFAULT 'main', status TEXT NOT NULL DEFAULT 'published', hash TEXT, last_sync DATETIME DEFAULT CURRENT_TIMESTAMP, UNIQUE(repo, path, filename));` 
    },
    { 
      name: 'media', 
      sql: `CREATE TABLE IF NOT EXISTS media (id TEXT PRIMARY KEY, repo TEXT NOT NULL, path TEXT NOT NULL, filename TEXT NOT NULL, branch TEXT NOT NULL DEFAULT 'main', type TEXT, size INTEGER, hash TEXT, last_sync DATETIME DEFAULT CURRENT_TIMESTAMP, UNIQUE(repo, path, filename));` 
    }
  ];

  try {
    const results = [];
    for (const step of steps) {
      await env.potato_d1.prepare(step.sql).run();
      results.push({ name: step.name, status: 'success' });
    }

    // Attempt to seed the admin user from KV config
    const configStr = await env.potato_kv.get('config');
    if (configStr) {
        const config = JSON.parse(configStr);
        if (config.email) {
            await env.potato_d1.prepare(`
                INSERT INTO users (email, role, can_publish, can_delete)
                VALUES (?, 'Administrator', 1, 1)
                ON CONFLICT(email) DO NOTHING
            `).bind(config.email).run();
            results.push({ name: 'Admin Account', status: 'success' });
        }
    }

    // Mark setup as complete
    await env.potato_kv.put('setup_complete', 'true');

    return new Response(JSON.stringify({ success: true, results }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};
