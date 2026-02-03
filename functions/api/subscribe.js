// Cloudflare Pages Function - Email Subscription
// Stores emails in Cloudflare KV

export async function onRequestPost(context) {
  const { request, env } = context;

  // CORS headers
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
  };

  try {
    const { email } = await request.json();

    // Basic validation
    if (!email || !email.includes('@')) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid email' }),
        { status: 400, headers }
      );
    }

    // Normalize email
    const normalizedEmail = email.toLowerCase().trim();

    // Store in KV with timestamp
    // Key: email, Value: JSON with metadata
    await env.SUBSCRIBERS.put(normalizedEmail, JSON.stringify({
      email: normalizedEmail,
      subscribedAt: new Date().toISOString(),
      source: 'website'
    }));

    return new Response(
      JSON.stringify({ success: true, message: 'Welcome to the crew!' }),
      { status: 200, headers }
    );

  } catch (err) {
    return new Response(
      JSON.stringify({ success: false, error: 'Something went wrong' }),
      { status: 500, headers }
    );
  }
}

// Handle preflight
export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
