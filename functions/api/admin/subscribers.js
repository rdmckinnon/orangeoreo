// Admin API - List all subscribers
// Password protected via ADMIN_PASSWORD env var

export async function onRequestPost(context) {
  const { request, env } = context;

  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
  };

  try {
    const { password } = await request.json();

    // Check password against env var
    if (!env.ADMIN_PASSWORD || password !== env.ADMIN_PASSWORD) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid password' }),
        { status: 401, headers }
      );
    }

    // List all keys from KV
    const list = await env.SUBSCRIBERS.list();

    // Fetch full data for each subscriber
    const subscribers = await Promise.all(
      list.keys.map(async (key) => {
        const data = await env.SUBSCRIBERS.get(key.name, { type: 'json' });
        return data || { email: key.name };
      })
    );

    // Sort by date, newest first
    subscribers.sort((a, b) =>
      new Date(b.subscribedAt || 0) - new Date(a.subscribedAt || 0)
    );

    return new Response(
      JSON.stringify({ success: true, subscribers, count: subscribers.length }),
      { status: 200, headers }
    );

  } catch (err) {
    return new Response(
      JSON.stringify({ success: false, error: 'Failed to fetch subscribers' }),
      { status: 500, headers }
    );
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
