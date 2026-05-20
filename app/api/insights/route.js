import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req) {
  try {
    const { prompt } = await req.json();
    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 300,
      messages: [{ role: 'user', content: prompt }],
    });
    return Response.json({ insight: message.content[0].text });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}

