export async function onRequestGet(context) {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
  };

  try {
    const list = await context.env.SUBSCRIBERS.list();
    // Count only email subscribers (exclude ticket: and guestbook: prefixed keys)
    const count = list.keys.filter(k => !k.name.startsWith('ticket:') && !k.name.startsWith('guestbook:')).length;

    return new Response(JSON.stringify({ count }), { headers });
  } catch (e) {
    return new Response(JSON.stringify({ count: 0 }), { headers });
  }
}
