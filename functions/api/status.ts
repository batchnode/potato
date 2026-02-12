interface Env {
  potato_kv: {
    get: (key: string) => Promise<string | null>;
  };
}

export const onRequest = async (context: { env: Env }) => {
  const { env } = context;
  
  if (!env.potato_kv) {
    return new Response(JSON.stringify({ 
      configured: false, 
      error: 'Database not bound' 
    }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const isSetup = await env.potato_kv.get('setup_complete');

  return new Response(JSON.stringify({ 
    configured: isSetup === 'true' 
  }), {
    headers: { 'Content-Type': 'application/json' }
  });
};
