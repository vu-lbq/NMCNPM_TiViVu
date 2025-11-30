const fs = require('fs');
const path = require('path');

// Uses OpenAI TTS via the Audio API (GPT-4o-mini-tts) when available
// Fallback: simple SSML-like prompt to regular chat model and return text (for demo only)
async function synthesize({ text, voice = 'alloy', format = 'mp3', openaiClient }) {
  if (!openaiClient) throw new Error('OpenAI client not configured');
  try {
    if (openaiClient.audio && openaiClient.audio.speech && typeof openaiClient.audio.speech.create === 'function') {
      const resp = await openaiClient.audio.speech.create({
        model: process.env.OPENAI_TTS_MODEL || 'gpt-4o-mini-tts',
        voice,
        input: text,
        format,
      });
      const arrayBuffer = await resp.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      return { buffer, contentType: format === 'wav' ? 'audio/wav' : `audio/${format}` };
    }
    // Fallback: return text if TTS API not available
    return { buffer: Buffer.from(text, 'utf8'), contentType: 'text/plain' };
  } catch (err) {
    throw err;
  }
}

module.exports = { synthesize };