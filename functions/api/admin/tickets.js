// Admin API - List all ticket requests
// Password protected via ADMIN_PASSWORD env var

export async function onRequestPost(context) {
  const { request, env } = context;

  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
  };

  try {
    const { password } = await request.json();

    // Check password
    if (!env.ADMIN_PASSWORD || password !== env.ADMIN_PASSWORD) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid password' }),
        { status: 401, headers }
      );
    }

    // List all keys with ticket: prefix
    const list = await env.SUBSCRIBERS.list({ prefix: 'ticket:' });

    // Fetch full data for each ticket
    const tickets = await Promise.all(
      list.keys.map(async (key) => {
        const data = await env.SUBSCRIBERS.get(key.name, { type: 'json' });
        return data;
      })
    );

    // Sort by date, newest first
    tickets.sort((a, b) =>
      new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
    );

    return new Response(
      JSON.stringify({ success: true, tickets, count: tickets.length }),
      { status: 200, headers }
    );

  } catch (err) {
    return new Response(
      JSON.stringify({ success: false, error: 'Failed to fetch tickets' }),
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
