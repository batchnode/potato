interface Env {
  potato_kv: {
    get: (key: string) => Promise<string | null>;
    put: (key: string, value: string) => Promise<void>;
    delete: (key: string) => Promise<void>;
  };
  potato_d1: D1Database;
}

export const onRequest = async (context: { request: Request; env: Env }) => {
  const { request, env } = context;
  const url = new URL(request.url);
  const method = request.method;

  if (!env.potato_kv || !env.potato_d1) {
      return new Response(JSON.stringify({ error: 'Storage binding missing (KV or D1)' }), { status: 500 });
  }

  // Helper to get user ID
  const rawUserId = request.headers.get('x-user-id') || 'anonymous';
  const userId = rawUserId.toLowerCase().trim();

  if (method === 'GET') {
    const kvPath = url.searchParams.get('path'); // ID
    
    // 1. Fetch Single Item Content (From KV)
    if (kvPath) {
        const content = await env.potato_kv.get(kvPath);
        if (!content) return new Response("Not found", { status: 404 });
        return new Response(JSON.stringify({ content, id: kvPath }), {
            headers: { 'Content-Type': 'application/json' }
        });
    }

    // 2. List Items (From D1 Metadata)
    const type = url.searchParams.get('type') || 'draft';
    let status = 'private_draft';
    if (type === 'pending') status = 'pending_review';

    try {
        // For drafts, user only sees their own. For pending, logic might differ (e.g. Admins see all), 
        // but for now let's stick to the requested behavior or basic filtering.
        // Actually, "Pending Review" should probably be visible to Admins regardless of author.
        // But let's assume the frontend filters or we filter by author for "My Drafts".
        
        let query = "SELECT * FROM content_metadata WHERE status = ?";
        let params: any[] = [status];

        // If listing 'draft' (private), strictly filter by author
        if (status === 'private_draft') {
            query += " AND author_email = ?";
            params.push(userId);
        }
        // If 'pending_review', maybe allow all if Admin? 
        // For simplicity/safety now: Filter by author if x-user-id provided, 
        // unless we want a global list. 
        // Let's implement: If type is pending, show ALL (Collaboration). 
        // If type is draft, show MINE.
        
        // Wait, the previous logic filtered pending by user too. Let's keep it broad for pending
        // so Admins can see it. But Editors should only see theirs?
        // Let's rely on the frontend to filter "My Drafts" vs "Review Queue".
        // Actually, simpler:
        // Drafts = My Private Drafts.
        // Pending = All Pending Items (Public Queue).
        
        if (status === 'private_draft') {
             // Already added AND author_email = ?
        } 

        const { results } = await env.potato_d1.prepare(query).bind(...params).all();
        
        // Map back to frontend expected format
        const items = results.map((row: any) => ({
            id: row.id,
            filename: row.filename,
            type: type,
            author_id: row.author_email,
            last_modified: row.last_modified
        }));

        return new Response(JSON.stringify(items), { headers: { 'Content-Type': 'application/json' } });

    } catch (e: any) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
  }

  if (method === 'POST') {
    const body = await request.json() as any;
    const { filename, content, type = 'draft', repo } = body;
    // content is the full markdown
    
    // Status Mapping
    const status = type === 'pending' ? 'pending_review' : 'private_draft';
    
    // Construct ID (KV Key)
    // Legacy format: type:email:filename. New format: same to keep KV organized.
    const id = `${type}:${userId}:${filename}`;
    
    try {
        // 1. Write Content to KV
        await env.potato_kv.put(id, content);
        
        // 2. Write Metadata to D1
        await env.potato_d1.prepare(`
            INSERT INTO content_metadata (id, filename, author_email, repo, status, last_modified)
            VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
            ON CONFLICT(id) DO UPDATE SET
                status=excluded.status,
                last_modified=CURRENT_TIMESTAMP
        `).bind(id, filename, userId, repo, status).run();

        return new Response(JSON.stringify({ success: true, path: id }), { status: 200 });
    } catch (e: any) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
  }

  if (method === 'DELETE') {
    const id = url.searchParams.get('path');
    if (!id) return new Response("Missing path", { status: 400 });

    try {
        await env.potato_kv.delete(id);
        await env.potato_d1.prepare("DELETE FROM content_metadata WHERE id = ?").bind(id).run();
        return new Response(JSON.stringify({ success: true }), { status: 200 });
    } catch (e: any) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
  }

  return new Response("Method not allowed", { status: 405 });
};
