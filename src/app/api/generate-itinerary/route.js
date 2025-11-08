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

export async function POST(request) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { success: false, error: 'GEMINI_API_KEY is not configured. Get your free API key at https://aistudio.google.com/app/apikey' },
        { status: 500 }
      );
    }

    const { destination, days, interests, budget } = await request.json();

    const genAI = getGenAI();

    // Use only valid Gemini model names that support generateContent
    // Based on available models from API key
    const candidates = [
      'gemini-2.5-flash',
      'gemini-2.0-flash',
      'gemini-flash-latest',
      'gemini-pro-latest'
    ];

    let model = null;
    let lastErr = null;

    for (const candidate of candidates) {
      try {
        const m = genAI.getGenerativeModel({ model: candidate });
        // quick smoke-check call to validate this model is accessible
        await m.generateContent('OK');
        model = m;
        console.log('Selected model:', candidate);
        break;
      } catch (err) {
        lastErr = err;
        console.warn('Candidate model failed:', candidate, err?.message || err);
      }
    }

    if (!model) {
      console.error('No candidate models were accessible', lastErr?.message || lastErr);
      return NextResponse.json({ success: false, error: `No accessible models found. Last error: ${lastErr?.message || String(lastErr)}` }, { status: 500 });
    }

    const prompt = `You are an expert travel planner. Create a detailed ${days}-day itinerary for ${destination}.

User preferences:
- Interests: ${interests.join(', ')}
- Budget level: ${budget}

For each day, provide:
1. Morning activity (with estimated time and location)
2. Lunch recommendation (restaurant name and cuisine type)
3. Afternoon activity (with estimated time and location)
4. Dinner recommendation (restaurant name and cuisine type)
5. Evening activity or rest suggestion

Also suggest 2-3 hotels that match the budget level.

Format the response as a structured JSON with this exact schema:
{
  "itinerary": [
    {
      "day": 1,
      "morning": { "activity": "", "time": "", "location": "" },
      "lunch": { "name": "", "cuisine": "", "location": "" },
      "afternoon": { "activity": "", "time": "", "location": "" },
      "dinner": { "name": "", "cuisine": "", "location": "" },
      "evening": { "activity": "" }
    }
  ],
  "hotels": [
    { "name": "", "priceRange": "", "location": "", "highlights": "" }
  ],
  "tips": ["tip1", "tip2", "tip3"]
}

Return ONLY valid JSON, no markdown, no code blocks, just the JSON object.`;

    const result = await model.generateContent(prompt);

    // Helpful debug logging for unexpected shapes (trim to avoid huge logs)
    try {
      console.log('generateContent result (preview):', JSON.stringify(result).slice(0, 1000));
    } catch (e) {
      // ignore stringify errors
    }

    // Extract text from a few possible result shapes returned by different client versions
    let text = '';
    if (result && result.response) {
      const resp = result.response;
      if (typeof resp.text === 'function') {
        text = await resp.text();
      } else if (typeof resp.text === 'string') {
        text = resp.text;
      }
    }

    // fallback: some libs return `output` / `candidates` / `content` arrays
    if (!text && result && result.output && Array.isArray(result.output)) {
      text = result.output
        .map((o) => {
          if (o.content && Array.isArray(o.content)) {
            return o.content.map((c) => c.text || '').join('\n');
          }
          return o.text || '';
        })
        .join('\n');
    }

    if (!text && typeof result === 'string') {
      text = result;
    }

    if (!text) {
      throw new Error('Empty response from generative model');
    }

    // Clean up response - remove markdown code blocks if present
    text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    const itineraryData = JSON.parse(text);

    return NextResponse.json({ success: true, data: itineraryData });
  } catch (error) {
    console.error('Error generating itinerary:', error);
    
    let errorMessage = error.message;
    // If the error indicates the model isn't found or supported, try to list available models
    if (errorMessage.includes('404') || errorMessage.toLowerCase().includes('not found') || errorMessage.toLowerCase().includes('model')) {
      try {
        const genAI = getGenAI();
        const models = await genAI.listModels();
        // Build a concise model list preview
        const preview = (models || [])
          .slice(0, 10)
          .map((m) => {
            try {
              return `${m.name} (supports: ${(m.supportedMethods || []).join(', ')})`;
            } catch (e) {
              return m.name || JSON.stringify(m).slice(0, 80);
            }
          })
          .join('\n');

        errorMessage = `Model not found or not supported for this operation. Your API key may be valid, but the requested model or method isn't available. Available models (preview):\n${preview}`;
      } catch (listErr) {
        console.error('Error listing models:', listErr);
        // Keep original message but make it friendlier
        errorMessage = 'Invalid API key or model not accessible. Please verify your Gemini API key and model access at https://aistudio.google.com/app/apikey';
      }
    }

    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
