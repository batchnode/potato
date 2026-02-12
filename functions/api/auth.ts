import { comparePassword, createToken, hashPassword } from './_utils';

interface Env {
  potato_kv: {
    get: (key: string) => Promise<string | null>;
    put: (key: string, value: string) => Promise<void>;
  };
  potato_d1: D1Database;
}

export const onRequest = async (context: { request: Request; env: Env }) => {
  const { request, env } = context;

  // We need at least one storage mechanism
  if (!env.potato_kv && !env.potato_d1) return new Response(JSON.stringify({ error: 'Storage not bound' }), { status: 500 });

  try {
    const { email, password } = await request.json() as Record<string, string>;

    // 1. Root Admin Authentication (KV Config Source of Truth for Root)
    // This allows recovery if D1 is wiped or broken
    if (env.potato_kv) {
        const configStr = await env.potato_kv.get('config');
        const config = configStr ? JSON.parse(configStr) : null;
        
        // Factory Default Setup Mode
        if (!config || !config.email) {
          if (email === 'admin@admin.com' && password === 'admin') {
            const token = await createToken({ email, role: 'Administrator', isAdmin: true, isSetupMode: true });
            return new Response(JSON.stringify({ 
              success: true,
              user: { email, role: 'Administrator', isAdmin: true, isSetupMode: true } 
            }), { 
              status: 200,
              headers: { 
                'Content-Type': 'application/json',
                'Set-Cookie': `session_token=${token}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=86400`
              }
            });
          }
        }

        // Check Root Admin
        if (config && email === config.email) {
          let isAuthenticated = false;
          let shouldMigrate = false;

          if (config.passwordHash) {
            isAuthenticated = await comparePassword(password, config.passwordHash);
          } else if (config.password) {
            if (password === config.password) {
              isAuthenticated = true;
              shouldMigrate = true;
            }
          }

          if (isAuthenticated) {
            if (shouldMigrate) {
              config.passwordHash = await hashPassword(password);
              delete config.password;
              await env.potato_kv.put('config', JSON.stringify(config));
            }

            const token = await createToken({ email, role: 'Administrator', isAdmin: true });
            return new Response(JSON.stringify({
              success: true,
              user: { email, role: 'Administrator', isAdmin: true }
            }), {
              status: 200,
              headers: { 
                'Content-Type': 'application/json',
                'Set-Cookie': `session_token=${token}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=86400`
              }
            });
          }
        }
    }

    // 2. Editor/User Authentication (D1 Source of Truth)
    if (env.potato_d1) {
        const user = await env.potato_d1.prepare('SELECT * FROM users WHERE email = ?').bind(email).first();
        
        if (user && user.password_hash) {
            const isValid = await comparePassword(password, user.password_hash as string);
            
            if (isValid) {
                const sessionUser = {
                    email: user.email,
                    role: user.role,
                    // Map permissions
                    canDelete: user.can_delete === 1,
                    canEditPublished: user.can_publish === 1,
                    requireReview: user.role !== 'Administrator',
                    isAdmin: user.role === 'Administrator'
                };

                const token = await createToken(sessionUser);
                return new Response(JSON.stringify({
                    success: true,
                    user: sessionUser
                }), {
                    status: 200,
                    headers: { 
                        'Content-Type': 'application/json',
                        'Set-Cookie': `session_token=${token}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=86400`
                    }
                });
            }
        }
    }

    return new Response(JSON.stringify({ error: 'Invalid credentials' }), { status: 401 });
  } catch (err: unknown) {
    return new Response(JSON.stringify({ error: 'Authentication failed' }), { status: 500 });
  }
};
