import { corsHeaders, preflightResponse, checkRateLimit, rateLimitResponse } from './_shared.js';

export async function onRequestGet(context) {
  const headers = corsHeaders(context.request, 'GET, POST, OPTIONS');

  try {
    const data = await context.env.SUBSCRIBERS.get('quiz:stats', { type: 'json' });
    const stats = data || { total: 0, addy: 0, emma: 0 };
    return new Response(JSON.stringify(stats), { headers });
  } catch (e) {
    return new Response(JSON.stringify({ total: 0, addy: 0, emma: 0 }), { headers });
  }
}

export async function onRequestPost(context) {
  const headers = corsHeaders(context.request);

  try {
    const limit = await checkRateLimit(context.env, context.request, {
      prefix: 'quiz',
      maxRequests: 10,
      windowSeconds: 3600,
    });
    if (!limit.allowed) return rateLimitResponse(limit.retryAfter, headers);

    const body = await context.request.json();
    const { result } = body;

    if (!result || !['addy', 'emma'].includes(result)) {
      return new Response(JSON.stringify({ error: 'Invalid result' }), { status: 400, headers });
    }

    const data = await context.env.SUBSCRIBERS.get('quiz:stats', { type: 'json' });
    const stats = data || { total: 0, addy: 0, emma: 0 };

    stats.total += 1;
    stats[result] += 1;

    await context.env.SUBSCRIBERS.put('quiz:stats', JSON.stringify(stats));

    return new Response(JSON.stringify({ success: true, stats }), { headers });
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Something went wrong' }), { status: 500, headers });
  }
}

export async function onRequestOptions(context) {
  return preflightResponse(context.request, 'GET, POST, OPTIONS');
}
