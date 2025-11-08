import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

// Initialize client with API key as a string parameter
// Initialize lazily to avoid issues if API key is not set at module load time
function getGenAI() {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not configured');
  }
  return new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
}

export async function GET() {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ success: false, error: 'GEMINI_API_KEY is not configured. Set it in .env.local or your environment.' }, { status: 400 });
    }

    const genAI = getGenAI();

    // Use only valid Gemini model names that support generateContent
    // Based on available models from API key
    const candidates = [
      'gemini-2.5-flash',
      'gemini-2.0-flash',
      'gemini-flash-latest',
      'gemini-pro-latest'
    ];

    const results = [];
    for (const name of candidates) {
      try {
        const m = genAI.getGenerativeModel({ model: name });
        await m.generateContent('OK');
        results.push({ name, ok: true });
      } catch (err) {
        results.push({ name, ok: false, error: err?.message || String(err) });
      }
    }

    return NextResponse.json({ success: true, probes: results });
  } catch (error) {
    console.error('Error listing models (probe):', error?.message || error, error?.stack || '');
    return NextResponse.json({ success: false, error: error.message || String(error) }, { status: 500 });
  }
}
