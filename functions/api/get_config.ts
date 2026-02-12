interface Env {
  potato_kv: {
    get: (key: string) => Promise<string | null>;
  };
}

export const onRequest = async (context: { env: Env }) => {
  const { env } = context;
  if (!env.potato_kv) return new Response(JSON.stringify({ error: 'KV not bound' }), { status: 500 });

  const configStr = await env.potato_kv.get('config');
  if (!configStr) return new Response(JSON.stringify({}), { status: 200 });

  const config = JSON.parse(configStr);
  
  // NEVER return the PAT to the client
  if (config.pat) {
    delete config.pat;
  }
  // Also remove password/hash just in case
  if (config.password) delete config.password;
  if (config.passwordHash) delete config.passwordHash;

  return new Response(JSON.stringify(config), {
    headers: { 'Content-Type': 'application/json' }
  });
};