import { verifyToken, getCookie } from './_utils';

interface Env {
  potato_kv: KVNamespace;
}

const PUBLIC_PATHS = [
  '/api/auth',
  '/api/health',
  '/api/status',
  '/api/initialize_engine' // Assuming this is needed for boot, or we can protect it?
];

export const onRequest = async (context: { request: Request; env: Env; next: () => Promise<Response>; data: any }) => {
  const { request, env, next, data } = context;
  const url = new URL(request.url);
  
  // 1. Allow Public Paths
  if (PUBLIC_PATHS.some(path => url.pathname.startsWith(path))) {
    return next();
  }

  // 2. Handle /api/setup Special Case
  if (url.pathname === '/api/setup') {
    if (request.method === 'GET') return next(); // Status check is public
    
    // For POST, check if system is already configured
    if (request.method === 'POST') {
        const configStr = await env.potato_kv.get('config');
        if (!configStr) {
          // Not configured -> Allow access (First time setup)
          return next();
        }
    }
    
    // If configured (or DELETE), fall through to Auth check
  }

  // 3. Authentication Check
  const token = getCookie(request, 'session_token');
  if (!token) {
    return new Response(JSON.stringify({ error: 'Unauthorized: No session' }), { 
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const payload = await verifyToken(token);
  if (!payload) {
    return new Response(JSON.stringify({ error: 'Unauthorized: Invalid token' }), { 
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // Attach user to context for downstream functions
  data.user = payload;

  return next();
};
