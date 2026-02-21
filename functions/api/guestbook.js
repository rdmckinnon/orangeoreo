export async function onRequestPost(context) {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
  };

  try {
    const body = await context.request.json();
    const { name, message } = body;

    if (!name || !name.trim()) {
      return new Response(JSON.stringify({ error: 'Name is required' }), { status: 400, headers });
    }

    if (!message || !message.trim()) {
      return new Response(JSON.stringify({ error: 'Message is required' }), { status: 400, headers });
    }

    // Limit message length
    const cleanName = name.trim().substring(0, 50);
    const cleanMessage = message.trim().substring(0, 280);

    const id = `guestbook:${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

    await context.env.SUBSCRIBERS.put(id, JSON.stringify({
      name: cleanName,
      message: cleanMessage,
      timestamp: new Date().toISOString(),
    }));

    return new Response(JSON.stringify({ success: true }), { headers });
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Something went wrong' }), { status: 500, headers });
  }
}

export async function onRequestGet(context) {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
  };

  try {
    const list = await context.env.SUBSCRIBERS.list({ prefix: 'guestbook:' });
    const messages = [];

    for (const key of list.keys) {
      const value = await context.env.SUBSCRIBERS.get(key.name);
      if (value) {
        try {
          const msg = JSON.parse(value);
          msg.id = key.name;
          messages.push(msg);
        } catch (e) {
          // skip malformed entries
        }
      }
    }

    // Sort newest first
    messages.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    return new Response(JSON.stringify({ messages }), { headers });
  } catch (e) {
    return new Response(JSON.stringify({ messages: [] }), { headers });
  }
}
