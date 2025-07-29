export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import playwright from 'playwright';

export async function POST(request) {
  try {
    const { name, content, avatar } = await request.json();
    if (!name || !content) {
      return NextResponse.json({ error: 'Missing name or content' }, { status: 400 });
    }

    const browser = await playwright.chromium.launch();
    const page = await browser.newPage();

    const url = `http://localhost:3000/tag-image-preview?name=${encodeURIComponent(
      name
    )}&content=${encodeURIComponent(content)}&avatar=${encodeURIComponent(
      avatar || ''
    )}`;
    await page.goto(url, { waitUntil: 'networkidle' });

	await page.waitForSelector('#tag-image-preview');
    const element = await page.$('#tag-image-preview');
    if (!element) {
      throw new Error('discord-message element not found');
    }

    const imageBuffer = await element.screenshot({ omitBackground: true });
    await browser.close();

    return new Response(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Content-Length': imageBuffer.length.toString(),
        'Cache-Control': 'no-store',
      },
    });
  } catch (err) {
    console.error('tag-image error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
