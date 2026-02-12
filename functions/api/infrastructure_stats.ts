interface Env {
  potato_kv: {
    list: (options?: { prefix?: string; limit?: number; cursor?: string }) => Promise<{ keys: { name: string }[] }>;
  };
  potato_d1: D1Database;
}

export const onRequest = async (context: { request: Request; env: Env }) => {
  const { env } = context;

  try {
    // 1. Fetch D1 Stats (Count rows in posts table)
    let d1Count = 0;
    if (env.potato_d1) {
      const { results } = await env.potato_d1.prepare("SELECT COUNT(*) as count FROM posts").all();
      d1Count = (results[0] as any).count;
    }

    // 2. Fetch KV Stats (Count all keys)
    // Note: This only counts up to 1000 keys for performance, but usually enough for drafts/configs
    let kvCount = 0;
    if (env.potato_kv) {
      const kvList = await env.potato_kv.list();
      kvCount = kvList.keys.length;
    }

    return new Response(JSON.stringify({
      d1_sync_count: d1Count,
      kv_keys_count: kvCount,
      timestamp: new Date().toISOString()
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};
