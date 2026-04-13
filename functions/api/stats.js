import { corsHeaders, preflightResponse } from './_shared.js';

export async function onRequestGet(context) {
  const headers = corsHeaders(context.request, 'GET, OPTIONS');

  try {
    const list = await context.env.SUBSCRIBERS.list();
    // Count only email subscribers (exclude prefixed keys)
    const count = list.keys.filter(k =>
      !k.name.startsWith('ticket:') &&
      !k.name.startsWith('guestbook:') &&
      !k.name.startsWith('ratelimit:') &&
      !k.name.startsWith('quiz:')
    ).length;

    return new Response(JSON.stringify({ count }), { headers });
  } catch (e) {
    return new Response(JSON.stringify({ count: 0 }), { headers });
  }
}

export async function onRequestOptions(context) {
  return preflightResponse(context.request, 'GET, OPTIONS');
}
