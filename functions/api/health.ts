export const onRequest = async () => {
  return new Response(JSON.stringify({ status: 'Potato is alive' }), {
    headers: { 'Content-Type': 'application/json' }
  });
};
