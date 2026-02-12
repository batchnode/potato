interface Env {
  potato_kv: {
    get: (key: string) => Promise<string | null>;
    put: (key: string, value: string) => Promise<void>;
    delete: (key: string) => Promise<void>;
  };
  potato_d1: D1Database;
}

export const onRequestGet = async (context: { request: Request; env: Env }) => {
  const { request, env } = context;

    const url = new URL(request.url);
    const email = url.searchParams.get('email');
    if (!email) return new Response(JSON.stringify({ error: 'Email required' }), { status: 400 });

    const prefsStr = await env.potato_kv.get(`prefs:${email}`);
    const prefs = prefsStr ? JSON.parse(prefsStr) : { theme: 'default' };

    return new Response(JSON.stringify(prefs), { status: 200 });
};

export const onRequestPost = async (context: { request: Request; env: Env }) => {
  const { request, env } = context;
    const data = await request.json();
    const { email, currentPassword, newPassword, newEmail, theme } = data;

    if (!email) return new Response(JSON.stringify({ error: 'Email required' }), { status: 400 });

    // 1. Handle Theme Only - No password check required for theme
    if (theme && !newPassword && !newEmail) {
        const existingPrefs = await env.potato_kv.get(`prefs:${email}`);
        const prefs = existingPrefs ? JSON.parse(existingPrefs) : { theme: 'default' };
        prefs.theme = theme;
        await env.potato_kv.put(`prefs:${email}`, JSON.stringify(prefs));
        return new Response(JSON.stringify({ success: true }), { status: 200 });
    }

    // 2. Handle Profile Update (requires password check)
    const configStr = await env.potato_kv.get('config');
    if (!configStr) return new Response(JSON.stringify({ error: 'Not configured' }), { status: 500 });
    const config = JSON.parse(configStr);

    const isTargetAdmin = email === config.email;
    let targetUser: any = null;

    if (isTargetAdmin) {
        if (currentPassword !== config.password) return new Response(JSON.stringify({ error: 'Invalid current password' }), { status: 401 });
        targetUser = config;
    } else {
        const editorsStr = await env.potato_kv.get('editors');
        const editors = editorsStr ? (JSON.parse(editorsStr) as any[]) : [];
        const editorIndex = editors.findIndex((e) => e.email === email);
        if (editorIndex === -1) return new Response(JSON.stringify({ error: 'User not found' }), { status: 404 });
        if (currentPassword !== editors[editorIndex].password) return new Response(JSON.stringify({ error: 'Invalid current password' }), { status: 401 });
        targetUser = editors[editorIndex];
    }

    // Apply changes
    if (newEmail) {
        // If email changes, migrate preferences
        const oldPrefs = await env.potato_kv.get(`prefs:${email}`);
        if (oldPrefs) {
            await env.potato_kv.put(`prefs:${newEmail}`, oldPrefs);
            await env.potato_kv.delete(`prefs:${email}`);
        }
        targetUser.email = newEmail;
    }
    if (newPassword) targetUser.password = newPassword;
    if (theme) {
        const existingPrefs = await env.potato_kv.get(`prefs:${newEmail || email}`);
        const prefs = existingPrefs ? JSON.parse(existingPrefs) : { theme: 'default' };
        prefs.theme = theme;
        await env.potato_kv.put(`prefs:${newEmail || email}`, JSON.stringify(prefs));
    }

    // Save back to KV
    if (isTargetAdmin) {
        await env.potato_kv.put('config', JSON.stringify({ ...config, ...targetUser }));
    } else {
        const editorsStr = await env.potato_kv.get('editors');
        const editors = editorsStr ? (JSON.parse(editorsStr) as any[]) : [];
        const editorIndex = editors.findIndex((e) => e.email === email);
        editors[editorIndex] = { ...editors[editorIndex], ...targetUser };
        await env.potato_kv.put('editors', JSON.stringify(editors));
    }

    return new Response(JSON.stringify({ success: true, user: targetUser }), { status: 200 });
};
