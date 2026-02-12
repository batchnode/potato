import { hashPassword } from './_utils';

interface Env {
  potato_d1: D1Database;
}

export const onRequestGet = async (context: { env: Env }) => {
    const { env } = context;
    
    if (!env.potato_d1) {
        return new Response(JSON.stringify({ error: 'Database not bound' }), { status: 500 });
    }

    try {
        const { results } = await env.potato_d1.prepare("SELECT * FROM users").all();
        
        // Transform back to frontend expected format if needed, or update frontend types later.
        // For now, let's return raw rows, frontend might need minor adjustment or we map it here.
        // Mapping to match current frontend expected 'Editor' type:
        const mappedUsers = results.map((u: any) => ({
            id: u.email, // Use email as ID
            email: u.email,
            role: u.role,
            joined: u.joined_at,
            // Reconstruct permissions object
            canDelete: u.can_delete === 1,
            canEditPublished: u.can_publish === 1, // Mapping can_publish to canEditPublished for now
            requireReview: u.role !== 'Administrator' // Implicit rule
        }));

        return new Response(JSON.stringify(mappedUsers), {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (e: any) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
};

export const onRequestPost = async (context: { request: Request; env: Env }) => {
  const { request, env } = context;

    if (!env.potato_d1) {
        return new Response(JSON.stringify({ error: 'Database not bound' }), { status: 500 });
    }

    try {
      const editors = await request.json() as any[];
      
      const stmt = env.potato_d1.prepare(`
          INSERT INTO users (email, role, can_publish, can_delete, password_hash) 
          VALUES (?, ?, ?, ?, ?)
          ON CONFLICT(email) DO UPDATE SET 
            role=excluded.role, 
            can_publish=excluded.can_publish,
            can_delete=excluded.can_delete,
            password_hash=COALESCE(excluded.password_hash, users.password_hash)
      `);

      const batch = await Promise.all(editors.map(async (editor: any) => {
          // Flatten permissions object to columns
          const canPublish = editor.canEditPublished ? 1 : 0;
          const canDelete = editor.canDelete ? 1 : 0;
          let pwdHash = null;
          if (editor.password) {
              pwdHash = await hashPassword(editor.password);
          }
          
          return stmt.bind(editor.email, editor.role, canPublish, canDelete, pwdHash);
      }));

      await env.potato_d1.batch(batch);
      return new Response(JSON.stringify({ success: true }), { status: 200 });

    } catch (e: any) {
      console.error('D1 POST error:', e);
      return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
};

export const onRequestDelete = async (context: { request: Request; env: Env }) => {
  const { request, env } = context;
  const url = new URL(request.url);
  const email = url.searchParams.get('id'); // Frontend sends 'id' which maps to email

  if (!env.potato_d1) return new Response(JSON.stringify({ error: 'Database not bound' }), { status: 500 });
  if (!email) return new Response(JSON.stringify({ error: 'Missing ID' }), { status: 400 });

  try {
    await env.potato_d1.prepare("DELETE FROM users WHERE email = ?").bind(email).run();
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
};
