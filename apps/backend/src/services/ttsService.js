const fs = require('fs');
const path = require('path');

// Phát hiện ngôn ngữ đơn giản (Việt/Anh) dựa trên dấu tiếng Việt
function detectLanguage(text) {
  if (!text) return 'en';
  const viChars = text.match(/[ăâđêôơưĂÂĐÊÔƠƯàảãáạằẳẵắặầẩẫấậèẻẽéẹềểễếệìỉĩíịòỏõóọồổỗốộờởỡớợùủũúụừửữứựỳỷỹýỵ]/g);
  const viCount = viChars ? viChars.length : 0;
  if (viCount >= 3 || (viCount > 0 && viCount / text.length > 0.02)) return 'vi';
  return 'en';
}

// mã ngôn ngữ sang tên giọng đọc; cấu hình qua biến môi trường
function pickVoice(lang, requested) {
  if (requested && requested !== 'auto') return requested;
  if (lang === 'vi') return process.env.OPENAI_VOICE_VI || process.env.OPENAI_VOICE_DEFAULT || 'alloy';
  return process.env.OPENAI_VOICE_EN || process.env.OPENAI_VOICE_DEFAULT || 'alloy';
}

// Sử dụng OpenAI TTS qua Audio API (GPT-4o-mini-tts) khi khả dụng
// Dự phòng: trả về buffer văn bản nếu TTS API không khả dụng
async function synthesize({ text, voice = 'alloy', format = 'mp3', openaiClient, language }) {
  if (!openaiClient) throw new Error('OpenAI client not configured');
  try {
    // Xác định ngôn ngữ và chọn giọng đọc nếu cần
    const lang = language || detectLanguage(text);
    // Chọn giọng đọc dựa trên ngôn ngữ và voice yêu cầu
    const resolvedVoice = pickVoice(lang, voice);
    // Gọi OpenAI TTS API (nếu có) để nhận buffer âm thanh
    if (openaiClient.audio && openaiClient.audio.speech && typeof openaiClient.audio.speech.create === 'function') {
      const resp = await openaiClient.audio.speech.create({
        model: process.env.OPENAI_TTS_MODEL || 'gpt-4o-mini-tts', // default TTS model is gpt-4o-mini-tts
        voice: resolvedVoice,
        input: text,
        format,
      });
      // Phản hồi là ReadableStream; chuyển sang Buffer
      const arrayBuffer = await resp.arrayBuffer();
      // Chuyển ArrayBuffer thành Buffer, trả về kèm content type
      const buffer = Buffer.from(arrayBuffer);
      // Trả về buffer âm thanh và content type theo định dạng
      return { buffer, contentType: format === 'wav' ? 'audio/wav' : `audio/${format}` };
    }
    // Dự phòng: trả về văn bản nếu TTS API không khả dụng
    return { buffer: Buffer.from(text, 'utf8'), contentType: 'text/plain' };
  } catch (err) {
    throw err;
  }
}

module.exports = { synthesize, detectLanguage };