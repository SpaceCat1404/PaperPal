import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json();
    if (!query) {
      return NextResponse.json({ error: 'Missing query' }, { status: 400 });
    }

    // Use DuckDuckGo Images (unofficial, public endpoint for demo purposes)
    // This is a workaround for demo; for production, use a proper image search API
    const searchUrl = `https://duckduckgo.com/?q=${encodeURIComponent(query)}&iax=images&ia=images`;
    // Get the vqd token required for image search
    const tokenRes = await fetch(searchUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    const tokenHtml = await tokenRes.text();
    const vqdMatch = tokenHtml.match(/vqd='([\d-]+)'/);
    if (!vqdMatch) {
      return NextResponse.json({ images: [] });
    }
    const vqd = vqdMatch[1];
    // Now fetch images JSON
    const imagesRes = await fetch(`https://duckduckgo.com/i.js?l=us-en&o=json&q=${encodeURIComponent(query)}&vqd=${vqd}`, {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    const imagesJson = await imagesRes.json();
    const images = (imagesJson.results || []).slice(0, 6).map((img: any) => img.image);
    return NextResponse.json({ images });
  } catch (e) {
    console.error('Image fetch error:', e);
    return NextResponse.json({ images: [] });
  }
} 