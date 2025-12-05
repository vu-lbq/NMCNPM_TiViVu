const fs = require('fs');
const path = require('path');

// Simple language detection for Vietnamese vs English based on diacritics
function detectLanguage(text) {
  if (!text) return 'en';
  const viChars = text.match(/[ăâđêôơưĂÂĐÊÔƠƯàảãáạằẳẵắặầẩẫấậèẻẽéẹềểễếệìỉĩíịòỏõóọồổỗốộờởỡớợùủũúụừửữứựỳỷỹýỵ]/g);
  const viCount = viChars ? viChars.length : 0;
  if (viCount >= 3 || (viCount > 0 && viCount / text.length > 0.02)) return 'vi';
  return 'en';
}

// Maps language code to a voice name; configurable via env
// If requested voice is provided and not 'auto', use it directly
// Otherwise, pick based on language with fallbacks, using env vars or defaults
function pickVoice(lang, requested) {
  if (requested && requested !== 'auto') return requested;
  if (lang === 'vi') return process.env.OPENAI_VOICE_VI || process.env.OPENAI_VOICE_DEFAULT || 'alloy';
  return process.env.OPENAI_VOICE_EN || process.env.OPENAI_VOICE_DEFAULT || 'alloy';
}

// Uses OpenAI TTS via the Audio API (GPT-4o-mini-tts) when available
// Fallback: return plain text buffer if TTS API not available
// OPENAI TTS docs: https://platform.openai.com/docs/api-reference/audio/speech/create-speech
async function synthesize({ text, voice = 'alloy', format = 'mp3', openaiClient, language }) {
  if (!openaiClient) throw new Error('OpenAI client not configured');
  try {
    // Determine language and pick voice, if needed
    const lang = language || detectLanguage(text);
    // Pick voice based on language and requested voice
    const resolvedVoice = pickVoice(lang, voice);
    // Call OpenAI TTS API, if available, to get audio buffer
    if (openaiClient.audio && openaiClient.audio.speech && typeof openaiClient.audio.speech.create === 'function') {
      const resp = await openaiClient.audio.speech.create({
        model: process.env.OPENAI_TTS_MODEL || 'gpt-4o-mini-tts', // default TTS model is gpt-4o-mini-tts
        voice: resolvedVoice,
        input: text,
        format,
      });
      // The response is a ReadableStream; convert to Buffer
      const arrayBuffer = await resp.arrayBuffer();
      // Convert ArrayBuffer to Buffer, return with content type
      const buffer = Buffer.from(arrayBuffer);
      // Return audio buffer and content type, based on format
      return { buffer, contentType: format === 'wav' ? 'audio/wav' : `audio/${format}` };
    }
    // Fallback: return text if TTS API not available
    return { buffer: Buffer.from(text, 'utf8'), contentType: 'text/plain' };
  } catch (err) {
    throw err;
  }
}

module.exports = { synthesize, detectLanguage };