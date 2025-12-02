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
function pickVoice(lang, requested) {
  if (requested && requested !== 'auto') return requested;
  if (lang === 'vi') return process.env.OPENAI_VOICE_VI || process.env.OPENAI_VOICE_DEFAULT || 'alloy';
  return process.env.OPENAI_VOICE_EN || process.env.OPENAI_VOICE_DEFAULT || 'alloy';
}

// Uses OpenAI TTS via the Audio API (GPT-4o-mini-tts) when available
// Fallback: return plain text buffer if TTS API not available
async function synthesize({ text, voice = 'alloy', format = 'mp3', openaiClient, language }) {
  if (!openaiClient) throw new Error('OpenAI client not configured');
  try {
    const lang = language || detectLanguage(text);
    const resolvedVoice = pickVoice(lang, voice);
    if (openaiClient.audio && openaiClient.audio.speech && typeof openaiClient.audio.speech.create === 'function') {
      const resp = await openaiClient.audio.speech.create({
        model: process.env.OPENAI_TTS_MODEL || 'gpt-4o-mini-tts',
        voice: resolvedVoice,
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

module.exports = { synthesize, detectLanguage };