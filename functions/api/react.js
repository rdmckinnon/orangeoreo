export async function onRequestPost(context) {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
  };

  try {
    const body = await context.request.json();
    const { id } = body;

    if (!id || !id.startsWith('guestbook:')) {
      return new Response(JSON.stringify({ error: 'Invalid message ID' }), { status: 400, headers });
    }

    const value = await context.env.SUBSCRIBERS.get(id);
    if (!value) {
      return new Response(JSON.stringify({ error: 'Message not found' }), { status: 404, headers });
    }

    const msg = JSON.parse(value);
    msg.reactions = (msg.reactions || 0) + 1;

    await context.env.SUBSCRIBERS.put(id, JSON.stringify(msg));

    return new Response(JSON.stringify({ success: true, reactions: msg.reactions }), { headers });
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Something went wrong' }), { status: 500, headers });
  }
}
