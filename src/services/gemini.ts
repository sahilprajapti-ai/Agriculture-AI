import { GoogleGenAI } from '@google/genai';
import { getDemoAnalysis, expertAgriReply } from './expertEngine.js';

const MODEL_FALLBACK_LADDER = [
  'gemini-2.5-flash',
  'gemini-2.5-flash-lite',
  'gemini-flash-latest',
  'gemini-3.1-flash-lite',
  'gemini-3.7-flash',
];

const SYSTEM_PROMPT = `You are an agriculture assistance AI. Analyze the farmer's crop problem using the provided description and image when available. Identify possible symptoms and causes, then provide practical and safe recommendations. Do not claim certainty when visual evidence is insufficient. Ask follow-up questions when necessary. Avoid dangerous or unsupported pesticide recommendations. Encourage consultation with qualified agricultural experts for serious or uncertain cases. Explain recommendations in simple farmer-friendly language. Never present a diagnosis as guaranteed.`;

function getClient(): GoogleGenAI | null {
  const apiKey = (process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || process.env.API_KEY || '').trim();
  if (!apiKey) return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

function cleanJsonText(raw: string): any {
  let cleaned = raw.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.slice(7);
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.slice(3);
  }
  if (cleaned.endsWith('```')) {
    cleaned = cleaned.slice(0, -3);
  }
  cleaned = cleaned.trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error('Failed to parse analysis JSON');
  }
}

export async function generateContentWithFallback(
  contents: any,
  config?: any
): Promise<{ text: string; modelUsed: string }> {
  const client = getClient();
  if (!client) {
    throw new Error('GEMINI_API_KEY is not configured');
  }

  let lastError: any = null;
  for (const model of MODEL_FALLBACK_LADDER) {
    try {
      const response = await client.models.generateContent({
        model,
        contents,
        config,
      });
      if (response && response.text) {
        return { text: response.text.trim(), modelUsed: model };
      }
    } catch (err: any) {
      lastError = err;
      const msg = String(err?.message || err);
      if (msg.includes('API_KEY_INVALID') || msg.includes('API key not valid')) {
        break;
      }
      console.warn(`Gemini generation attempt with ${model} deferred:`, msg);
    }
  }

  throw lastError || new Error('All fallback models failed to generate a response');
}

export async function analyzeProblem(
  payload: {
    crop?: string;
    location?: string;
    stage?: string;
    category?: string;
    description: string;
    language?: string;
  },
  image?: { buffer: Buffer; mimeType: string } | null
): Promise<{ analysis: any; mode: string }> {
  const client = getClient();
  if (!client) {
    return { analysis: getDemoAnalysis(payload), mode: 'demo' };
  }

  const lang = payload.language || 'English';
  const prompt = `${SYSTEM_PROMPT}

Return ONLY a valid JSON object with EXACTLY these keys:
- detected_problem (string)
- confidence ("Low" | "Medium" | "High")
- summary (string)
- symptoms (array of strings)
- causes (array of strings)
- actions (array of 3-5 safe, practical step strings)
- prevention (array of strings)
- follow_up (array of strings)
- expert_note (string)

Language requested: ${lang}. Ensure all text values are written in natural ${lang}.

Farmer details:
Crop: ${payload.crop || 'not provided'}
Location: ${payload.location || 'not provided'}
Growth stage: ${payload.stage || 'not provided'}
Category: ${payload.category || 'not provided'}
Description: ${payload.description}`;

  try {
    const parts: any[] = [{ text: prompt }];
    if (image && image.buffer) {
      parts.push({
        inlineData: {
          mimeType: image.mimeType,
          data: image.buffer.toString('base64'),
        },
      });
    }

    const result = await generateContentWithFallback(parts, {
      temperature: 0.3,
    });

    const parsed = cleanJsonText(result.text);
    return { analysis: parsed, mode: 'gemini' };
  } catch (err) {
    console.error('Gemini problem analysis failed, falling back to expert demo engine:', err);
    return { analysis: getDemoAnalysis(payload), mode: 'expert_engine' };
  }
}

export async function chatAssistant(
  message: string,
  language = 'English',
  history: Array<{ role: string; content: string }> = []
): Promise<{ reply: string; mode: string }> {
  const client = getClient();
  if (!client) {
    return {
      reply: expertAgriReply(message, language),
      mode: 'expert_engine',
    };
  }

  try {
    const contents: any[] = [];
    if (Array.isArray(history)) {
      for (const turn of history.slice(-6)) {
        const role = turn.role === 'user' || turn.role === 'human' ? 'user' : 'model';
        contents.push({
          role,
          parts: [{ text: String(turn.content || '') }],
        });
      }
    }

    const userPrompt = `Respond in ${language}. Provide simple, practical, farmer-friendly guidance with bullet points if helpful. Question: ${message}`;
    contents.push({
      role: 'user',
      parts: [{ text: userPrompt }],
    });

    const result = await generateContentWithFallback(contents, {
      systemInstruction: SYSTEM_PROMPT,
      temperature: 0.6,
    });

    return {
      reply: result.text,
      mode: 'gemini',
    };
  } catch (err) {
    console.error('Gemini chat failed, falling back to expert reply:', err);
    return {
      reply: expertAgriReply(message, language),
      mode: 'expert_engine',
    };
  }
}
