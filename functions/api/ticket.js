// Cloudflare Pages Function - Ticket Generation Tracking
// Stores ticket requests in KV

export async function onRequestPost(context) {
  const { request, env } = context;

  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
  };

  try {
    const data = await request.json();
    const { name, date, doors, section, seat } = data;

    // Basic validation
    if (!name || !date) {
      return new Response(
        JSON.stringify({ success: false, error: 'Name and date required' }),
        { status: 400, headers }
      );
    }

    // Generate ticket ID
    const ticketId = `OO-2026-${Date.now().toString(36).toUpperCase()}`;

    // Store in KV with ticket ID as key
    const ticketData = {
      ticketId,
      name: name.trim(),
      date,
      doors: doors || '7:00 PM',
      section: section || 'GA',
      seat: seat || '-',
      createdAt: new Date().toISOString(),
      status: 'requested'
    };

    await env.SUBSCRIBERS.put(`ticket:${ticketId}`, JSON.stringify(ticketData));

    return new Response(
      JSON.stringify({ success: true, ticketId, message: 'Ticket request saved!' }),
      { status: 200, headers }
    );

  } catch (err) {
    return new Response(
      JSON.stringify({ success: false, error: 'Something went wrong' }),
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
